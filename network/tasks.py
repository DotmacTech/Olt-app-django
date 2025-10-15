from django.utils import timezone
from celery import shared_task, group
import logging # Import the logging module
import asyncio
from django.db.models import Count, Q

from .models import OLT, Card, PONPort, ONU, ONUType, PONOutageEvent, Zone, ODB, SpeedProfile, NetworkStatusData, UnconfiguredONT
from .utils.snmp_utils import get_system_metrics, get_ont_info_per_slot_async, get_all_ont_details_for_pon_port_async, get_ssh_metrics
from .utils.board_utils import get_installed_board_info
from .utils.network_utils import ping_host
from django.utils import timezone
import logging
from datetime import datetime, timedelta
from django.db import transaction

from .utils.discover_onts import ONTDiscovery # Import the ONTDiscovery class

logger = logging.getLogger(__name__)

# Placeholder for WebSocket notification - we'll define this structure later
from .consumers import send_pon_outage_notification # Assuming it will be in consumers.py
from .serializers import PONOutageEventSerializer # Assuming you have/will create this

# Logger is now defined at the top of the file

@shared_task
def discover_and_create_cards_task(olt_id):
    try:
        olt = OLT.objects.get(id=olt_id)
        logger.info(f"TASK_discover_and_create_cards: Starting card discovery for OLT: {olt.name} ({olt.ip_address})")

        # Use asyncio.run to execute the async function synchronously
        board_info_result = asyncio.run(get_installed_board_info(
            host=olt.ip_address,
            username=olt.telnet_username,
            password=olt.telnet_password,
            frame=getattr(olt, 'frame_id', '0')
        ))

        # Check for a successful result from the utility function
        if board_info_result and 'data' in board_info_result and 'boards' in board_info_result['data']:
            boards_data = board_info_result['data']['boards']
            for board_data in boards_data:
                card, created = Card.objects.update_or_create(
                    olt=olt,
                    slot_number=board_data.get('slot'),
                    defaults={
                        'card_type': board_data.get('board_name', 'Unknown'),
                        'status': board_data.get('status', 'Unknown'),
                        'port_count': board_data.get('port_count', 0)
                    }
                )
                if created:
                    logger.info(f"TASK_discover_and_create_cards: Created card in slot {card.slot_number} for OLT {olt.name}")
                else:
                    logger.info(f"TASK_discover_and_create_cards: Updated card in slot {card.slot_number} for OLT {olt.name}")

                # If the card has ports and is likely a PON card, trigger PON port discovery
                # Adjust condition based on how you identify PON cards (e.g., card_type name)
                if card.port_count > 0: # Basic check
                    discover_and_create_pon_ports_task.apply_async(args=[card.id,])
            logger.info(f"TASK_discover_and_create_cards: Card discovery completed for OLT: {olt.name}")
        else:
            # Improved error logging for card discovery failure
            if board_info_result:
                error_message = board_info_result.get('error', 'Unknown error during card discovery')
            else:
                error_message = "The board discovery utility (get_installed_board_info) returned a null or empty result."
            logger.error(f"TASK_discover_and_create_cards: Card discovery failed for OLT {olt.name}: {error_message}")
            # Optionally, update OLT status or log this error more formally

    except OLT.DoesNotExist:
        logger.error(f"TASK_discover_and_create_cards: OLT with id {olt_id} not found.")
    except Exception as e:
        logger.error(f"TASK_discover_and_create_cards: Error for OLT {olt_id}: {e}", exc_info=True)

@shared_task
def discover_and_create_pon_ports_task(card_id):
    try:
        card = Card.objects.select_related('olt').get(id=card_id)
        olt = card.olt
        logger.info(f"TASK_discover_pon_ports: Starting for OLT: {olt.name}, Card Slot: {card.slot_number}")

        if not olt.ip_address or not olt.snmp_ro_community:
            logger.warning(f"TASK_discover_pon_ports: OLT {olt.name} missing IP/SNMP details. Skipping.")
            return

        num_pon_ports_on_card = card.port_count
        if num_pon_ports_on_card <= 0: # Or a more specific check like card.card_type == 'GPON_16_PORT'
             logger.info(f"TASK_discover_pon_ports: Card in slot {card.slot_number} has {num_pon_ports_on_card} ports or not PON. Skipping.")
             return

        # Call the async function using asyncio.run() from the synchronous Celery task
        pon_details_data_snmp = asyncio.run(get_ont_info_per_slot_async(
            ip=olt.ip_address,
            community=olt.snmp_ro_community,
            slot_num=card.slot_number,
            number_of_ports=num_pon_ports_on_card,
            snmp_port=olt.snmp_port # Make sure OLT model has snmp_port field and it's populated
        ))
        # At this point, pon_details_data_snmp is a list of dictionaries.

        updated_ports_in_db = []
        for port_data_snmp in pon_details_data_snmp:
            if not isinstance(port_data_snmp, dict) or 'port_id' not in port_data_snmp:
                logger.warning(f"TASK_discover_pon_ports: Skipping invalid port data: {port_data_snmp} for card {card_id}")
                continue

            pon_port_obj, created = PONPort.objects.update_or_create(
                card=card,
                port_index_on_card=port_data_snmp.get('port_id'), # This is port_index_on_card
                defaults={
                    'description': port_data_snmp.get('port_desc'),
                    'status': str(port_data_snmp.get('port_status')),
                    'configured_onts': port_data_snmp.get('number_of_olt', 0),
                    'online_onts': port_data_snmp.get('online', 0),
                    'tx_power': port_data_snmp.get('tx_power'),
                    'rx_power': port_data_snmp.get('rx_power'),
                    'last_snmp_update': timezone.now()
                }
            )
            updated_ports_in_db.append(pon_port_obj)
        
        logger.info(f"TASK_discover_pon_ports: Successfully updated/created {len(updated_ports_in_db)} PON ports for OLT: {olt.name}, Card Slot: {card.slot_number}")

    except Card.DoesNotExist:
        logger.error(f"TASK_discover_pon_ports: Card with id {card_id} not found.")
    except Exception as e:
        logger.error(f"TASK_discover_pon_ports: Error for Card {card_id}: {e}", exc_info=True)
        # For more detailed debugging of where the TypeError occurs:
        # import traceback # Already handled by exc_info=True
        # traceback.print_exc() 
        raise # Re-raise to mark task as failed

