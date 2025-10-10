import os
from celery import Celery

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'oltmanager.settings')

# Create the Celery application without any configuration
app = Celery('oltmanager')

# Configure Celery using settings from Django settings file
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps
app.autodiscover_tasks()
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

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')

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

    # Add ONT discovery task
    sender.add_periodic_task(
        300.0,  # Run every 5 minutes
        check_for_new_onts.s(),
        name='check for new ONTs'
    )

# Optional: If you want to see what tasks are loaded
# print(f"Celery tasks: {app.tasks.keys()}")

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
