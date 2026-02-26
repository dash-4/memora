from rest_framework import serializers
from .models import Deck, Card, StudySession, CardReview, Folder


class CardSerializer(serializers.ModelSerializer):
    """
    Упрощённый сериализатор: только вопрос/ответ + служебные поля.
    Без тегов и изображений, все запросы идут в JSON.
    """
    deck = serializers.PrimaryKeyRelatedField(queryset=Deck.objects.all(), required=True)

    class Meta:
        model = Card
        fields = [
            'id', 'deck', 'front', 'back',
            'card_type', 'repetitions', 'ease_factor', 'interval',
            'next_review', 'last_reviewed', 'is_suspended',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']




class FolderSerializer(serializers.ModelSerializer):
    subfolders_count = serializers.SerializerMethodField()
    decks_count = serializers.SerializerMethodField()
    total_cards = serializers.SerializerMethodField()
    breadcrumbs = serializers.SerializerMethodField()
    
    class Meta:
        model = Folder
        fields = [
            'id', 'name', 'parent', 'color', 'icon', 'description',
            'subfolders_count', 'decks_count', 'total_cards', 'breadcrumbs',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_subfolders_count(self, obj):
        return obj.subfolders.count()
    
    def get_decks_count(self, obj):
        return obj.decks.count()
    
    def get_total_cards(self, obj):
        return sum(deck.cards.count() for deck in obj.decks.all())
    
    def get_breadcrumbs(self, obj):
        return obj.get_breadcrumbs()


class FolderTreeSerializer(serializers.ModelSerializer):
    """Рекурсивный сериализатор для дерева папок"""
    subfolders = serializers.SerializerMethodField()
    decks = serializers.SerializerMethodField()
    
    class Meta:
        model = Folder
        fields = [
            'id', 'name', 'color', 'icon', 'description',
            'subfolders', 'decks', 'created_at'
        ]
    
    def get_subfolders(self, obj):
        subfolders = obj.subfolders.all()
        return FolderTreeSerializer(subfolders, many=True).data
    
    def get_decks(self, obj):
        from .serializers import DeckSerializer
        decks = obj.decks.all()
        return DeckSerializer(decks, many=True).data


class DeckSerializer(serializers.ModelSerializer):
    cards_count = serializers.SerializerMethodField()
    folder_name = serializers.CharField(source='folder.name', read_only=True)
    
    class Meta:
        model = Deck
        fields = [
            'id', 'name', 'description', 'color', 'folder', 'folder_name',
            'is_public', 'cards_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_cards_count(self, obj):
        return obj.cards.count()


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
            'is_practice_mode',
            'is_reversed',
        ]
        read_only_fields = ['id', 'user', 'started_at']
