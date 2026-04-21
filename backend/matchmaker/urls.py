
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import TournamentViewSet, GameViewSet, CurrentUserViewSet, GetPlayedGamesView, LastGamesView

router = DefaultRouter()
router.register(r'tournaments', TournamentViewSet, basename='tournament')
router.register(r'games', GameViewSet, basename='game')
router.register(r'current-user', CurrentUserViewSet, basename='current-user')


urlpatterns = [
    path('', include(router.urls)),
    path('played-games/', GetPlayedGamesView.as_view(), name='played-games'),
    path('last-games/<str:username>/', LastGamesView.as_view(), name='last-games'),
]
