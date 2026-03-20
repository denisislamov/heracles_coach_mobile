import json
import math
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .models import HealthMetric, get_default_metrics, get_weekly_trend, get_default_biomarkers


@login_required
def index(request):
    latest_metric = HealthMetric.objects.filter(user=request.user).first()

    if latest_metric:
        metrics = {
            'steps': latest_metric.steps,
            'calories_consumed': latest_metric.calories_consumed,
            'calories_burned': latest_metric.calories_burned,
            'water_ml': latest_metric.water_ml,
            'sleep_hours': latest_metric.sleep_hours,
            'heart_rate_avg': latest_metric.heart_rate_avg,
            'workout_minutes': latest_metric.workout_minutes,
            'recovery_score': latest_metric.recovery_score,
            'strain_level': latest_metric.strain_level,
        }
        is_default = False
    else:
        metrics = get_default_metrics()
        is_default = True

    trends = get_weekly_trend()
    biomarkers = get_default_biomarkers()

    # SVG circular progress calculations
    radius = 54
    circumference = 2 * math.pi * radius
    recovery_pct = metrics['recovery_score'] / 100.0
    offset = circumference * (1 - recovery_pct)

    context = {
        'metrics': metrics,
        'is_default': is_default,
        'trends_json': json.dumps(trends),
        'biomarkers': biomarkers,
        'user_initial': (request.user.email[0] if request.user.email else 'U').upper(),
        'recovery_circumference': f'{circumference:.1f}',
        'recovery_offset': f'{offset:.1f}',
    }
    return render(request, 'dashboard/index.html', context)


