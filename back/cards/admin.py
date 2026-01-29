from django.contrib import admin
from .models import Deck, Card, StudySession, CardReview

@admin.register(Deck)
class DeckAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'created_at']
    
@admin.register(Card)
class CardAdmin(admin.ModelAdmin):
    list_display = ['front', 'deck', 'next_review', 'repetitions']
    
@admin.register(StudySession)
class StudySessionAdmin(admin.ModelAdmin):
    list_display = ['user', 'deck', 'cards_studied', 'started_at']
    
@admin.register(CardReview)
class CardReviewAdmin(admin.ModelAdmin):
    list_display = ['card', 'rating', 'reviewed_at']
