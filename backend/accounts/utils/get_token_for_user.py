from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import User


def get_token_for_user(user:User):

    refresh = RefreshToken.for_user(user)
    if refresh:
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }
    return None