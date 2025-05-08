from rest_framework import viewsets,status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from .models import (
    OLT, Card, PONPort, UplinkPort, VLAN,
    ONUType, ONU, Zone, ODB, SpeedProfile
)
from .serializers import ( # Import the new serializers
    OLTListSerializer, OLTDetailSerializer, OLTCreateUpdateSerializer, PONPortSerializer,
    CardSerializer,
    UplinkPortSerializer, VLANSerializer, ONUTypeSerializer, ONUSerializer,
    ZoneSerializer, ODBSerializer, SpeedProfileSerializer
)
from .utils.board_utils import get_installed_board_info # Assuming this is the correct pa
# from .tasks import update_olt_metrics
from .utils.snmp_utils import get_ont_info_per_port  # Use the fully async version
from .tasks import discover_and_create_pon_ports_task # Import the Celery task


class OLTViewSet(viewsets.ModelViewSet):
    queryset = OLT.objects.all()
    # Remove the fixed serializer_class here
    # serializer_class = OLTSerializer

    def get_serializer_class(self):
        """Return appropriate serializer class based on action."""
        if self.action == 'retrieve':
            return OLTDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return OLTCreateUpdateSerializer
        # Default to list serializer for 'list' action or others
        return OLTListSerializer

    @action(detail=True, methods=['get'])
    def cards(self, request, pk=None):
        """Return cards for this OLT; if none, fetch via SSH and create them."""
        # Try to get cards from DB
        cards_qs = Card.objects.filter(olt_id=pk)
        if cards_qs.exists():
            serializer = CardSerializer(cards_qs, many=True)
            return Response(serializer.data)
        # No cards: fetch via SSH and create
        olt = self.get_object()
        try:
            # Use the already imported function
            # from network.utils.board_utils import get_installed_board_info
            board_info = get_installed_board_info(
                olt.ip_address,
                olt.telnet_username,
                olt.telnet_password # Assuming password is required, add port if needed
            )
            boards = board_info.get('data', {}).get('boards', [])
            created_cards = []
            for board in boards:
                card = Card.objects.create(
                    olt=olt,
                    slot_number=board.get('slot'),
                    card_type=board.get('board_name'),
                    port_count=board.get('port_count'),
                    status=board.get('status')
                )
                created_cards.append(card)
            serializer = CardSerializer(created_cards, many=True)
            return Response(serializer.data)
        except ImportError:
            return Response({'error': 'SSH board info utility not found'}, status=500)
        
        
    @action(detail=True, methods=['get'], url_path='slot/(?P<slot_number_str>[^/.]+)/pon-port-details')
    def pon_port_details_for_slot(self, request, pk=None, slot_number_str=None):
        """
        Retrieves PON port details (description, status, ONT counts) for a specific slot of an OLT.
        It first checks the database. If data is not present or stale, it fetches from SNMP and updates the DB.
        The slot_number_str from the URL is used to identify the card.
        """
        olt = self.get_object() # OLT instance
        try:
            slot_number = int(slot_number_str)
            if not (0 <= slot_number < 64): # Basic validation for slot number range
                # This range might need to be adjusted based on your OLT's max slot number
                raise ValueError("Slot number out of typical range.")
        except ValueError:
            return Response({"error": "Invalid slot number format or value."}, status=status.HTTP_400_BAD_REQUEST)

        if not olt.snmp_ro_community:
             return Response({"error": "OLT SNMP read-only community string is not configured."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Fetch the specific card for the given OLT and slot_number
            # Find any card associated with this OLT that has port_count = 16
            # The slot_number from the URL is validated but not used to pick the card for SNMP here.
            # Get the specific card for the given OLT and slot_number.
            # If it doesn't exist, we might need to create it or handle it.
            # For now, we assume it should exist if this endpoint is called,
            # possibly created when viewing the OLT cards list.
            # If the card has a specific port_count (e.g., 16) that's a prerequisite for SNMP,
            # that logic should be here.
            try:
                # Using the slot_number from the URL to fetch the card
                target_card = Card.objects.get(olt=olt, slot_number=slot_number)
            except Card.DoesNotExist:
                 # Optionally, create the card if it's guaranteed to exist on the OLT
                 # For now, let's return an error if the card isn't in the DB.
                 # This implies that the card list should be populated first.
                return Response(
                    {"error": f"Card in slot {slot_number} not found in database for OLT {olt.name}. Please ensure cards are discovered first."},
                    status=status.HTTP_404_NOT_FOUND
                )
            # Check if the card is supposed to have a specific number of ports for this operation
            if target_card.port_count != 16: # Example: only proceed for 16-port cards
                 return Response({
                     "error": f"The card in slot {slot_number} has {target_card.port_count} ports. This operation is intended for 16-port cards."
                 }, status=status.HTTP_400_BAD_REQUEST)
            
            num_pon_ports_on_card = target_card.port_count

            # Try to fetch from DB first
            db_pon_ports = PONPort.objects.filter(card=target_card).order_by('port_index_on_card')
            
            # Define staleness threshold (e.g., 15 minutes)
            staleness_threshold = timezone.now() - timedelta(minutes=15)
            
            refresh_from_snmp = False # Default to refresh
            # if db_pon_ports.exists() and db_pon_ports.count() == num_pon_ports_on_card:
            #     # Check if all ports have a recent last_snmp_update
            #     if all(port.last_snmp_update and port.last_snmp_update > staleness_threshold for port in db_pon_ports):
            #         refresh_from_snmp = False
            
            if not refresh_from_snmp:
                serializer = PONPortSerializer(db_pon_ports, many=True)
                return Response(serializer.data)

            # # Fetch from SNMP, then save/update DB
            # pon_details_data_snmp = get_ont_info_per_port(
            #     ip=olt.ip_address,
            #     community=olt.snmp_ro_community,
            #     slot_num=target_card.slot_number, # Use the slot_number of the found 16-port card
            #     number_of_ports=num_pon_ports_on_card
            # )
            # updated_ports_in_db = []
            # for port_data_snmp in pon_details_data_snmp:
            #     pon_port_obj, created = PONPort.objects.update_or_create(
            #         card=target_card,
            #         port_index_on_card=port_data_snmp.get('port_id'), # Matches key from _fetch_one_port_details_async
            #         defaults={
            #             'description': port_data_snmp.get('port_desc'),
            #             'status': str(port_data_snmp.get('port_status')), # Ensure it's a string
            #             'configured_onts': port_data_snmp.get('number_of_olt', 0),
            #             'online_onts': port_data_snmp.get('online', 0),
            #             'tx_power': port_data_snmp.get('tx_power'),
            #             'rx_power': port_data_snmp.get('rx_power'),
            #             'last_snmp_update': timezone.now()
            #         }
            #     )
            #     updated_ports_in_db.append(pon_port_obj)
            
            # serializer = PONPortSerializer(updated_ports_in_db, many=True)
            # return Response(serializer.data)
            
        except Exception as e:
            print(f"Error in pon_port_details_for_slot view for OLT {olt.id}, Slot {slot_number}: {e}")
            return Response({"error": f"Failed to retrieve PON port details via SNMP: {str(e)}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    @action(detail=True, methods=['post'], url_path='slot/(?P<slot_number_str>[^/.]+)/refresh-pon-details')
    def refresh_pon_port_details(self, request, pk=None, slot_number_str=None):
        """
        Triggers a background task to refresh PON port details for a specific slot of an OLT.
        """
        olt = self.get_object()
        try:
            slot_number = int(slot_number_str)
            if not (0 <= slot_number < 64):
                raise ValueError("Slot number out of typical range.")
        except ValueError:
            return Response({"error": "Invalid slot number format or value."}, status=status.HTTP_400_BAD_REQUEST)

        if not olt.snmp_ro_community:
            return Response({"error": "OLT SNMP read-only community string is not configured."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            target_card = Card.objects.get(olt=olt, slot_number=slot_number)
            # Optional: Add a check here if only specific card types or port_counts should be refreshed
            # if target_card.port_count != 16: # Example
            #     return Response({"error": "This card type/port count is not eligible for PON port refresh."}, status=status.HTTP_400_BAD_REQUEST)

            # Trigger the Celery task
            discover_and_create_pon_ports_task.delay(target_card.id)
            
            return Response({"message": "PON port details refresh initiated in the background."}, status=status.HTTP_202_ACCEPTED)
        except Card.DoesNotExist:
            return Response({"error": f"Card in slot {slot_number} not found for OLT {olt.name}."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"Failed to initiate PON port refresh: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    # @action(detail=True, methods=['post'])
    # def refresh_metrics(self, request, pk=None):
    #     """Manually trigger metrics update for an OLT"""
    #     olt = self.get_object()
    #     task = update_olt_metrics.delay(olt.id)
    #     return Response({'status': 'Metrics update initiated', 'task_id': task.id})

class CardViewSet(viewsets.ModelViewSet):
    queryset = Card.objects.all()
    serializer_class = CardSerializer

class PONPortViewSet(viewsets.ModelViewSet):
    queryset = PONPort.objects.all()
    serializer_class = PONPortSerializer

class UplinkPortViewSet(viewsets.ModelViewSet):
    queryset = UplinkPort.objects.all()
    serializer_class = UplinkPortSerializer

class VLANViewSet(viewsets.ModelViewSet):
    queryset = VLAN.objects.all()
    serializer_class = VLANSerializer

class ONUTypeViewSet(viewsets.ModelViewSet):
    queryset = ONUType.objects.all()
    serializer_class = ONUTypeSerializer

class ONUViewSet(viewsets.ModelViewSet):
    queryset = ONU.objects.all()
    serializer_class = ONUSerializer

class ZoneViewSet(viewsets.ModelViewSet):
    queryset = Zone.objects.all()
    serializer_class = ZoneSerializer

class ODBViewSet(viewsets.ModelViewSet):
    queryset = ODB.objects.all()
    serializer_class = ODBSerializer

class SpeedProfileViewSet(viewsets.ModelViewSet):
    queryset = SpeedProfile.objects.all()
    serializer_class = SpeedProfileSerializer
