import random
from celery import shared_task
from django.utils import timezone


WORKOUT_REMINDERS = [
    "🏋️ You haven't worked out today! Even 15 minutes of exercise will boost your recovery.",
    "🏃 Time to get moving! A short walk or stretch will lift your mood.",
    "💪 Don't forget about physical activity! Your body will thank you.",
    "🧘 How about some yoga or stretching? It only takes 10 minutes!",
    "🚶 You've been sitting too long. Get up and walk for at least 5 minutes!",
    "⚡ Your strain level is low today. A light workout will boost your stats!",
]

NUTRITION_REMINDERS = [
    "🥗 Time to check your nutrition! Have you eaten enough veggies today?",
    "💧 Don't forget to drink water! 2 liters a day is recommended.",
    "🍎 Snack time! Choose something healthy — fruits or nuts.",
    "🥩 Make sure you're getting enough protein today — it will improve recovery.",
    "🍽️ Check your calorie balance for today. Don't skip meals!",
    "🥛 A high-protein meal right now will improve your recovery score by 6%.",
]


@shared_task
def send_health_reminders():
    """Send periodic health reminders to all users with notifications enabled."""
    from accounts.models import CustomUser
    from notifications.models import Notification

    users = CustomUser.objects.filter(
        notifications_enabled=True,
        is_active=True,
    )

    now = timezone.now()
    notifications_created = 0

    for user in users:
        # Don't spam — check if we sent a notification in the last 5 minutes
        recent = Notification.objects.filter(
            user=user,
            created_at__gte=now - timezone.timedelta(minutes=5)
        ).exists()

        if not recent:
            if random.random() > 0.5:
                reminder = random.choice(WORKOUT_REMINDERS)
                n_type = Notification.NotificationType.WORKOUT
                title = "Workout Reminder"
            else:
                reminder = random.choice(NUTRITION_REMINDERS)
                n_type = Notification.NotificationType.NUTRITION
                title = "Nutrition Reminder"

            Notification.objects.create(
                user=user,
                notification_type=n_type,
                title=title,
                message=reminder,
            )
            notifications_created += 1

    return f"Created {notifications_created} notifications for {users.count()} users"
