from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from django.views.static import serve
from django.conf import settings
import os

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('accounts.urls')),
    path('accounts/', include('allauth.urls')),
    path('dashboard/', include('dashboard.urls')),
    path('chat/', include('chatbot.urls')),
    path('notifications/', include('notifications.urls')),
    # Service worker must be served from root for full scope
    path('sw.js', serve, {
        'path': 'sw.js',
        'document_root': os.path.join(settings.BASE_DIR, 'static'),
    }, name='sw.js'),
    path('', RedirectView.as_view(url='/dashboard/', permanent=False)),
]

