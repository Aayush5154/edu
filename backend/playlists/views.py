from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import Playlist, PlaylistItem, PlaylistCollaborator
from .serializers import (
    PlaylistSerializer,
    PlaylistListSerializer,
    PlaylistItemSerializer,
    PlaylistCollaboratorSerializer,
    ReorderItemsSerializer,
)


class IsOwnerOrCollaborator(permissions.BasePermission):
    """Permission to check if user is owner or collaborator."""
    
    def has_object_permission(self, request, view, obj):
        if obj.creator == request.user:
            return True
        if request.method in permissions.SAFE_METHODS:
            if obj.is_public:
                return True
            return obj.collaborators.filter(user=request.user).exists()
        return obj.collaborators.filter(
            user=request.user, 
            permission='edit'
        ).exists()


class PlaylistListCreateView(generics.ListCreateAPIView):
    """List user's playlists or create a new one."""
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return PlaylistListSerializer
        return PlaylistSerializer
    
    def get_queryset(self):
        user = self.request.user
        # Get own playlists and shared playlists
        return Playlist.objects.filter(
            Q(creator=user) | Q(collaborators__user=user)
        ).distinct()
    
    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)


class PlaylistDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a playlist."""
    
    serializer_class = PlaylistSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrCollaborator]
    
    def get_queryset(self):
        user = self.request.user
        return Playlist.objects.filter(
            Q(creator=user) | Q(collaborators__user=user) | Q(is_public=True)
        ).distinct()


class PlaylistItemCreateView(generics.CreateAPIView):
    """Add an item to a playlist."""
    
    serializer_class = PlaylistItemSerializer
    
    def create(self, request, playlist_id):
        playlist = get_object_or_404(Playlist, id=playlist_id)
        
        # Check permission
        if playlist.creator != request.user:
            if not playlist.collaborators.filter(
                user=request.user, 
                permission='edit'
            ).exists():
                return Response(
                    {'error': 'Permission denied'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Set order to last position
        last_order = playlist.items.count()
        serializer.save(playlist=playlist, order=last_order)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class PlaylistItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a playlist item."""
    
    serializer_class = PlaylistItemSerializer
    
    def get_queryset(self):
        return PlaylistItem.objects.filter(
            Q(playlist__creator=self.request.user) | 
            Q(playlist__collaborators__user=self.request.user)
        ).distinct()


class ReorderItemsView(APIView):
    """Reorder items within a playlist."""
    
    def put(self, request, playlist_id):
        playlist = get_object_or_404(Playlist, id=playlist_id)
        
        # Check permission
        if playlist.creator != request.user:
            if not playlist.collaborators.filter(
                user=request.user, 
                permission='edit'
            ).exists():
                return Response(
                    {'error': 'Permission denied'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        serializer = ReorderItemsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        item_ids = serializer.validated_data['item_ids']
        
        for index, item_id in enumerate(item_ids):
            PlaylistItem.objects.filter(
                id=item_id, 
                playlist=playlist
            ).update(order=index)
        
        return Response({'message': 'Items reordered successfully'})


class DiscoverPlaylistsView(generics.ListAPIView):
    """Discover public playlists."""
    
    serializer_class = PlaylistListSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = Playlist.objects.filter(is_public=True)
        
        # Search filter
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )
        
        return queryset


class SharePlaylistView(APIView):
    """Share playlist with another user."""
    
    def post(self, request, playlist_id):
        playlist = get_object_or_404(Playlist, id=playlist_id, creator=request.user)
        
        email = request.data.get('email')
        permission = request.data.get('permission', 'view')
        
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        collaborator, created = PlaylistCollaborator.objects.update_or_create(
            playlist=playlist,
            user=user,
            defaults={'permission': permission}
        )
        
        return Response({
            'message': f'Playlist shared with {email}',
            'collaborator': PlaylistCollaboratorSerializer(collaborator).data
        })
