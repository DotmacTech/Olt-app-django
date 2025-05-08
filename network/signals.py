from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import OLT
from .tasks import discover_and_create_cards_task

@receiver(post_save, sender=OLT)
def trigger_olt_discovery_tasks(sender, instance, created, **kwargs):
    """
    After an OLT is saved, if it's a new OLT, trigger background
    tasks to discover its cards and subsequently its PON ports.
    """
    if created:
        print(f"New OLT created: {instance.name}. Triggering card discovery task.")
        discover_and_create_cards_task.delay(instance.id)