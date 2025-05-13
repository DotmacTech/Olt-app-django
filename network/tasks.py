from celery import shared_task
from django.utils import timezone
import asyncio

from .models import OLT, Card, PONPort, ONU, ONUType # Ensure OLT is imported
from .utils.snmp_utils import get_system_metrics # Assuming you might have this
from .utils.board_utils import get_installed_board_info # SSH based card discovery
from .utils.snmp_utils import get_ont_info_per_slot_async, get_all_ont_details_for_pon_port_async, get_ssh_metrics # Import new ONT fetcher
from .utils.network_utils import ping_host
@shared_task
def discover_and_create_cards_task(olt_id):
    try:
        olt = OLT.objects.get(id=olt_id)
        print(f"Starting card discovery for OLT: {olt.name} ({olt.ip_address})")

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
                    print(f"Created card in slot {card.slot_number} for OLT {olt.name}")
                else:
                    print(f"Updated card in slot {card.slot_number} for OLT {olt.name}")

                # If the card has ports and is likely a PON card, trigger PON port discovery
                # Adjust condition based on how you identify PON cards (e.g., card_type name)
                if card.port_count > 0: # Basic check
                    discover_and_create_pon_ports_task.delay(card.id)
            print(f"Card discovery completed for OLT: {olt.name}")
        else:
            error_message = board_info_result.get('error', 'Unknown error during card discovery')
            print(f"Card discovery failed for OLT {olt.name}: {error_message}")
            # Optionally, update OLT status or log this error more formally

    except OLT.DoesNotExist:
        print(f"OLT with id {olt_id} not found for card discovery.")
    except Exception as e:
        print(f"Error in discover_and_create_cards_task for OLT {olt_id}: {e}")

@shared_task
def discover_and_create_pon_ports_task(card_id):
    try:
        card = Card.objects.select_related('olt').get(id=card_id)
        olt = card.olt
        print(f"Starting PON port discovery for OLT: {olt.name}, Card Slot: {card.slot_number}")

        if not olt.ip_address or not olt.snmp_ro_community:
            print(f"OLT {olt.name} is missing IP address or SNMP community string. Skipping PON port discovery.")
            return

        num_pon_ports_on_card = card.port_count
        if num_pon_ports_on_card <= 0: # Or a more specific check like card.card_type == 'GPON_16_PORT'
             print(f"Card in slot {card.slot_number} has {num_pon_ports_on_card} ports or is not a recognized PON card. Skipping PON port discovery.")
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
                print(f"Skipping invalid port data: {port_data_snmp}")
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
        
        print(f"Successfully updated/created {len(updated_ports_in_db)} PON ports for OLT: {olt.name}, Card Slot: {card.slot_number}")

    except Card.DoesNotExist:
        print(f"Error in discover_and_create_pon_ports_task: Card with id {card_id} not found.")
    except Exception as e:
        print(f"Error in discover_and_create_pon_ports_task for Card {card_id}: {e}")
        # For more detailed debugging of where the TypeError occurs:
        import traceback
        traceback.print_exc() 
        raise # Re-raise to mark task as failed

@shared_task
def discover_and_update_onts_for_pon_port_task(pon_port_id):
    try:
        pon_port = PONPort.objects.select_related('card__olt').get(id=pon_port_id)
        card = pon_port.card
        olt = card.olt

        print(f"Starting ONT discovery for OLT: {olt.name}, Card Slot: {card.slot_number}, PON Port Index: {pon_port.port_index_on_card}")

        if not olt.ip_address or not olt.snmp_ro_community:
            print(f"OLT {olt.name} is missing IP/SNMP details. Skipping ONT discovery.")
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
        print(f"DEBUG TASKS: Raw SNMP data for ONTs on PON Port {pon_port_id} (count: {len(ont_details_snmp)}): {ont_details_snmp}")

        updated_onts_count = 0
        for ont_data in ont_details_snmp:
            if not ont_data or not ont_data.get("serial_number"):
                print(f"DEBUG TASKS: Skipping ONT data because it's invalid or missing serial number: {ont_data}")
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
        
        print(f"Successfully updated/created {updated_onts_count} ONTs for PON Port ID {pon_port_id}")

    except PONPort.DoesNotExist:
        print(f"Error in discover_and_update_onts_for_pon_port_task: PONPort with id {pon_port_id} not found.")
    except Exception as e:
        print(f"Error in discover_and_update_onts_for_pon_port_task for PONPort {pon_port_id}: {e}")
        import traceback
        traceback.print_exc()
        raise
   

