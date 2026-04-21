from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.request import Request
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError, AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken

from django.contrib.auth.models import AnonymousUser


class CookieJWTAuthentication(JWTAuthentication):

    def authenticate(self, request: Request):
        # print('------------->reuest.headers: ', request.headers)
        access_token = request.COOKIES.get('access_token')
        refresh_token = request.COOKIES.get('refresh_token')
        if access_token is None or refresh_token is None:
            return None
        try:
            validated_token = self.get_validated_token(access_token)
            return self.get_user(validated_token), validated_token
        except (InvalidToken, TokenError, AuthenticationFailed) as e:
            try:
                new_access_token = RefreshToken(refresh_token).access_token
                validated_token = self.get_validated_token(
                    str(new_access_token))
                request.session['new_access_token'] = str(new_access_token)
                return self.get_user(validated_token), validated_token
            except (InvalidToken, TokenError):
                return AnonymousUser(), None
