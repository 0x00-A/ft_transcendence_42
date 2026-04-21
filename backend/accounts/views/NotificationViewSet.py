from accounts.utils import translate_text
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

from accounts.models import Notification
from accounts.serializers import NotificationSerializer
from rest_framework.views import APIView


class NotificationPagination(PageNumberPagination):
    page_size = 5
    page_size_query_param = 'page_size'
    max_page_size = 100


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = NotificationPagination

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

    def get_user_language(self, user):
        return user.profile.preferred_language or 'en'

    def translate_notification(self, notification, language):
        # print("***** translator ****")
        # print(language)
        translated_title = translate_text(notification.title, language)
        translated_message = translate_text(notification.message, language)
        return {
            "title": translated_title,
            "link": notification.link,
            "message": translated_message,
            "created_at": notification.created_at.isoformat(),
            "user": notification.user.username,
            "is_read": notification.is_read,
            "state": notification.state
        }

    def list(self, request, *args, **kwargs):
        language = self.get_user_language(request.user)

        page = self.paginate_queryset(self.get_queryset())
        if page is not None:
            translated_notifications = [
                self.translate_notification(notification, language) for notification in page
            ]
            return self.get_paginated_response(translated_notifications)
        notifications = self.get_queryset()
        if not notifications.exists():
            return Response([], status=200)

        translated_notifications = [
            self.translate_notification(notification, language) for notification in notifications
        ]
        return Response(translated_notifications)

    @action(detail=False, methods=['patch'], url_path='mark-all-read')
    def mark_all_read(self, request):
        notifications = self.get_queryset().filter(is_read=False)
        notifications.update(is_read=True)
        return Response({"message": "All notifications marked as read"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'], url_path='mark-read')
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({"message": f"Notification {pk} marked as read"}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['delete'], url_path='delete-all')
    def delete_all_notifications(self, request, pk=None):
        self.get_queryset().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class HasNewRequestsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({'hasNewRequests': request.user.has_new_requests}, status=status.HTTP_200_OK)
