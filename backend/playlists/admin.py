from django.contrib import admin
from .models import Playlist, PlaylistItem, PlaylistCollaborator


class PlaylistItemInline(admin.TabularInline):
    model = PlaylistItem
    extra = 0


@admin.register(Playlist)
class PlaylistAdmin(admin.ModelAdmin):
    list_display = ['title', 'creator', 'is_public', 'item_count', 'created_at']
    list_filter = ['is_public', 'created_at']
    search_fields = ['title', 'creator__email']
    inlines = [PlaylistItemInline]


@admin.register(PlaylistItem)
class PlaylistItemAdmin(admin.ModelAdmin):
    list_display = ['title', 'playlist', 'item_type', 'order']
    list_filter = ['item_type']
    search_fields = ['title']


@admin.register(PlaylistCollaborator)
class PlaylistCollaboratorAdmin(admin.ModelAdmin):
    list_display = ['playlist', 'user', 'permission', 'created_at']
    list_filter = ['permission']
