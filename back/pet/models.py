from django.db import models
from django.conf import settings
from datetime import timedelta

PET_TYPES = [
    ('cat', 'Кот'),
    ('dragon', 'Дракон'),
    ('robot', 'Робот'),
]

XP_PER_LEVEL = 100


class StudyPet(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='studypet',
    )
    pet_type = models.CharField(
        max_length=20,
        choices=PET_TYPES,
        default='cat',
    )
    level = models.PositiveIntegerField(default=1)
    xp = models.PositiveIntegerField(default=0)
    streak_days = models.PositiveIntegerField(default=0)
    last_streak_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'study_pets'
        verbose_name = 'StudyPet'
        verbose_name_plural = 'StudyPets'

    def __str__(self):
        return f"{self.get_pet_type_display()} Lv.{self.level} ({self.user.username})"

    def add_xp(self, amount):
        self.xp += amount
        while self.xp >= XP_PER_LEVEL:
            self.xp -= XP_PER_LEVEL
            self.level += 1
        self.save(update_fields=['xp', 'level', 'updated_at'])
        return self.level

    def update_streak(self, study_date):
        from django.utils import timezone
        today = timezone.now().date()
        if study_date != today:
            return
        if self.last_streak_date == today:
            return
        if self.last_streak_date == today - timedelta(days=1):
            self.streak_days += 1
        else:
            self.streak_days = 1
        self.last_streak_date = today
        self.save(update_fields=['streak_days', 'last_streak_date', 'updated_at'])