@shared_task
def discover_and_update_onts_for_pon_port_task(pon_port_id):
    try:
        pon_port = PONPort.objects.select_related('card__olt').get(id=pon_port_id)
        card = pon_port.card
        olt = card.olt

        logger.info(f"TASK_discover_onts: Starting for OLT: {olt.name}, Card: {card.slot_number}, PON Port: {pon_port.port_index_on_card}")

        if not olt.ip_address or not olt.snmp_ro_community:
            logger.warning(f"TASK_discover_onts: OLT {olt.name} missing IP/SNMP details. Skipping for PON Port {pon_port_id}.")
            return

        # The number of configured ONTs on the PON port is needed by the SNMP util
        # This value should ideally be fresh from a recent PON port scan.
        # If not, the SNMP util has a fallback.
        num_configured_onts_on_port = pon_port.configured_onts

        ont_details_snmp = asyncio.run(get_all_ont_details_for_pon_port_async(
            ip=olt.ip_address,
            community=olt.snmp_ro_community,
            slot_num=card.slot_number,
            port_num=pon_port.port_index_on_card,
            num_configured_onts=num_configured_onts_on_port,
            snmp_port=olt.snmp_port
        ))
        logger.debug(f"TASK_discover_onts: Raw SNMP data for ONTs on PON Port {pon_port_id} (count: {len(ont_details_snmp)}): {ont_details_snmp}")

        updated_onts_count = 0
        for ont_data in ont_details_snmp:
            if not ont_data or not ont_data.get("serial_number"):
                logger.warning(f"TASK_discover_onts: Skipping invalid/incomplete ONT data: {ont_data} for PON Port {pon_port_id}")
                continue

            # Get or create a default ONUType if needed
            default_onu_type, _ = ONUType.objects.get_or_create(
                unique_id="UNKNOWN_DEFAULT", 
                defaults={'name': 'Unknown Type', 'pon_type': 'GPON', 'image_url': ''}
            )

            onu_obj, created = ONU.objects.update_or_create(
                pon_port=pon_port,
                ont_index_on_port=ont_data.get('ont_index_on_port'),
                defaults={
                    'serial_number': ont_data.get('serial_number'),
                    'status': ont_data.get('status'),
                    'rx_power_at_ont': ont_data.get('rx_power_at_ont'),
                    'tx_power_at_ont': ont_data.get('tx_power_at_ont'),
                    'rx_power_at_olt': ont_data.get('rx_power_at_olt'),
                    'last_down_time': ont_data.get('last_down_time'),
                    'last_down_cause': ont_data.get('last_down_cause'),
                    'onu_type': default_onu_type, # Assign a default type, can be updated later
                    'last_snmp_update': timezone.now()
                }
            )
            updated_onts_count +=1
        
        logger.info(f"TASK_discover_onts: Successfully updated/created {updated_onts_count} ONTs for PON Port ID {pon_port_id}")

    except PONPort.DoesNotExist:
        logger.error(f"TASK_discover_onts: PONPort with id {pon_port_id} not found.")
    except Exception as e:
        logger.error(f"TASK_discover_onts: Error for PONPort {pon_port_id}: {e}", exc_info=True)
        # import traceback # Already handled by exc_info=True
        # traceback.print_exc()
        raise
   

