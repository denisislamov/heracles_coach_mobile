from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('accounts.urls')),
    path('accounts/', include('allauth.urls')),
    path('dashboard/', include('dashboard.urls')),
    path('chat/', include('chatbot.urls')),
    path('notifications/', include('notifications.urls')),
    path('', RedirectView.as_view(url='/dashboard/', permanent=False)),
]

