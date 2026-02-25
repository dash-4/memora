from django.utils import timezone
from datetime import timedelta


def apply_sm2(card, rating):
    if rating == 1:
        card.repetitions = 0
        card.interval = 0
        card.next_review = timezone.now() + timedelta(minutes=10)
    else:
        if card.repetitions == 0:
            card.interval = 1
        elif card.repetitions == 1:
            card.interval = 6
        else:
            card.interval = int(card.interval * card.ease_factor)
        card.repetitions += 1
        card.next_review = timezone.now() + timedelta(days=card.interval)
        if rating == 2:
            card.ease_factor = max(1.3, card.ease_factor - 0.15)
        elif rating == 4:
            card.ease_factor = min(2.5, card.ease_factor + 0.15)
    card.last_reviewed = timezone.now()
    card.save()
    return card
