from django.urls import path
from django.urls import re_path

from rest_framework.routers import DefaultRouter

from accounts import views

router = DefaultRouter()
router.register(r'notifications', views.NotificationViewSet, basename='notification')


urlpatterns = [

    path('auth/confirm_login/', views.ConfirmLoginView.as_view(), name='confirm_login'),

    path('auth/signup/', views.SignupView.as_view(), name='signup'),
    path('auth/email-verification/', views.verify_email, name='email_verification'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/login/otp-verification/', views.LoginVerifyOTPView.as_view(), name='otp_verification'),
    path('auth/reset-password-request/', views.RequestResetPasswordView.as_view(), name='reset_password_request'),
    path('auth/reset-password/', views.ResetPasswordView.as_view(), name='reset_password'),

    re_path(r'^auth/oauth2/(?P<choice>intra|discord|google)/$', views.oauth2_authentication, name='oauth2_authentication'),
    re_path(r'^auth/oauth2/authorize/(?P<choice>intra|discord|google)/$', views.oauth2_authorize, name='oauth2_authorize'),
    path('auth/oauth2/set-username/', views.oauth2_set_username, name='oauth2_set_username'),

    path('auth/logout/', views.LogoutView.as_view(), name='logout'),

    path('profile/', views.MyProfileView.as_view(), name='my_profile'),
    path('set-language/<str:lang>/', views.SetLanguageView.as_view(), name='set-language'),
    path('get-language/', views.GetLanguageView.as_view(), name='get-language'),
    path('profile/<str:username>/', views.UserProfileView.as_view(), name='user_profile'),

    path('edit/profile/', views.EditProfileView.as_view(), name='edit_profile'),
    path('edit/update-email-request/', views.UpdateEmailRequest.as_view(), name='update_email_request'),
    path('edit/update-email/', views.UpdateEmailView.as_view(), name='update_email'),
    path('edit/set-password/', views.SetPasswordView.as_view(), name='set_password'),

    path('security/update-password/', views.UpdatePasswordView.as_view(), name='update_password'),
    path('security/enable-2fa-request/', views.Enable2faRequest.as_view(), name='enable_2fa_request'),
    path('security/enable-2fa/', views.Enable2faView.as_view(), name='enable_2fa'),
    path('security/disable-2fa/', views.Disable2FAView.as_view(), name='disable_2fa'),

    path('users/', views.AllUsersView.as_view(), name='all_users'),
    path('users/<int:user_id>/', views.UserDetailView.as_view(), name='user_detail'),
    path('users/online/', views.OnlineUsersView.as_view(), name='online_users'),

    path('achievements/<str:username>/', views.GetProfileAchievementsView.as_view(), name='profile_achievements'),
    path('dashboard-leaderboard/', views.DashboardLeaderBoardView.as_view(), name='dashboard_leaderboard'),
    path('leaderboard/', views.LeaderBoardView.as_view(), name='leaderboard'),

    path ('delete-account/', views.DeleteAccountView.as_view(), name='delete_account'),
    #  path('profile/', views.ProfileApiView.as_view(), name='profile'),

#     path('security/set_password/', views.SetPasswordView.as_view()),
#     path('auth/confirm_login/', views.ConfirmOauth2Login.as_view()),
#     path('oauth2/verify_login/', views.ConfirmOauth2Login.as_view()),


    # path('oauth2/discord/authorize/', discord_authorize),

    # path('auth/refresh_token/', RefreshToken.as_view()),
    # path('oauth2/discord/', oauth2_discord),
    # path('oauth2/intra/authorize/', intra_authorize),
    # path('oauth2/intra/', oauth2_intra),
    # path('oauth2/google/authorize/', google_authorize),
    # path('oauth2/google/', oauth2_google),

    *router.urls,
]
