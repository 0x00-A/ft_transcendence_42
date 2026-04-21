# views.py
from rest_framework.response import Response
from rest_framework import viewsets, permissions
from matchmaker.models import Game
from accounts.models import User
from matchmaker.serializers import GameSerializer
from matchmaker.serializers.GameSerializer import ProfileGamesSerializer
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.renderers import JSONRenderer
from django.db.models import Q


class GameViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = GameSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        return Game.objects.filter(
            Q(player1=user) | Q(player2=user),
            status='ended'
        )

class GetPlayedGamesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            user = request.user

            played_games = Game.objects.filter(
                Q(player1=user) | Q(player2=user),
                status='ended'
            ).order_by('-start_time')
            serializer = ProfileGamesSerializer(played_games, many=True, context={
                                                'request': request, 'user': user})
            # all_games = (games_as_player1 | games_as_player2).order_by('-start_time')
            # last_5_games = all_games[:5]
            return Response(data=serializer.data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response(data={"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response(data={"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LastGamesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, username):
        try:
            user = User.objects.get(username=username)
            last_games = Game.objects.filter(
                Q(player1=user) | Q(player2=user),
                status='ended'
            ).order_by('-start_time')[:5]
            serializer = ProfileGamesSerializer(last_games, many=True, context={
                                                'request': request, 'user': user})
            return Response(data=serializer.data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response(data={"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response(data={"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
