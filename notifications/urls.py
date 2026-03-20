from django.urls import path
from . import views

app_name = 'notifications'

urlpatterns = [
    path('api/', views.get_notifications, name='get_notifications'),
    path('api/<int:pk>/read/', views.mark_read, name='mark_read'),
    path('api/read-all/', views.mark_all_read, name='mark_all_read'),
    path('api/subscribe/', views.subscribe_push, name='subscribe_push'),
    path('api/schedule-push/', views.schedule_push, name='schedule_push'),
]

