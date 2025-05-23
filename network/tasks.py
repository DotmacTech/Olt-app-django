from celery import shared_task
from django.utils import timezone
import logging # Import the logging module
import asyncio

from .models import OLT, Card, PONPort, ONU, ONUType, PONOutageEvent
from .utils.snmp_utils import get_system_metrics, get_ont_info_per_slot_async, get_all_ont_details_for_pon_port_async, get_ssh_metrics
from .utils.board_utils import get_installed_board_info
from .utils.network_utils import ping_host
from django.utils import timezone
import logging
from datetime import datetime, timedelta
from django.db import transaction

logger = logging.getLogger(__name__)

@shared_task
def update_all_onts_task():
    """
    Task to update ONT information for all PON ports across all OLTs.
    This task will:
    1. Get all active PON ports
    2. For each port, fetch ONT details via SNMP
    3. Update or create ONT records in the database
    """
    try:
        # Get all active PON ports
        pon_ports = PONPort.objects.select_related('card__olt').all()
        total_ports = pon_ports.count()
        logger.info(f"Starting ONT update for {total_ports} PON ports")
        
        updated_count = 0
        error_count = 0
        
        for port in pon_ports:
            try:
                # Use the async helper to get ONT info for this PON port
                ont_info = get_ont_info_per_slot_async(
                    host=port.card.olt.ip_address,
                    community=port.card.olt.snmp_ro_community,
                    slot=port.card.slot_number,
                    port=port.port_index_on_card,
                    olt_id=port.card.olt.id
                )
                
                if not ont_info or 'data' not in ont_info or not ont_info['data']:
                    logger.warning(f"No ONT data received for PON port {port.id} on OLT {port.card.olt.name}")
                    error_count += 1
                    continue
                
                # Process each ONT
                with transaction.atomic():
                    for ont_data in ont_info['data']:
                        try:
                            # Create or update ONT
                            ONU.objects.update_or_create(
                                pon_port=port,
                                ont_index_on_port=ont_data.get('ont_index'),
                                defaults={
                                    'serial_number': ont_data.get('serial_number'),
                                    'status': ont_data.get('status', 'unknown'),
                                    'rx_power_at_olt': ont_data.get('rx_power'),
                                    'last_snmp_update': timezone.now(),
                                    'name': ont_data.get('description', '')
                                }
                            )
                            updated_count += 1
                        except Exception as ont_error:
                            logger.error(f"Error processing ONT {ont_data.get('serial_number')} on port {port.id}: {str(ont_error)}")
                            error_count += 1
                            continue
                
                # Update the port's last update time
                port.last_snmp_update = timezone.now()
                port.save(update_fields=['last_snmp_update'])
                
            except Exception as port_error:
                logger.error(f"Error processing PON port {port.id} on OLT {port.card.olt.name}: {str(port_error)}")
                error_count += 1
                continue
        
        logger.info(f"ONT update completed. Updated: {updated_count}, Errors: {error_count}")
        return {
            'status': 'completed',
            'updated_onts': updated_count,
            'errors': error_count,
            'total_ports': total_ports
        }
        
    except Exception as e:
        logger.error(f"Critical error in update_all_onts_task: {str(e)}", exc_info=True)
        return {
            'status': 'error',
            'message': str(e)
        }

# Placeholder for WebSocket notification - we'll define this structure later
from .consumers import send_pon_outage_notification # Assuming it will be in consumers.py
from .serializers import PONOutageEventSerializer # Assuming you have/will create this

# Logger is now defined at the top of the file

@shared_task
def discover_and_create_cards_task(olt_id):
    try:
        olt = OLT.objects.get(id=olt_id)
        logger.info(f"TASK_discover_and_create_cards: Starting card discovery for OLT: {olt.name} ({olt.ip_address})")

        # Using SSH-based get_installed_board_info for card discovery
        # This function is synchronous.
        board_info_result = get_installed_board_info(
            host=olt.ip_address,
            username=olt.telnet_username, # Assuming telnet creds are used for SSH too
            password=olt.telnet_password,
            frame='0' # Adjust frame_id if necessary or make it configurable
        )

        if board_info_result:
            boards_data = board_info_result.get('data', {}).get('boards', [])
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
                    discover_and_create_pon_ports_task.apply_async(args=(card.id,), queue='receive_periodic')
            logger.info(f"TASK_discover_and_create_cards: Card discovery completed for OLT: {olt.name}")
        else:
            error_message = board_info_result.get('error', 'Unknown error during card discovery')
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
            olt.uptime = metrics.get('uptime', olt.uptime)
            olt.cpu_usage = metrics.get('cpu', olt.cpu_usage)
            olt.memory_usage = metrics.get('memory', olt.memory_usage) # 'memory' from metrics is usage %
            olt.temperature = metrics.get('temperature', olt.temperature) # 'temperature' from metrics
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
        discover_and_update_onts_for_pon_port_task.apply_async(queue='receive_periodic', args=[pon_port.id], countdown=base_delay)
        base_delay += increment_delay_by
        
    logger.info(f"TASK_periodically_update_all_onts: Finished queueing ONT data updates for {active_pon_ports.count()} PON Ports.")


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
        check_olt_reachability_task.apply_async(queue='receive_periodic', args=[olt.id], countdown=base_delay)
        base_delay += increment_delay_by
        
    logger.info(f"TASK_periodically_check_all_olts_reachability: Finished queueing checks for {olts.count()} OLTs.")

