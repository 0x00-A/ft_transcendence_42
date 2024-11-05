from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.request import Request
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken


class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request: Request):
        # Check if token exists in cookies
        access_token = request.COOKIES.get('access_token')
        refresh_token = request.COOKIES.get('refresh_token')
        if access_token is None or refresh_token is None:
            print('----access_token or refresh token not in the request-----')
            return None
        try:
            validated_token = self.get_validated_token(access_token)
            return self.get_user(validated_token), validated_token
        except InvalidToken as e:
            try:
                new_access_token = RefreshToken(refresh_token).access_token
                validated_token = self.get_validated_token(str(new_access_token))
                request.session['new_access_token'] = str(new_access_token)
                print('---request.new_access_token---')
                return self.get_user(validated_token), validated_token
            except TokenError:
                print('----error refreshing token-----')
                return None
        except AccessToken as e:
            print('--------', e, '---------')