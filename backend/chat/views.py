# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer
from django.db.models import Q
from django.contrib.auth import get_user_model
from datetime import datetime, timezone
from app.settings import SERVER_URL, MEDIA_URL
from rest_framework.pagination import PageNumberPagination

User = get_user_model()

def format_time(timestamp):
    now = datetime.now(timezone.utc)
    diff = now - timestamp
    seconds = diff.total_seconds()
    if seconds < 60:
        return 'Just now'
    minutes = int(seconds // 60)
    if minutes < 60:
        return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
    hours = int(seconds // 3600)
    if hours < 24:
        return f"{hours} hour{'s' if hours != 1 else ''} ago"
    days = int(seconds // 86400)
    if days < 7:
        return f"{days} day{'s' if days != 1 else ''} ago"
    weeks = int(days // 7)
    if weeks < 52:
        return f"{weeks} week{'s' if weeks != 1 else ''} ago"
    years = int(days // 365)
    return f"{years} year{'s' if years != 1 else ''} ago"

class CreateConversationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user1 = request.user
        user2_id = request.data.get("user2_id")

        if not user2_id:
            return Response({"error": "user2_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user2 = User.objects.get(id=user2_id)

            conversation, created = Conversation.objects.get_or_create(
                user1=min(user1, user2, key=lambda u: u.id),
                user2=max(user1, user2, key=lambda u: u.id)
            )

            if user1 == conversation.user1:
                other_user = conversation.user2
                unread_count = conversation.unread_messages_user1
            else:
                other_user = conversation.user1
                unread_count = conversation.unread_messages_user2

            last_message = conversation.last_message or "Send first message"
            truncated_message = f"{last_message[:10]}..." if len(last_message) > 10 else last_message

            conversation_data = {
                'id': conversation.id,
                'last_seen': other_user.last_seen,
                'user_id': other_user.id,
                'avatar': f"{SERVER_URL}{MEDIA_URL}{other_user.profile.avatar}",
                'name': other_user.username,
                'lastMessage': truncated_message,
                'time': conversation.updated_at,
                'unreadCount': unread_count or '',
                'status': other_user.profile.is_online,
            }

            status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
            return Response(conversation_data, status=status_code)

        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response(
                {"error": "An unexpected error occurred.", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )



class GetConversationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user
            conversations = Conversation.objects.filter(
                Q(user1=user) | Q(user2=user)
            ).select_related('user1', 'user2').order_by('-updated_at')

            serializer = ConversationSerializer(conversations, context={'request': request}, many=True)
            conversations_data = []

            for conversation in serializer.data:
                if not conversation.get('user1_id') or not conversation.get('user2_id'):
                    continue

                if user.id == conversation['user1_id']:
                    other_user_id = conversation['user2_id']
                    other_user_username = conversation['user2_username']
                    other_user_avatar = conversation['user2_avatar']
                    other_last_seen = conversation['user2_last_seen']
                    other_status = conversation['user2_is_online']
                    unread_count = conversation['unread_messages_user1']
                    block_status = conversation['user1_block_status']

                else:
                    other_user_id = conversation['user1_id']
                    other_user_username = conversation['user1_username']
                    other_user_avatar = conversation['user1_avatar']
                    other_last_seen = conversation['user1_last_seen']
                    other_status = conversation['user1_is_online']
                    unread_count = conversation['unread_messages_user2']
                    block_status = conversation['user2_block_status']

                if block_status == "blocker":
                    block_status_display = "You have blocked this user"
                elif block_status == "blocked":
                    block_status_display = "You are blocked by this user"
                else:
                    block_status_display = None

                last_message = conversation['last_message']
                # if last_message == "Send first message" and user.id == conversation['user2_id']:
                #     continue

                updated_at_str = conversation['updated_at']
                updated_at = datetime.fromisoformat(updated_at_str)
                truncated_message = last_message[:10] + "..." if len(last_message) > 10 else last_message

                conversation_data = {
                    'id': conversation['id'],
                    'last_seen': other_last_seen,
                    'user_id': other_user_id,
                    'avatar': other_user_avatar,
                    'name': other_user_username,
                    'lastMessage': truncated_message or "Send",
                    'time': updated_at,
                    'unreadCount': unread_count or '',
                    'status': other_status,
                    'block_status': block_status,
                    'block_status_display': block_status_display,
                }
                conversations_data.append(conversation_data)

            return Response(conversations_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': 'Internal server error', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CustomMessagePagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class GetMessagesView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = CustomMessagePagination

    def get(self, request, conversation_id):
        try:
            user = request.user
            conversation = Conversation.objects.get(
                Q(id=conversation_id),
                Q(user1=user) | Q(user2=user)
            )

            messages = conversation.messages.all().order_by('-timestamp')

            paginator = self.pagination_class()

            page = request.query_params.get('page', 1)

            try:
                page = int(str(page).rstrip('/'))
            except (ValueError, TypeError):
                page = 1

            request.query_params._mutable = True
            request.query_params['page'] = page

            try:
                paginated_messages = paginator.paginate_queryset(messages, request)
                serializer = MessageSerializer(paginated_messages, many=True)
                return paginator.get_paginated_response(serializer.data)

            except Exception as pagination_error:
                return Response(
                    {'error': 'Pagination error', 'details': str(pagination_error)},
                    status=status.HTTP_400_BAD_REQUEST
                )

        except Conversation.DoesNotExist:
            return Response(
                {'error': 'Conversation not found or access denied'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': 'Internal server error', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
