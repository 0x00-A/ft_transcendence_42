from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated

from django.contrib.auth import authenticate
import requests

from accounts.serializers.oauth2Serializer import Oauth2Serializer
from accounts.utils import get_token_for_user
from accounts import conf


class ConfirmOauth2Login(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # print('api ==> oauth2_confirm_login: User is authenticated')
        return Response({"message": "User is authenticated"}, status=status.HTTP_200_OK)



def exchange_code(code:str, choice:str):
    data = {
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': conf.OAUTH2_REDIRECT_URI + choice + '/',
    }
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    token_url = {
        'intra': conf.INTRA_TOKEN_URL,
        'discord': conf.DISCORD_TOKEN_URL,
        'google': conf.GOOGLE_TOKEN_URL,
    }.get(choice)
    client_id = {
        'intra': conf.INTRA_CLIENT_ID,
        'discord': conf.DISCORD_CLIENT_ID,
        'google': conf.GOOGLE_CLIENT_ID,
    }.get(choice)
    client_secret = {
        'intra': conf.INTRA_CLIENT_SECRET,
        'discord': conf.DISCORD_CLIENT_SECRET,
        'google': conf.GOOGLE_CLIENT_SECRET,
    }.get(choice)
    try:
        res = requests.post(url=token_url, data=data, headers=headers,
                            auth=(client_id, client_secret))
        res.raise_for_status()
        return res.json()
    except requests.exceptions.HTTPError as err:
        # print('-->', err)
        return None
    except Exception as err:
        # print('-->', err)
        return None


def get_oauth2_user(token, choice):
    user_url = {
        'intra': conf.INTRA_USER_URL,
        'discord': conf.DISCORD_USER_URL,
        'google': conf.GOOGLE_USER_URL,
    }.get(choice)
    access_token = token['access_token']
    try:
        res = requests.get(user_url, headers={
            'Authorization': "Bearer %s" % access_token
        })
        res.raise_for_status()
        data = res.json()
        if choice == 'intra':
            user_data = {
                'id' : data['id'],
                'provider': choice,
                'username': data['login'],
                'email': data['email'],
                'avatar_link': data['image']['link']
            }
        if choice == 'discord':
            user_data = {
                'id': data['id'],
                'provider': choice,
                'username': data['username'],
                'email': data['email'],
                'avatar_link': f"https://cdn.discordapp.com/avatars/{data['id']}/{data['avatar']}.png"
            }
        if choice == 'google':
            user_data = {
                'id': data['id'],
                'provider': choice,
                'username': data['given_name'].replace(" ", "_"),
                'email': data['email'],
                'avatar_link': data['picture']
            }
        return user_data
    except requests.exceptions.HTTPError as e:
        # print('-->', e)
        return None
    except Exception as e:
        # print('-->', e)
        return None

# def get_oauth2_user(token, user_url):
#     access_token = token['access_token']
#     try:
#         res = requests.get(user_url, headers={
#             'Authorization': "Bearer %s" % access_token
#         })
#         res.raise_for_status()
#     except requests.exceptions.HTTPError as e:
#         print('-->', e)
#         return None
#     except Exception as e:
#         print('-->', e)
#         return None
#     return res.json()