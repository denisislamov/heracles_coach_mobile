import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'health_coach.settings')

app = Celery('health_coach')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

app.conf.beat_schedule = {
    'send-health-reminders-every-7-minutes': {
        'task': 'notifications.tasks.send_health_reminders',
        'schedule': 7 * 60,  # every 7 minutes
    },
}

