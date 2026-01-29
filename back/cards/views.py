from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from django.utils import timezone
from django.db.models import Q
from datetime import timedelta, datetime
from calendar import monthrange
from .models import Deck, Card, StudySession, CardReview
from .serializers import (DeckSerializer, CardSerializer, 
                          StudySessionSerializer, CardReviewSerializer)


class DeckViewSet(viewsets.ModelViewSet):
    serializer_class = DeckSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Deck.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['get'])
    def cards(self, request, pk=None):
        deck = self.get_object()
        cards = deck.cards.all()
        serializer = CardSerializer(cards, many=True)
        return Response(serializer.data)


class CardViewSet(viewsets.ModelViewSet):
    serializer_class = CardSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Card.objects.filter(deck__user=self.request.user)
    
    def perform_create(self, serializer):
        deck_id = self.request.data.get('deck')
        try:
            deck = Deck.objects.get(id=deck_id, user=self.request.user)
            serializer.save(deck=deck)
        except Deck.DoesNotExist:
            raise ValidationError({'deck': 'Колода не найдена или нет доступа'})


class StudyViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def due_cards(self, request):
        deck_id = request.query_params.get('deck_id')
        limit = int(request.query_params.get('limit', 20))
        
        queryset = Card.objects.filter(
            deck__user=request.user,
            is_suspended=False
        )
        
        if deck_id:
            queryset = queryset.filter(deck_id=deck_id)
        
        queryset = queryset.filter(
            Q(next_review__lte=timezone.now()) | 
            Q(next_review__isnull=True)
        ).order_by('next_review')
        
        cards = queryset[:limit]
        serializer = CardSerializer(cards, many=True)
        
        return Response({
            'count': len(cards),
            'cards': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def all_cards(self, request):
        deck_id = request.query_params.get('deck_id')
        limit = int(request.query_params.get('limit', 20))
        
        if not deck_id:
            return Response(
                {'error': 'deck_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        cards = Card.objects.filter(
            deck__user=request.user,
            deck_id=deck_id
        ).order_by('?')[:limit]
        
        serializer = CardSerializer(cards, many=True)
        
        return Response({
            'count': len(cards),
            'cards': serializer.data,
            'mode': 'practice'
        })
    
    @action(detail=False, methods=['post'])
    def start_session(self, request):
        deck_id = request.data.get('deck_id')
        mode = request.data.get('mode', 'learning')
        
        session = StudySession.objects.create(
            user=request.user,
            deck_id=deck_id,
            is_practice_mode=(mode == 'practice')
        )
        
        return Response(
            {'session_id': session.id, 'mode': mode}, 
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=False, methods=['post'])
    def submit_review(self, request):
        card_id = request.data.get('card_id')
        session_id = request.data.get('session_id')
        rating = int(request.data.get('rating'))
        time_taken = int(request.data.get('time_taken', 0))
        
        try:
            card = Card.objects.get(id=card_id, deck__user=request.user)
            session = StudySession.objects.get(id=session_id, user=request.user)
        except (Card.DoesNotExist, StudySession.DoesNotExist):
            return Response(
                {'error': 'Card or Session not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        ease_before = card.ease_factor
        interval_before = card.interval
        
        if not session.is_practice_mode:
            card = self._apply_sm2(card, rating)
        
        CardReview.objects.create(
            session=session,
            card=card,
            rating=rating,
            time_taken=time_taken,
            ease_factor_before=ease_before,
            interval_before=interval_before,
            ease_factor_after=card.ease_factor,
            interval_after=card.interval
        )
        
        session.cards_studied += 1
        if rating >= 3:
            session.cards_correct += 1
        session.points_earned += rating
        session.save()
        
        if not session.is_practice_mode:
            profile = request.user.profile
            profile.total_cards_studied += 1
            profile.total_points += rating
            
            today = timezone.now().date()
            if profile.last_study_date != today:
                if profile.last_study_date == today - timedelta(days=1):
                    profile.current_streak += 1
                else:
                    profile.current_streak = 1
                profile.last_study_date = today
                
                if profile.current_streak > profile.longest_streak:
                    profile.longest_streak = profile.current_streak
            
            profile.save()
        
        return Response({
            'card': CardSerializer(card).data,
            'points_earned': rating if not session.is_practice_mode else 0,
            'current_streak': request.user.profile.current_streak if not session.is_practice_mode else 0
        })
    
    def _apply_sm2(self, card, rating):
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
    
    @action(detail=False, methods=['post'])
    def end_session(self, request):
        session_id = request.data.get('session_id')
        
        try:
            session = StudySession.objects.get(id=session_id, user=request.user)
        except StudySession.DoesNotExist:
            return Response(
                {'error': 'Session not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        session.ended_at = timezone.now()
        session.save()
        
        return Response(StudySessionSerializer(session).data)
    
    @action(detail=False, methods=['get'])
    def schedule(self, request):
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        days = int(request.query_params.get('days', 7))
        user = request.user
        
        if year and month:
            year = int(year)
            month = int(month)
            _, days_in_month = monthrange(year, month)
            schedule = []
            
            for day in range(1, days_in_month + 1):
                target_date = datetime(year, month, day).date()
                
                cards = Card.objects.filter(
                    deck__user=user,
                    is_suspended=False,
                    next_review__date=target_date
                ).select_related('deck')
                
                decks_dict = {}
                for card in cards:
                    deck_id = card.deck.id
                    if deck_id not in decks_dict:
                        decks_dict[deck_id] = {
                            'deck_id': deck_id,
                            'deck_name': card.deck.name,
                            'color': card.deck.color,
                            'count': 0
                        }
                    decks_dict[deck_id]['count'] += 1
                
                schedule.append({
                    'date': target_date.isoformat(),
                    'count': cards.count(),
                    'by_deck': list(decks_dict.values())
                })
            
            today = timezone.now().date()
            
            stats = {
                'today': Card.objects.filter(
                    deck__user=user,
                    is_suspended=False,
                    next_review__date=today
                ).count(),
                'week': Card.objects.filter(
                    deck__user=user,
                    is_suspended=False,
                    next_review__date__range=[today, today + timedelta(days=7)]
                ).count(),
                'completed': Card.objects.filter(
                    deck__user=user,
                    repetitions__gte=3
                ).count(),
                'total': Card.objects.filter(deck__user=user).count()
            }
            
            return Response({'schedule': schedule, 'stats': stats})
        
        else:
            today = timezone.now().date()
            schedule = []
            
            for i in range(days):
                target_date = today + timedelta(days=i)
                
                cards = Card.objects.filter(
                    deck__user=user,
                    is_suspended=False,
                    next_review__date=target_date
                ).select_related('deck')
                
                decks_dict = {}
                for card in cards:
                    deck_id = card.deck.id
                    if deck_id not in decks_dict:
                        decks_dict[deck_id] = {
                            'deck_id': deck_id,
                            'deck_name': card.deck.name,
                            'color': card.deck.color,
                            'count': 0
                        }
                    decks_dict[deck_id]['count'] += 1
                
                schedule.append({
                    'date': target_date.isoformat(),
                    'count': cards.count(),
                    'by_deck': list(decks_dict.values())
                })
            
            stats = {
                'today': Card.objects.filter(
                    deck__user=user,
                    is_suspended=False,
                    next_review__date=today
                ).count(),
                'week': Card.objects.filter(
                    deck__user=user,
                    is_suspended=False,
                    next_review__date__range=[today, today + timedelta(days=7)]
                ).count(),
                'completed': Card.objects.filter(
                    deck__user=user,
                    repetitions__gte=3
                ).count(),
                'total': Card.objects.filter(deck__user=user).count()
            }
            
            return Response({'schedule': schedule, 'stats': stats})
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        user = request.user
        today = timezone.now().date()
        
        stats = {
            'cards_due_today': Card.objects.filter(
                deck__user=user,
                is_suspended=False,
                next_review__date__lte=today
            ).count(),
            'total_decks': Deck.objects.filter(user=user).count(),
            'total_cards': Card.objects.filter(deck__user=user).count(),
            'cards_learned': Card.objects.filter(
                deck__user=user,
                repetitions__gte=1
            ).count()
        }
        
        return Response(stats)


class StatisticsViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        user = request.user
        profile = user.profile
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        
        total_cards = Card.objects.filter(deck__user=user).count()
        due_today = Card.objects.filter(
            deck__user=user,
            is_suspended=False,
            next_review__lte=timezone.now()
        ).count()
        
        total_decks = Deck.objects.filter(user=user).count()
        
        cards_studied_week = CardReview.objects.filter(
            session__user=user,
            reviewed_at__date__gte=week_ago,
            reviewed_at__date__lte=today,
            session__is_practice_mode=False
        ).values('card').distinct().count()
        
        sessions_week = StudySession.objects.filter(
            user=user,
            started_at__date__gte=week_ago,
            started_at__date__lte=today,
            ended_at__isnull=False,
            is_practice_mode=False
        ).count()
        
        cards_learned_total = Card.objects.filter(
            deck__user=user,
            repetitions__gte=1
        ).count()
        
        return Response({
            'cards': {
                'total': total_cards,
                'due_today': due_today
            },
            'decks': {
                'total': total_decks
            },
            'study': {
                'cards_studied_this_week': cards_studied_week,
                'sessions_this_week': sessions_week
            },
            'cards_learned': cards_learned_total,
            'progress': {
                'points': profile.total_points,
                'level': profile.level,
                'current_streak': profile.current_streak,
                'longest_streak': profile.longest_streak,
                'total_cards_studied': profile.total_cards_studied
            }
        })

    
    @action(detail=False, methods=['get'])
    def decks_progress(self, request):
        user = request.user
        decks = Deck.objects.filter(user=user).prefetch_related('cards')
        
        decks_data = []
        for deck in decks:
            cards = deck.cards.all()
            total_cards = cards.count()
            
            if total_cards > 0:
                new_cards = cards.filter(repetitions=0).count()
                
                mastered_cards = cards.filter(
                    Q(interval__gte=10, repetitions__gte=1) |
                    Q(repetitions__gte=3)
                ).count()
                
                learning_cards = cards.filter(
                    repetitions__gte=1
                ).exclude(
                    Q(interval__gte=10, repetitions__gte=1) |
                    Q(repetitions__gte=3)
                ).count()
                
                due_cards = cards.filter(
                    next_review__lte=timezone.now(),
                    is_suspended=False
                ).count()
                
                mastery_percent = round((mastered_cards / total_cards) * 100)
            else:
                new_cards = 0
                learning_cards = 0
                mastered_cards = 0
                due_cards = 0
                mastery_percent = 0
            
            decks_data.append({
                'id': deck.id,
                'name': deck.name,
                'description': deck.description,
                'color': deck.color,
                'total_cards': total_cards,
                'mastered_cards': mastered_cards,
                'learning_cards': learning_cards,
                'new_cards': new_cards,
                'cards_due_today': due_cards,
                'mastery_percent': mastery_percent,
                'created_at': deck.created_at,
            })
        
        return Response(decks_data)