@shared_task
def update_olt_system_metrics_task(olt_id):
    """
    Celery task to fetch and update system metrics for a given OLT.
    """
    try:
        olt = OLT.objects.get(pk=olt_id)
        logger.info(f"TASK_update_olt_metrics: Starting for OLT: {olt.name} ({olt.ip_address})")

        # get_system_metrics uses SSH and defaults board to '0/2' if not specified.
        # Adjust board parameter if needed, or make it configurable per OLT.
        # For now, we rely on its default or pass None if appropriate.
        # The board parameter in get_system_metrics is for specific SSH commands.
        # If your OLT model has a field for the main control board, use it here.
        # e.g., main_board_identifier = olt.main_control_board_slot_identifier or '0/2'
        metrics = get_system_metrics(
            host=olt.ip_address,
            ssh_username=olt.telnet_username, # Assuming telnet_username is used for SSH
            ssh_password=olt.telnet_password  # Assuming telnet_password is used for SSH
            # board=main_board_identifier # Pass a specific board if necessary
        )

        if metrics and metrics.get('status') == 'success':
            # Only update fields if the metric was successfully retrieved and is not None
            new_uptime = metrics.get('uptime')
            if new_uptime is not None:
                olt.uptime = new_uptime
            
            new_cpu = metrics.get('cpu')
            if new_cpu is not None:
                olt.cpu_usage = new_cpu

            # The same pattern can be applied to other metrics if they can also return None
            olt.memory_usage = metrics.get('memory', olt.memory_usage)
            olt.temperature = metrics.get('temperature', olt.temperature)
            olt.metrics_status = 'success'
            olt.metrics_error = None
        elif metrics:
            olt.metrics_status = 'error'
            olt.metrics_error = metrics.get('error', 'Unknown error during metrics fetch.')
        
        olt.last_metrics_update = timezone.now()
        olt.save()
        logger.info(f"TASK_update_olt_metrics: Successfully updated system metrics for OLT: {olt.name}")
    except OLT.DoesNotExist:
        logger.error(f"TASK_update_olt_metrics: OLT with ID {olt_id} not found.")
    except Exception as e:
        logger.error(f"TASK_update_olt_metrics: Error for OLT ID {olt_id}: {e}", exc_info=True)
        try:
            # Attempt to save error status to the OLT object if it exists
            olt_obj = OLT.objects.get(pk=olt_id)
            olt_obj.metrics_status = 'error'
            olt_obj.metrics_error = str(e)
            olt_obj.last_metrics_update = timezone.now()
            olt_obj.save()
        except OLT.DoesNotExist:
            pass # OLT not found, nothing to save error to
        except Exception as save_e:
            logger.error(f"TASK_update_olt_metrics: Could not save error status to OLT {olt_id} after task failure: {save_e}", exc_info=True)
@shared_task
def check_olt_reachability_task(olt_id):
    """
    Celery task to check OLT reachability via ping and update its status.
    """
    try:
        olt = OLT.objects.get(pk=olt_id)
        logger.info(f"TASK_check_olt_reachability: Checking OLT: {olt.name} ({olt.ip_address})")

        is_reachable = ping_host(olt.ip_address)
        logger.info(f"TASK_check_olt_reachability: OLT: {olt.name} ({olt.ip_address}) - ping_host returned: {is_reachable}")

        new_status = 'active' if is_reachable else 'inactive'

        if olt.status != new_status:
            olt.status = new_status
            # last_seen is auto_now=True, so it will be updated on save
            olt.save(update_fields=['status', 'last_seen']) 
            logger.info(f"TASK_check_olt_reachability: OLT {olt.name} reachability: {is_reachable}. Status set to {new_status}.")
        else:
            # Even if status hasn't changed, update last_seen to show we checked
            olt.save(update_fields=['last_seen'])
            logger.info(f"TASK_check_olt_reachability: OLT {olt.name} reachability: {is_reachable}. Status remains {new_status}.")

    except OLT.DoesNotExist:
        logger.error(f"TASK_check_olt_reachability: OLT with ID {olt_id} not found.")
    except Exception as e:
        logger.error(f"TASK_check_olt_reachability: Error for OLT ID {olt_id}: {e}", exc_info=True)
        try:
            olt_obj = OLT.objects.get(pk=olt_id)
            olt_obj.status = 'error' # Indicate an error during the ping check itself
            olt_obj.save(update_fields=['status', 'last_seen'])
        except Exception as save_e: # Catch OLT.DoesNotExist or other save errors
            logger.error(f"TASK_check_olt_reachability: Could not save error status to OLT {olt_id} after task failure: {save_e}", exc_info=True)
            pass # Logged above or OLT doesn't exist

@shared_task
def periodically_update_all_onts_data():
    """
    Celery task to be run periodically by Celery Beat.
    It iterates through all PON Ports and queues an ONT update task for each.
    """
    logger.info(f"TASK_periodically_update_all_onts: Starting periodic update for all ONTs data...")
    
    base_delay = 0  # Start with no delay for the first task
    # Adjust this based on how many PON ports you have and typical task duration
    increment_delay_by = 30  # Stagger subsequent tasks by 30 seconds each 

    # We only want to update ONTs for PON ports that belong to active OLTs
    # and have a configured SNMP community string.
    active_pon_ports = PONPort.objects.filter(
        card__olt__status='active', 
        card__olt__snmp_ro_community__isnull=False
    ).exclude(card__olt__snmp_ro_community__exact='')
    
    for pon_port in active_pon_ports:
        logger.info(f"TASK_periodically_update_all_onts: Queueing ONT data update for PON Port ID: {pon_port.id} (OLT: {pon_port.card.olt.name}, Card: {pon_port.card.slot_number}, Port: {pon_port.port_index_on_card}) with delay {base_delay}s.")
        discover_and_update_onts_for_pon_port_task.apply_async(args=[pon_port.id], countdown=base_delay)
        base_delay += increment_delay_by
        
    logger.info(f"TASK_periodically_update_all_onts: Finished queueing ONT data updates for {active_pon_ports.count()} PON Ports.")


