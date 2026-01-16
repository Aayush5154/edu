from django.db import models
from django.conf import settings


class Playlist(models.Model):
    """Playlist containing learning resources."""
    
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='playlists'
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    cover_image = models.ImageField(upload_to='playlist_covers/', null=True, blank=True)
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return self.title
    
    @property
    def item_count(self):
        return self.items.count()
    
    @property
    def total_duration(self):
        return sum(item.duration_minutes or 0 for item in self.items.all())


class PlaylistItem(models.Model):
    """Individual item within a playlist (video, article, etc.)."""
    
    ITEM_TYPES = [
        ('video', 'Video'),
        ('article', 'Article'),
        ('resource', 'Resource'),
    ]
    
    playlist = models.ForeignKey(
        Playlist,
        on_delete=models.CASCADE,
        related_name='items'
    )
    title = models.CharField(max_length=200)
    item_type = models.CharField(max_length=20, choices=ITEM_TYPES, default='video')
    url = models.URLField()
    description = models.TextField(blank=True)
    thumbnail = models.URLField(blank=True)
    duration_minutes = models.PositiveIntegerField(null=True, blank=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.playlist.title} - {self.title}"


class PlaylistCollaborator(models.Model):
    """Collaborators for shared playlists."""
    
    PERMISSION_CHOICES = [
        ('view', 'View Only'),
        ('edit', 'Can Edit'),
    ]
    
    playlist = models.ForeignKey(
        Playlist,
        on_delete=models.CASCADE,
        related_name='collaborators'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='shared_playlists'
    )
    permission = models.CharField(max_length=10, choices=PERMISSION_CHOICES, default='view')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['playlist', 'user']
    
    def __str__(self):
        return f"{self.user.email} - {self.playlist.title}"
