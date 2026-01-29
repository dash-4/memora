from rest_framework import serializers
from .models import Deck, Card, StudySession, CardReview


class CardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = [
            'id', 
            'deck', 
            'front', 
            'back',
            'repetitions',
            'ease_factor',
            'interval',
            'next_review',
            'last_reviewed',
            'is_suspended',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class DeckSerializer(serializers.ModelSerializer):
    total_cards = serializers.IntegerField(read_only=True)
    cards_due_today = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Deck
        fields = [
            'id',
            'name',
            'description',
            'color',
            'total_cards',
            'cards_due_today',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']



class CardReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = CardReview
        fields = [
            'id',
            'session',
            'card',
            'rating',
            'time_taken',
            'ease_factor_before',
            'ease_factor_after',
            'interval_before',
            'interval_after',
            'reviewed_at'
        ]
        read_only_fields = ['id', 'reviewed_at']


class StudySessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudySession
        fields = [
            'id',
            'user',
            'deck',
            'started_at',
            'ended_at',
            'cards_studied',
            'cards_correct',
            'points_earned',
            'is_practice_mode'
        ]
        read_only_fields = ['id', 'user', 'started_at']