@shared_task
def update_all_olts_task():
    """
    Task to update all OLTs when the refresh button is clicked.
    This will:
    1. Check reachability of all OLTs
    2. Update system metrics for reachable OLTs
    3. Refresh cards and PON ports for each OLT
    """
    logger.info("TASK_update_all_olts_task: Starting full OLT update...")
    
    # Get all OLTs regardless of status
    olts = OLT.objects.all()
    updated_count = 0
    error_count = 0
    
    for olt in olts:
        try:
            # Check reachability first
            is_reachable = ping_host(olt.ip_address)
            olt.is_reachable = is_reachable
            olt.last_seen = timezone.now()
            olt.save(update_fields=['is_reachable', 'last_seen'])
            
            if is_reachable:
                # Queue metrics update
                update_olt_system_metrics_task.apply_async(
                    args=[olt.id], 
                    countdown=5  # Small delay to prevent overloading
                )
                
                # Queue card discovery
                discover_and_create_cards_task.apply_async(
                    args=[olt.id], 
                    countdown=10  # Slightly longer delay
                )
                
                logger.info(f"TASK_update_all_olts_task: Queued updates for OLT {olt.name} ({olt.ip_address})")
                updated_count += 1
            else:
                logger.warning(f"TASK_update_all_olts_task: OLT {olt.name} ({olt.ip_address}) is not reachable")
                
        except Exception as e:
            error_count += 1
            logger.error(f"TASK_update_all_olts_task: Error updating OLT {olt.name} ({olt.ip_address}): {str(e)}")
    
    result = {
        "status": "completed",
        "olts_processed": olts.count(),
        "olts_updated": updated_count,
        "errors": error_count,
        "message": f"Successfully updated {updated_count} out of {olts.count()} OLTs"
    }
    
    if error_count > 0:
        result["status"] = "completed_with_errors"
    
    logger.info(f"TASK_update_all_olts_task: Finished with result: {result}")
    return result

@shared_task
def update_all_pon_ports_task():
    """
    Task to update all PON ports across all OLTs.
    This will:
    1. Get all OLTs
    2. For each OLT, queue a PON port discovery task
    3. Return a summary of the operation
    """
    logger.info("TASK_update_all_pon_ports_task: Starting full PON port update...")
    
    # Get all OLTs that are reachable
    olts = OLT.objects.filter(is_reachable=True)
    total_ports = 0
    queued_olts = 0
    error_count = 0
    
    for olt in olts:
        try:
            # Queue PON port discovery for each OLT
            discover_and_create_pon_ports_task.apply_async(
                args=[olt.id], 
                countdown=5 * queued_olts  # Stagger the tasks
            )
            
            logger.info(f"TASK_update_all_pon_ports_task: Queued PON port update for OLT {olt.name} ({olt.ip_address})")
            queued_olts += 1
            
        except Exception as e:
            error_count += 1
            logger.error(f"TASK_update_all_pon_ports_task: Error queuing PON port update for OLT {olt.name} ({olt.ip_address}): {str(e)}")
    
    result = {
        "status": "completed",
        "olts_processed": olts.count(),
        "olts_queued": queued_olts,
        "errors": error_count,
        "message": f"Successfully queued PON port updates for {queued_olts} out of {olts.count()} reachable OLTs"
    }
    
    if error_count > 0:
        result["status"] = "completed_with_errors"
    
    logger.info(f"TASK_update_all_pon_ports_task: Finished with result: {result}")
    return result

@shared_task
def periodically_check_all_olts_reachability():
    """
    Celery task to be run periodically by Celery Beat.
    It iterates through all OLTs and queues a reachability check for each.
    """
    logger.info("TASK_periodically_check_all_olts_reachability: Starting...")
    
    base_delay = 0  # Start with no delay for the first task
    # Adjust this based on how many OLTs you have and typical task duration
    increment_delay_by = 5  # Stagger subsequent tasks by 5 seconds each

    olts = OLT.objects.filter(status__in=['active', 'error', 'unknown', 'inactive']) # Or simply OLT.objects.all() if you want to check all regardless of current status
    
    for olt in olts:
        logger.info(f"TASK_periodically_check_all_olts_reachability: Queueing check for OLT: {olt.name} (ID: {olt.id}) with delay {base_delay}s.")
        check_olt_reachability_task.apply_async(args=[olt.id], countdown=base_delay)
        base_delay += increment_delay_by
        
    logger.info(f"TASK_periodically_check_all_olts_reachability: Finished queueing checks for {olts.count()} OLTs.")

