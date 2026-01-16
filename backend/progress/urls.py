from django.urls import path
from .views import (
    UpdateProgressView,
    PlaylistProgressView,
    OverallStatsView,
    LearningStreaksView,
    WeeklyInsightsView,
)

urlpatterns = [
    path('', UpdateProgressView.as_view(), name='update_progress'),
    path('playlist/<int:playlist_id>/', PlaylistProgressView.as_view(), name='playlist_progress'),
    path('stats/', OverallStatsView.as_view(), name='overall_stats'),
    path('streaks/', LearningStreaksView.as_view(), name='streaks'),
    path('weekly/', WeeklyInsightsView.as_view(), name='weekly_insights'),
]
