#!/usr/bin/env bash
# exit on error
set -o errexit

pip install --upgrade pip
pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate

# Create django sites entry (needed for allauth)
python manage.py shell -c "
from django.contrib.sites.models import Site
site, created = Site.objects.get_or_create(id=1, defaults={'domain': 'localhost', 'name': 'Heracles Coach'})
if not created:
    site.domain = 'localhost'
    site.name = 'Heracles Coach'
    site.save()
print('Site configured')
"

