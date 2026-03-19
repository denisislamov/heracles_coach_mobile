web: gunicorn health_coach.wsgi:application --bind 0.0.0.0:$PORT
worker: celery -A health_coach worker --loglevel=info --beat

