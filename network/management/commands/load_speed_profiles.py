import json
from django.core.management.base import BaseCommand
from network.models import SpeedProfile
from pathlib import Path
from django.conf import settings

class Command(BaseCommand):
    help = 'Load speed profiles from a JSON file into the database'

    def handle(self, *args, **options):
        # Path to the JSON file
        json_file = Path(settings.BASE_DIR) / 'frontend' / 'src' / 'data' / 'speed_profiles.json'
        
        try:
            # Read the JSON file
            with open(json_file, 'r') as f:
                profiles = json.load(f)
            
            created_count = 0
            updated_count = 0
            
            for profile_data in profiles:
                # Convert kbps to bps for the model
                download_speed = int(profile_data.get('download_speed', 0)) * 1000
                upload_speed = int(profile_data.get('upload_speed', 0)) * 1000
                
                # Create or update the profile
                profile, created = SpeedProfile.objects.update_or_create(
                    name=profile_data['name'],
                    defaults={
                        'download_speed': download_speed,
                        'upload_speed': upload_speed,
                        'type': profile_data.get('type', 'INTERNET'),
                        'vlan': profile_data.get('vlan', 1),
                        'priority': profile_data.get('priority', 0),
                        'dscp': profile_data.get('dscp', 'AF41'),
                        'policer_cir': profile_data.get('policer_cir', 100000),
                        'policer_cbs': profile_data.get('policer_cbs', 2000),
                        'policer_eir': profile_data.get('policer_eir'),
                        'policer_ebs': profile_data.get('policer_ebs'),
                    }
                )
                
                if created:
                    created_count += 1
                else:
                    updated_count += 1
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully loaded {created_count} new profiles and updated {updated_count} existing profiles.'
                )
            )
            
        except FileNotFoundError:
            self.stderr.write(self.style.ERROR(f'Error: File not found at {json_file}'))
        except json.JSONDecodeError:
            self.stderr.write(self.style.ERROR('Error: Invalid JSON file'))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f'Error: {str(e)}'))
