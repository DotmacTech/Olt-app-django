# c:\Users\ibrah\CascadeProjects\Olt-app-django\oltmanager\celery.py
import os
import django # Import Django
from celery import Celery
from celery.schedules import crontab # For cron-like scheduling

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'oltmanager.settings') # Replace 'oltmanager' with your project's name

django.setup() # Explicitly setup Django settings

# Now that Django is set up, we can safely import tasks that might depend on Django models/settings
# from network.tasks import test # Example: if you had tasks defined here and needed them for setup

app = Celery('oltmanager') # Replace 'oltmanager' with your project's name

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
app.config_from_object('django.conf:settings', namespace='CELERY')
# Define Celery queues and routing
app.conf.task_routes = {
    'network.tasks.periodically_*': {'queue': 'receive_periodic'},  # Tasks starting with "periodically_" go to "receive_periodic" queue
    'network.tasks.check_olt_reachability_task': {'queue': 'receive_periodic'},
    'network.tasks.update_olt_system_metrics_task': {'queue': 'receive_periodic'},
    'network.tasks.discover_and_update_onts_for_pon_port_task': {'queue': 'receive_periodic'},
    'network.tasks.*': {'queue': 'default'},  # All other network tasks go to the default queue
}

# Ensure all queues are properly configured
app.conf.task_default_queue = 'default'
app.conf.task_queues = {
    'default': {
        'exchange': 'default',
        'routing_key': 'default',
    },
    'receive_periodic': {
        'exchange': 'receive_periodic',
        'routing_key': 'receive_periodic',
    },
}

# Load task modules from all registered Django app configs.
app.autodiscover_tasks()

# Import tasks after Django is fully loaded to avoid circular imports
from network.tasks import (
    periodically_check_all_olts_reachability,
    periodically_update_all_onts_data,
    periodically_update_all_olts_metrics,
    periodically_detect_pon_outages
)

@app.on_after_configure.connect
def setup_periodic_tasks(sender: Celery, **kwargs):
    """
    Celery task to be run periodically by Celery Beat.
    It iterates through all OLTs and queues a reachability check for each.
    """
    # Calls periodically_check_all_olts_reachability every 5 minutes.
    sender.add_periodic_task(
        300.0,  # Run every 300 seconds (5 minutes)
        periodically_check_all_olts_reachability.s(),
        name='check all olts reachability every 5 mins',
    )

    # Schedule for periodically_update_all_onts_data
    sender.add_periodic_task(
        300.0,  # 5 minutes
        periodically_update_all_onts_data.s(),
        name='update all onts data every 5 mins',
    )

    # Schedule for periodically_update_all_olts_metrics
    sender.add_periodic_task(
        600.0,  # 10 minutes
        periodically_update_all_olts_metrics.s(),
        name='update all olts metrics every 10 mins',
    )
    
    # Schedule for detect_pon_outages
    sender.add_periodic_task(
        300.0,  # 5 minutes
        periodically_detect_pon_outages.s(),
        name='detect pon outages every 5 mins',
    )

# Optional: If you want to see what tasks are loaded
# print(f"Celery tasks: {app.tasks.keys()}")

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
