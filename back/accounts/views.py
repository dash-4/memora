# backend/accounts/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from .serializers import UserRegistrationSerializer, UserSerializer
import logging

logger = logging.getLogger(__name__)


class AuthViewSet(viewsets.GenericViewSet):
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer
    
    @action(detail=False, methods=['post'])
    def register(self, request):
        try:
            logger.info(f"📝 Registration attempt: {request.data}")
            
            serializer = UserRegistrationSerializer(data=request.data)
            
            if not serializer.is_valid():
                logger.error(f"❌ Validation errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            user = serializer.save()
            logger.info(f"✅ User created: {user.username} ({user.email})")
            
            return Response({
                'message': 'Регистрация успешна',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"💥 Registration error: {str(e)}", exc_info=True)
            return Response({
                'error': 'Ошибка регистрации',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
