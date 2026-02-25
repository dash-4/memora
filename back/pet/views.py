from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction

from .models import StudyPet
from .serializers import StudyPetSerializer

XP_PER_LEVEL = 100


class PetViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = StudyPetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return StudyPet.objects.filter(user=self.request.user)

    def list(self, request, *args, **kwargs):
        pet = StudyPet.objects.filter(user=request.user).first()
        if not pet:
            pet = StudyPet.objects.create(user=request.user)
        serializer = self.get_serializer(pet)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        pet = StudyPet.objects.filter(user=request.user).first()
        if not pet:
            pet = StudyPet.objects.create(user=request.user)
        serializer = self.get_serializer(pet)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def xp(self, request):
        amount = request.data.get('amount', 0)
        try:
            amount = int(amount)
        except (TypeError, ValueError):
            return Response({'error': 'amount must be integer'}, status=status.HTTP_400_BAD_REQUEST)
        if amount < 0:
            return Response({'error': 'amount must be non-negative'}, status=status.HTTP_400_BAD_REQUEST)
        pet, _ = StudyPet.objects.get_or_create(user=request.user, defaults={'pet_type': 'cat'})
        with transaction.atomic():
            old_level = pet.level
            pet.add_xp(amount)
            level_up = pet.level > old_level
        serializer = StudyPetSerializer(pet)
        return Response({
            **serializer.data,
            'level_up': level_up,
            'xp_gained': amount,
        }, status=status.HTTP_200_OK)
