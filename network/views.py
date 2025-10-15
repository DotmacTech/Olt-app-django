import asyncio
import logging # Import the logging module
from datetime import timedelta

from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Count, Q

from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, status, generics, mixins
from rest_framework.decorators import action,api_view, permission_classes # For function-based views
from rest_framework.response import Response

from rest_framework.views import APIView
from .models import UnconfiguredONT

from network.utils.snmp_utils import get_system_metrics

logger = logging.getLogger(__name__)


from .models import (
    OLT, Card, PONPort, UplinkPort, VLAN,
    ONUType, ONU, Zone, ODB, SpeedProfile, PONOutageEvent, NetworkStatusData, UnconfiguredONT
)
from .serializers import ( # Import the new serializers
    OLTListSerializer, OLTDetailSerializer, OLTCreateUpdateSerializer, PONPortSerializer,
    CardSerializer, PONPortSerializer, ONUSerializer, UplinkPortSerializer, VLANSerializer, ONUTypeSerializer, ONUSerializer,
    ZoneSerializer, ODBSerializer, SpeedProfileSerializer, PONOutageEventSerializer, NetworkStatusDataSerializer
)
from .utils.board_utils import get_installed_board_info # Assuming this is the correct pa
# from .tasks import update_olt_metrics
from .utils.snmp_utils import get_ont_info_per_slot_async, get_all_ont_details_for_pon_port_async
from .tasks import (
    discover_and_create_cards_task, 
    discover_and_create_pon_ports_task, 
    discover_and_update_onts_for_pon_port_task, 
    update_olt_system_metrics_task,
    check_olt_reachability_task,    
    periodically_check_all_olts_reachability,
    periodically_update_all_onts_data
)

