import json
import threading
import time
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.conf import settings
from .models import Notification, PushSubscription


@login_required
def get_notifications(request):
    """API: Get unread notifications for the current user."""
    notifications = Notification.objects.filter(
        user=request.user,
        is_read=False,
    ).order_by('-created_at')[:20]

    data = [
        {
            'id': n.id,
            'type': n.notification_type,
            'title': n.title,
            'message': n.message,
            'created_at': n.created_at.isoformat(),
        }
        for n in notifications
    ]
    return JsonResponse({'notifications': data})


@login_required
def mark_read(request, pk):
    """API: Mark a notification as read."""
    if request.method == 'POST':
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
            notification.is_read = True
            notification.save()
            return JsonResponse({'status': 'ok'})
        except Notification.DoesNotExist:
            return JsonResponse({'error': 'Not found'}, status=404)
    return JsonResponse({'error': 'POST only'}, status=405)


@login_required
def mark_all_read(request):
    """API: Mark all notifications as read."""
    if request.method == 'POST':
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return JsonResponse({'status': 'ok'})
    return JsonResponse({'error': 'POST only'}, status=405)


@login_required
@require_POST
def subscribe_push(request):
    """API: Save a Web Push subscription for the current user."""
    try:
        data = json.loads(request.body)
        endpoint = data.get('endpoint')
        keys = data.get('keys', {})
        p256dh = keys.get('p256dh', '')
        auth = keys.get('auth', '')

        if not endpoint or not p256dh or not auth:
            return JsonResponse({'error': 'Missing subscription data'}, status=400)

        PushSubscription.objects.update_or_create(
            endpoint=endpoint,
            defaults={
                'user': request.user,
                'p256dh': p256dh,
                'auth': auth,
            },
        )
        return JsonResponse({'status': 'ok'})
    except (json.JSONDecodeError, KeyError):
        return JsonResponse({'error': 'Invalid JSON'}, status=400)


@login_required
@require_POST
def schedule_push(request):
    """API: Schedule a push notification to be sent after a delay."""
    try:
        data = json.loads(request.body)
        delay = int(data.get('delay', 30))  # seconds
        title = data.get('title', 'Heracles Coach 🏋️')
        body = data.get('body', "Don't forget your workout! Time to get moving 💪")
    except (json.JSONDecodeError, ValueError):
        return JsonResponse({'error': 'Invalid request'}, status=400)

    # Send push after delay in a background thread
    user_id = request.user.id
    thread = threading.Thread(
        target=_send_push_after_delay,
        args=(user_id, delay, title, body),
        daemon=True,
    )
    thread.start()

    return JsonResponse({'status': 'scheduled', 'delay': delay})


def _send_push_after_delay(user_id, delay, title, body):
    """Background: wait `delay` seconds then send push to all user's subscriptions."""
    time.sleep(delay)

    from pywebpush import webpush, WebPushException

    subscriptions = PushSubscription.objects.filter(user_id=user_id)
    payload = json.dumps({'title': title, 'body': body, 'tag': 'workout-reminder'})

    vapid_private_key = settings.VAPID_PRIVATE_KEY.strip()
    vapid_claims = {'sub': settings.VAPID_ADMIN_EMAIL}

    for sub in subscriptions:
        subscription_info = {
            'endpoint': sub.endpoint,
            'keys': {
                'p256dh': sub.p256dh,
                'auth': sub.auth,
            },
        }
        try:
            webpush(
                subscription_info=subscription_info,
                data=payload,
                vapid_private_key=vapid_private_key,
                vapid_claims=vapid_claims,
            )
        except WebPushException as e:
            # Subscription expired or invalid — remove it
            if hasattr(e, 'response') and e.response is not None and e.response.status_code in (404, 410):
                sub.delete()
        except Exception:
            pass
