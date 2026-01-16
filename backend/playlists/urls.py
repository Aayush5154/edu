from django.urls import path
from .views import (
    PlaylistListCreateView,
    PlaylistDetailView,
    PlaylistItemCreateView,
    PlaylistItemDetailView,
    ReorderItemsView,
    DiscoverPlaylistsView,
    SharePlaylistView,
)

urlpatterns = [
    path('', PlaylistListCreateView.as_view(), name='playlist_list_create'),
    path('<int:pk>/', PlaylistDetailView.as_view(), name='playlist_detail'),
    path('<int:playlist_id>/items/', PlaylistItemCreateView.as_view(), name='add_item'),
    path('items/<int:pk>/', PlaylistItemDetailView.as_view(), name='item_detail'),
    path('<int:playlist_id>/reorder/', ReorderItemsView.as_view(), name='reorder_items'),
    path('discover/', DiscoverPlaylistsView.as_view(), name='discover'),
    path('<int:playlist_id>/share/', SharePlaylistView.as_view(), name='share_playlist'),
]
