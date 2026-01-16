from django.contrib import admin
from .models import KnowledgeCapsule, CapsuleLike


@admin.register(KnowledgeCapsule)
class KnowledgeCapsuleAdmin(admin.ModelAdmin):
    list_display = ['user', 'playlist_item', 'summary_preview', 'is_public', 'likes_count', 'created_at']
    list_filter = ['is_public', 'created_at']
    search_fields = ['user__username', 'summary', 'playlist_item__title']
    readonly_fields = ['likes_count', 'created_at', 'updated_at']
    
    def summary_preview(self, obj):
        return obj.summary[:50] + '...' if len(obj.summary) > 50 else obj.summary
    summary_preview.short_description = 'Summary'


@admin.register(CapsuleLike)
class CapsuleLikeAdmin(admin.ModelAdmin):
    list_display = ['user', 'capsule', 'created_at']
    list_filter = ['created_at']
