# OLT Management System: Ubuntu Setup Guide
# Backend
## 1. Install System Dependencies

```bash
sudo apt update
sudo apt install python3 python3-venv python3-pip redis-server rabbitmq-server git build-essential libpq-dev
```

## 2. Clone the Project Repository

```bash
git clone <your-repo-url>
cd Olt-app-django
```

## 3. Set Up Python Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate
```

## 4. Install Python Requirements

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

## 5. Set Up PostgreSQL (If Used)

- Install PostgreSQL:
  ```bash
  sudo apt install postgresql postgresql-contrib
  ```
- Create database and user (replace `olt_db`, `olt_user`, `your_password` as needed):
  ```bash
  sudo -u postgres psql
  CREATE DATABASE oltmanager;
  CREATE USER dotmacuser WITH PASSWORD 'dotmac@1;
  ALTER ROLE dotmacuser SET client_encoding TO 'utf8';
  ALTER ROLE dotmacuser SET default_transaction_isolation TO 'read committed';
  ALTER ROLE dotmacuser SET timezone TO 'UTC';
  GRANT ALL PRIVILEGES ON DATABASE oltmanager TO dotmacuser;
  GRANT ALL PRIVILEGES ON SCHEMA public TO dotmacuser;
  \q
  ```

## 6. Configure Django Settings

- Copy and edit your environment variables or `settings.py` as needed (database, secret key, etc.).

## 7. Apply Database Migrations

```bash
python manage.py migrate
```

## 8. Create a Superuser

```bash
python manage.py createsuperuser
```

## 9. Collect Static Files

```bash
python manage.py collectstatic
```

## 10. Start Redis

```bash
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

### Create systemd service files

#### celery-default.service

```bash
sudo nano /etc/systemd/system/celery-default.service
```

```ini
[Unit]
Description=Celery Default Worker Service
After=network.target

[Service]
Type=forking
User=devserver
Group=devserver
WorkingDirectory=/home/devserver/Olt-app-django
Environment="DJANGO_SETTINGS_MODULE=oltmanager.settings"
Environment="PYTHONPATH=/home/devserver/Olt-app-django"
ExecStart=/home/devserver/Olt-app-django/venv/bin/celery multi start default -A oltmanager --loglevel=INFO --logfile=/home/devserver/Olt-app-django/logs/celery-default.log
ExecStop=/home/devserver/Olt-app-django/venv/bin/celery multi stopwait default --pidfile=/home/devserver/Olt-app-django/celery-default.pid
ExecReload=/home/devserver/Olt-app-django/venv/bin/celery multi restart default -A oltmanager --loglevel=INFO --logfile=/home/devserver/Olt-app-django/logs/celery-default.log
Restart=always

[Install]
WantedBy=multi-user.target
```

#### celery-periodic.service

```bash
sudo nano /etc/systemd/system/celery-periodic.service
```

```ini
[Unit]
Description=Celery Periodic Worker Service
After=network.target

[Service]
Type=forking
User=devserver
Group=devserver
WorkingDirectory=/home/devserver/Olt-app-django
Environment="DJANGO_SETTINGS_MODULE=oltmanager.settings"
Environment="PYTHONPATH=/home/devserver/Olt-app-django"
ExecStart=/home/devserver/Olt-app-django/venv/bin/celery multi start periodic -A oltmanager --loglevel=INFO --logfile=/home/devserver/Olt-app-django/logs/celery-periodic.log
ExecStop=/home/devserver/Olt-app-django/venv/bin/celery multi stopwait periodic --pidfile=/home/devserver/Olt-app-django/celery-periodic.pid
ExecReload=/home/devserver/Olt-app-django/venv/bin/celery multi restart periodic -A oltmanager --loglevel=INFO --logfile=/home/devserver/Olt-app-django/logs/celery-periodic.log
Restart=always

[Install]
WantedBy=multi-user.target
```

#### celery-receive.service

```bash
sudo nano /etc/systemd/system/celery-receive.service
```

```ini
[Unit]
Description=Celery Worker for 'receive_periodic' Queue
After=network.target

[Service]
Type=forking
User=devserver
Group=devserver
WorkingDirectory=/home/devserver/Olt-app-django
Environment="DJANGO_SETTINGS_MODULE=oltmanager.settings"
Environment="PYTHONPATH=/home/devserver/Olt-app-django"
ExecStart=/home/devserver/Olt-app-django/venv/bin/celery multi start receive_periodic -A oltmanager --loglevel=INFO --logfile=/home/devserver/Olt-app-django/logs/celery-receive.log
ExecStop=/home/devserver/Olt-app-django/venv/bin/celery multi stopwait receive_periodic --pidfile=/home/devserver/Olt-app-django/celery-receive.pid
ExecReload=/home/devserver/Olt-app-django/venv/bin/celery multi restart receive_periodic -A oltmanager --pidfile=/home/devserver/Olt-app-django/celery-receive.pid --loglevel=INFO --logfile=/home/devserver/Olt-app-django/logs/celery-receive.log
Restart=always

[Install]
WantedBy=multi-user.target
```

#### celery-beat.service

```bash
sudo nano /etc/systemd/system/celery-beat.service
```

```ini
[Unit]
Description=Celery Beat Service
After=network.target

[Service]
Type=simple
User=devserver
Group=devserver
WorkingDirectory=/home/devserver/Olt-app-django
Environment="DJANGO_SETTINGS_MODULE=oltmanager.settings"
Environment="PYTHONPATH=/home/devserver/Olt-app-django"
ExecStart=/home/devserver/Olt-app-django/venv/bin/celery -A oltmanager beat --loglevel=INFO --logfile=/home/devserver/Olt-app-django/logs/celery-beat.log
Restart=always

[Install]
WantedBy=multi-user.target
```

## 11. Run Django Development Server (for testing)

```bash
uvicorn oltmanager.asgi:application --host 0.0.0.0 --port 8000 --reload
```


## 13. (Optional) Set Up Systemd Services for Production

- Create systemd service files for each worker and beat as shown below.
- Reload systemd and enable/start services:
  ```bash
  sudo systemctl daemon-reload
  sudo systemctl enable celery-default celery-periodic celery-receive celery-beat
  sudo systemctl start celery-default celery-periodic celery-receive celery-beat
  ```


## 14. Access the Admin Panel

- Go to `http://localhost:8000/admin` and log in with your superuser credentials.

---

## Troubleshooting

- Check logs for errors: `journalctl -xeu <service-name>`
- Make sure your environment variables and settings are correct.
- Ensure Redis and RabbitMQ are running.

# Frontend

```bash
cd frontend
```
```bash
npm install
```
```bash
npm start
```