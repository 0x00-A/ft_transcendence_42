from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, authentication_classes

from django.shortcuts import redirect
from urllib.parse import quote
from uuid import UUID
from app.settings import SERVER_URL

from accounts.serializers import SignupSerializer
from accounts.models import EmailVerification
from accounts.utils import send_verification_email



@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def verify_email(request):
    if 'token' not in request.data:
        return Response({'error': 'Token is required!'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        UUID(request.data.get('token'), version=4)
    except ValueError:
        return Response({'error': 'Invalid token!'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        verify = EmailVerification.objects.get(token=request.data.get('token'))
    except EmailVerification.DoesNotExist:
        return Response({'error': 'Invalid token, your account is not verified!'}, status=status.HTTP_400_BAD_REQUEST)
    user = verify.user
    user.is_active = True
    user.save()
    verify.delete()
    return Response({'message': 'Your account has been verified, you can login now!'}, status=status.HTTP_200_OK)


class SignupView(CreateAPIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    serializer_class = SignupSerializer

    def post(self, request):
        try:
            serializer = self.get_serializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            try:
                user = serializer.instance
                try:
                    EmailVerification.objects.get(user=user).delete()
                except EmailVerification.DoesNotExist:
                    pass
                send_verification_email(user)
                message = 'Your account has been created, an activation link has been sent to your email.'
                return Response(data={'message': message}, status=status.HTTP_201_CREATED, headers=headers)
            except Exception as e:
                user.delete()
                return Response(data={'error': f"sending email verification, detail: {str(e)}"}, status=status.HTTP_503_SERVICE_UNAVAILABLE, headers=headers)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
