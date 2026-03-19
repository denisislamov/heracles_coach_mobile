from django.contrib import admin
from .models import HealthMetric


@admin.register(HealthMetric)
class HealthMetricAdmin(admin.ModelAdmin):
    list_display = ('user', 'date', 'steps', 'calories_consumed', 'recovery_score', 'workout_minutes')
    list_filter = ('date',)

