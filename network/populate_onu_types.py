import os
import django
import sys

# Setup Django environment
django_project_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(django_project_path)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'oltmanager.settings')
django.setup()

from network.models import ONUType

import json
import uuid

def populate_onu_types():
    json_path = os.path.join(os.path.dirname(__file__), 'onu_types_data.json')
    with open(json_path, 'r') as f:
        onu_types = json.load(f)

    for entry in onu_types:
        # Fill required fields with defaults if missing
        defaults = {
            'ethernet_ports_prefix': 'eth_0/',
            'wifi_ssids_prefix': 'wifi_0/',
            'voip_ports_prefix': 'pots_0/',
            'catv': False,
            'allow_custom_profiles': True,
            'default_custom_profile': '',
            'capability': 'Bridging/Routing',
            'onu_type_image': '',
            'image_url': '',
        }
        data = {**defaults, **entry}
        # Use name as unique_id if not present, else generate a uuid
        if 'unique_id' not in data or not data['unique_id']:
            data['unique_id'] = str(data['name']).replace(' ', '_').upper() if 'name' in data else str(uuid.uuid4())
        obj, created = ONUType.objects.update_or_create(
            unique_id=data['unique_id'],
            defaults=data
        )
        print(f"{'Created' if created else 'Updated'} ONUType: {obj.name}")

if __name__ == '__main__':
    populate_onu_types()
