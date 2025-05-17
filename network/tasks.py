from celery import shared_task
from django.utils import timezone
import asyncio

from .models import OLT, Card, PONPort, ONU, ONUType, PONOutageEvent # Ensure PONOutageEvent is imported
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
        print(f"[{timezone.now()}] Queueing ONT data update for PON Port ID: {pon_port.id} (OLT: {pon_port.card.olt.name}, Card: {pon_port.card.slot_number}, Port: {pon_port.port_index_on_card}) with a delay of {base_delay} seconds.")
        discover_and_update_onts_for_pon_port_task.apply_async(args=[pon_port.id], countdown=base_delay)
        base_delay += increment_delay_by
        
    print(f"[{timezone.now()}] Finished queueing ONT data updates for {active_pon_ports.count()} PON Ports with staggering.")


@shared_task
def periodically_check_all_olts_reachability():
    """
    Celery task to be run periodically by Celery Beat.
    It iterates through all OLTs and queues a reachability check for each.
    """
    print("Starting periodic check for all OLTs reachability...")
    
    base_delay = 0  # Start with no delay for the first task
    # Adjust this based on how many OLTs you have and typical task duration
    increment_delay_by = 5  # Stagger subsequent tasks by 5 seconds each

    olts = OLT.objects.filter(status__in=['active', 'error', 'unknown', 'inactive']) # Or simply OLT.objects.all() if you want to check all regardless of current status
    
    for olt in olts:
        print(f"Queueing reachability check for OLT: {olt.name} (ID: {olt.id}) with a delay of {base_delay} seconds.")
        check_olt_reachability_task.apply_async(args=[olt.id], countdown=base_delay)
        base_delay += increment_delay_by
        
    print(f"Finished queueing reachability checks for {olts.count()} OLTs with staggering.")

@shared_task
def periodically_update_all_olts_metrics():
    """
    Celery task to be run periodically by Celery Beat.
    It iterates through all OLTs and queues a system metrics update task for each.
    Only queues for OLTs that are considered 'active' or if you want to try updating
    metrics regardless of their last known ping status.
    """
    print(f"[{timezone.now()}] Starting periodic update for all OLTs system metrics...")
    
    base_delay = 0  # Start with no delay for the first task
    # Adjust this based on how many OLTs you have and typical task duration
    increment_delay_by = 20 # Stagger subsequent tasks by 10 seconds each (metrics tasks can be longer)

    # Consider which OLTs to update. For example, only active ones,
    # or all OLTs to attempt metrics fetching even if they were recently inactive.
    olts_to_update = OLT.objects.filter(status='active') # Or OLT.objects.all()

    for olt in olts_to_update:
        print(f"[{timezone.now()}] Queueing system metrics update for OLT: {olt.name} (ID: {olt.id}) with a delay of {base_delay} seconds.")
        update_olt_system_metrics_task.apply_async(args=[olt.id], countdown=base_delay)
        base_delay += increment_delay_by
        
    print(f"[{timezone.now()}] Finished queueing system metrics updates for {olts_to_update.count()} OLTs with staggering.")

# ... (existing imports and tasks) ...

@shared_task
def periodically_detect_pon_outages():
    """
    Task to detect and record PON port outages based on ONT statuses.
    """
    print(f"[{timezone.now()}] Starting PON outage detection (v2 - no overall percentage threshold)...")
    pon_ports = PONPort.objects.filter(card__olt__status='active') # Only check ports on active OLTs

    # Removed: outage_threshold_percentage
    recent_offline_window_minutes = 10 # ONTs must have gone offline in the last 10 minutes to be considered "recent"
    # Removed: recent_offline_significance_threshold

    for pon_port in pon_ports:
        total_onts = pon_port.onts.count()
        if total_onts == 0:
            # print(f"DEBUG: PON Port {pon_port.id} ({pon_port}) has no ONTs. Skipping.")
            continue # Cannot detect outage if no ONTs exist

        offline_onts_qs = pon_port.onts.filter(status='offline')
        offline_count = offline_onts_qs.count()
        # print(f"DEBUG: PON Port {pon_port.id} ({pon_port}) - Total ONTs: {total_onts}, Offline ONTs: {offline_count}")

        active_outage = PONOutageEvent.objects.filter(pon_port=pon_port, end_time__isnull=True).first()

        if offline_count > 0:
            # There are offline ONTs. Check if this is a new/escalating outage.
            recent_offline_onts_qs = offline_onts_qs.filter(
                last_down_time__gte=timezone.now() - timezone.timedelta(minutes=recent_offline_window_minutes)
            )
            recent_offline_count = recent_offline_onts_qs.count()
            # print(f"DEBUG: PON Port {pon_port.id} ({pon_port}) - Recently Offline ONTs (last {recent_offline_window_minutes}min): {recent_offline_count}")

            # Condition for a *new* outage:
            # 1. No active outage already recorded for this port.
            # 2. Some ONTs went offline recently.
            # (offline_count > 0 is already established by the outer if condition)
            if not active_outage and recent_offline_count > 0:

                print(f"[{timezone.now()}] New PON outage detected on {pon_port}. {offline_count}/{total_onts} ONTs offline, {recent_offline_count} of them recently.")

                causes = {}
                for ont in recent_offline_onts_qs: # Use the queryset for recent offline ONTs
                    cause = ont.last_down_cause or 'Unknown Cause'
                    causes[cause] = causes.get(cause, 0) + 1
                possible_cause = max(causes, key=causes.get) if causes else 'Unknown Cause'
                # print(f"DEBUG: PON Port {pon_port.id} ({pon_port}) - Determined cause: {possible_cause}")

                PONOutageEvent.objects.create(
                    pon_port=pon_port,
                    affected_ont_count=offline_count, # Total offline ONTs on this port
                    possible_cause=possible_cause
                )
            elif active_outage:
                # An outage is already active. Update its affected_ont_count if it has changed.
                if active_outage.affected_ont_count != offline_count:
                    print(f"[{timezone.now()}] Updating affected ONT count for active outage on {pon_port} from {active_outage.affected_ont_count} to {offline_count}.")
                    active_outage.affected_ont_count = offline_count
                    # Note: Cause is not re-evaluated here for simplicity, but could be if desired.
                    active_outage.save(update_fields=['affected_ont_count'])
                # else:
                    # print(f"DEBUG: PON Port {pon_port.id} ({pon_port}) - Active outage exists. Offline count ({offline_count}) is the same. No new event trigger.")
            # else:
                # Offline ONTs exist, but not enough went down recently to trigger a *new* outage event,
                # or no active outage exists to update.
                # print(f"DEBUG: PON Port {pon_port.id} ({pon_port}) - Offline ONTs present ({offline_count}), but recent offline activity ({recent_offline_count}/{offline_count}) doesn't meet threshold for new outage, or no active outage.")

        else: # offline_count == 0
            # No ONTs are offline on this port.
            # If there was an active outage, it has now ended.
            if active_outage:
                print(f"[{timezone.now()}] PON outage on {pon_port} has ended. All {total_onts} ONTs are online.")
                active_outage.end_time = timezone.now()
                active_outage.save(update_fields=['end_time'])
            # else:
                # print(f"DEBUG: PON Port {pon_port.id} ({pon_port}) - All ONTs online. No active outage to end.")

    print(f"[{timezone.now()}] Finished PON outage detection.")

# Add this task to your periodic schedule in admin or settings
# Example using settings.py:
# CELERY_BEAT_SCHEDULE = {
#     # ... other tasks ...
#     'detect-pon-outages-every-5-minutes': {
#         'task': 'network.tasks.detect_pon_outages',
#         'schedule': timedelta(minutes=5),
#     },
# }


# celery -A oltmanager worker -l info -P threads
# celery -A oltmanager beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler