from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserProfile

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'is_staff']
    
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'level', 'total_points', 'current_streak']
