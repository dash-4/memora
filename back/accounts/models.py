from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """Кастомная модель пользователя"""
    email = models.EmailField(unique=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    
    class Meta:
        db_table = 'users'
    
    def __str__(self):
        return self.username


class UserProfile(models.Model):
    """Профиль пользователя со статистикой"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    total_cards_studied = models.IntegerField(default=0)
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    last_study_date = models.DateField(null=True, blank=True)
    
    total_points = models.IntegerField(default=0)
    level = models.IntegerField(default=1)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_profiles'
    
    def __str__(self):
        return f"Profile of {self.user.username}"
