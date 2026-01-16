from django.urls import path
from .views import NoteListCreateView, NoteDetailView, ItemNotesView

urlpatterns = [
    path('', NoteListCreateView.as_view(), name='note_list_create'),
    path('<int:pk>/', NoteDetailView.as_view(), name='note_detail'),
    path('item/<int:item_id>/', ItemNotesView.as_view(), name='item_notes'),
]
