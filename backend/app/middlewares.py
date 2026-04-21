from rest_framework_simplejwt.exceptions import InvalidToken, TokenError, AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser
from asgiref.sync import sync_to_async
from http.cookies import SimpleCookie


class JwtAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        # headers = dict(scope['headers'])

        # cookie = headers.get(b'cookie', b'').decode('utf-8')
        cookie = next((value.decode('utf-8')
                      for name, value in scope['headers'] if name == b'cookie'), None)
        cookies = SimpleCookie()
        cookies.load(cookie)
        access_token = cookies.get('access_token')
        refresh_token = cookies.get('refresh_token')
        access_token = access_token.value if access_token else None
        refresh_token = refresh_token.value if refresh_token else None
        if access_token and refresh_token:
            try:
                jwtAuth = JWTAuthentication()
                validated_token = jwtAuth.get_validated_token(
                    raw_token=access_token)
                user = await sync_to_async(jwtAuth.get_user)(validated_token)
                scope['user'] = user
            except (InvalidToken, TokenError, AuthenticationFailed):
                scope['user'] = AnonymousUser()
        else:
            scope['user'] = AnonymousUser()
        return await super().__call__(scope, receive, send)
