import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from channels.db import database_sync_to_async

import logging
logger = logging.getLogger(__name__)

# Utility function to broadcast dashboard summary to all clients
def broadcast_dashboard_summary():
    from network.models import OLT, ONU
    channel_layer = get_channel_layer()
    if channel_layer is not None:
        # Calculate summary synchronously (this is called from sync code, e.g. signals or views)
        total_olts = OLT.objects.count()
        online_olts = OLT.objects.filter(status='active').count()
        total_onts = ONU.objects.count()
        online_onts = ONU.objects.filter(status='online').count()
        offline_onts = ONU.objects.filter(status='offline').count()
        offline_power_onts = ONU.objects.filter(status='offline', last_down_cause__icontains='power').count()
        offline_los_onts = ONU.objects.filter(status='offline', last_down_cause__icontains='los').count()
        all_olts_details_list = []
        for olt in OLT.objects.all().order_by('name'):
            all_olts_details_list.append({
                'id': olt.id,
                'name': olt.name,
                'status': olt.status,
                'status_display': olt.get_status_display(),
                'uptime': olt.uptime,
                'temperature': getattr(olt, 'temperature', None),
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
        logger.info(f"BROADCAST_DASHBOARD_SUMMARY: Preparing to send summary. Total OLTs: {summary_data.get('total_olts')}, Details count: {len(summary_data.get('all_olts_details', []))}")
        try:
            async_to_sync(channel_layer.group_send)(
                'pon_outages_group',
                {
                    'type': 'dashboard_summary',  # Use underscore to match frontend expectation
                    'data': summary_data
                }
            )
            logger.info("BROADCAST_DASHBOARD_SUMMARY: Successfully sent to group pon_outages_group.")
        except Exception as e:
            logger.error(f"BROADCAST_DASHBOARD_SUMMARY: Error sending to group: {e}", exc_info=True)
    else:
        logger.warning("BROADCAST_DASHBOARD_SUMMARY: Channel layer is None. Cannot broadcast.")

class PONOutageConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = 'pon_outages_group' # Name of the group

        # Join room group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()
        logger.info(f"WebSocket connected: {self.channel_name}, joined group: {self.group_name}")

        # --- Send dashboard summary on connect ---
        # Import models here to avoid circular imports
        from network.models import OLT, ONU
        try:
            total_olts = await self._count(OLT)
            online_olts = await self._count(OLT, status='active')
            total_onts = await self._count(ONU)
            online_onts = await self._count(ONU, status='online')
            offline_onts = await self._count(ONU, status='offline')
            offline_power_onts = await self._count(ONU, status='offline', last_down_cause__icontains='power')
            offline_los_onts = await self._count(ONU, status='offline', last_down_cause__icontains='los')
            all_olts_details_list = []
            for olt in await self._all_olts(OLT):
                all_olts_details_list.append({
                    'id': olt.id,
                    'name': olt.name,
                    'status': olt.status,
                    'status_display': olt.get_status_display(),
                    'uptime': olt.uptime,
                    'temperature': getattr(olt, 'temperature', None),
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
            logger.info(f"PONOutageConsumer.connect: Sending initial dashboard summary. Total OLTs: {summary_data.get('total_olts')}, Details count: {len(summary_data.get('all_olts_details', []))}")
            await self.send(text_data=json.dumps({
                'type': 'dashboard_summary',
                'data': summary_data
            }))
        except Exception as e:
            logger.error(f"PONOutageConsumer.connect: Error sending initial dashboard summary: {e}", exc_info=True)
            await self.send(text_data=json.dumps({
                'type': 'dashboard_summary',
                'data': None,
                'error': str(e)
            }))
            

    # Helper async methods for ORM compatibility
    @database_sync_to_async
    def _count(self, model, **kwargs):
        return model.objects.filter(**kwargs).count()

    @database_sync_to_async
    def _all_olts(self, OLT):
        return list(OLT.objects.all().order_by('name'))

    async def dashboard_summary(self, event):
        # Handler for group_send with type 'dashboard_summary' (underscore, to match frontend)
        summary_data = event.get('data', {})
        logger.info(f"PONOutageConsumer.dashboard_summary: Received event. Total OLTs in event data: {summary_data.get('total_olts')}, Details count: {len(summary_data.get('all_olts_details', []))}")
        await self.send(text_data=json.dumps({
            'type': 'dashboard_summary',
            'data': summary_data
        }))

    async def disconnect(self, close_code):
        logger.info(f"WebSocket disconnected: {self.channel_name}, code: {close_code}")
        # Leave room group
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    # Receive message from room group (triggered by group_send)
    async def outage_event(self, event_dict):
        # This method name 'outage_event' corresponds to the 'type' in group_send:
        # e.g., {'type': 'outage.event', 'event_type': ..., 'data': ...}
        # The part after the dot ('event') is used if the 'type' has a dot.
        # If type was just 'outage_event', this method would be called directly.
        # To be safe and explicit, let's ensure group_send uses 'outage.event'
        # or we rename this method to match the 'type' field from group_send.

        # Let's assume group_send uses 'type': 'outage.message'
        # and this method is outage_message
        message_content = {
            'type': event_dict['event_type'], # e.g., 'new_outage', 'updated_outage', 'resolved_outage'
            'data': event_dict['data']
        }
        # Send message to WebSocket
        await self.send(text_data=json.dumps(message_content))
        logger.info(f"PONOutageConsumer.outage_event: Sent message to WebSocket group {self.group_name}: {message_content['type']}")


# Helper function to send messages from synchronous code (like Celery tasks)
def send_pon_outage_notification(event_type, outage_data_dict):
    """
    Sends a PON outage notification to the 'pon_outages_group'.
    :param event_type: str (e.g., 'new_outage', 'updated_outage', 'resolved_outage')
    :param outage_data_dict: dict (serialized PONOutageEvent data)
    """
    channel_layer = get_channel_layer()
    if channel_layer is not None:
        logger.info(f"SEND_PON_OUTAGE_NOTIFICATION: Sending WebSocket notification: {event_type}, Outage ID: {outage_data_dict.get('id', 'N/A')}")
        async_to_sync(channel_layer.group_send)(
            'pon_outages_group', # Must match self.group_name in consumer
            {
                'type': 'outage.event', # This will call the 'outage_event' method in the consumer
                'event_type': event_type,
                'data': outage_data_dict
            }
        )
    else:
        logger.error("SEND_PON_OUTAGE_NOTIFICATION: Channel layer not found. Cannot send WebSocket notification.")



class PonPortRefreshConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.pon_port_id = self.scope['url_route']['kwargs']['pon_port_id']
        self.group_name = f'pon_port_refresh_{self.pon_port_id}'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        logger.info(f"PonPortRefreshConsumer connected: {self.channel_name}, joined group: {self.group_name}")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)
        logger.info(f"PonPortRefreshConsumer disconnected: {self.channel_name}, left group: {self.group_name}")

    async def receive(self, text_data):
        # Optionally handle messages from the frontend if needed
        pass

    async def refresh_ont_list(self, event):
        # Send a refresh trigger to the frontend
        await self.send(text_data=json.dumps({
            'type': 'refresh_ont_list',
            'pon_port_id': self.pon_port_id,
            'timestamp': event.get('timestamp'),
        }))


class PONPortConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = 'pon_ports_group'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        # Optionally send initial data here

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        # Handle messages from the frontend if needed
        pass

    async def send_pon_port_update(self, event):
        # Send updates to the frontend
        await self.send(text_data=json.dumps(event['data']))
