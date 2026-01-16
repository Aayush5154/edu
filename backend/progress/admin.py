from django.contrib import admin
from .models import Progress, LearningStreak


@admin.register(Progress)
class ProgressAdmin(admin.ModelAdmin):
    list_display = ['user', 'playlist_item', 'is_completed', 'time_spent_seconds']
    list_filter = ['is_completed', 'last_accessed']
    search_fields = ['user__email', 'playlist_item__title']


@admin.register(LearningStreak)
class LearningStreakAdmin(admin.ModelAdmin):
    list_display = ['user', 'date', 'minutes_learned', 'items_completed']
    list_filter = ['date']
    search_fields = ['user__email']
