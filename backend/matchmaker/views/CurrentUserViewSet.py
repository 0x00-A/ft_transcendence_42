# views.py
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from accounts.serializers import UserSerializer
from accounts.models import User
from rest_framework.response import Response
from rest_framework.decorators import action


# class CurrentUserViewSet(viewsets.ReadOnlyModelViewSet):
#     serializer_class = UserSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         return User.objects.get(id=self.request.user.id)


class CurrentUserViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def me(self, request):
        user = request.user  # Get the authenticated user
        serializer = UserSerializer(user)
        return Response(serializer.data)