@shared_task
def periodically_update_all_olts_metrics():
    """
    Celery task to be run periodically by Celery Beat.
    It iterates through all OLTs and queues a system metrics update task for each.
    Only queues for OLTs that are considered 'active' or if you want to try updating
    metrics regardless of their last known ping status.
    """
    logger.info(f"TASK_periodically_update_all_olts_metrics: Starting periodic update...")
    
    base_delay = 0  # Start with no delay for the first task
    # Adjust this based on how many OLTs you have and typical task duration
    increment_delay_by = 20 # Stagger subsequent tasks by 10 seconds each (metrics tasks can be longer)

    # Consider which OLTs to update. For example, only active ones,
    # or all OLTs to attempt metrics fetching even if they were recently inactive.
    olts_to_update = OLT.objects.filter(status='active') # Or OLT.objects.all()

    for olt in olts_to_update:
        logger.info(f"TASK_periodically_update_all_olts_metrics: Queueing metrics update for OLT: {olt.name} (ID: {olt.id}) with delay {base_delay}s.")
        update_olt_system_metrics_task.apply_async(queue='receive_periodic', args=[olt.id], countdown=base_delay)
        base_delay += increment_delay_by
        
    logger.info(f"TASK_periodically_update_all_olts_metrics: Finished queueing metrics updates for {olts_to_update.count()} OLTs.")

@shared_task # Make sure this is a Celery task if it's to be scheduled by Celery Beat
def periodically_detect_pon_outages():
    """
    Task to detect and record PON port outages based on ONT statuses.
    """
    logger.info(f"TASK_periodically_detect_pon_outages: Starting PON outage detection...")
    pon_ports = PONPort.objects.filter(card__olt__status='active') # Only check ports on active OLTs

    # Outage detection is now based on PON port status, not recent offline ONTs
    # Define recent_offline_window_minutes or remove its usage if not intended
    recent_offline_window_minutes = getattr(settings, 'RECENT_OFFLINE_WINDOW_MINUTES', 15) # Example: get from settings or default
    for pon_port in pon_ports:
        total_onts = pon_port.onts.count()
        if total_onts == 0:
            continue # Cannot detect outage if no ONTs exist

        # If the PON port itself is down, trigger outage logic
        if pon_port.status == 'down':
            offline_onts_qs = pon_port.onts.filter(status='offline')
            offline_count = offline_onts_qs.count()
            active_outage_event = PONOutageEvent.objects.filter(pon_port=pon_port, end_time__isnull=True).first()

            if offline_count > 0:
                if not active_outage_event:
                    logger.info(f"TASK_periodically_detect_pon_outages: New PON outage on {pon_port}. {offline_count}/{total_onts} ONTs offline (PON port DOWN).")
                    causes = {}
                    for ont in offline_onts_qs:
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
        # If port is up, use the old logic to resolve outages if all ONTs are online
        offline_onts_qs = pon_port.onts.filter(status='offline')
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

        offline_onts_qs = pon_port.onts.filter(status='offline')
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
                # else:
                    # logger.debug(f"TASK_periodically_detect_pon_outages: PON Port {pon_port} - Active outage exists. Affected ONT count ({total_onts}) is the same. No new event trigger.")

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

    logger.info(f"TASK_periodically_detect_pon_outages: Finished PON outage detection cycle.")


# Add this task to your periodic schedule in admin or settings
# Example using settings.py:
# CELERY_BEAT_SCHEDULE = {
#     # ... other tasks ...
#     'detect-pon-outages-every-5-minutes': {
#         'task': 'network.tasks.periodically_detect_pon_outages', # Ensure this matches the task name
#         'schedule': timedelta(minutes=5),
#     },
# }


# celery -A oltmanager worker -l info -P threads
# celery -A oltmanager beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler