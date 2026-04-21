from rest_framework import permissions
from rest_framework import renderers
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets
from matchmaker.models import Tournament
from matchmaker.serializers import TournamentSerializer

from django.shortcuts import get_object_or_404


class TournamentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    This ViewSet automatically provides `list`, `create`, `retrieve`,
    `update` and `destroy` actions.

    Additionally we also provide an extra `highlight` action.
    """
    # queryset = Tournament.objects.all()
    queryset = Tournament.objects.filter(is_full=False).order_by('-created_at')
    serializer_class = TournamentSerializer
    permission_classes = [permissions.IsAuthenticated]
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly,
    #                       IsOwnerOrReadOnly]

    def get_serializer_context(self):
        # Add user_id to the context, which can be accessed in the serializer
        context = super().get_serializer_context()
        context['user_id'] = self.request.user.id
        return context

    @action(detail=False, methods=['get'], url_path='user-tournaments')
    def get_user_tournaments(self, request):
        tournaments = Tournament.objects.filter(
            players=request.user).exclude(status='aborted').order_by('-status')

        if tournaments.exists():
            serializer = self.get_serializer(tournaments, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response([], status=status.HTTP_200_OK)

    # def perform_create(self, serializer):
    #     # Automatically set the creator as the user making the request
    #     serializer.save(creator=self.request.user)

    # def get_queryset(self):
    #     # Only list tournaments that are not full
    #     return Tournament.objects.filter(is_full=False)
