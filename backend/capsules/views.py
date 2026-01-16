from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from .models import KnowledgeCapsule, CapsuleLike
from .serializers import (
    KnowledgeCapsuleSerializer,
    KnowledgeCapsuleCreateSerializer,
    CapsuleListSerializer
)


class CapsuleListCreateView(generics.ListCreateAPIView):
    """
    List user's capsules or create a new capsule.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return KnowledgeCapsuleCreateSerializer
        return CapsuleListSerializer
    
    def get_queryset(self):
        return KnowledgeCapsule.objects.filter(
            user=self.request.user
        ).select_related('playlist_item')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Return full capsule data
        capsule = serializer.instance
        response_serializer = KnowledgeCapsuleSerializer(
            capsule, context={'request': request}
        )
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class CapsuleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a capsule.
    """
    serializer_class = KnowledgeCapsuleSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Users can view their own and public capsules
        return KnowledgeCapsule.objects.filter(
            Q(user=self.request.user) | Q(is_public=True)
        ).select_related('user', 'playlist_item')


class ItemCapsulesView(generics.ListAPIView):
    """
    Get all capsules for a specific playlist item.
    Shows public capsules and user's own capsule.
    """
    serializer_class = KnowledgeCapsuleSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        item_id = self.kwargs.get('item_id')
        return KnowledgeCapsule.objects.filter(
            playlist_item_id=item_id
        ).filter(
            Q(user=self.request.user) | Q(is_public=True)
        ).select_related('user', 'playlist_item')


class UserCapsulesView(generics.ListAPIView):
    """
    Get all capsules created by the current user.
    """
    serializer_class = CapsuleListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return KnowledgeCapsule.objects.filter(
            user=self.request.user
        ).select_related('playlist_item')


class PublicCapsulesView(generics.ListAPIView):
    """
    Browse all public capsules for discovery.
    """
    serializer_class = CapsuleListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return KnowledgeCapsule.objects.filter(
            is_public=True
        ).select_related('user', 'playlist_item').order_by('-likes_count', '-created_at')


class LikeCapsuleView(APIView):
    """
    Like or unlike a public capsule.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, capsule_id):
        try:
            capsule = KnowledgeCapsule.objects.get(id=capsule_id, is_public=True)
        except KnowledgeCapsule.DoesNotExist:
            return Response(
                {'error': 'Capsule not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        like, created = CapsuleLike.objects.get_or_create(
            user=request.user,
            capsule=capsule
        )
        
        if created:
            capsule.likes_count += 1
            capsule.save(update_fields=['likes_count'])
            return Response({'liked': True, 'likes_count': capsule.likes_count})
        else:
            like.delete()
            capsule.likes_count = max(0, capsule.likes_count - 1)
            capsule.save(update_fields=['likes_count'])
            return Response({'liked': False, 'likes_count': capsule.likes_count})
