from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Comment, Discussion, DiscussionReply
from .serializers import (
    CommentSerializer, CommentCreateSerializer,
    DiscussionSerializer, DiscussionCreateSerializer,
    DiscussionReplySerializer
)


class CommentListCreateView(generics.ListCreateAPIView):
    """
    List comments for a playlist item or create new comment.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CommentCreateSerializer
        return CommentSerializer
    
    def get_queryset(self):
        item_id = self.request.query_params.get('item_id')
        if item_id:
            return Comment.objects.filter(
                playlist_item_id=item_id, 
                parent=None  # Only top-level comments
            ).select_related('user')
        return Comment.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a comment.
    Only the comment author can modify.
    """
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Comment.objects.filter(user=self.request.user)


class ItemCommentsView(generics.ListAPIView):
    """
    Get all comments for a specific playlist item.
    """
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        item_id = self.kwargs.get('item_id')
        return Comment.objects.filter(
            playlist_item_id=item_id,
            parent=None
        ).select_related('user').prefetch_related('replies__user')


class DiscussionListCreateView(generics.ListCreateAPIView):
    """
    List discussions for a playlist or create new discussion.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return DiscussionCreateSerializer
        return DiscussionSerializer
    
    def get_queryset(self):
        playlist_id = self.request.query_params.get('playlist_id')
        if playlist_id:
            return Discussion.objects.filter(
                playlist_id=playlist_id
            ).select_related('author').prefetch_related('replies__author')
        return Discussion.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class DiscussionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a discussion.
    """
    serializer_class = DiscussionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Discussion.objects.all()


class DiscussionReplyView(APIView):
    """
    Add a reply to a discussion.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, discussion_id):
        try:
            discussion = Discussion.objects.get(id=discussion_id)
        except Discussion.DoesNotExist:
            return Response(
                {'error': 'Discussion not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        content = request.data.get('content')
        if not content:
            return Response(
                {'error': 'Content is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        reply = DiscussionReply.objects.create(
            discussion=discussion,
            author=request.user,
            content=content
        )
        
        serializer = DiscussionReplySerializer(reply)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class PlaylistDiscussionsView(generics.ListAPIView):
    """
    Get all discussions for a specific playlist.
    """
    serializer_class = DiscussionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        playlist_id = self.kwargs.get('playlist_id')
        return Discussion.objects.filter(
            playlist_id=playlist_id
        ).select_related('author').prefetch_related('replies__author')
