from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from .models import Notification


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

