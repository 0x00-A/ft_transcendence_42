from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from accounts.models import User, UserAchievement, Profile
from accounts.serializers import UserProfileSerializer, LeaderBoardSerializer
from accounts.serializers import OtherUserSerializer, UserAchievementsSerializer


class MyProfileView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get(self, request):
        try:
            user = request.user
            serializer = UserProfileSerializer(user, context={'request': request})
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


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username):
        if username == request.user.username:
            return Response({'status': 'me'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(username=username)
            serializer = OtherUserSerializer(user, context={'request': request})
            if serializer.data['friend_status'] == 'Blocker':
                return Response(
                    {'message': 'You have blocked this user. To view their profile, unblock them first.', 'status': 'Blocker'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if serializer.data['friend_status'] == 'Blocked':
                return Response(
                    {'message': 'You have been blocked by this user, you cannot see his profile', 'status': 'Blocked'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            return Response(serializer.data, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({'error': 'User profile not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response(
                {'error': f'Internal server error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class GetProfileAchievementsView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserAchievementsSerializer

    def get(self, request, username):
        try:
            user = User.objects.get(username=username)
            achievements = UserAchievement.objects.filter(user=user).order_by('-is_unlocked', 'achievement__reward_points')
            serializer = UserAchievementsSerializer(achievements, many=True, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': f'Internal server error: {str(e)}'},status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LeaderBoardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            query_set = Profile.objects.filter(user__is_active=True).select_related('user').order_by('rank')
            serializer = LeaderBoardSerializer(query_set, many=True, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Profile.DoesNotExist:
            return Response({'error': 'Leaderboard not found'},status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response(
                {'error': f'Internal server error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DashboardLeaderBoardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            query_set = Profile.objects.filter(user__is_active=True).select_related('user').order_by('rank')[:5]
            serializer = LeaderBoardSerializer(query_set, many=True, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Profile.DoesNotExist:
            return Response({'error': 'Leaderboard not found'},status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response(
                {'error': f'Internal server error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DeleteAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            if 'password' not in request.data:
                return Response({'error': 'Password is required'}, status=status.HTTP_400_BAD_REQUEST)
            user = request.user
            if not user.check_password(request.data['password']):
                return Response({'password': 'Invalid password'}, status=status.HTTP_400_BAD_REQUEST)
            user.is_active = False
            user.save()
            return Response({'message': 'Account deleted successfully'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': f'Internal server error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