@shared_task
def periodically_update_all_olts_metrics():
    """
    Celery task to be run periodically by Celery Beat. It uses a group
    to queue system metrics update tasks for all active OLTs in parallel.
    """
    logger.info(f"TASK_periodically_update_all_olts_metrics: Starting periodic update...")

    # Get a list of IDs for all active OLTs
    olt_ids = list(OLT.objects.filter(status='active').values_list('id', flat=True))

    if not olt_ids:
        logger.info("TASK_periodically_update_all_olts_metrics: No active OLTs found to update.")
        return

    # Create a group of task signatures, one for each OLT
    # The .s(olt_id) creates a signature for the task with the OLT ID as an argument.
    job = group(update_olt_system_metrics_task.s(olt_id) for olt_id in olt_ids)

    # Execute the group of tasks in parallel
    job.apply_async()

    logger.info(f"TASK_periodically_update_all_olts_metrics: Queued a group of {len(olt_ids)} metrics update tasks.")

@shared_task # Make sure this is a Celery task if it's to be scheduled by Celery Beat
def periodically_detect_pon_outages():
    """
    Re-implemented task to detect and record PON port outages.
    This task checks for two main outage conditions:
    1. The PON port itself is reported as 'down' or 'offline'.
    2. The PON port is 'up', but all of its configured ONUs are offline.

    It creates, updates, and resolves PONOutageEvent records accordingly.
    """
    logger.info(f"TASK_periodically_detect_pon_outages: Starting PON outage detection...")

    # Get all PON ports on active OLTs, with counts of total and offline ONUs
    pon_ports = PONPort.objects.filter(card__olt__status='active').annotate(
        total_onts_count=Count('onus'),
        offline_onts_count=Count('onus', filter=Q(onus__status__in=['offline', 'los']))
    ).select_related('card')

    for pon_port in pon_ports:
        total_onts = pon_port.total_onts_count
        offline_onts = pon_port.offline_onts_count

        # Normalize PON port status. Assuming 'down' and 'offline' are outage indicators.
        is_port_down = pon_port.status.lower() in ['down', 'offline']

        # Condition for an outage: Port is down, OR port is up but all ONUs are offline (and there are ONUs).
        is_outage_condition = is_port_down or (total_onts > 0 and offline_onts == total_onts)

        # Check for an existing active outage for this port
        active_outage_event = PONOutageEvent.objects.filter(pon_port=pon_port, end_time__isnull=True).first()

        if is_outage_condition:
            # --- OUTAGE IS ACTIVE ---
            if not active_outage_event:
                # This is a NEW outage. Let's create an event.
                logger.info(f"NEW OUTAGE DETECTED on {pon_port} ({pon_port.card.slot_number}/{pon_port.port_index_on_card}). "
                            f"Port Status: {pon_port.status}, Offline ONUs: {offline_onts}/{total_onts}.")

                # --- Trace the cause ---
                possible_cause = "Unknown"
                if is_port_down:
                    possible_cause = f"PON Port Down (Status: {pon_port.status})"
                elif total_onts > 0 and offline_onts == total_onts:
                    # If port is up but all ONUs are down, check their individual causes
                    # This query is only run when a new outage is detected.
                    offline_onu_causes = pon_port.onus.filter(
                        status__in=['offline', 'los']
                    ).values_list('last_down_cause', flat=True)

                    causes = {}
                    for cause in offline_onu_causes:
                        cause_str = cause or "Unknown Cause"
                        causes[cause_str] = causes.get(cause_str, 0) + 1
                    
                    if causes:
                        # Find the most common cause among the offline ONUs
                        most_common_cause = max(causes, key=causes.get)
                        possible_cause = f"All ONUs Offline (Most common reason: {most_common_cause})"
                    else:
                        possible_cause = "All ONUs Offline (Reason unknown)"

                # Create the outage event
                new_outage = PONOutageEvent.objects.create(
                    pon_port=pon_port,
                    affected_ont_count=offline_onts,
                    possible_cause=possible_cause,
                    # Trace other data at the time of outage
                    board_port_description=f"Board: {pon_port.card.slot_number}, Port: {pon_port.port_index_on_card}",
                    port_tx_power=pon_port.tx_power,
                    port_rx_power=pon_port.rx_power,
                )

                logger.info(f"Saved new outage event {new_outage.id} for {pon_port}.")
                
                # Send notification for the new outage
                serializer = PONOutageEventSerializer(new_outage)
                send_pon_outage_notification('new_outage', serializer.data)

            else:
                # An outage is ALREADY active. We can update the count if it changed.
                if active_outage_event.affected_ont_count != offline_onts:
                    logger.info(f"Updating active outage {active_outage_event.id} for {pon_port}. "
                                f"Offline ONT count changed from {active_outage_event.affected_ont_count} to {offline_onts}.")
                    active_outage_event.affected_ont_count = offline_onts
                    active_outage_event.save(update_fields=['affected_ont_count'])

                    # Send notification for the updated outage
                    serializer = PONOutageEventSerializer(active_outage_event)
                    send_pon_outage_notification('updated_outage', serializer.data)
        else:
            # --- NO OUTAGE CONDITION ---
            if active_outage_event:
                # An outage was active, but the condition is now clear. Let's resolve it.
                logger.info(f"RESOLVING outage {active_outage_event.id} on {pon_port}. "
                            f"Port Status: {pon_port.status}, Offline ONUs: {offline_onts}/{total_onts}.")
                
                active_outage_event.end_time = timezone.now()
                active_outage_event.save(update_fields=['end_time'])

                # Send notification for the resolved outage
                serializer = PONOutageEventSerializer(active_outage_event)
                send_pon_outage_notification('resolved_outage', serializer.data)

    logger.info(f"TASK_periodically_detect_pon_outages: Finished PON outage detection cycle.")


