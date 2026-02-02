from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from django.utils import timezone
from django.db.models import Q, Count, Avg
from datetime import date, timedelta, datetime
from calendar import monthrange
from taggit.models import Tag
from collections import defaultdict

from .models import Deck, Card, StudySession, CardReview, Folder
from .serializers import (
    DeckSerializer, CardSerializer, StudySessionSerializer,
    CardReviewSerializer, FolderTreeSerializer, FolderSerializer
)
from accounts.models import UserProfile


class DeckViewSet(viewsets.ModelViewSet):
    serializer_class = DeckSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Deck.objects.filter(user=self.request.user)
        
        sort_by = self.request.query_params.get('sort_by', '-created_at')
        if sort_by in ['name', '-name', 'created_at', '-created_at']:
            queryset = queryset.order_by(sort_by)
        
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['get'])
    def cards(self, request, pk=None):
        deck = self.get_object()
        cards = self._apply_card_filters(deck.cards.all())
        serializer = CardSerializer(cards, many=True)
        
        return Response({
            'deck': DeckSerializer(deck).data,
            'cards': serializer.data,
            'count': len(serializer.data)
        })
    
    def _apply_card_filters(self, queryset):
        status_filter = self.request.query_params.get('status')
        if status_filter == 'new':
            queryset = queryset.filter(repetitions=0)
        elif status_filter == 'learning':
            queryset = queryset.filter(repetitions__gte=1, repetitions__lt=3)
        elif status_filter == 'mastered':
            queryset = queryset.filter(repetitions__gte=3)
        
        tag = self.request.query_params.get('tag')
        if tag:
            queryset = queryset.filter(tags__name=tag)
        
        return queryset


class CardViewSet(viewsets.ModelViewSet):
    serializer_class = CardSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['front', 'back', 'tags__name']
    ordering_fields = ['created_at', 'next_review', 'repetitions']
    
    def get_queryset(self):
        queryset = Card.objects.filter(deck__user=self.request.user)
        
        deck_id = self.request.query_params.get('deck_id')
        if deck_id:
            queryset = queryset.filter(deck_id=deck_id)
        
        tag = self.request.query_params.get('tag')
        if tag:
            queryset = queryset.filter(tags__name__in=[tag])
        
        status_filter = self.request.query_params.get('status')
        if status_filter == 'new':
            queryset = queryset.filter(repetitions=0)
        elif status_filter == 'learning':
            queryset = queryset.filter(repetitions__gte=1, repetitions__lt=3)
        elif status_filter == 'mastered':
            queryset = queryset.filter(repetitions__gte=3)
        
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(front__icontains=search) | 
                Q(back__icontains=search) |
                Q(tags__name__icontains=search)
            ).distinct()
        
        return queryset
    
    def perform_create(self, serializer):
        deck_id = self.request.data.get('deck')
        try:
            deck = Deck.objects.get(id=deck_id, user=self.request.user)
            serializer.save(deck=deck)
        except Deck.DoesNotExist:
            raise ValidationError({'deck': 'Колода не найдена'})
    
    @action(detail=False, methods=['get'])
    def popular_tags(self, request):
        tags = Tag.objects.filter(
            taggit_taggeditem_items__content_type__model='card',
            taggit_taggeditem_items__object_id__in=Card.objects.filter(
                deck__user=request.user
            ).values_list('id', flat=True)
        ).annotate(
            count=Count('taggit_taggeditem_items')
        ).order_by('-count')[:20]
        
        return Response([{'name': tag.name, 'count': tag.count} for tag in tags])


class StudyViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def due_cards(self, request):
        deck_id = request.query_params.get('deck_id')
        limit = int(request.query_params.get('limit', 20))
        now = timezone.now()
        
        queryset = Card.objects.filter(
            deck__user=request.user,
            is_suspended=False,
            next_review__isnull=False,
            next_review__lte=now
        )
        
        if deck_id:
            try:
                queryset = queryset.filter(deck_id=int(deck_id))
            except (ValueError, TypeError):
                return Response({'error': 'Invalid deck_id'}, status=400)
        
        cards = queryset.order_by('next_review')[:limit]
        serializer = CardSerializer(cards, many=True)
        
        return Response({'cards': serializer.data, 'count': len(serializer.data)})
    
    @action(detail=False, methods=['get'])
    def all_cards(self, request):
        deck_id = request.query_params.get('deck_id')
        limit = int(request.query_params.get('limit', 20))
        
        if not deck_id:
            return Response({'error': 'deck_id is required'}, status=400)
        
        cards = Card.objects.filter(
            deck__user=request.user,
            deck_id=deck_id,
            is_suspended=False
        ).order_by('?')[:limit]
        
        serializer = CardSerializer(cards, many=True)
        return Response({
            'cards': serializer.data,
            'count': len(serializer.data),
            'mode': 'practice'
        })
    
    @action(detail=False, methods=['post'])
    def start_session(self, request):
        deck_id = request.data.get('deck_id')
        mode = request.data.get('mode', 'learning')
        
        session = StudySession.objects.create(
            user=request.user,
            deck_id=deck_id if deck_id else None,
            is_practice_mode=(mode == 'practice')
        )
        
        return Response({'session_id': session.id, 'mode': mode}, status=201)
    
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
            return Response({'error': 'Card or Session not found'}, status=404)
        
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
            self._update_user_profile(request.user, rating)
        
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
    
    def _update_user_profile(self, user, rating):
        profile, _ = UserProfile.objects.get_or_create(user=user)
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
    
    @action(detail=False, methods=['post'])
    def end_session(self, request):
        session_id = request.data.get('session_id')
        
        try:
            session = StudySession.objects.get(id=session_id, user=request.user)
        except StudySession.DoesNotExist:
            return Response({'error': 'Session not found'}, status=404)
        
        session.ended_at = timezone.now()
        session.save()
        
        return Response(StudySessionSerializer(session).data)
    
    @action(detail=False, methods=['get'])
    def schedule(self, request):
        days = int(request.query_params.get('days', 7))
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        user = request.user
        today = timezone.now().date()
        
        if year and month:
            try:
                year, month = int(year), int(month)
                _, days_in_month = monthrange(year, month)
                start_date = date(year, month, 1)
                end_date = date(year, month, days_in_month)
            except (ValueError, TypeError):
                return Response({'error': 'Неверный год или месяц'}, status=400)
        else:
            start_date = today
            end_date = today + timedelta(days=days - 1)
        
        schedule_by_date = defaultdict(lambda: {'count': 0, 'by_deck': defaultdict(int)})
        
        overdue_cards = Card.objects.filter(
            deck__user=user,
            is_suspended=False,
            next_review__lt=start_date
        ).select_related('deck')
        
        for card in overdue_cards:
            date_str = start_date.isoformat()
            deck_id = card.deck.id
            schedule_by_date[date_str]['count'] += 1
            schedule_by_date[date_str]['by_deck'][deck_id] += 1
        
        cards_due = Card.objects.filter(
            deck__user=user,
            is_suspended=False,
            next_review__date__range=[start_date, end_date]
        ).select_related('deck').order_by('next_review')
        
        for card in cards_due:
            due_date = card.next_review.date().isoformat()
            deck_id = card.deck.id
            schedule_by_date[due_date]['count'] += 1
            schedule_by_date[due_date]['by_deck'][deck_id] += 1
        
        schedule = []
        current_date = start_date
        while current_date <= end_date:
            date_str = current_date.isoformat()
            day_data = schedule_by_date.get(date_str, {'count': 0, 'by_deck': {}})
            
            by_deck_list = []
            for deck_id, cnt in day_data['by_deck'].items():
                try:
                    deck = Deck.objects.get(id=deck_id)
                    by_deck_list.append({
                        'deck_id': deck_id,
                        'deck_name': deck.name,
                        'color': deck.color or '#6366f1',
                        'count': cnt
                    })
                except Deck.DoesNotExist:
                    continue
            
            schedule.append({
                'date': date_str,
                'count': day_data['count'],
                'by_deck': by_deck_list
            })
            
            current_date += timedelta(days=1)
        
        stats = {
            'today': Card.objects.filter(
                deck__user=user,
                is_suspended=False,
                next_review__lte=timezone.now()
            ).count(),
            'week': Card.objects.filter(
                deck__user=user,
                is_suspended=False,
                next_review__date__range=[today, today + timedelta(days=6)]
            ).count(),
            'total_due': Card.objects.filter(
                deck__user=user,
                is_suspended=False,
                next_review__lte=timezone.now()
            ).count(),
        }
        
        return Response({'schedule': schedule, 'stats': stats})
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        user = request.user
        now = timezone.now()
        
        return Response({
            'cards_due_today': Card.objects.filter(
                deck__user=user,
                is_suspended=False,
                next_review__lte=now
            ).count(),
            'total_decks': Deck.objects.filter(user=user).count(),
            'total_cards': Card.objects.filter(deck__user=user).count(),
            'cards_learned': Card.objects.filter(deck__user=user, repetitions__gte=1).count()
        })


class StatisticsViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        user = request.user
        profile = user.profile
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        now = timezone.now()
        
        return Response({
            'cards': {
                'total': Card.objects.filter(deck__user=user).count(),
                'due_today': Card.objects.filter(
                    deck__user=user,
                    is_suspended=False,
                    next_review__lte=now
                ).count()
            },
            'decks': {
                'total': Deck.objects.filter(user=user).count()
            },
            'study': {
                'cards_studied_this_week': CardReview.objects.filter(
                    session__user=user,
                    reviewed_at__date__gte=week_ago,
                    reviewed_at__date__lte=today,
                    session__is_practice_mode=False
                ).values('card').distinct().count(),
                'sessions_this_week': StudySession.objects.filter(
                    user=user,
                    started_at__date__gte=week_ago,
                    started_at__date__lte=today,
                    ended_at__isnull=False,
                    is_practice_mode=False
                ).count()
            },
            'cards_learned': Card.objects.filter(deck__user=user, repetitions__gte=1).count(),
            'progress': {
                'points': profile.total_points,
                'level': profile.level,
                'current_streak': profile.current_streak,
                'longest_streak': profile.longest_streak,
                'total_cards_studied': profile.total_cards_studied
            }
        })
    
    @action(detail=False, methods=['get'])
    def learning_stats(self, request):
        user = request.user
        days = int(request.query_params.get('days', 30))
        today = timezone.now().date()
        start_date = today - timedelta(days=days)
        
        daily_activity = []
        for i in range(days):
            date = start_date + timedelta(days=i)
            reviews = CardReview.objects.filter(
                session__user=user,
                reviewed_at__date=date,
                session__is_practice_mode=False
            )
            
            daily_activity.append({
                'date': date.isoformat(),
                'cards_studied': reviews.values('card').distinct().count(),
                'cards_correct': reviews.filter(rating__gte=3).count(),
                'sessions': StudySession.objects.filter(
                    user=user,
                    started_at__date=date,
                    ended_at__isnull=False,
                    is_practice_mode=False
                ).count()
            })
        
        return Response({'daily_activity': daily_activity})
    
    @action(detail=False, methods=['get'])
    def tags_stats(self, request):
        user = request.user
        user_cards = Card.objects.filter(deck__user=user)
        
        tags_data = []
        for tag in Tag.objects.filter(
            taggit_taggeditem_items__content_type__model='card',
            taggit_taggeditem_items__object_id__in=user_cards.values_list('id', flat=True)
        ).distinct():
            tagged_cards = user_cards.filter(tags__name=tag.name)
            total = tagged_cards.count()
            mastered = tagged_cards.filter(repetitions__gte=3).count()
            
            tags_data.append({
                'tag': tag.name,
                'total_cards': total,
                'mastered_cards': mastered,
                'mastery_percent': round((mastered / total * 100) if total > 0 else 0),
                'avg_repetitions': round(
                    tagged_cards.aggregate(Avg('repetitions'))['repetitions__avg'] or 0, 1
                )
            })
        
        return Response(sorted(tags_data, key=lambda x: x['total_cards'], reverse=True))
    
    @action(detail=False, methods=['get'])
    def decks_progress(self, request):
        user = request.user
        now = timezone.now()
        decks = Deck.objects.filter(user=user).prefetch_related('cards')
        
        decks_data = []
        for deck in decks:
            cards = deck.cards.all()
            total_cards = cards.count()
            
            if total_cards > 0:
                mastered = cards.filter(
                    Q(interval__gte=10, repetitions__gte=1) | Q(repetitions__gte=3)
                ).count()
                learning = cards.filter(repetitions__gte=1).exclude(
                    Q(interval__gte=10, repetitions__gte=1) | Q(repetitions__gte=3)
                ).count()
                
                decks_data.append({
                    'id': deck.id,
                    'name': deck.name,
                    'description': deck.description,
                    'color': deck.color,
                    'total_cards': total_cards,
                    'new_cards': cards.filter(repetitions=0).count(),
                    'learning_cards': learning,
                    'mastered_cards': mastered,
                    'cards_due_today': cards.filter(
                        next_review__lte=now,
                        is_suspended=False
                    ).count(),
                    'mastery_percent': round((mastered / total_cards) * 100),
                    'created_at': deck.created_at
                })
            else:
                decks_data.append({
                    'id': deck.id,
                    'name': deck.name,
                    'description': deck.description,
                    'color': deck.color,
                    'total_cards': 0,
                    'new_cards': 0,
                    'learning_cards': 0,
                    'mastered_cards': 0,
                    'cards_due_today': 0,
                    'mastery_percent': 0,
                    'created_at': deck.created_at
                })
        
        return Response(decks_data)


class FolderViewSet(viewsets.ModelViewSet):
    serializer_class = FolderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Folder.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def tree(self, request):
        root_folders = Folder.objects.filter(user=request.user, parent__isnull=True)
        serializer = FolderTreeSerializer(root_folders, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def contents(self, request, pk=None):
        folder = self.get_object()
        
        return Response({
            'folder': FolderSerializer(folder).data,
            'subfolders': FolderSerializer(folder.subfolders.all(), many=True).data,
            'decks': DeckSerializer(folder.decks.all(), many=True).data
        })
    
    @action(detail=True, methods=['post'])
    def move(self, request, pk=None):
        folder = self.get_object()
        new_parent_id = request.data.get('parent_id')
        
        if new_parent_id:
            try:
                new_parent = Folder.objects.get(id=new_parent_id, user=request.user)
                if new_parent == folder or new_parent.parent == folder:
                    return Response(
                        {'error': 'Нельзя переместить папку в саму себя или в дочернюю'},
                        status=400
                    )
                folder.parent = new_parent
            except Folder.DoesNotExist:
                return Response({'error': 'Папка не найдена'}, status=404)
        else:
            folder.parent = None
        
        folder.save()
        return Response(FolderSerializer(folder).data)
