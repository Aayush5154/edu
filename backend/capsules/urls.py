from django.urls import path
from . import views

urlpatterns = [
    path('', views.CapsuleListCreateView.as_view(), name='capsule-list-create'),
    path('<int:pk>/', views.CapsuleDetailView.as_view(), name='capsule-detail'),
    path('item/<int:item_id>/', views.ItemCapsulesView.as_view(), name='item-capsules'),
    path('user/', views.UserCapsulesView.as_view(), name='user-capsules'),
    path('public/', views.PublicCapsulesView.as_view(), name='public-capsules'),
    path('<int:capsule_id>/like/', views.LikeCapsuleView.as_view(), name='capsule-like'),
]
