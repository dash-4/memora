from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DeckViewSet, CardViewSet, StudyViewSet, StatisticsViewSet

router = DefaultRouter()
router.register(r'decks', DeckViewSet, basename='deck')
router.register(r'cards', CardViewSet, basename='card')
router.register(r'study', StudyViewSet, basename='study')
router.register(r'statistics', StatisticsViewSet, basename='statistics')

urlpatterns = [
    path('', include(router.urls)),
]
