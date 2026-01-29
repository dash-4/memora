from django.db import models
from django.conf import settings 
from django.utils import timezone
from datetime import timedelta


class Deck(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='decks'
    )
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default='#3B82F6')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
    
    @property
    def total_cards(self):
        return self.cards.count()
    
    @property
    def cards_due_today(self):
        return self.cards.filter(
            next_review__lte=timezone.now(),
            is_suspended=False
        ).count()


class Card(models.Model):
    deck = models.ForeignKey(Deck, on_delete=models.CASCADE, related_name='cards')
    front = models.TextField()
    back = models.TextField()
    
    # SM-2 Algorithm fields
    repetitions = models.IntegerField(default=0)
    ease_factor = models.FloatField(default=2.5)
    interval = models.IntegerField(default=0)
    next_review = models.DateTimeField(null=True, blank=True)
    last_reviewed = models.DateTimeField(null=True, blank=True)
    
    is_suspended = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['next_review']
    
    def __str__(self):
        return f"{self.front[:50]}..."


class StudySession(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,  
        on_delete=models.CASCADE, 
        related_name='study_sessions'
    )
    deck = models.ForeignKey(Deck, on_delete=models.SET_NULL, null=True, blank=True)
    
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    
    cards_studied = models.IntegerField(default=0)
    cards_correct = models.IntegerField(default=0)
    points_earned = models.IntegerField(default=0)
    
    is_practice_mode = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-started_at']
    
    def __str__(self):
        mode = "Тренировка" if self.is_practice_mode else "Обучение"
        return f"{self.user.username} - {mode} - {self.started_at}"


class CardReview(models.Model):
    session = models.ForeignKey(StudySession, on_delete=models.CASCADE, related_name='reviews')
    card = models.ForeignKey(Card, on_delete=models.CASCADE, related_name='reviews')
    
    rating = models.IntegerField()
    time_taken = models.IntegerField(default=0)
    
    ease_factor_before = models.FloatField()
    ease_factor_after = models.FloatField()
    interval_before = models.IntegerField()
    interval_after = models.IntegerField()
    
    reviewed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-reviewed_at']
    
    def __str__(self):
        return f"{self.card.front[:30]} - Rating: {self.rating}"
