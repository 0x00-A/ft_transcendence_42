from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from datetime import datetime
import pyotp
import qrcode
import os
import base64
from io import BytesIO

from app.settings import MEDIA_URL
from app.settings import SERVER_URL, MEDIA_ROOT


class Enable2faRequest(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        if user.is2fa_active:
            return Response(
                {'error': '2FA is already enabled for this account'},
                status=status.HTTP_400_BAD_REQUEST
            )
        user.otp_secret = pyotp.random_base32()
        user.save()
        privisioning_uri = pyotp.TOTP(user.otp_secret).provisioning_uri(
            name=user.username,
            issuer_name='ft_transcendence_2FA'
        )
        qr = qrcode.make(privisioning_uri)
        buffer = BytesIO()
        qr.save(buffer, format='PNG')
        encoded = base64.b64encode(buffer.getvalue()).decode()
        # qr_code = f"{MEDIA_URL}qrcodes/{user.username}_{datetime.now()}.png"
        # qr.save(f"static{qr_code}")
        return Response({'qr_code': f"data:image/png;base64,{encoded}",
                         'content_type': 'image/png'}, status=status.HTTP_200_OK)
        # return Response({'qr_code': f"{SERVER_URL}{qr_code}"}, status=status.HTTP_200_OK)


class Enable2faView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if 'otp' not in request.data:
            return Response(
                {'error': 'Please provide an OTP'},
                status=status.HTTP_400_BAD_REQUEST
            )
        user = request.user
        if user.is2fa_active:
            return Response(
                {'error': '2FA is already enabled for this account'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if not user.otp_secret:
            return Response(
                {'error': 'Please generate a QR code first'},
                status=status.HTTP_400_BAD_REQUEST
            )
        totp = pyotp.TOTP(user.otp_secret)
        if totp.verify(request.data['otp']):
            user = request.user
            user.is2fa_active = True
            user.save()
            # qrcode_path = f"{MEDIA_ROOT}/qrcodes/{user.username}_2fa.png"
            # if os.path.exists(qrcode_path):
            # os.remove(qrcode_path)
            return Response({'message': 'Two-factor authentication enabled'}, status=status.HTTP_200_OK)
        else:
            return Response(
                {'error': 'Invalid OTP'},
                status=status.HTTP_400_BAD_REQUEST
            )


class Disable2FAView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        if not user.is2fa_active:
            return Response(
                {'error': '2FA is already disabled for this account'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if 'password' not in request.data:
            return Response(
                {'error': 'Your password is required to disable 2FA'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if not user.check_password(request.data['password']):
            return Response(
                {'error': 'Password is incorrect'},
                status=status.HTTP_400_BAD_REQUEST
            )
        qrcode_path = f"{MEDIA_ROOT}/qrcodes/{user.username}_2fa.png"
        if os.path.exists(qrcode_path):
            os.remove(qrcode_path)
        user.otp_secret = None
        user.is2fa_active = False
        user.save()
        return Response({'message': 'Two-factor authentication disabled'}, status=status.HTTP_200_OK)
