from rest_framework import serializers
from .models import Progress, LearningStreak


class ProgressSerializer(serializers.ModelSerializer):
    """Serializer for progress tracking."""
    
    playlist_item_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Progress
        fields = ['id', 'playlist_item_id', 'is_completed', 'time_spent_seconds', 
                  'completed_at', 'last_accessed']
        read_only_fields = ['id', 'completed_at', 'last_accessed']


class LearningStreakSerializer(serializers.ModelSerializer):
    """Serializer for learning streaks."""
    
    class Meta:
        model = LearningStreak
        fields = ['id', 'date', 'minutes_learned', 'items_completed']
        read_only_fields = ['id']


class PlaylistProgressSerializer(serializers.Serializer):
    """Serializer for playlist progress summary."""
    
    playlist_id = serializers.IntegerField()
    playlist_title = serializers.CharField()
    total_items = serializers.IntegerField()
    completed_items = serializers.IntegerField()
    progress_percentage = serializers.FloatField()
    total_time_spent = serializers.IntegerField()


class WeeklyStatsSerializer(serializers.Serializer):
    """Serializer for weekly learning statistics."""
    
    total_minutes = serializers.IntegerField()
    items_completed = serializers.IntegerField()
    current_streak = serializers.IntegerField()
    longest_streak = serializers.IntegerField()
    daily_breakdown = serializers.ListField()
