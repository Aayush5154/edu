from django.db import models
from django.conf import settings


class KnowledgeCapsule(models.Model):
    """
    Knowledge capsules created after completing a learning item.
    Users can summarize key learnings, create notes, and share insights.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='capsules'
    )
    playlist_item = models.ForeignKey(
        'playlists.PlaylistItem',
        on_delete=models.CASCADE,
        related_name='capsules'
    )
    
    # Main content
    summary = models.TextField(
        help_text="Short summary of what was learned"
    )
    key_points = models.JSONField(
        default=list,
        help_text="List of key takeaways"
    )
    common_mistakes = models.TextField(
        blank=True,
        help_text="Common mistakes to avoid"
    )
    
    # Optional code snippet
    code_snippet = models.TextField(
        blank=True,
        help_text="Code example or snippet"
    )
    code_language = models.CharField(
        max_length=20,
        blank=True,
        help_text="Programming language for syntax highlighting"
    )
    
    # Optional image
    image = models.ImageField(
        upload_to='capsule_images/',
        blank=True,
        null=True
    )
    
    # Metadata
    is_public = models.BooleanField(
        default=False,
        help_text="Allow others to view this capsule"
    )
    likes_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['user', 'playlist_item']  # One capsule per item per user
    
    def __str__(self):
        return f"Capsule by {self.user.username}: {self.playlist_item.title}"


class CapsuleLike(models.Model):
    """Track likes on public capsules."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    capsule = models.ForeignKey(
        KnowledgeCapsule,
        on_delete=models.CASCADE,
        related_name='likes'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'capsule']
