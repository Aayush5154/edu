from django.urls import path
from . import views

urlpatterns = [
    # Comments
    path('', views.CommentListCreateView.as_view(), name='comment-list-create'),
    path('<int:pk>/', views.CommentDetailView.as_view(), name='comment-detail'),
    path('item/<int:item_id>/', views.ItemCommentsView.as_view(), name='item-comments'),
    
    # Discussions
    path('discussions/', views.DiscussionListCreateView.as_view(), name='discussion-list-create'),
    path('discussions/<int:pk>/', views.DiscussionDetailView.as_view(), name='discussion-detail'),
    path('discussions/<int:discussion_id>/reply/', views.DiscussionReplyView.as_view(), name='discussion-reply'),
    path('discussions/playlist/<int:playlist_id>/', views.PlaylistDiscussionsView.as_view(), name='playlist-discussions'),
]
