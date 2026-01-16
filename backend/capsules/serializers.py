from rest_framework import serializers
from .models import KnowledgeCapsule, CapsuleLike


class KnowledgeCapsuleSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    item_title = serializers.CharField(source='playlist_item.title', read_only=True)
    is_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = KnowledgeCapsule
        fields = [
            'id', 'username', 'playlist_item', 'item_title',
            'summary', 'key_points', 'common_mistakes',
            'code_snippet', 'code_language', 'image',
            'is_public', 'likes_count', 'is_liked',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['likes_count', 'created_at', 'updated_at']
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return CapsuleLike.objects.filter(
                user=request.user, capsule=obj
            ).exists()
        return False


class KnowledgeCapsuleCreateSerializer(serializers.ModelSerializer):
    key_points = serializers.ListField(
        child=serializers.CharField(max_length=500),
        allow_empty=True,
        required=False
    )
    
    class Meta:
        model = KnowledgeCapsule
        fields = [
            'playlist_item', 'summary', 'key_points',
            'common_mistakes', 'code_snippet', 'code_language',
            'image', 'is_public'
        ]
    
    def validate_key_points(self, value):
        # Filter out empty strings
        return [point for point in value if point.strip()]


class CapsuleListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""
    username = serializers.CharField(source='user.username', read_only=True)
    item_title = serializers.CharField(source='playlist_item.title', read_only=True)
    
    class Meta:
        model = KnowledgeCapsule
        fields = [
            'id', 'username', 'item_title', 'summary',
            'likes_count', 'is_public', 'created_at'
        ]
