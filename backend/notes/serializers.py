from rest_framework import serializers
from .models import Note


class NoteSerializer(serializers.ModelSerializer):
    """Serializer for notes."""
    
    class Meta:
        model = Note
        fields = ['id', 'playlist_item', 'playlist', 'title', 'content', 
                  'timestamp_seconds', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class NoteCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating notes."""
    
    playlist_item_id = serializers.IntegerField(required=False, allow_null=True)
    playlist_id = serializers.IntegerField(required=False, allow_null=True)
    
    class Meta:
        model = Note
        fields = ['playlist_item_id', 'playlist_id', 'title', 'content', 
                  'timestamp_seconds']
