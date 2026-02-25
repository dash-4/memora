from django.contrib import admin
from .models import StudyPet


@admin.register(StudyPet)
class StudyPetAdmin(admin.ModelAdmin):
    list_display = ('user', 'pet_type', 'level', 'xp', 'streak_days', 'updated_at')
    list_filter = ('pet_type',)
    search_fields = ('user__username',)
