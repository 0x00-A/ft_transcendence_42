from typing import Any
from django.contrib.auth.backends import BaseBackend
from django.contrib.auth import get_user_model
from django.contrib.auth.base_user import AbstractBaseUser
from django.http import HttpRequest

class Oauth2AuthBackend(BaseBackend):
    def authenticate(self, request: HttpRequest, email : str = None, **kwargs: Any):
        User = get_user_model()
        try:
            user = User.objects.get(email=email)
            if (not user.has_usable_password()) and user.is_oauth_user:
                return user
        except User.DoesNotExist:
            return None
        return user