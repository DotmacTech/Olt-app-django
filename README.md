"# Olt-app-django" 

sudo systemctl restart celery-default.service # Or whatever your worker service is named
sudo systemctl restart celery-periodic.service # If you have a separate periodic queue worker
sudo systemctl restart celery-beat.service
