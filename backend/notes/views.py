from rest_framework import generics, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Note
from .serializers import NoteSerializer, NoteCreateUpdateSerializer
from playlists.models import PlaylistItem, Playlist


class NoteListCreateView(generics.ListCreateAPIView):
    """List user's notes or create a new one."""
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return NoteCreateUpdateSerializer
        return NoteSerializer
    
    def get_queryset(self):
        queryset = Note.objects.filter(user=self.request.user)
        
        # Filter by playlist item
        item_id = self.request.query_params.get('item_id')
        if item_id:
            queryset = queryset.filter(playlist_item_id=item_id)
        
        # Filter by playlist
        playlist_id = self.request.query_params.get('playlist_id')
        if playlist_id:
            queryset = queryset.filter(playlist_id=playlist_id)
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        
        playlist_item = None
        playlist = None
        
        if data.get('playlist_item_id'):
            playlist_item = get_object_or_404(
                PlaylistItem, 
                id=data['playlist_item_id']
            )
        
        if data.get('playlist_id'):
            playlist = get_object_or_404(Playlist, id=data['playlist_id'])
        
        note = Note.objects.create(
            user=request.user,
            playlist_item=playlist_item,
            playlist=playlist,
            title=data.get('title', ''),
            content=data.get('content', ''),
            timestamp_seconds=data.get('timestamp_seconds')
        )
        
        return Response(
            NoteSerializer(note).data,
            status=status.HTTP_201_CREATED
        )


class NoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a note."""
    
    serializer_class = NoteSerializer
    
    def get_queryset(self):
        return Note.objects.filter(user=self.request.user)
    
    def update(self, request, *args, **kwargs):
        note = self.get_object()
        
        # Update fields
        if 'title' in request.data:
            note.title = request.data['title']
        if 'content' in request.data:
            note.content = request.data['content']
        if 'timestamp_seconds' in request.data:
            note.timestamp_seconds = request.data['timestamp_seconds']
        
        note.save()
        
        return Response(NoteSerializer(note).data)


class ItemNotesView(generics.ListAPIView):
    """Get all notes for a specific playlist item."""
    
    serializer_class = NoteSerializer
    
    def get_queryset(self):
        item_id = self.kwargs.get('item_id')
        return Note.objects.filter(
            user=self.request.user,
            playlist_item_id=item_id
        ).order_by('timestamp_seconds', 'created_at')
