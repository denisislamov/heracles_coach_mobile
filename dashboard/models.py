from django.db import models
from django.conf import settings


class HealthMetric(models.Model):
    """Stores daily health metrics for a user."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='health_metrics')
    date = models.DateField(auto_now_add=True)
    steps = models.IntegerField(default=0, verbose_name='Steps')
    calories_consumed = models.IntegerField(default=0, verbose_name='Calories (consumed)')
    calories_burned = models.IntegerField(default=0, verbose_name='Calories (burned)')
    water_ml = models.IntegerField(default=0, verbose_name='Water (ml)')
    sleep_hours = models.FloatField(default=0, verbose_name='Sleep (hours)')
    heart_rate_avg = models.IntegerField(default=0, verbose_name='Avg heart rate')
    workout_minutes = models.IntegerField(default=0, verbose_name='Workout (min)')
    recovery_score = models.IntegerField(default=0, verbose_name='Recovery (%)')
    strain_level = models.FloatField(default=0, verbose_name='Strain')

    class Meta:
        ordering = ['-date']
        unique_together = ['user', 'date']
        verbose_name = 'Health metric'
        verbose_name_plural = 'Health metrics'

    def __str__(self):
        return f"{self.user.email} - {self.date}"


def get_default_metrics():
    """Return average health metrics (used as defaults for new users)."""
    return {
        'steps': 7500,
        'calories_consumed': 2100,
        'calories_burned': 350,
        'water_ml': 2000,
        'sleep_hours': 8.1,
        'heart_rate_avg': 72,
        'workout_minutes': 30,
        'recovery_score': 92,
        'strain_level': 9.2,
    }


def get_weekly_trend():
    """Return mock 7-day trend data."""
    return {
        'recovery': [85, 78, 92, 88, 95, 90, 92],
        'sleep': [7.5, 6.8, 8.2, 7.9, 8.5, 7.2, 8.1],
        'strain': [12, 15, 10, 14, 11, 13, 9],
    }
