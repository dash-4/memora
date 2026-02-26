from rest_framework import serializers
from .models import StudyPet


class StudyPetSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyPet
        fields = [
            'id', 'pet_type', 'level', 'xp', 'streak_days',
            'last_streak_date', 'created_at', 'updated_at',
            'name',
        ]
        read_only_fields = ['id', 'level', 'xp', 'streak_days', 'created_at', 'updated_at']
