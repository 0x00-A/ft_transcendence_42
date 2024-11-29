from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from ..models import User
from ..serializers import UserLoginSerializer
from ..serializers import SetPasswordSerializer
import random
from django.utils import timezone
from datetime import timedelta
from django.core.mail import send_mail
from rest_framework.views import APIView
import pyotp
import qrcode


def generate_otp():
    return random.randint(100000, 999999)


def send_otp_email(user):
    send_mail(
        'Your 2FA Code',
        f'Your one-time code is: {user.otp_secret}',
        'mahdimardi18@gmail.com',
        [user.email],
        fail_silently=False,
    )

# class VerifyOTPView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         user = request.user
#         if user:

#         pass
class SetPasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if 'password' not in request.data:
            return Response({'error': 'Password is required'}, status=status.HTTP_400_BAD_REQUEST)
        if 'password2' not in request.data:
            return Response({'error': 'Password confirmation is required'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = SetPasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'message': 'Password updated'}, status=status.HTTP_200_OK)


class LoginVerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        if 'otp' not in request.data:
            return Response({'error': 'OTP is required'}, status=status.HTTP_400_BAD_REQUEST)
        if 'username' not in request.data:
            return Response({'error': 'Username is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(username=request.data['username'])
            if not user.is2fa_active:
                return Response({'error': '2FA is not enabled by user'}, status=status.HTTP_400_BAD_REQUEST)
            if user.otp_secret:
                totp = pyotp.TOTP(user.otp_secret)
                if totp.verify(request.data['otp']):
                    token = get_token_for_user(user)
                    if token:
                        response = Response(data={'message': 'login success'}, status=status.HTTP_200_OK)
                        response.set_cookie(
                            key = 'access_token',
                            value = token['access'],
                            httponly = True,
                            secure = False,
                            samesite = 'Strict'
                        )
                        response.set_cookie(
                            key = 'refresh_token',
                            value = token['refresh'],
                            httponly = True,
                            secure = False,
                            samesite = 'Strict'
                        )
                        print('apiBackend ==> login verify otp status: login success')
                        return response
                    return Response({'error': 'Getting tokens for user failed'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
                return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)
            return Response({'error': 'OTP secret not found'}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


class LoginView(CreateAPIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    serializer_class = UserLoginSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print('apiBackend ==> login status: Invalid data', serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.is_valid(raise_exception=True)
        user = authenticate(
            username = serializer.validated_data['username'],
            password = serializer.validated_data['password']
            )
        if user is not None:
            if user.is2fa_active:
                return Response({"status": "2FA_REQUIRED",
                                 "message": "2FA is required. Please enter your OTP code.",
                                 "username": user.username}, status=status.HTTP_200_OK)
            token = get_token_for_user(user)
            if token:
                response = Response(data={'message': 'login success'}, status=status.HTTP_200_OK)
                response.set_cookie(
                    key = 'access_token',
                    value = token['access'],
                    httponly = True,
                    secure = False,
                    samesite = 'Strict'
                )
                response.set_cookie(
                    key = 'refresh_token',
                    value = token['refresh'],
                    httponly = True,
                    secure = False,
                    samesite = 'Strict'
                )
                print('apiBackend ==> login status: login success')
                return response
            else:
                print('apiBackend ==> login status: Getting tokens for user failed')
                return Response({'error': 'Getting tokens for user failed'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        print('apiBackend ==> login status: Invalid credentials')
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)




        # except TokenError as e:
        #     print('--------error', e, '---------')

    #     print('------------------------')
    #     token = AccessToken(access_token)
    #     print('------------------------')
    #     expiration = token['exp']
    #     now = datetime.now(timezone.utc)
    #     if now > datetime.fromtimestamp(expiration, tz=timezone.utc):
    #         return False

    #     print('----------', expiration, '-----------')
    #     print('----------', access_token, '-------------')
    # # Try to authenticate using the access token from the cookie
    #     validated_token = self.get_validated_token(access_token)
    #     print('----------', validated_token, '-------------')

        # return self.get_user(validated_token), validated_token

# class RefreshToken(CreateAPIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request, *args, **kwargs):
#         refresh_token = request.COOKIES.get('refresh_token')
#         if refresh_token:
#             try:
#                 refresh = RefreshToken(refresh_token)
#                 if refresh:
#                     response = Response(data={''})
#                     access_token = refresh.access_token
#                 return Response(data={'access_token': str(access_token)}, status=status.HTTP_200_OK)
#             except Exception as err:
#                 return Response({'error': 'Invalid or expired refresh token', 'detail': err}, status=status.HTTP_401_UNAUTHORIZED)
#         return Response({'error': 'Refresh token missing'}, status=status.HTTP_400_BAD_REQUEST)


def get_token_for_user(user:User):

    refresh = RefreshToken.for_user(user)
    if refresh:
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }
    return None

# @api_view(['POST'])
# @permission_classes([AllowAny])
# def login_view(request):
#     if request.method == 'POST':
#         serializer = UserLoginSerializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         user = authenticate(
#             username = serializer.validated_data['username'],
#             password = serializer.validated_data['password'])
#         if user is not None:
#             return Response(data=get_token_for_user(user),
#                                 status=status.HTTP_200_OK)
#         else:
#             return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)