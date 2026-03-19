import random
from celery import shared_task
from django.utils import timezone


WORKOUT_REMINDERS = [
    "🏋️ Вы сегодня ещё не тренировались! Даже 15 минут зарядки улучшат ваше восстановление.",
    "🏃 Время размяться! Короткая прогулка или растяжка помогут поднять настроение.",
    "💪 Не забывайте о физической активности! Ваше тело скажет вам спасибо.",
    "🧘 Как насчёт небольшой йоги или растяжки? Это займёт всего 10 минут!",
    "🚶 Вы давно не двигались. Встаньте и пройдитесь хотя бы 5 минут!",
    "⚡ Ваш уровень нагрузки сегодня низкий. Лёгкая тренировка поднимет показатели!",
]

NUTRITION_REMINDERS = [
    "🥗 Пора проверить свой режим питания! Вы сегодня ели достаточно овощей?",
    "💧 Не забывайте пить воду! Рекомендуется 2 литра в день.",
    "🍎 Время перекуса! Выберите что-нибудь полезное — фрукты или орехи.",
    "🥩 Убедитесь, что вы получаете достаточно белка сегодня — это улучшит восстановление.",
    "🍽️ Проверьте свой баланс калорий на сегодня. Не пропускайте приёмы пищи!",
    "🥛 Высокобелковый приём пищи сейчас улучшит ваши показатели восстановления на 6%.",
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
                title = "Напоминание о тренировке"
            else:
                reminder = random.choice(NUTRITION_REMINDERS)
                n_type = Notification.NotificationType.NUTRITION
                title = "Напоминание о питании"

            Notification.objects.create(
                user=user,
                notification_type=n_type,
                title=title,
                message=reminder,
            )
            notifications_created += 1

    return f"Created {notifications_created} notifications for {users.count()} users"

