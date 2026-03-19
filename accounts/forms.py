from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import CustomUser


class CustomUserCreationForm(UserCreationForm):
    email = forms.EmailField(required=True, widget=forms.EmailInput(attrs={
        'class': 'auth-input',
        'placeholder': 'Email',
        'autocomplete': 'email',
    }))
    password1 = forms.CharField(widget=forms.PasswordInput(attrs={
        'class': 'auth-input',
        'placeholder': 'Пароль',
        'autocomplete': 'new-password',
    }))
    password2 = forms.CharField(widget=forms.PasswordInput(attrs={
        'class': 'auth-input',
        'placeholder': 'Подтвердите пароль',
        'autocomplete': 'new-password',
    }))

    class Meta:
        model = CustomUser
        fields = ('email', 'password1', 'password2')

    def save(self, commit=True):
        user = super().save(commit=False)
        user.username = user.email
        if commit:
            user.save()
        return user


class ProfileForm(forms.ModelForm):
    class Meta:
        model = CustomUser
        fields = ('date_of_birth', 'height_cm', 'weight_kg', 'notifications_enabled')
        widgets = {
            'date_of_birth': forms.DateInput(attrs={'type': 'date', 'class': 'auth-input'}),
            'height_cm': forms.NumberInput(attrs={'class': 'auth-input', 'placeholder': 'Рост в см'}),
            'weight_kg': forms.NumberInput(attrs={'class': 'auth-input', 'placeholder': 'Вес в кг'}),
            'notifications_enabled': forms.CheckboxInput(attrs={'class': 'toggle-checkbox'}),
        }

