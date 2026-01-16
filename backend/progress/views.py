from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Sum, Count
from datetime import timedelta

from .models import Progress, LearningStreak
from .serializers import (
    ProgressSerializer,
    LearningStreakSerializer,
    PlaylistProgressSerializer,
    WeeklyStatsSerializer,
)
from playlists.models import PlaylistItem, Playlist


class UpdateProgressView(APIView):
    """Update or create progress for a playlist item."""
    
    def post(self, request):
        playlist_item_id = request.data.get('playlist_item_id')
        is_completed = request.data.get('is_completed', False)
        time_spent = request.data.get('time_spent_seconds', 0)
        
        playlist_item = get_object_or_404(PlaylistItem, id=playlist_item_id)
        
        progress, created = Progress.objects.get_or_create(
            user=request.user,
            playlist_item=playlist_item
        )
        
        progress.time_spent_seconds += time_spent
        
        if is_completed and not progress.is_completed:
            progress.is_completed = True
            progress.completed_at = timezone.now()
            
            # Update learning streak
            today = timezone.now().date()
            streak, _ = LearningStreak.objects.get_or_create(
                user=request.user,
                date=today
            )
            streak.items_completed += 1
            streak.minutes_learned += time_spent // 60
            streak.save()
        
        progress.save()
        
        return Response({
            'progress': ProgressSerializer(progress).data
        })


class PlaylistProgressView(APIView):
    """Get progress for all items in a playlist."""
    
    def get(self, request, playlist_id):
        playlist = get_object_or_404(Playlist, id=playlist_id)
        
        total_items = playlist.items.count()
        completed_items = Progress.objects.filter(
            user=request.user,
            playlist_item__playlist=playlist,
            is_completed=True
        ).count()
        
        total_time = Progress.objects.filter(
            user=request.user,
            playlist_item__playlist=playlist
        ).aggregate(total=Sum('time_spent_seconds'))['total'] or 0
        
        progress_percentage = (completed_items / total_items * 100) if total_items > 0 else 0
        
        # Get progress for each item
        item_progress = []
        for item in playlist.items.all():
            try:
                progress = Progress.objects.get(
                    user=request.user,
                    playlist_item=item
                )
                item_progress.append({
                    'item_id': item.id,
                    'title': item.title,
                    'is_completed': progress.is_completed,
                    'time_spent_seconds': progress.time_spent_seconds
                })
            except Progress.DoesNotExist:
                item_progress.append({
                    'item_id': item.id,
                    'title': item.title,
                    'is_completed': False,
                    'time_spent_seconds': 0
                })
        
        return Response({
            'playlist_id': playlist_id,
            'playlist_title': playlist.title,
            'total_items': total_items,
            'completed_items': completed_items,
            'progress_percentage': round(progress_percentage, 1),
            'total_time_spent': total_time,
            'items': item_progress
        })


class OverallStatsView(APIView):
    """Get overall learning statistics."""
    
    def get(self, request):
        user = request.user
        
        # Total stats
        total_completed = Progress.objects.filter(
            user=user,
            is_completed=True
        ).count()
        
        total_time = Progress.objects.filter(
            user=user
        ).aggregate(total=Sum('time_spent_seconds'))['total'] or 0
        
        # Playlist progress
        playlists = Playlist.objects.filter(creator=user)
        playlist_progress = []
        
        for playlist in playlists[:5]:  # Top 5 playlists
            total_items = playlist.items.count()
            completed = Progress.objects.filter(
                user=user,
                playlist_item__playlist=playlist,
                is_completed=True
            ).count()
            
            if total_items > 0:
                playlist_progress.append({
                    'id': playlist.id,
                    'title': playlist.title,
                    'progress': round(completed / total_items * 100, 1)
                })
        
        return Response({
            'total_items_completed': total_completed,
            'total_time_minutes': total_time // 60,
            'playlist_progress': playlist_progress
        })


class LearningStreaksView(APIView):
    """Get learning streak information."""
    
    def get(self, request):
        user = request.user
        today = timezone.now().date()
        
        # Get last 30 days of streaks
        streaks = LearningStreak.objects.filter(
            user=user,
            date__gte=today - timedelta(days=30)
        ).order_by('-date')
        
        # Calculate current streak
        current_streak = 0
        check_date = today
        
        for streak in streaks:
            if streak.date == check_date and streak.minutes_learned > 0:
                current_streak += 1
                check_date -= timedelta(days=1)
            else:
                break
        
        # Calculate longest streak
        all_streaks = LearningStreak.objects.filter(
            user=user,
            minutes_learned__gt=0
        ).order_by('date')
        
        longest_streak = 0
        temp_streak = 0
        prev_date = None
        
        for streak in all_streaks:
            if prev_date is None or streak.date == prev_date + timedelta(days=1):
                temp_streak += 1
            else:
                longest_streak = max(longest_streak, temp_streak)
                temp_streak = 1
            prev_date = streak.date
        
        longest_streak = max(longest_streak, temp_streak)
        
        return Response({
            'current_streak': current_streak,
            'longest_streak': longest_streak,
            'recent_activity': LearningStreakSerializer(streaks, many=True).data
        })


class WeeklyInsightsView(APIView):
    """Get weekly learning insights."""
    
    def get(self, request):
        user = request.user
        today = timezone.now().date()
        week_start = today - timedelta(days=7)
        
        weekly_streaks = LearningStreak.objects.filter(
            user=user,
            date__gte=week_start
        )
        
        total_minutes = weekly_streaks.aggregate(
            total=Sum('minutes_learned')
        )['total'] or 0
        
        items_completed = weekly_streaks.aggregate(
            total=Sum('items_completed')
        )['total'] or 0
        
        daily_breakdown = []
        for i in range(7):
            date = week_start + timedelta(days=i)
            try:
                streak = weekly_streaks.get(date=date)
                daily_breakdown.append({
                    'date': date.isoformat(),
                    'minutes': streak.minutes_learned
                })
            except LearningStreak.DoesNotExist:
                daily_breakdown.append({
                    'date': date.isoformat(),
                    'minutes': 0
                })
        
        return Response({
            'total_minutes': total_minutes,
            'items_completed': items_completed,
            'daily_breakdown': daily_breakdown
        })
