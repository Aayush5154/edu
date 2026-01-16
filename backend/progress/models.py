from django.db import models
from django.conf import settings


class Progress(models.Model):
    """Tracks user progress on playlist items."""
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='progress'
    )
    playlist_item = models.ForeignKey(
        'playlists.PlaylistItem',
        on_delete=models.CASCADE,
        related_name='progress'
    )
    is_completed = models.BooleanField(default=False)
    time_spent_seconds = models.PositiveIntegerField(default=0)
    completed_at = models.DateTimeField(null=True, blank=True)
    last_accessed = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'playlist_item']
        ordering = ['-last_accessed']
    
    def __str__(self):
        status = 'completed' if self.is_completed else 'in progress'
        return f"{self.user.email} - {self.playlist_item.title} ({status})"


class LearningStreak(models.Model):
    """Tracks daily learning activity for streak calculation."""
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='learning_streaks'
    )
    date = models.DateField()
    minutes_learned = models.PositiveIntegerField(default=0)
    items_completed = models.PositiveIntegerField(default=0)
    
    class Meta:
        unique_together = ['user', 'date']
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.user.email} - {self.date}: {self.minutes_learned} mins"