@shared_task
def update_olt_system_metrics_task(olt_id):
    """
    Celery task to fetch and update system metrics for a given OLT.
    """
    try:
        olt = OLT.objects.get(pk=olt_id)
        print(f"Starting system metrics update for OLT: {olt.name} ({olt.ip_address})")

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
        print(f"Successfully updated system metrics for OLT: {olt.name}")
    except OLT.DoesNotExist:
        print(f"OLT with ID {olt_id} not found for metrics update.")
    except Exception as e:
        print(f"Error in update_olt_system_metrics_task for OLT ID {olt_id}: {e}")
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
            print(f"Could not save error status to OLT {olt_id} after task failure: {save_e}")
@shared_task
def check_olt_reachability_task(olt_id):
    """
    Celery task to check OLT reachability via ping and update its status.
    """
    try:
        olt = OLT.objects.get(pk=olt_id)
        print(f"Checking reachability for OLT: {olt.name} ({olt.ip_address})")

        is_reachable = ping_host(olt.ip_address)
        print(f"[TASK_DEBUG] OLT: {olt.name} ({olt.ip_address}) - ping_host returned: {is_reachable}")

        new_status = 'active' if is_reachable else 'inactive'

        if olt.status != new_status:
            olt.status = new_status
            # last_seen is auto_now=True, so it will be updated on save
            olt.save(update_fields=['status', 'last_seen']) 
            print(f"OLT {olt.name} reachability: {is_reachable}. Status set to {new_status}.")
        else:
            # Even if status hasn't changed, update last_seen to show we checked
            olt.save(update_fields=['last_seen'])
            print(f"OLT {olt.name} reachability: {is_reachable}. Status remains {new_status}.")

    except OLT.DoesNotExist:
        print(f"OLT with ID {olt_id} not found for reachability check.")
    except Exception as e:
        print(f"Error in check_olt_reachability_task for OLT ID {olt_id}: {e}")
        try:
            olt_obj = OLT.objects.get(pk=olt_id)
            olt_obj.status = 'error' # Indicate an error during the ping check itself
            olt_obj.save(update_fields=['status', 'last_seen'])
        except Exception: # Catch OLT.DoesNotExist or other save errors
            pass # Logged above or OLT doesn't exist

@shared_task
def periodically_update_all_onts_data():
    """
    Celery task to be run periodically by Celery Beat.
    It iterates through all PON Ports and queues an ONT update task for each.
    """
    print(f"[{timezone.now()}] Starting periodic update for all ONTs data...")
    # We only want to update ONTs for PON ports that belong to active OLTs
    # and have a configured SNMP community string.
    active_pon_ports = PONPort.objects.filter(
        card__olt__status='active', 
        card__olt__snmp_ro_community__isnull=False
    ).exclude(card__olt__snmp_ro_community__exact='')

    for pon_port in active_pon_ports:
        print(f"[{timezone.now()}] Queueing ONT data update for PON Port ID: {pon_port.id} (OLT: {pon_port.card.olt.name}, Card: {pon_port.card.slot_number}, Port: {pon_port.port_index_on_card})")
        discover_and_update_onts_for_pon_port_task.delay(pon_port.id)
    
    print(f"[{timezone.now()}] Finished queueing ONT data updates for {active_pon_ports.count()} PON Ports.")


@shared_task
def periodically_check_all_olts_reachability():
    """
    Celery task to be run periodically by Celery Beat.
    It iterates through all OLTs and queues a reachability check for each.
    """
    print("Starting periodic check for all OLTs reachability...")
    olts = OLT.objects.filter(status__in=['active', 'error', 'unknown', 'inactive']) # Or simply OLT.objects.all() if you want to check all regardless of current status
    
    for olt in olts:
        print(f"Queueing reachability check for OLT: {olt.name} (ID: {olt.id})")
        check_olt_reachability_task.delay(olt.id)
    
    print(f"Finished queueing reachability checks for {olts.count()} OLTs.")


# celery -A oltmanager worker -l info -P threads