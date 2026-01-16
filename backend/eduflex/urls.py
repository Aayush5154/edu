"""
URL configuration for eduflex project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/playlists/', include('playlists.urls')),
    path('api/progress/', include('progress.urls')),
    path('api/notes/', include('notes.urls')),
    path('api/comments/', include('comments.urls')),
    path('api/capsules/', include('capsules.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
