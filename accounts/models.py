from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    """Extended user with health-related profile fields."""
    email = models.EmailField(unique=True)
    date_of_birth = models.DateField(null=True, blank=True)
    height_cm = models.FloatField(null=True, blank=True, verbose_name='Рост (см)')
    weight_kg = models.FloatField(null=True, blank=True, verbose_name='Вес (кг)')
    notifications_enabled = models.BooleanField(default=True, verbose_name='Уведомления включены')

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

