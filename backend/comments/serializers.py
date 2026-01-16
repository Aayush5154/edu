from rest_framework import serializers
from .models import Comment, Discussion, DiscussionReply


class CommentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    replies = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = [
            'id', 'content', 'username', 'parent', 
            'replies', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_replies(self, obj):
        if obj.parent is None:  # Only get replies for top-level comments
            replies = obj.replies.all()
            return CommentSerializer(replies, many=True).data
        return []


class CommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['playlist_item', 'content', 'parent']


class DiscussionReplySerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    
    class Meta:
        model = DiscussionReply
        fields = ['id', 'content', 'author_username', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class DiscussionSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    reply_count = serializers.SerializerMethodField()
    replies = DiscussionReplySerializer(many=True, read_only=True)
    
    class Meta:
        model = Discussion
        fields = [
            'id', 'playlist', 'title', 'content', 'author_username',
            'is_pinned', 'reply_count', 'replies', 'created_at', 'updated_at'
        ]
        read_only_fields = ['is_pinned', 'created_at', 'updated_at']
    
    def get_reply_count(self, obj):
        return obj.replies.count()


class DiscussionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Discussion
        fields = ['playlist', 'title', 'content']
