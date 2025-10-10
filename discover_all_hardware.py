import os
import sys
import django

# --- Setup Django Environment ---
# This is necessary to run the script standalone and access Django models/components.
# It assumes the script is in the project's root directory.
def setup_django():
    """Initializes the Django environment."""
    # Add the project directory to the Python path
    project_path = os.path.dirname(os.path.abspath(__file__))
    sys.path.append(project_path)
    
    # Set the DJANGO_SETTINGS_MODULE environment variable
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'oltmanager.settings')
    
    # Setup Django
    try:
        django.setup()
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc

def main():
    """
    Main function to trigger hardware discovery for all OLTs.
    This script will queue background jobs to discover cards and their PON ports.
    """
    print("--- Starting Full Hardware Discovery Script ---")
    
    # Setup Django to access models and tasks
    setup_django()
    
    # Now we can import our Django components
    from network.models import OLT
    from network.tasks import discover_and_create_cards_task
    
    # Fetch all OLTs from the database
    all_olts = OLT.objects.all()
    
    if not all_olts.exists():
        print("No OLTs found in the database. Exiting.")
        return
        
    print(f"Found {all_olts.count()} OLT(s) to process.")
    
    # Iterate through each OLT and trigger the discovery task
    for i, olt in enumerate(all_olts):
        print(f"\n[{i+1}/{all_olts.count()}] Triggering card discovery for: {olt.name} (ID: {olt.id}, IP: {olt.ip_address})")
        try:
            # Queue the Celery task to discover cards for this OLT.
            # This task will automatically chain the PON port discovery for each card found.
            discover_and_create_cards_task.delay(olt.id)
            print(f" -> Successfully queued task.")
        except Exception as e:
            print(f" -> ERROR: Failed to queue task for OLT {olt.name}. Reason: {e}")
            
    print("\n--- Hardware Discovery Script Finished ---")
    print("All discovery tasks have been queued. Monitor your Celery workers to see the progress.")
    print("It may take several minutes for all tasks to be processed.")

if __name__ == "__main__":
    main()