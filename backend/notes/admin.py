from django.contrib import admin
from .models import Note


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'playlist_item', 'created_at', 'updated_at']
    list_filter = ['created_at']
    search_fields = ['user__email', 'title', 'content']
