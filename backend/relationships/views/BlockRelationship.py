from chat.models import Conversation
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Q
from accounts.models import User
from relationships.models import BlockRelationship, FriendRequest
from relationships.serializers import BlockedUserSerializer



def update_conversation_block_status(blocker, blocked, block):

    try:
        conversation = Conversation.objects.filter(
            Q(user1=blocker, user2=blocked) | Q(user1=blocked, user2=blocker)
        ).first()
        if not conversation:
            return
        if block:
            if conversation.user1 == blocker:
                conversation.user1_block_status = "blocker"
                if conversation.user2_block_status != "blocker":
                    conversation.user2_block_status = "blocked"
            elif conversation.user2 == blocker:
                conversation.user2_block_status = "blocker"
                if conversation.user1_block_status != "blocker":
                    conversation.user1_block_status = "blocked"
        else:
            if conversation.user1 == blocker:
                if conversation.user2_block_status == "blocker":
                    conversation.user1_block_status = "blocked"
                else:
                    conversation.user1_block_status = None
                    conversation.user2_block_status = None
            elif conversation.user2 == blocker:
                if conversation.user1_block_status == "blocker":
                    conversation.user2_block_status = "blocked"
                else:
                    conversation.user1_block_status = None
                    conversation.user2_block_status = None
        conversation.save()
    except Conversation.DoesNotExist:
        pass
    except Exception as e:
        raise e

class BlockUserView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BlockedUserSerializer

    def post(self, request, username):
        try:
            target_user = User.objects.get(username=username)

            if not request.user.friends.filter(username=target_user.username).exists():
                return Response({'error': 'You can only block friends'}, status=status.HTTP_400_BAD_REQUEST)

            block_relationship, created = BlockRelationship.objects.get_or_create(
                blocker=request.user,
                blocked=target_user,
                defaults={'date_blocked': timezone.now()}
            )

            if created:
                request.user.friends.remove(target_user)
                FriendRequest.objects.filter(
                    Q(sender=request.user, receiver=target_user) |
                    Q(sender=target_user, receiver=request.user)
                ).delete()

                update_conversation_block_status(request.user, target_user, block=True)

                return Response({'message': 'User blocked and removed from friends'}, status=status.HTTP_200_OK)
            else:
                return Response({'message': 'User is already blocked'}, status=status.HTTP_400_BAD_REQUEST)

        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception:
            return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UnblockUserView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BlockedUserSerializer

    def post(self, request, username):
        try:
            target_user = User.objects.get(username=username)
            deleted_count, _ = BlockRelationship.objects.filter(blocker=request.user, blocked=target_user).delete()
            if deleted_count > 0:
                update_conversation_block_status(request.user, target_user, block=False)
                return Response({'message': 'User unblocked'}, status=status.HTTP_200_OK)
            else:
                return Response({'message': 'User is not blocked'}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception:
            return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class BlockedUsersView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BlockedUserSerializer

    def get(self, request):
        try:
            blocked_relationships = BlockRelationship.objects.filter(blocker=request.user).select_related('blocked')
            serializer = BlockedUserSerializer(blocked_relationships, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
