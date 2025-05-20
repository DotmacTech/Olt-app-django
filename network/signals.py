import logging
logger = logging.getLogger(__name__)
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import OLT, ONU, PONOutageEvent, PONPort
from .tasks import discover_and_create_cards_task
from .consumers import broadcast_dashboard_summary


@receiver(post_save, sender=OLT)
def trigger_olt_discovery_tasks(sender, instance, created, **kwargs):
    if created:
        logger.info(f"SIGNAL: New OLT created: {instance.name}. Attempting to trigger card discovery task.")
        try:
            discover_and_create_cards_task.delay(instance.id)
            logger.info(f"SIGNAL: Successfully called .delay() for discover_and_create_cards_task for OLT ID {instance.id}.")
        except Exception as e:
            logger.error(f"SIGNAL: Error calling .delay() for discover_and_create_cards_task: {e}", exc_info=True)
    # Always broadcast summary on OLT save
    broadcast_dashboard_summary()

@receiver(post_delete, sender=OLT)
def broadcast_on_olt_delete(sender, instance, **kwargs):
    broadcast_dashboard_summary()

@receiver(post_save, sender=ONU)
def broadcast_on_onu_save(sender, instance, **kwargs):
    broadcast_dashboard_summary()

@receiver(post_delete, sender=ONU)
def broadcast_on_onu_delete(sender, instance, **kwargs):
    broadcast_dashboard_summary()

@receiver(post_save, sender=PONOutageEvent)
def broadcast_on_outage_save(sender, instance, **kwargs):
    broadcast_dashboard_summary()

@receiver(post_delete, sender=PONOutageEvent)
def broadcast_on_outage_delete(sender, instance, **kwargs):
    broadcast_dashboard_summary()

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

def broadcast_pon_port_update(data):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        'pon_ports_group',
        {
            'type': 'send_pon_port_update',
            'data': data
        }
    )

@receiver(post_save, sender=PONPort)
@receiver(post_delete, sender=PONPort)
def handle_pon_port_change(sender, instance, **kwargs):
    # Prepare the data to send (customize as needed)
    pon_ports = list(PONPort.objects.filter(olt=instance.olt, slot=instance.slot).values())
    broadcast_pon_port_update({"pon_ports": pon_ports})