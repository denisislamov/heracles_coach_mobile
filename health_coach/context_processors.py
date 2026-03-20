from django.conf import settings
from health_coach import VERSION


def version(request):
    return {
        'APP_VERSION': VERSION,
        'VAPID_PUBLIC_KEY': settings.VAPID_PUBLIC_KEY,
    }

