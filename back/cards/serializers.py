import json
from rest_framework import serializers
from .models import Deck, Card, StudySession, CardReview, Folder
from taggit.serializers import TagListSerializerField, TaggitSerializer


class CardSerializer(TaggitSerializer, serializers.ModelSerializer):
    tags = TagListSerializerField(required=False)
    image_url = serializers.SerializerMethodField()
    clear_image = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = Card
        fields = [
            'id',
            'deck',
            'front',
            'back',
            'image',
            'image_url',
            'clear_image',
            'card_type',
            'repetitions',
            'ease_factor',
            'interval',
            'next_review',
            'last_reviewed',
            'is_suspended',
            'created_at',
            'updated_at',
            'tags',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def update(self, instance, validated_data):
        clear = validated_data.pop('clear_image', False)
        if clear in (True, 'true', '1') and instance.image:
            instance.image.delete(save=False)
            instance.image = None
        return super().update(instance, validated_data)

    def to_internal_value(self, data):
        """Поддержка multipart: tags как JSON-строка или через запятую."""
        if hasattr(data, 'get'):
            tags = data.get('tags')
            if isinstance(tags, str):
                data = data.copy() if hasattr(data, 'copy') else dict(data)
                try:
                    data['tags'] = json.loads(tags) if tags.strip() else []
                except (ValueError, TypeError):
                    data['tags'] = [t.strip() for t in tags.split(',') if t.strip()]
        return super().to_internal_value(data)

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

from rest_framework import serializers
from .models import Folder, Deck, Card

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
