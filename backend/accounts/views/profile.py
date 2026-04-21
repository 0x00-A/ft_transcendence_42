from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status

from django.shortcuts import get_object_or_404
from django.db.models import Q

from accounts.models import User
from accounts.serializers import UserSerializer
from relationships.models import FriendRequest



def get_friend_status(current_user, other_user):
    """Helper function to determine the friend request status between two users."""
    friend_request = FriendRequest.objects.filter(
        Q(sender=current_user, receiver=other_user) | Q(
            sender=other_user, receiver=current_user)
    ).first()

    if friend_request:
        if friend_request.status == 'accepted':
            return 'accepted'
        elif friend_request.receiver == current_user:
            return friend_request.status
        else:
            return 'cancel'
    return 'Add Friend'


class ProfileApiView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get(self, request):
        try:
            user = request.user
            serializer = UserSerializer(user, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response(
                {'error': 'User profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Internal server error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AllUsersView(APIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            users = User.objects.exclude(
                Q(blocked_users__blocked=request.user) | Q(
                    blockers__blocker=request.user)
            ).exclude(username=request.user.username)

            user_data_with_status = []
            for user in users:
                user_data = UserSerializer(user).data
                user_data['friend_request_status'] = get_friend_status(
                    request.user, user)
                user_data_with_status.append(user_data)

            return Response(user_data_with_status, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response(
                {'error': 'User profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Internal server error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserDetailView(APIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            user_data = UserSerializer(user).data
            # # Optionally, add friend request status
            # user_data['friend_request_status'] = get_friend_status(
            #     request.user, user)
            return Response(user_data, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Internal server error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class OnlineUsersView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            online_count = User.objects.filter(profile__is_online=True).count()
            return Response(
                {'online_players': online_count},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'error': f'Internal server error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class GetLanguageView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            preferred_language = request.user.profile.preferred_language
            return Response({'language': preferred_language}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': f'Internal server error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class SetLanguageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, lang):
        try:
            profile = request.user.profile
            profile.preferred_language = lang
            profile.save()

            return Response(
                {'message': 'Language updated successfully.', 'language': profile.preferred_language},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'error': f'Internal server error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )