from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from uuid import UUID

from accounts.models import User, EmailVerification
from accounts.serializers import EditProfileSerializer, SetPasswordSerializer
from accounts.utils import send_update_email_email


class EditProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        serializer = EditProfileSerializer(user, context={'request': request}, data=request.data, partial=True)
        if request.FILES:
            serializer.files = request.FILES
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Changes apply to your profile successfuly'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UpdateEmailRequest(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        if 'email' not in request.data:
            return Response(
                {'error': 'Please provide email'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            User.objects.get(email=request.data['email'])
            return Response(
                {'error': 'Email is already taken'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except User.DoesNotExist:
            pass
        try:
            already = EmailVerification.objects.get(user=user)
            already.delete()
        except EmailVerification.DoesNotExist:
            pass
        try:
            send_update_email_email(user, request.data['email'])
        except Exception as e:
            return Response({'error': f'Something went wrong, please try again!, detalails: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': 'Verification email sent successfully'}, status=status.HTTP_200_OK)


class UpdateEmailView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        if 'token' not in request.data:
            return Response(
                {'error': 'Token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            UUID(request.data.get('token'), version=4)
        except ValueError:
            return Response({'error': 'Invalid token!'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            verify = EmailVerification.objects.get(token=request.data.get('token'))
            user = verify.user
            user.email = verify.new_email
            user.save()
            verify.delete()
            return Response({'message': 'Your email has been verified successfully'}, status=status.HTTP_200_OK)
        except EmailVerification.DoesNotExist:
            return Response({'error': 'Invalid token, your email is not verified!'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f'Something went wrong, please try again!, detalails: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)


class UpdatePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        if 'current_password' not in request.data or 'new_password' not in request.data or 'confirm_password' not in request.data:
            return Response(
                {'error': 'Please provide both current and new passwords'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if not user.check_password(request.data['current_password']):
            return Response(
                {'current_password': 'Current password is incorrect'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if request.data['new_password'] != request.data['confirm_password']:
            return Response(
                {'new_password': 'Passwords do not match'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            validate_password(request.data['new_password'], user)
            user.set_password(request.data['new_password'])
            user.save()
            return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)
        except ValidationError as exc:
            return Response({'new_password': exc.messages}, status=status.HTTP_400_BAD_REQUEST)


class SetPasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if 'password' not in request.data:
            return Response({'error': 'Password is required'}, status=status.HTTP_400_BAD_REQUEST)
        if 'password2' not in request.data:
            return Response({'error': 'Password confirmation is required'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = SetPasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.update(request.user, serializer.validated_data)
        return Response({'message': 'Password set successfully'}, status=status.HTTP_200_OK)