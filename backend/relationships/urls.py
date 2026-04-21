from django.urls import path
from django.urls import re_path
from rest_framework.routers import DefaultRouter

from relationships import views


urlpatterns = [

     path('dashboard-friends/<str:username>/', views.DashboardFriendsView.as_view(), name='dashboard-friends'),
     path('profile-online-friends/', views.GetProfileOnlineFriends.as_view(), name='profile-online-friends'),
     path('profile-offline-friends/', views.GetProfileOfflineFriends.as_view(), name='profile-offline-friends'),


    path('friends/', views.UserFriendsView.as_view(), name='current-user-friends'),
    path('friends/<str:username>/', views.UserFriendsView.as_view(), name='specific-user-friends'),
    path('friends/mutual/<str:username>/', views.MutualFriendsView.as_view(), name='mutual-friends'),
    path('online-friends/', views.OnlineFriendsView.as_view(), name='online-friends'),

    path('block/<str:username>/', views.BlockUserView.as_view(), name='block_user'),
    path('unblock/<str:username>/', views.UnblockUserView.as_view(), name='unblock_user'),
    path('blocked/', views.BlockedUsersView.as_view(), name='blocked_users'),
    path('suggested-connections/', views.SuggestedConnectionsView.as_view(), name='suggested-connections'),
    path('friend-request/send/<str:username>/',
         views.SendFriendRequestView.as_view(), name='send-friend-request'),
    path('friend-request/accept/<str:username>/',
         views.AcceptFriendRequestView.as_view(), name='accept-friend-request'),
    path('friend-request/reject/<str:username>/',
         views.RejectFriendRequestView.as_view(), name='reject-friend-request'),
    path('friend-requests/pending/', views.PendingFriendRequestsView.as_view(),
         name='pending-friend-requests'),
    path('friend-requests/sent/', views.SentFriendRequestsView.as_view(),
         name='friend-request-list'),
    path('friend-request/cancel/<str:username>/',
         views.CancelFriendRequestView.as_view(), name='cancel-friend-request'),
     path('friend/remove/<str:username>/', views.RemoveFriendView.as_view(), name='remove-friend'),

]