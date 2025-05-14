import logging
logger = logging.getLogger(__name__)
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import OLT
from .tasks import discover_and_create_cards_task


@receiver(post_save, sender=OLT)
def trigger_olt_discovery_tasks(sender, instance, created, **kwargs):
    if created:
        logger.info(f"SIGNAL: New OLT created: {instance.name}. Attempting to trigger card discovery task.")
        try:
            discover_and_create_cards_task.delay(instance.id)
            logger.info(f"SIGNAL: Successfully called .delay() for discover_and_create_cards_task for OLT ID {instance.id}.")
        except Exception as e:
            logger.error(f"SIGNAL: Error calling .delay() for discover_and_create_cards_task: {e}", exc_info=True)
