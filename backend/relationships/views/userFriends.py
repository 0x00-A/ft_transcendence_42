from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from django.db.models import BooleanField, Case, Value, When

from accounts.models import Profile, User
from accounts.serializers import OtherUserSerializer



class GetProfileOnlineFriends(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user
            friends = user.friends.filter(profile__is_online=True)[:5]
            serializer = OtherUserSerializer(friends, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Profile.DoesNotExist:
            return Response(
                {'error': 'User profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': 'Internal server error'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
class GetProfileOfflineFriends(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user
            friends = user.friends.filter(profile__is_online=False)[:5]
            serializer = OtherUserSerializer(friends, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Profile.DoesNotExist:
            return Response(
                {'error': 'User profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': 'Internal server error'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DashboardFriendsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username=None):
        try:
            user = User.objects.get(username=username)
            friends = user.friends.annotate(
                is_online_order=Case(When(profile__is_online=True,
                                          then=Value(True)),
                                            default=Value(False), output_field=BooleanField(),)
            ).order_by('-is_online_order')[:5]
            # friends = user.friends.filter(profile__is_online=True)[:5] | user.friends.filter(profile__is_online=False)[:5]
            serializer = OtherUserSerializer(friends, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': 'Internal server error, details: ' + str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserFriendsView(APIView):
    permission_classes = [IsAuthenticated]
    # serializer_class = UserSerializer

    def get(self, request, username=None):
        if username:
            try:
                user = User.objects.get(username=username)
                friends = user.friends.all()
                serializer = self.serializer_class(friends, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except User.DoesNotExist:
                return Response(
                    {'error': 'User does not exist'},
                    status=status.HTTP_404_NOT_FOUND
                )
            except Exception as e:
                return Response(
                    {'error': 'Internal server error'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        try:
            user = request.user
            friends = user.friends.all()
            serializer = self.serializer_class(friends, many=True)
            return Response(serializer.data)
        except Profile.DoesNotExist:
            return Response(
                {'error': 'User profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': 'Internal server error'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )