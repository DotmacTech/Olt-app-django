from celery import shared_task
from django.utils import timezone
import asyncio

from .models import OLT, Card, PONPort
from .utils.snmp_utils import get_system_metrics as get_snmp_system_metrics # Assuming you might have this
from .utils.snmp_utils import get_ont_info_per_port,get_ont_info_per_slot_async # This is the synchronous wrapper
from .utils.board_utils import get_installed_board_info # SSH based card discovery


# logger = logging.getLogger(__name__)

# # Configure periodic tasks
# app.conf.beat_schedule = {
#     'update-all-olts-metrics': {
#         'task': 'network.tasks.update_all_olts_metrics',
#         'schedule': crontab(minute='*/5'),  # Run every 5 minutes
#     },
# }

# @shared_task(bind=True, max_retries=3)
# async def update_olt_metrics(self, olt_id):
#     try:
#         olt = OLT.objects.get(id=olt_id)
        
#         # Initialize SNMP client
#         client = SNMPClient(
#             host=olt.ip_address,
#             community=olt.snmp_ro_community,
#             port=olt.snmp_port,
#             version=olt.snmp_version,
#             timeout=10,
#             retries=2
#         )
        
#         # Get metrics
#         metrics = await client.get_system_metrics()
        
#         # Update OLT with new metrics
#         olt.temperature = metrics.get('temperature')
#         olt.uptime = metrics.get('uptime')
#         olt.cpu_usage = metrics.get('cpu_usage')
#         olt.memory_usage = metrics.get('memory_usage')
#         olt.memory_total = metrics.get('memory_total')
#         olt.memory_free = metrics.get('memory_free')
#         olt.storage_usage = metrics.get('storage_usage')
#         olt.last_metrics_update = metrics['timestamp']
#         olt.metrics_status = metrics['status']
#         olt.metrics_error = metrics.get('error')
        
#         olt.save()
        
#         if metrics['status'] == 'success':
#             logger.info(
#                 "Updated metrics for OLT %s: CPU=%s%%, Memory=%s%%, Temp=%s°C",
#                 olt.name,
#                 olt.cpu_usage,
#                 olt.memory_usage,
#                 olt.temperature
#             )
#             return True
#         else:
#             logger.error(
#                 "Failed to get some metrics for OLT %s: %s",
#                 olt.name,
#                 metrics.get('error', 'Unknown error')
#             )
#             return False
        
#     except OLT.DoesNotExist:
#         logger.error("OLT with id %s not found", olt_id)
#         return False
        
#     except SNMPError as e:
#         # Retry on SNMP errors with exponential backoff
#         retry_countdown = 60 * (2 ** self.request.retries)  # 60s, 120s, 240s
#         self.retry(exc=e, countdown=retry_countdown)
        
#     except Exception as e:
#         logger.error(
#             "Critical error updating metrics for OLT %s: %s",
#             olt_id,
#             str(e),
#             exc_info=True
#         )
#         return False

# @shared_task
# def update_all_olts_metrics():
#     """Update metrics for all OLTs"""
#     try:
#         # Get OLTs that haven't been updated in the last 4 minutes
#         cutoff_time = timezone.now() - timezone.timedelta(minutes=4)
#         olts = OLT.objects.filter(
#             models.Q(last_metrics_update__isnull=True) |
#             models.Q(last_metrics_update__lt=cutoff_time)
#         )
        
#         logger.info("Starting metrics update for %d OLTs", olts.count())
        
#         for olt in olts:
#             # Add some randomization to prevent all tasks starting at once
#             countdown = random.randint(0, 30)
#             update_olt_metrics.apply_async(
#                 args=[olt.id],
#                 countdown=countdown
#             )
        
#         return True
        
#     except Exception as e:
#         logger.error(
#             "Failed to schedule OLT metrics updates: %s",
#             str(e),
#             exc_info=True
#         )
#         return False

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


    # celery -A oltmanager worker -l info -P threads