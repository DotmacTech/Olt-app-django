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
# Define Celery queues
app.conf.task_routes = {
    'network.tasks.periodically_*': {'queue': 'periodic'},  # Tasks starting with "periodically_" go to "periodic" queue
    'network.tasks.*': {'queue': 'default'}, # Other network tasks go to "default" queue
}

# Load task modules from all registered Django app configs.
app.autodiscover_tasks()

@app.on_after_configure.connect
def setup_periodic_tasks(sender : Celery, **kwargs):
    """
    Celery task to be run periodically by Celery Beat.
    It iterates through all OLTs and queues a reachability check for each.
    """
    # Calls periodically_check_all_olts_reachability every 5 minutes.
    sender.add_periodic_task(
        300.0,  # Run every 300 seconds (5 minutes)
        # Use the string path to the task to avoid direct import issues before app is fully ready
        'network.tasks.periodically_check_all_olts_reachability', 
        name='check all olts reachability every 5 mins', # Optional descriptive name
    )

    # Add the schedule for periodically_update_all_onts_data if it's not already here
    sender.add_periodic_task(
        300.0,
        'network.tasks.periodically_update_all_onts_data',
        name='update all onts data every 5 mins',
    )

    # Example test task - using string path
    sender.add_periodic_task(
        30.0,
        'oltmanager.celery.test', # Use the string path to the task
        kwargs={'arg': 'world'}, # Pass arguments as kwargs
        name='test task every 30 secs', # Optional descriptive name
        expires=10
    )

    # Calls periodically_update_all_olts_metrics every 10 minutes (600 seconds).
    sender.add_periodic_task(
        600.0,  # Run every 600 seconds (10 minutes)
        'network.tasks.periodically_update_all_olts_metrics', 
        name='update all olts metrics every 10 mins',
    )

# Optional: If you want to see what tasks are loaded
# print(f"Celery tasks: {app.tasks.keys()}")
@app.task
def test(arg):
    print(arg)

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
