from django.urls import path
from .views import SignupView
from .views import LoginView
from .views import discord_authorize
from .views import oauth2_discord
from .views import intra_authorize
from .views import oauth2_intra
from .views import google_authorize
from .views import oauth2_google
from .views import oauth2_set_username
from .views import SendFriendRequestView
from .views import AcceptFriendRequestView
from .views import RejectFriendRequestView
from .views import PendingFriendRequestsView

urlpatterns = [
    path('auth/signup/', SignupView.as_view()),
    path('auth/login/', LoginView.as_view()),
    path('oauth2/set_username/', oauth2_set_username),
    path('oauth2/discord/authorize/', discord_authorize),
    path('oauth2/discord/', oauth2_discord),
    path('oauth2/intra/authorize/', intra_authorize),
    path('oauth2/intra/', oauth2_intra),
    path('oauth2/google/authorize/', google_authorize),
    path('oauth2/google/', oauth2_google),

    path('friend-request/send/<int:profile_id>/', SendFriendRequestView.as_view(), name='send-friend-request'),
    path('friend-request/accept/<int:request_id>/', AcceptFriendRequestView.as_view(), name='accept-friend-request'),
    path('friend-request/reject/<int:request_id>/', RejectFriendRequestView.as_view(), name='reject-friend-request'),
    path('friend-requests/pending/', PendingFriendRequestsView.as_view(), name='pending-friend-requests'),
    # path('profiles/', ProfileModelViewSet.as_view({'get': 'list'})),
]
