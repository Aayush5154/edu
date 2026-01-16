from django.db import models
from django.conf import settings


class Note(models.Model):
    """Notes linked to playlist items."""
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notes'
    )
    playlist_item = models.ForeignKey(
        'playlists.PlaylistItem',
        on_delete=models.CASCADE,
        related_name='notes',
        null=True,
        blank=True
    )
    playlist = models.ForeignKey(
        'playlists.Playlist',
        on_delete=models.CASCADE,
        related_name='notes',
        null=True,
        blank=True
    )
    title = models.CharField(max_length=200, blank=True)
    content = models.TextField()
    timestamp_seconds = models.PositiveIntegerField(
        null=True, 
        blank=True,
        help_text="Video timestamp where note was taken"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        if self.playlist_item:
            return f"Note on {self.playlist_item.title}"
        elif self.playlist:
            return f"Note on {self.playlist.title}"
        return f"Note by {self.user.email}"
