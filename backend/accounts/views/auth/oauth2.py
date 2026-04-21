from django.shortcuts import redirect
from django.urls import reverse
from django.contrib.auth import authenticate
from urllib.parse import quote

from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.contrib.auth import login

from accounts.serializers import Oauth2Serializer
from accounts.models import User, EmailVerification
from accounts.utils import get_token_for_user
from accounts.utils import exchange_code, get_oauth2_user
from accounts import conf
from accounts.utils import send_oauth2_welcome



def oauth2_authorize(request, choice):
    if request.method == 'GET':
        if choice == 'intra':
            return redirect(conf.INTRA_AUTHORIZATION_URL)
        if choice == 'discord':
            return redirect(conf.DISCORD_AUTHORIZATION_URL)
        if choice == 'google':
            return redirect(conf.GOOGLE_AUTHORIZATION_URL)


@api_view()
@authentication_classes([])
@permission_classes([AllowAny])
def oauth2_authentication(request, choice):

    code = request.GET.get('code')
    if code is None:
        return redirect(f"{conf.API_CLIENT_OAUTH2_REDIRECT_URL}?status=failed&error={quote(f'Failed to get the code from {choice}, (go to authorize page)')}")
        # return redirect(reverse('oauth2_authorize', kwargs={'choice': choice}))
    token = exchange_code(code, choice)
    if token is None:
        return redirect(f"{conf.API_CLIENT_OAUTH2_REDIRECT_URL}?status=failed&error={quote(f'Failed to get the token from {choice}')}")
    user_data = get_oauth2_user(token, choice)
    if user_data is None:
        return redirect(f"{conf.API_CLIENT_OAUTH2_REDIRECT_URL}?status=failed&error={quote(f'Failed to get user {choice} resources!')}")
    try:
        # check_user = User.objects.get(email=user_data['email'])
        check_user = User.objects.get(oauth2_id=user_data['id'], oauth2_provider=choice)
        if not check_user.is_active:
            try:
                email_verf = EmailVerification.objects.get(user=check_user)
                email_verf.delete()
                check_user.is_active = True
                check_user.save()
            except EmailVerification.DoesNotExist:
                pass
        if check_user.is2fa_active:
            return redirect(f"{conf.API_CLIENT_OAUTH2_REDIRECT_URL}?status=2fa_required&username={check_user.username}&message={quote('2FA is required. Please enter your OTP code.')}")
    except User.DoesNotExist:
        check_user = None
    except Exception as e:
        return redirect(f"{conf.API_CLIENT_OAUTH2_REDIRECT_URL}?status=failed&error={quote(f'error oauth2 details: {str(e)}')}")
    if check_user is None:
        try:
            if User.objects.filter(email=user_data['email']).exists():
                # request.session['user_data'] = user_data
                return redirect(f"{conf.API_CLIENT_OAUTH2_REDIRECT_URL}?status=email_exists&message={quote(f'Email already exists, you can login with your account!')}")
            if User.objects.filter(username=user_data['username']).exists():
                # request.session['user_data'] = {'id': user_data['id'], 'email': user_data['email'], 'avatar_link': user_data['avatar_link']}
                request.session['user_data'] = user_data
                return redirect(f"{conf.API_CLIENT_OAUTH2_REDIRECT_URL}?status=set_username&message={quote(f'Username already exists, Please choose a username to continue!')}")
            serializer = Oauth2Serializer(data=user_data)
            if not serializer.is_valid():
                if 'username' in serializer.errors:
                    # request.session['user_data'] = {'id': user_data['id'], 'email': user_data['email'], 'avatar_link': user_data['avatar_link']}
                    request.session['user_data'] = user_data
                    return redirect(f"{conf.API_CLIENT_OAUTH2_REDIRECT_URL}?status=set_username&message={quote(f'Username not valid, Please choose a username to continue!')}")
                return redirect(f"{conf.API_CLIENT_OAUTH2_REDIRECT_URL}?status=failed&error={quote(f'A data in your {choice} user not compatible with our criteria!')}")
            check_user = serializer.save()
            send_oauth2_welcome(check_user, choice)
        except Exception as e:
            return redirect(f"{conf.API_CLIENT_OAUTH2_REDIRECT_URL}?status=failed&error={quote(f'Failed to create user, try again!')}")
        # try:
        #     check_user = User.objects.get(serializer.validated_data['username'])
        # except User.DoesNotExist:
        #     return redirect(f"{conf.API_CLIENT_OAUTH2_REDIRECT_URL}?status=failed&error={quote('Failed to create a new user!')}")
        # check_user = authenticate(email=serializer.validated_data['email'])
        # if check_user is None:
        #     return redirect(f"{conf.API_CLIENT_OAUTH2_REDIRECT_URL}?status=failed&error={quote('Authenticate the user failed')}")
    token = get_token_for_user(check_user)
    if token is None:
        return redirect(f"{conf.API_CLIENT_OAUTH2_REDIRECT_URL}?status=failed&error={quote('Getting token for user failed')}")
    response = redirect(
        f"{conf.API_CLIENT_OAUTH2_REDIRECT_URL}?status=success&message={quote('Login success, welcome player!')}")
    response.set_cookie(
        key='access_token',
        value=token['access'],
        httponly=True,
        secure=True,
        samesite='Lax'
    )
    response.set_cookie(
        key='refresh_token',
        value=token['refresh'],
        httponly=True,
        secure=True,
        samesite='Lax'
    )
    login(request, check_user)
    return response


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def oauth2_set_username(request):

    user_data = request.session.get('user_data')
    if user_data is None:
        return Response(data={'error': 'Bad request, user data not found'}, status=status.HTTP_400_BAD_REQUEST)
    if 'username' not in request.data:
        return Response(data={'error': "Missing 'username' data!"}, status=status.HTTP_400_BAD_REQUEST)
    user_data['username'] = request.data.get('username')
    serializer = Oauth2Serializer(data = user_data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    del request.session['user_data']
    send_oauth2_welcome(user, serializer.validated_data['provider'])
    # del request.session['user_data']
    # user = authenticate(email=serializer.validated_data['email'])
    # if user is None:
        # return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    token = get_token_for_user(user)
    response = Response(data={'message': 'login success, Welcome player'}, status=status.HTTP_200_OK)
    response.set_cookie(
        key = 'access_token',
        value = token['access'],
        httponly = True,
        secure = True,
        samesite = 'Lax'
    )
    response.set_cookie(
        key = 'refresh_token',
        value = token['refresh'],
        httponly = True,
        secure = True,
        samesite = 'Lax'
    )
    login(request, user)
    return response