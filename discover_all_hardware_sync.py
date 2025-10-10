import os
import sys
import django
import asyncio
from django.utils import timezone
from asgiref.sync import sync_to_async

# --- Setup Django Environment ---
def setup_django():
    """Initializes the Django environment."""
    project_path = os.path.dirname(os.path.abspath(__file__))
    sys.path.append(project_path)
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'oltmanager.settings')
    try:
        django.setup()
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc

async def discover_cards_for_olt(olt):
    """
    Synchronously discovers and updates cards for a single OLT.
    Returns a list of card objects that were found.
    """
    from network.models import Card
    from network.utils.board_utils import get_installed_board_info

    print(f"  -> Discovering cards via SSH...")
    found_cards = []
    try:
        board_info_result = await get_installed_board_info(
            host=olt.ip_address,
            username=olt.telnet_username,
            password=olt.telnet_password,
            frame=getattr(olt, 'frame_id', '0')
        )

        print(f"  -> Raw board_info_result: {board_info_result}")  # Debug print

        # Fix: Check for 'data' and 'boards' keys instead of 'status'
        boards_data = board_info_result.get('data', {}).get('boards', [])
        if boards_data:
            print(f"  -> Found {len(boards_data)} cards on the device. Syncing with database...")
            for board_data in boards_data:
                card, created = await sync_to_async(Card.objects.update_or_create, thread_sensitive=True)(
                    olt=olt,
                    slot_number=board_data.get('slot'),
                    defaults={
                        'card_type': board_data.get('board_name', 'Unknown'),
                        'status': board_data.get('status', 'Unknown'),
                        'port_count': board_data.get('port_count', 0)
                    }
                )
                action = "Created" if created else "Updated"
                print(f"     - {action} card in slot {card.slot_number} (Type: {card.card_type})")
                found_cards.append(card)
        else:
            error_message = board_info_result.get('error', 'Unknown error')
            print(f"  -> ERROR: Failed to discover cards: {error_message}")
    except Exception as e:
        print(f"  -> CRITICAL ERROR during card discovery: {e}")
    return found_cards

async def discover_pon_ports_for_card(card):
    """Synchronously discovers and updates PON ports for a single card."""
    from network.models import PONPort
    from network.utils.snmp_utils import get_ont_info_per_slot_async

    # Fix: fetch olt using sync_to_async to avoid SynchronousOnlyOperation
    olt = await sync_to_async(getattr, thread_sensitive=True)(card, 'olt')
    print(f"    -> Discovering PON ports for card in slot {card.slot_number} via SNMP...")
    if card.port_count <= 0:
        print(f"    -> Skipping PON port discovery, card has {card.port_count} ports.")
        return

    try:
        pon_details_data = await get_ont_info_per_slot_async(
            ip=olt.ip_address,
            community=olt.snmp_ro_community,
            slot_num=card.slot_number,
            number_of_ports=card.port_count,
            snmp_port=olt.snmp_port
        )

        for port_data in pon_details_data:
            await sync_to_async(PONPort.objects.update_or_create, thread_sensitive=True)(
                card=card,
                port_index_on_card=port_data.get('port_id'),
                defaults={
                    'description': port_data.get('port_desc'),
                    'status': str(port_data.get('port_status')),
                    'configured_onts': port_data.get('number_of_olt', 0),
                    'online_onts': port_data.get('online', 0),
                    'tx_power': port_data.get('tx_power'),
                    'rx_power': port_data.get('rx_power'),
                    'last_snmp_update': timezone.now()
                }
            )
        print(f"    -> Successfully synced {len(pon_details_data)} PON ports for card in slot {card.slot_number}.")
    except Exception as e:
        print(f"    -> CRITICAL ERROR during PON port discovery for card {card.id}: {e}")

async def main():
    """Main function to trigger synchronous hardware discovery for all OLTs."""
    print("--- Starting Synchronous Full Hardware Discovery Script ---")
    setup_django()
    from network.models import OLT
    
    # Fetch all OLTs asynchronously by wrapping the sync ORM call and converting to a list
    all_olts_list = await sync_to_async(list, thread_sensitive=True)(OLT.objects.all())

    if not all_olts_list:
        print("No OLTs found in the database. Exiting.")
        return

    print(f"Found {len(all_olts_list)} OLT(s) to process.")
    for i, olt in enumerate(all_olts_list):
        print(f"\n[{i + 1}/{len(all_olts_list)}] Processing OLT: {olt.name} (ID: {olt.id}, IP: {olt.ip_address})")
        found_cards = await discover_cards_for_olt(olt)
        for card in found_cards:
            await discover_pon_ports_for_card(card)

    print("\n--- Synchronous Hardware Discovery Script Finished ---")

if __name__ == "__main__":
    asyncio.run(main())