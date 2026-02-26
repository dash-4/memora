# views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction

from .models import StudyPet
from .serializers import StudyPetSerializer

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

    # можно оставить retrieve, но list обычно достаточно для one-to-one

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

    # ─── НОВЫЙ МЕТОД ───
    @action(detail=False, methods=['patch'])
    def update_pet(self, request):
        pet = StudyPet.objects.filter(user=request.user).first()
        if not pet:
            return Response({"detail": "Pet not found"}, status=404)

        serializer = StudyPetSerializer(pet, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)