@shared_task
def old_periodically_detect_pon_outages():
    """
    Task to detect and record PON port outages based on ONT statuses.
    """
    logger.info(f"TASK_periodically_detect_pon_outages: Starting PON outage detection...")
    # Annotate counts directly in the query to avoid N+1 queries in the loop
    pon_ports = PONPort.objects.filter(card__olt__status='active').annotate(
        total_onts_count=Count('onus'),
        offline_onts_count=Count('onus', filter=Q(onus__status='offline'))
    ).prefetch_related('onus') # Prefetch for accessing last_down_cause

    # Outage detection is now based on PON port status, not recent offline ONTs
    # Define recent_offline_window_minutes or remove its usage if not intended
    recent_offline_window_minutes = getattr(settings, 'RECENT_OFFLINE_WINDOW_MINUTES', 15) # Example: get from settings or default
    for pon_port in pon_ports:
        total_onts = pon_port.total_onts_count
        if total_onts == 0:
            continue # Cannot detect outage if no ONTs exist

        # If the PON port itself is down, trigger outage logic
        if pon_port.status == 'down':
            # Use the annotated count
            offline_count = pon_port.offline_onts_count
            active_outage_event = PONOutageEvent.objects.filter(pon_port=pon_port, end_time__isnull=True).first()

            if offline_count > 0:
                if not active_outage_event:
                    logger.info(f"TASK_periodically_detect_pon_outages: New PON outage on {pon_port}. {offline_count}/{total_onts} ONTs offline (PON port DOWN).")
                    causes = {}
                    # We still need to iterate here for the cause, but the count is efficient
                    for ont in pon_port.onus.filter(status='offline'):
                        cause = ont.last_down_cause or 'Unknown Cause'
                        causes[cause] = causes.get(cause, 0) + 1
                    possible_cause = max(causes, key=causes.get) if causes else 'Unknown Cause'
                    new_outage = PONOutageEvent.objects.create(
                        pon_port=pon_port,
                        affected_ont_count=total_onts,
                        possible_cause=possible_cause
                    )
                    logger.info(f"TASK_periodically_detect_pon_outages: Saved new outage for {pon_port} affecting {total_onts} ONTs.")
                    serializer = PONOutageEventSerializer(new_outage)
                    send_pon_outage_notification('new_outage', serializer.data)
                elif active_outage_event.affected_ont_count != total_onts:
                    logger.info(f"TASK_periodically_detect_pon_outages: Updating affected ONT count for active outage on {pon_port} from {active_outage_event.affected_ont_count} to {total_onts}.")
                    active_outage_event.affected_ont_count = total_onts
                    active_outage_event.save(update_fields=['affected_ont_count'])
                    serializer = PONOutageEventSerializer(active_outage_event)
                    send_pon_outage_notification('updated_outage', serializer.data)
            else:
                # If no ONTs are offline but port is down, still consider this an outage
                if not active_outage_event:
                    logger.info(f"TASK_periodically_detect_pon_outages: New PON outage on {pon_port}. Port DOWN, no ONTs offline.")
                    new_outage = PONOutageEvent.objects.create(
                        pon_port=pon_port,
                        affected_ont_count=0,
                        possible_cause='PON port down (no ONTs offline)'
                    )
                    serializer = PONOutageEventSerializer(new_outage)
                    send_pon_outage_notification('new_outage', serializer.data)
                elif active_outage_event.affected_ont_count != 0:
                    active_outage_event.affected_ont_count = 0
                    active_outage_event.save(update_fields=['affected_ont_count'])
                    serializer = PONOutageEventSerializer(active_outage_event)
                    send_pon_outage_notification('updated_outage', serializer.data)
            continue
        # If port is up, use the old logic to resolve outages if all ONUs are online
        offline_onts_qs = pon_port.onus.filter(status='offline')
        offline_count = offline_onts_qs.count()
        active_outage_event = PONOutageEvent.objects.filter(pon_port=pon_port, end_time__isnull=True).first()
        if offline_count == 0 and active_outage_event and pon_port.status != 'down': # Only resolve if port is not 'down'
            logger.info(f"TASK_periodically_detect_pon_outages: PON outage on {pon_port} ended. All {total_onts} ONTs online.")
            active_outage_event.end_time = timezone.now()
            active_outage_event.save(update_fields=['end_time'])
            serializer = PONOutageEventSerializer(active_outage_event)
            send_pon_outage_notification('resolved_outage', serializer.data)
            # Continue to next port after resolving
            continue 

        offline_onts_qs = pon_port.onus.filter(status='offline')
        offline_count = offline_onts_qs.count()

        active_outage_event = PONOutageEvent.objects.filter(pon_port=pon_port, end_time__isnull=True).first()

        if offline_count > 0:
            # There are offline ONTs. Check if this is a new/escalating outage.
            recent_offline_onts_qs = offline_onts_qs.filter(
                last_down_time__gte=timezone.now() - timezone.timedelta(minutes=recent_offline_window_minutes)
            )
            recent_offline_count = recent_offline_onts_qs.count()

            # Condition for a *new* outage:
            # 1. No active outage already recorded for this port.
            # 2. Some ONTs went offline recently.
            if not active_outage_event and recent_offline_count > 0 and pon_port.status != 'down': # Only if port itself is not 'down'
                logger.info(f"TASK_periodically_detect_pon_outages: New PON outage on {pon_port}. {offline_count}/{total_onts} ONTs offline, {recent_offline_count} recent.")

                causes = {}
                for ont in recent_offline_onts_qs: # Use the queryset for recent offline ONTs
                    cause = ont.last_down_cause or 'Unknown Cause'
                    causes[cause] = causes.get(cause, 0) + 1
                possible_cause = max(causes, key=causes.get) if causes else 'Unknown Cause'
                # print(f"DEBUG: PON Port {pon_port.id} ({pon_port}) - Determined cause: {possible_cause}")
                new_outage = PONOutageEvent.objects.create(
                    pon_port=pon_port,
                    affected_ont_count=total_onts, # Now, it's the total ONTs on the port
                    possible_cause=possible_cause
                )

                logger.info(f"TASK_periodically_detect_pon_outages: Saved new outage for {pon_port} affecting {total_onts} ONTs.")
                # Send WebSocket notification for new outage
                serializer = PONOutageEventSerializer(new_outage)
                send_pon_outage_notification('new_outage', serializer.data)

            elif active_outage_event:
                # An outage is already active. Update its affected_ont_count if it has changed.
                # The number of *affected* ONTs is the total ONTs on the port if the port is NOT 'down'.
                if active_outage_event.affected_ont_count != total_onts:
                    logger.info(f"TASK_periodically_detect_pon_outages: Updating affected ONT count for active outage on {pon_port} from {active_outage_event.affected_ont_count} to {total_onts}.")
                    active_outage_event.affected_ont_count = total_onts
                    # Note: Cause is not re-evaluated here for simplicity, but could be if desired.
                    active_outage_event.save(update_fields=['affected_ont_count'])
                    # Send WebSocket notification for updated outage
                    serializer = PONOutageEventSerializer(active_outage_event)
                    send_pon_outage_notification('updated_outage', serializer.data)

        else: # offline_count == 0
            # No ONTs are offline on this port.
            # If there was an active outage, it has now ended.
            if active_outage_event and pon_port.status != 'down': # Ensure port itself is not down
                logger.info(f"TASK_periodically_detect_pon_outages: PON outage on {pon_port} ended. All {total_onts} ONTs online.")
                active_outage_event.end_time = timezone.now()
                active_outage_event.save(update_fields=['end_time'])
                # Send WebSocket notification for resolved outage
                serializer = PONOutageEventSerializer(active_outage_event)
                send_pon_outage_notification('resolved_outage', serializer.data)

