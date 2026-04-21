from .auth.signup import SignupView
from .auth.signup import verify_email

from .auth.login import LoginView
from .auth.login import ConfirmLoginView
from .auth.login import RequestResetPasswordView
from .auth.login import ResetPasswordView

from .auth.login2FA import LoginVerifyOTPView

from .auth.oauth2 import oauth2_authorize
from .auth.oauth2 import oauth2_authentication
from .auth.oauth2 import oauth2_set_username

from .auth.logout import LogoutView

from .accounts import MyProfileView
from .accounts import UserProfileView
from .accounts import GetProfileAchievementsView
from .accounts import DeleteAccountView

from .update_account import EditProfileView
from .update_account import UpdateEmailRequest
from .update_account import UpdateEmailView
from .update_account import SetPasswordView

from .update_account import UpdatePasswordView
from .account_security import Enable2faRequest
from .account_security import Enable2faView
from .account_security import Disable2FAView

from .NotificationViewSet import NotificationViewSet

from .profile import ProfileApiView
from .profile import AllUsersView
from .profile import UserDetailView
from .profile import OnlineUsersView
from .profile import SetLanguageView
from .profile import GetLanguageView


from .accounts import LeaderBoardView
from .accounts import DashboardLeaderBoardView
