from rest_framework import serializers
from .models import Playlist, PlaylistItem, PlaylistCollaborator
from users.serializers import UserSerializer


class PlaylistItemSerializer(serializers.ModelSerializer):
    """Serializer for playlist items."""
    
    class Meta:
        model = PlaylistItem
        fields = ['id', 'title', 'item_type', 'url', 'description', 
                  'thumbnail', 'duration_minutes', 'order', 'created_at']
        read_only_fields = ['id', 'created_at']


class PlaylistCollaboratorSerializer(serializers.ModelSerializer):
    """Serializer for playlist collaborators."""
    
    user = UserSerializer(read_only=True)
    user_email = serializers.EmailField(write_only=True, required=False)
    
    class Meta:
        model = PlaylistCollaborator
        fields = ['id', 'user', 'user_email', 'permission', 'created_at']
        read_only_fields = ['id', 'created_at']


class PlaylistSerializer(serializers.ModelSerializer):
    """Serializer for playlists."""
    
    creator = UserSerializer(read_only=True)
    items = PlaylistItemSerializer(many=True, read_only=True)
    item_count = serializers.IntegerField(read_only=True)
    total_duration = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Playlist
        fields = ['id', 'creator', 'title', 'description', 'cover_image',
                  'is_public', 'items', 'item_count', 'total_duration', 
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'creator', 'created_at', 'updated_at']


class PlaylistListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for playlist lists."""
    
    creator = UserSerializer(read_only=True)
    item_count = serializers.IntegerField(read_only=True)
    total_duration = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Playlist
        fields = ['id', 'creator', 'title', 'description', 'cover_image',
                  'is_public', 'item_count', 'total_duration', 'created_at']
        read_only_fields = ['id', 'creator', 'created_at']


class ReorderItemsSerializer(serializers.Serializer):
    """Serializer for reordering playlist items."""
    
    item_ids = serializers.ListField(
        child=serializers.IntegerField(),
        help_text="Ordered list of item IDs"
    )