@shared_task
def record_aggregated_network_status():
    """
    Periodically aggregates network data (e.g., from ONU model)
    and stores it in the NetworkStatusData model for charting.
    """
    logger.info("TASK_record_aggregated_network_status: Starting aggregation...")
    try:
        total_onus_count = ONU.objects.count()
        online_onus_count = ONU.objects.filter(status='online').count()
        offline_onus_count = ONU.objects.filter(status='offline').count()
        
        # Example: Count ONUs with specific offline reasons if your model/data supports it well
        # This requires 'last_down_cause' to be reliably populated and standardized.
        signal_loss_onus_count = ONU.objects.filter(status='offline', last_down_cause__icontains='los').count() # Example
        power_failure_onus_count = ONU.objects.filter(status='offline', last_down_cause__icontains='power').count() # Example

        # Determine overall status (simplified example)
        current_status = 'up'
        if total_onus_count > 0:
            online_percentage = (online_onus_count / total_onus_count) * 100
            if online_percentage < 80: # Example threshold
                current_status = 'down'
            elif online_percentage < 95: # Example threshold
                current_status = 'degraded'
        elif total_onus_count == 0:
            current_status = 'maintenance' # Or 'unknown'

        # Placeholder for average Rx/Tx power - requires more complex aggregation
        # avg_rx = ONU.objects.filter(status='online', rx_power_at_olt__isnull=False).aggregate(avg_val=models.Avg('rx_power_at_olt'))['avg_val']
        # avg_tx = ONU.objects.filter(status='online', tx_power_at_ont__isnull=False).aggregate(avg_val=models.Avg('tx_power_at_ont'))['avg_val']

        NetworkStatusData.objects.create(
            timestamp=timezone.now(),
            online_onts=online_onus_count,
            offline_onts=offline_onus_count,
            signal_loss_onts=signal_loss_onus_count,
            power_failure_onts=power_failure_onus_count,
            total_onts=total_onus_count,
            status=current_status,
            # avg_rx_power=avg_rx,
            # avg_tx_power=avg_tx
        )
        logger.info(f"TASK_record_aggregated_network_status: Successfully recorded aggregated network status. Online: {online_onus_count}/{total_onus_count}")

    except Exception as e:
        logger.error(f"TASK_record_aggregated_network_status: Error during aggregation: {e}", exc_info=True)


