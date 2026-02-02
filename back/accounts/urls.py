# backend/accounts/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'', views.AuthViewSet, basename='auth')

urlpatterns = [
    path('user/', include([
        path('me/', views.UserViewSet.as_view({'get': 'me'}), name='user-me'),
    ])),
    path('', include(router.urls)),
]
