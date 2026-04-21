from rest_framework.views import APIView
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from django.contrib.auth import authenticate, login

from accounts.models import User, PasswordReset
from accounts.serializers import LoginSerializer, ResetPasswordSerializer
from accounts.utils import get_token_for_user, send_reset_password_email


class ConfirmLoginView(APIView):
    permission_calsses = [IsAuthenticated]

    def get(self, request):
        return Response({'message': 'User is authenticated'}, status=status.HTTP_200_OK)


class LoginView(CreateAPIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
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
            else:
                return Response({'error': 'Getting tokens for user failed'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


class RequestResetPasswordView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        if 'username' not in request.data:
            return Response({'error': 'Invalid data, username required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(username=request.data['username'])
            if not user.has_usable_password():
                return Response({'error': f'Cannot reset password, you can log in using your {user.oauth2_provider}'}, status=status.HTTP_400_BAD_REQUEST)
            if not user.is_active:
                return Response({'error': 'User is not active'}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        try:
            token = PasswordReset.objects.get(user=user)
            token.delete()
        except PasswordReset.DoesNotExist:
            pass
        send_reset_password_email(user)
        return Response({'message': 'A Reset password request sent to your email!'}, status=status.HTTP_200_OK)

class ResetPasswordView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        if 'token' not in request.data:
            return Response({'error': 'Token is required!'}, status=status.HTTP_400_BAD_REQUEST)
        if 'new_password' not in request.data or 'confirm_password' not in request.data:
            return Response({'error': 'Invalid data, Password and Password-confirmation are required!'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            token = PasswordReset.objects.get(token=serializer.validated_data['token'])
            user = token.user
            serializer.update(user, serializer.validated_data)
            token.delete()
            return Response({'message': 'Password reseted succeffuly'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f'error reseting password, details: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