# celery -A oltmanager worker -l info -P threads
# celery -A oltmanager beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler

from .utils.snmp_utils import get_all_ont_details_for_pon_port_async

@shared_task
def refresh_single_ont_in_pon_port_task(pon_port_id, ont_id):
    """
    Celery task to refresh a single ONT in a PONPort.
    """
    try:
        from .models import ONU, PONPort, ONUType
        pon_port = PONPort.objects.select_related('card__olt').get(id=pon_port_id)
        card = pon_port.card
        olt = card.olt

        # Get the ONT object
        ont = ONU.objects.get(id=ont_id, pon_port=pon_port)

        # Fetch all ONT details for this PON port via SNMP
        ont_details_snmp = asyncio.run(get_all_ont_details_for_pon_port_async(
            ip=olt.ip_address,
            community=olt.snmp_ro_community,
            slot_num=card.slot_number,
            port_num=pon_port.port_index_on_card,
            num_configured_onts=pon_port.configured_onts,
            snmp_port=olt.snmp_port
        ))

        # Find the ONT data for the target ONT
        target_ont_data = None
        for ont_data in ont_details_snmp:
            if ont_data.get("serial_number") == ont.serial_number or ont_data.get("ont_index_on_port") == ont.ont_index_on_port:
                target_ont_data = ont_data
                break

        if not target_ont_data:
            logger.warning(f"refresh_single_ont_in_pon_port_task: No SNMP data found for ONT {ont.id} on PONPort {pon_port.id}")
            return {"status": "not_found", "message": "ONT data not found in SNMP response"}

        # Get or create a default ONUType if needed
        default_onu_type, _ = ONUType.objects.get_or_create(
            unique_id="UNKNOWN_DEFAULT", 
            defaults={'name': 'Unknown Type', 'pon_type': 'GPON', 'image_url': ''}
        )

        # Update the ONT object
        ONU.objects.filter(id=ont.id).update(
            serial_number=target_ont_data.get('serial_number'),
            status=target_ont_data.get('status'),
            rx_power_at_ont=target_ont_data.get('rx_power_at_ont'),
            tx_power_at_ont=target_ont_data.get('tx_power_at_ont'),
            rx_power_at_olt=target_ont_data.get('rx_power_at_olt'),
            last_down_time=target_ont_data.get('last_down_time'),
            last_down_cause=target_ont_data.get('last_down_cause'),
            onu_type=default_onu_type,
            last_snmp_update=timezone.now()
        )

        logger.info(f"refresh_single_ont_in_pon_port_task: Successfully refreshed ONT {ont.id} in PONPort {pon_port.id}")
        return {"status": "success", "ont_id": ont.id}

    except PONPort.DoesNotExist:
        logger.error(f"refresh_single_ont_in_pon_port_task: PONPort with id {pon_port_id} not found.")
        return {"status": "error", "message": "PONPort not found"}
    except ONU.DoesNotExist:
        logger.error(f"refresh_single_ont_in_pon_port_task: ONU with id {ont_id} not found in PONPort {pon_port_id}.")
        return {"status": "error", "message": "ONT not found"}
    except Exception as e:
        logger.error(f"refresh_single_ont_in_pon_port_task: Error for ONT {ont_id} in PONPort {pon_port_id}: {e}", exc_info=True)
        return {"status": "error", "message": str(e)}

@shared_task
def discover_unconfigured_onts_task(olt_id):
    """
    Task to discover unconfigured ONTs on an OLT
    """
    try:
        olt = OLT.objects.get(id=olt_id)
        discoverer = ONTDiscovery(
            host=olt.ip_address,
            username=olt.telnet_username,
            password=olt.telnet_password
        )
        
        discovered_onts = asyncio.run(discoverer.discover_onts())
        
        for ont in discovered_onts:
            UnconfiguredONT.objects.update_or_create(
                serial_number=ont['serial_number'],
                olt=olt,
                defaults={
                    'vendor_id': ont['vendor_id'],
                    'frame': ont['frame'],
                    'slot': ont['slot'],
                    'port': ont['port'],
                    'status': ont['status'],
                }
            )
        
        return {
            'status': 'success',
            'discovered_count': len(discovered_onts)
        }
    except Exception as e:
        logger.error(f"Error discovering ONTs for OLT {olt_id}: {e}", exc_info=True)
        return {
            'status': 'error',
            'error': str(e)
        }

@shared_task(name='network.tasks.check_for_new_onts')
def check_for_new_onts():
    """
    Periodic task to check for new ONTs on all active OLTs
    """
    active_olts = OLT.objects.filter(status='active')
    for olt in active_olts:
        discover_unconfigured_onts_task.delay(olt.id)