logger = logging.getLogger(__name__) # Get a logger for this module

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

    @action(detail=True, methods=['post'], url_path='refresh-cards')
    def refresh_cards(self, request, pk=None):
        """
        Triggers a Celery task to discover/refresh cards for the OLT.
        """
        olt = self.get_object()
        logger.info(f"VIEW: Attempting to trigger card discovery for OLT ID {olt.id} ({olt.name}).")
        try:
            discover_and_create_cards_task.delay(olt.id)
            logger.info(f"VIEW: Successfully called .delay() for discover_and_create_cards_task for OLT ID {olt.id}.")
            return Response({"message": "Card discovery/refresh initiated."}, status=status.HTTP_202_ACCEPTED)
        except Exception as e:
            logger.error(f"VIEW: Error calling .delay() for discover_and_create_cards_task for OLT ID {olt.id}: {e}", exc_info=True)
            return Response({"error": "Failed to initiate card discovery."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
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
            if target_card.port_count < 1: # Example: only proceed for 16-port cards
                 return Response({
                     "error": f"The card in slot {slot_number} has {target_card.port_count} ports. This operation is intended for cards with at least 1 port."
                 }, status=status.HTTP_400_BAD_REQUEST)
            
            num_pon_ports_on_card = target_card.port_count

            # This endpoint should always fetch from the database.
            # The refresh action is separate and asynchronous.
            db_pon_ports = PONPort.objects.filter(card=target_card).order_by('port_index_on_card')
            
            serializer = PONPortSerializer(db_pon_ports, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error in pon_port_details_for_slot view for OLT {olt.id}, Slot {slot_number}: {e}", exc_info=True)
            return Response({"error": f"Failed to retrieve PON port details from database: {str(e)}"},
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
    @action(detail=True, methods=['post'], url_path='refresh-system-metrics')
    def refresh_system_metrics(self, request, pk=None):
        """
        Triggers a Celery task to refresh system metrics for the OLT.
        """
        olt = self.get_object()
        logger.info(f"VIEW: Attempting to trigger system metrics refresh for OLT ID {olt.id} ({olt.name}).")
        try:
            update_olt_system_metrics_task.delay(olt.id)
            logger.info(f"VIEW: Successfully called .delay() for update_olt_system_metrics_task for OLT ID {olt.id}.")
        except Exception as e:
            logger.error(f"VIEW: Error calling .delay() for update_olt_system_metrics_task for OLT ID {olt.id}: {e}", exc_info=True)
        return Response({"message": "System metrics refresh initiated."}, status=status.HTTP_202_ACCEPTED)
    @action(detail=True, methods=['post'], url_path='check-reachability')
    def check_reachability(self, request, pk=None):
        """
        Triggers a Celery task to check OLT reachability via ping.
        """
        olt = self.get_object()
        check_olt_reachability_task.delay(olt.id)
        return Response({"message": "OLT reachability check initiated."}, status=status.HTTP_202_ACCEPTED)

class CardViewSet(viewsets.ModelViewSet):
    serializer_class = CardSerializer
    
    def get_queryset(self):
        queryset = Card.objects.all()
        # If accessed via nested route (/olts/<olt_pk>/cards/), filter by OLT
        olt_pk = self.kwargs.get('olt_pk')
        if olt_pk is not None:
            queryset = queryset.filter(olt_id=olt_pk)
        return queryset

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



class AllONTListAPIView(APIView):
    """
    API endpoint that returns all ONTs from all PON ports.
    """
    def get(self, request, *args, **kwargs):
        onts = ONU.objects.select_related('onu_type', 'pon_port', 'pon_port__card', 'pon_port__card__olt').all().order_by('pon_port_id', 'ont_index_on_port')
        serializer = ONUSerializer(onts, many=True)
        return Response({'results': serializer.data}, status=status.HTTP_200_OK)

class ONUViewSet(mixins.ListModelMixin,
                 mixins.RetrieveModelMixin, # Optional: if you want a detail view for a single ONT
                 viewsets.GenericViewSet):
    """
    ViewSet for listing ONTs on a specific PON port and triggering their refresh.
    Accessed via /api/pon-ports/{pon_port_pk}/onts/
    """
    serializer_class = ONUSerializer
    queryset = ONU.objects.all()

    def get_queryset(self):
        """
        This view should return a list of all the ONUs
        for the PON port as determined by the pon_port_pk portion of the URL.
        """
        pon_port_pk = self.kwargs.get('pon_port_pk')
        if pon_port_pk:
            return ONU.objects.filter(pon_port_id=pon_port_pk).select_related('onu_type', 'pon_port__card__olt').order_by('ont_index_on_port')
        return ONU.objects.all()

    @action(detail=False, methods=['post'], url_path='refresh-ont-details')
    def refresh_ont_details(self, request, pon_port_pk=None):
        """
        Triggers a background task to refresh ONT details for the specified PON port.
        """
        try:
            pon_port = PONPort.objects.get(pk=pon_port_pk)
        except PONPort.DoesNotExist:
            return Response({"error": "PON Port not found."}, status=status.HTTP_404_NOT_FOUND)

        try:
            # Trigger the Celery task
            discover_and_update_onts_for_pon_port_task.delay(pon_port.id)
            return Response(
                {"message": f"ONT details refresh initiated for PON Port {pon_port.id} in the background."},
                status=status.HTTP_202_ACCEPTED
            )
        except Exception as e:
            return Response(
                {"error": f"Failed to initiate ONT details refresh: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def refresh(self, request, pk=None):
        """
        Triggers a background task to refresh a single ONT.
        """
        try:
            ont = self.get_object()
            pon_port = ont.pon_port
            # For now, we will trigger a refresh of the whole PON port,
            # as there is no task to refresh a single ONT yet.
            discover_and_update_onts_for_pon_port_task.delay(pon_port.id)
            return Response(
                {"message": f"ONT {ont.id} refresh initiated by refreshing the parent PON Port {pon_port.id}."},
                status=status.HTTP_202_ACCEPTED
            )
        except ONU.DoesNotExist:
            return Response({"error": "ONT not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response(
                {"error": f"Failed to initiate ONT refresh: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
@api_view(['GET'])
def get_olt_pon_port_context_info(request, olt_id, slot_number, pon_port_id):
    """
    Provides context information (OLT name, PON port index) 
    for breadcrumbs or headers on ONT list/detail pages.
    """
    olt = get_object_or_404(OLT, pk=olt_id)
    
    try:
        # Ensure pon_port_id is treated as an integer for the lookup
        pon_port_pk = int(pon_port_id)
        pon_port = get_object_or_404(PONPort, pk=pon_port_pk)
    except ValueError:
        return Response({"error": "Invalid PON Port ID format."}, status=status.HTTP_400_BAD_REQUEST)

    # Validate that the PON port belongs to the specified OLT and Slot
    if pon_port.card.olt_id != olt.id or pon_port.card.slot_number != int(slot_number):
        return Response(
            {"error": "PON Port does not match the specified OLT and Slot."},
            status=status.HTTP_404_NOT_FOUND
        )

    data = {
        "olt_name": olt.name,
        "pon_port": {
            "id": pon_port.id,
            "port_index_on_card": pon_port.port_index_on_card
        }
    }
    return Response(data, status=status.HTTP_200_OK)
class ZoneViewSet(viewsets.ModelViewSet):
    queryset = Zone.objects.all()
    serializer_class = ZoneSerializer

class ODBViewSet(viewsets.ModelViewSet):
    queryset = ODB.objects.all()
    serializer_class = ODBSerializer

class SpeedProfileViewSet(viewsets.ModelViewSet):
    queryset = SpeedProfile.objects.all()
    serializer_class = SpeedProfileSerializer


# class NetworkStatusViewSet(viewsets.ReadOnlyModelViewSet):
#     """
#     API endpoint that allows network status to be viewed.
#     """
#     queryset = NetworkStatus.objects.filter(is_monitored=True)
#     serializer_class = NetworkStatusSerializer
#     filter_backends = [DjangoFilterBackend]
#     filterset_fields = ['status', 'component_type']
    
#     @action(detail=False, methods=['get'])
#     def summary(self, request):
#         """
#         Get a summary of network status.
#         """
#         from django.db.models import Count, Avg, F, Q
        
#         # Get basic counts
#         total_components = self.get_queryset().count()
#         up_components = self.get_queryset().filter(status='up').count()
#         down_components = self.get_queryset().filter(status='down').count()
#         degraded_components = self.get_queryset().filter(status='degraded').count()
        
#         # Calculate average metrics
#         avg_metrics = self.get_queryset().aggregate(
#             avg_uptime=Avg('uptime'),
#             avg_response_time=Avg('response_time'),
#             avg_cpu=Avg('cpu_usage'),
#             avg_memory=Avg('memory_usage')
#         )
        
#         # Get component types with counts
#         component_types = (
#             self.get_queryset()
#             .values('component_type')
#             .annotate(count=Count('id'), up=Count('id', filter=Q(status='up')))
#             .order_by('-count')
#         )
        
#         # Prepare response
#         data = {
#             'total_components': total_components,
#             'up_components': up_components,
#             'down_components': down_components,
#             'degraded_components': degraded_components,
#             'uptime_percentage': round(avg_metrics['avg_uptime'] or 0, 2),
#             'avg_response_time': round(avg_metrics['avg_response_time'] or 0, 2) if avg_metrics['avg_response_time'] is not None else None,
#             'avg_cpu_usage': round(avg_metrics['avg_cpu'] or 0, 2) if avg_metrics['avg_cpu'] is not None else None,
#             'avg_memory_usage': round(avg_metrics['avg_memory'] or 0, 2) if avg_metrics['avg_memory'] is not None else None,
#             'component_types': list(component_types),
#             'last_updated': self.get_queryset().order_by('-last_checked').first().last_checked if self.get_queryset().exists() else None
#         }
        
#         return Response(data)

class NetworkStatusDataViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows historical network status data to be viewed.
    """
    queryset = NetworkStatusData.objects.all()
    serializer_class = NetworkStatusDataSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'timestamp']

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """
        Returns a summary of historical network status data, including average signal levels and ONT stats.
        """
        from django.db.models import Avg, Sum

        qs = self.get_queryset()

        summary_data = qs.aggregate(
            total_onts=Avg('total_onts'),
            online_onts=Avg('online_onts'),
            offline_onts=Avg('offline_onts'),
            signal_loss_onts=Avg('signal_loss_onts'),
            power_failure_onts=Avg('power_failure_onts'),
            avg_rx_power=Avg('avg_rx_power'),
            avg_tx_power=Avg('avg_tx_power'),
        )

        return Response({
            "summary": {
                "total_onts_avg": summary_data.get("total_onts", 0),
                "online_onts_avg": summary_data.get("online_onts", 0),
                "offline_onts_avg": summary_data.get("offline_onts", 0),
                "signal_loss_onts_avg": summary_data.get("signal_loss_onts", 0),
                "power_failure_onts_avg": summary_data.get("power_failure_onts", 0),
                "avg_rx_power": round(summary_data.get("avg_rx_power") or 0, 2),
                "avg_tx_power": round(summary_data.get("avg_tx_power") or 0, 2),
            }
        })



class SystemMetricsAPIView(APIView):
    def get(self, request):
        from network.models import OLT
        olt_id = request.query_params.get('olt_id')
        board = request.query_params.get('board')
        if not olt_id:
            return Response({'error': 'olt_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            olt = OLT.objects.get(id=olt_id)
        except OLT.DoesNotExist:
            return Response({'error': 'OLT not found'}, status=status.HTTP_404_NOT_FOUND)
        host = olt.ip_address
        ssh_username = olt.telnet_username
        ssh_password = olt.telnet_password
        try:
            metrics = get_system_metrics(host, ssh_username, ssh_password, board)
            print("[API DEBUG] metrics to return:", metrics)
            return Response(metrics)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def dashboard_summary_view(request):
    """
    API endpoint to provide summary statistics for the dashboard.
    """
    logger.info("API_DASHBOARD_SUMMARY: Request received. Fetching summary data.")
    try:
        total_olts = OLT.objects.count()
        online_olts = OLT.objects.filter(status='active').count()
        logger.info(f"API_DASHBOARD_SUMMARY: OLTs - Total: {total_olts}, Online: {online_olts}")

        total_onts = ONU.objects.count()
        online_onts = ONU.objects.filter(status='online').count()
        offline_onts = ONU.objects.filter(status='offline').count()
        logger.info(f"API_DASHBOARD_SUMMARY: ONUs - Total: {total_onts}, Online: {online_onts}, Offline: {offline_onts}")

        offline_power_onts = ONU.objects.filter(status='offline', last_down_cause__icontains='power').count()
        offline_los_onts = ONU.objects.filter(status='offline', last_down_cause__icontains='los').count()
        logger.info(f"API_DASHBOARD_SUMMARY: Offline ONUs - Power: {offline_power_onts}, LOS: {offline_los_onts}")
        
        all_olts_details_list = []
        olts_for_details = OLT.objects.all().order_by('name')
        logger.info(f"API_DASHBOARD_SUMMARY: Fetching details for {olts_for_details.count()} OLTs.")

        for olt in olts_for_details:
            all_olts_details_list.append({
                'id': olt.id,
                'name': olt.name,
                'status': olt.status,
                'status_display': olt.get_status_display(),
                'uptime': olt.uptime,
                'temperature': olt.temperature,
            })
        
        summary_data = {
            'total_olts': total_olts,
            'online_olts_count': online_olts,
            'total_onts': total_onts,
            'online_onts_count': online_onts,
            'offline_onts_count': offline_onts,
            'offline_power_onts_count': offline_power_onts,
            'offline_los_onts_count': offline_los_onts,
            'all_olts_details': all_olts_details_list,
        }
        logger.info(f"API_DASHBOARD_SUMMARY: Successfully prepared summary data. Total OLTs in summary: {summary_data.get('total_olts')}")
        return Response(summary_data)
    except Exception as e:
        logger.error(f"API_DASHBOARD_SUMMARY: Error preparing summary data: {e}", exc_info=True)
        return Response({"error": "Failed to generate dashboard summary.", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def pon_outage_list_view(request):
    """
    API endpoint to list active and recent PON outage events.
    """
    active_outages = PONOutageEvent.objects.filter(end_time__isnull=True)
    recent_outages = PONOutageEvent.objects.filter(
        end_time__isnull=False
    ).order_by('-created_at')[:10]  # Last 10 resolved outages
    
    active_serializer = PONOutageEventSerializer(active_outages, many=True)
    recent_serializer = PONOutageEventSerializer(recent_outages, many=True)
    
    return Response({
        'active': active_serializer.data,
        'recent': recent_serializer.data
    })

@api_view(['POST'])
def refresh_components(request):
    """
    API endpoint to force refresh different components.
    Expected POST data: {"component": "onts"|"olts"|"pon_ports"}
    """
    component = request.data.get('component')
    
    if not component:
        return Response(
            {"error": "Component type is required (onts/olts/pon_ports)"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        if component == 'onts':
            return refresh_onts()
        elif component == 'olts':
            return refresh_olts()
        elif component == 'pon_ports':
            return refresh_pon_ports()
        else:
            return Response(
                {"error": "Invalid component type. Use 'onts', 'olts', or 'pon_ports'"},
                status=status.HTTP_400_BAD_REQUEST
            )
    except Exception as e:
        logger.error(f"Error refreshing {component}: {str(e)}", exc_info=True)
        return Response(
            {"error": f"Failed to refresh {component}: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )



@api_view(['GET', 'POST'])
def refresh_onts(request):
    """
    API endpoint to trigger a staggered refresh of all ONTs across all active PON ports.
    """
    from celery import current_app
    
    logger = logging.getLogger(__name__)
    
    try:
        # Check if there's already a running task of this type
        inspector = current_app.control.inspect()
        active_tasks = inspector.active() or {}
        
        # Check if there's already a running update_all_onts_task
        for worker, tasks in active_tasks.items():
            for task in tasks:
                if task['name'] == 'network.tasks.periodically_update_all_onts_data':
                    return Response({
                        "status": "pending",
                        "message": "ONT refresh is already in progress",
                        "task_id": task['id']
                    }, status=status.HTTP_200_OK)
        
        # Trigger the fan-out Celery task
        task = periodically_update_all_onts_data.delay()
        
        logger.info(f"Started ONT refresh task with ID: {task.id}")
        
        return Response({
            "status": "started",
            "message": "ONT refresh started for all PON ports",
            "task_id": str(task.id)
        }, status=status.HTTP_202_ACCEPTED)
        
    except Exception as e:
        error_msg = f"Error triggering ONT refresh: {str(e)}"
        logger.error(error_msg, exc_info=True)
        return Response(
            {
                "status": "error",
                "message": error_msg,
                "error_type": str(type(e).__name__)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET', 'POST'])
def refresh_olts(request):
    """
    API endpoint to trigger a full refresh of all OLTs.
    
    Supports both GET and POST methods.
    
    This will:
    1. Check reachability of all OLTs
    2. Update system metrics for reachable OLTs
    3. Refresh cards and PON ports for each OLT
    
    Returns:
        Response with task ID and status
    """
    from .tasks import update_all_olts_task
    
    if request.method == 'GET':
        # Handle GET request - return a simple message about the endpoint
        return Response({
            "status": "info",
            "message": "Send a POST request to this endpoint to refresh all OLTs"
        })
    
    # Handle POST request - start the refresh task
    try:
        # Start the async task to update all OLTs
        task = update_all_olts_task.delay()
        
        # Log the task initiation
        logger.info(f"Started full OLT update task with ID: {task.id}")
        
        return Response({
            "status": "success",
            "message": "Full OLT update started for all OLTs. This may take several minutes.",
            "task_id": str(task.id)
        }, status=status.HTTP_202_ACCEPTED)
        
    except Exception as e:
        logger.error(f"Error starting full OLT update: {str(e)}")
        return Response(
            {"status": "error", "message": f"Failed to start full OLT update: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET', 'POST'])

def refresh_pon_ports(request):
    """
    API endpoint to trigger a refresh of all PON ports.
    
    Supports both GET and POST methods.
    
    This will:
    1. Get all reachable OLTs
    2. Queue PON port discovery for each OLT
    3. Return a summary of the operation
    
    Returns:
        Response with task ID and status
    """
    from .tasks import update_all_pon_ports_task
    
    if request.method == 'GET':
        # Handle GET request - return a simple message about the endpoint
        return Response({
            "status": "info",
            "message": "Send a POST request to this endpoint to refresh all PON ports"
        })
    
    # Handle POST request - start the refresh task
    try:
        # Start the async task to update all PON ports
        task = update_all_pon_ports_task.delay()
        
        # Log the task initiation
        logger.info(f"Started full PON port update task with ID: {task.id}")
        
        return Response({
            "status": "success",
            "message": "PON port refresh started for all reachable OLTs. This may take several minutes.",
            "task_id": str(task.id)
        }, status=status.HTTP_202_ACCEPTED)
        
    except Exception as e:
        logger.error(f"Error starting PON port refresh: {str(e)}")
        return Response(
            {"status": "error", "message": f"Failed to start PON port refresh: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def refresh_single_ont_in_pon_port(request, pon_port_pk, ont_id):
    """
    API endpoint to trigger a refresh of a specific ONT in a PONPort.
    """
    try:
        ont = ONU.objects.get(pk=ont_id, pon_port_id=pon_port_pk)
    except ONU.DoesNotExist:
        return Response({"error": "ONT not found for the specified PON Port."}, status=status.HTTP_404_NOT_FOUND)

    try:
        from .tasks import refresh_single_ont_in_pon_port_task
        refresh_single_ont_in_pon_port_task.delay(pon_port_pk, ont_id)
        return Response(
            {"message": f"Refresh initiated for ONT {ont.id} in PON Port {ont.pon_port.id}."},
            status=status.HTTP_202_ACCEPTED
        )
    except Exception as e:
        return Response(
            {"error": f"Failed to initiate ONT refresh: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
@api_view(['POST'])
def authorize_ont(request, olt_id, serial_number):
    """
    Authorize an unconfigured ONT and move it to the configured ONTs table
    """
    try:
        unconfigured_ont = UnconfiguredONT.objects.get(
            olt_id=olt_id,
            serial_number=serial_number,
            status='discovered'
        )
        
        # Create new ONU entry
        ONU.objects.create(
            serial_number=unconfigured_ont.serial_number,
            pon_port=PONPort.objects.get(
                card__olt_id=olt_id,
                card__slot_number=unconfigured_ont.slot,
                port_index_on_card=unconfigured_ont.port
            ),
            status='offline'  # Initial status
        )
        
        # Mark as authorized
        unconfigured_ont.status = 'authorized'
        unconfigured_ont.save()
        
        return Response({'status': 'success'})
    except UnconfiguredONT.DoesNotExist:
        return Response(
            {'error': 'Unconfigured ONT not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def unconfigured_ont_list(request):
    """
    API endpoint to list all unconfigured ONTs
    """
    try:
        onts = UnconfiguredONT.objects.select_related('olt').filter(
            status='discovered'
        ).order_by('-discovered_at')
        
        data = [{
            'id': ont.id,
            'serial_number': ont.serial_number,
            'vendor_id': ont.vendor_id,
            'frame': ont.frame,
            'slot': ont.slot,
            'port': ont.port,
            'discovered_at': ont.discovered_at,
            'status': ont.status,
            'olt_id': ont.olt.id,
            'olt_name': ont.olt.name
        } for ont in onts]
        
        return Response(data)
    except Exception as e:
        logger.error(f"Error fetching unconfigured ONTs: {e}", exc_info=True)
        return Response(
            {"error": "Failed to fetch unconfigured ONTs"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )