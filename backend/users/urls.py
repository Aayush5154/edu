from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView,
    LoginView,
    CurrentUserView,
    BecomeCreatorView,
    CreatorProfileView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('become-creator/', BecomeCreatorView.as_view(), name='become_creator'),
    path('creators/<int:pk>/', CreatorProfileView.as_view(), name='creator_profile'),
]
