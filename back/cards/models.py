from django.db import models
from django.conf import settings
from taggit.managers import TaggableManager
from django.utils import timezone
from datetime import timedelta


class Folder(models.Model):
    """Папка для организации колод"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE, 
        related_name='folders'
    )
    name = models.CharField('Название', max_length=100)
    parent = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='subfolders'
    )
    color = models.CharField('Цвет', max_length=7, default='#6366f1')
    icon = models.CharField('Иконка', max_length=50, default='📁')
    description = models.TextField('Описание', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Папка'
        verbose_name_plural = 'Папки'
        unique_together = ['user', 'name', 'parent']

    def __str__(self):
        return self.get_full_path()

    def get_full_path(self):
        """Полный путь: Родительская папка / Папка"""
        if self.parent:
            return f"{self.parent.get_full_path()} / {self.name}"
        return self.name

    def get_all_decks(self):
        """Получить все колоды из этой папки и подпапок"""
        decks = list(self.decks.all())
        for subfolder in self.subfolders.all():
            decks.extend(subfolder.get_all_decks())
        return decks

    def get_breadcrumbs(self):
        """Хлебные крошки для навигации"""
        breadcrumbs = [{'id': self.id, 'name': self.name}]
        current = self.parent
        while current:
            breadcrumbs.insert(0, {'id': current.id, 'name': current.name})
            current = current.parent
        return breadcrumbs


class Deck(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE, 
        related_name='decks'
    )
    folder = models.ForeignKey(
        Folder, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='decks'
    )
    name = models.CharField('Название', max_length=200)
    description = models.TextField('Описание', blank=True)
    color = models.CharField('Цвет', max_length=7, default='#3b82f6')
    is_public = models.BooleanField('Публичная', default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Колода'
        verbose_name_plural = 'Колоды'

    def __str__(self):
        return self.name


class Card(models.Model):
    CARD_TYPE_BASIC = 'basic'
    CARD_TYPE_MULTIPLE_CHOICE = 'multiple_choice'
    CARD_TYPE_CHOICES = [
        (CARD_TYPE_BASIC, 'Обычная'),
        (CARD_TYPE_MULTIPLE_CHOICE, 'Множественный выбор'),
    ]

    deck = models.ForeignKey(Deck, on_delete=models.CASCADE, related_name='cards')
    front = models.TextField('Вопрос')
    back = models.TextField('Ответ')
    image = models.ImageField('Изображение', upload_to='cards/images/', null=True, blank=True)
    card_type = models.CharField(
        'Тип карточки',
        max_length=20,
        choices=CARD_TYPE_CHOICES,
        default=CARD_TYPE_BASIC
    )
    tags = TaggableManager(blank=True)
    ease_factor = models.FloatField('Фактор легкости', default=2.5)
    interval = models.IntegerField('Интервал (дни)', default=0)
    repetitions = models.IntegerField('Повторения', default=0)
    next_review = models.DateTimeField('Следующее повторение', null=True, blank=True)
    last_reviewed = models.DateTimeField('Последнее повторение', null=True, blank=True)
    
    is_suspended = models.BooleanField('Приостановлена', default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['next_review']
        verbose_name = 'Карточка'
        verbose_name_plural = 'Карточки'
        indexes = [
            models.Index(fields=['next_review']),
            models.Index(fields=['deck', 'next_review']),
        ]

    def __str__(self):
        return f"{self.front[:50]}..."


class StudySession(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE, 
        related_name='study_sessions'
    )
    deck = models.ForeignKey(
        Deck, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='sessions'
    )
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    cards_studied = models.IntegerField('Изучено карточек', default=0)
    cards_correct = models.IntegerField('Правильных ответов', default=0)
    points_earned = models.IntegerField('Заработано очков', default=0)
    is_practice_mode = models.BooleanField('Режим практики', default=False)
    is_reversed = models.BooleanField('Реверс (ответ → вопрос)', default=False)

    class Meta:
        ordering = ['-started_at']
        verbose_name = 'Сессия обучения'
        verbose_name_plural = 'Сессии обучения'

    def __str__(self):
        mode = "Практика" if self.is_practice_mode else "Обучение"
        return f"{self.user.username} - {mode} - {self.started_at}"


class CardReview(models.Model):
    session = models.ForeignKey(
        StudySession, 
        on_delete=models.CASCADE, 
        related_name='reviews'
    )
    card = models.ForeignKey(Card, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField('Оценка (1-4)')
    time_taken = models.IntegerField('Время (сек)', default=0)
    reviewed_at = models.DateTimeField(auto_now_add=True)
    
    ease_factor_before = models.FloatField('EF до', default=2.5)
    interval_before = models.IntegerField('Интервал до', default=0)
    ease_factor_after = models.FloatField('EF после', default=2.5)
    interval_after = models.IntegerField('Интервал после', default=0)

    class Meta:
        ordering = ['-reviewed_at']
        verbose_name = 'Отзыв о карточке'
        verbose_name_plural = 'Отзывы о карточках'

    def __str__(self):
        return f"{self.card.front[:30]} - Rating {self.rating}"


