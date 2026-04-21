import json
from accounts.utils import translate_text
from channels.generic.websocket import AsyncWebsocketConsumer
from ..models import User, Message, Conversation
from asgiref.sync import sync_to_async
from accounts.models import Notification
from accounts.consumers import NotificationConsumer
import asyncio

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_authenticated:
            self.user_group_name = f"user_{self.user.id}"

            await self.update_open_chat_status(self.user.id, True)
            await self.channel_layer.group_add(self.user_group_name, self.channel_name)
            await self.accept()

        else:
            await self.close()

    async def disconnect(self, close_code):
        if self.user.is_authenticated:
            await self.update_open_chat_status(self.user.id, False)
            await self.dis_active_conversation(self.user.id, -1)
            await self.channel_layer.group_discard(self.user_group_name, self.channel_name)

    @sync_to_async
    def update_open_chat_status(self, user_id, status):
        user = User.objects.get(id=user_id)
        user.open_chat = status
        user.save()

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get("action")

        try:
            if action == "update_active_conversation":
                await self.update_active_conversation(data)
            elif action == "send_message":
                await self.handle_send_message(data)
            elif action == "typing":
                await self.handle_typing_status(data)
            elif action == "mark_as_read":
                await self.handle_mark_as_read(data)
            elif action == "toggle_block_status":
                await self.handle_block_status(data)
        except Exception as e:
            target_language = await sync_to_async(
                lambda: self.user.profile.preferred_language or 'en'
            )()
            try:
                translated_message = await sync_to_async(translate_text)(str(e), target_language)
            except Exception:
                translated_message = str(e)

            await self.send(text_data=json.dumps({
                "type": "error",
                "message": translated_message
            }))
    async def handle_block_status(self, data):
        conversation_id = data.get("conversation_id")
        blocker_id = data.get("blocker_id")
        blocked_id = data.get("blocked_id")
        status = data.get("status")

        try:
            conversation_id = int(conversation_id)
        except (ValueError, TypeError):
            raise ValueError("Invalid conversation_id. It must be a number.")

        if not all([conversation_id, blocker_id, blocked_id]):
            raise ValueError("Missing required block status parameters")

        await self.toggle_block_status(conversation_id, blocker_id, blocked_id, status)
        await self.send_block_status_update(conversation_id, blocker_id, blocked_id)

    @sync_to_async
    def toggle_block_status(self, conversation_id, blocker_id, blocked_id, status):
        conversation = Conversation.objects.get(id=conversation_id)

        if status:
            if blocker_id == conversation.user1_id and blocked_id == conversation.user2_id:
                conversation.user1_block_status = "blocker"
                if conversation.user2_block_status != "blocker":
                    conversation.user2_block_status = "blocked"
            elif blocker_id == conversation.user2_id and blocked_id == conversation.user1_id:
                conversation.user2_block_status = "blocker"
                if conversation.user1_block_status != "blocker":
                    conversation.user1_block_status = "blocked"
        else:
            if blocker_id == conversation.user1_id:
                if conversation.user2_block_status == "blocker":
                    conversation.user1_block_status = "blocked"
                else:
                    conversation.user1_block_status = None
                    conversation.user2_block_status = None

            elif blocker_id == conversation.user2_id:
                if conversation.user1_block_status == "blocker":
                    conversation.user2_block_status = "blocked"
                else:
                    conversation.user1_block_status = None
                    conversation.user2_block_status = None
        conversation.save()

    async def send_block_status_update(self, conversation_id, blocker_id, blocked_id):
        await self.channel_layer.group_send(
            f"user_{blocker_id}",
            {
                "type": "block_status_update",
                "conversation_id": conversation_id,
                "blocker_id": blocker_id,
                "blocked_id": blocked_id,
                "block_status": "success"
            }
        )

        await self.channel_layer.group_send(
            f"user_{blocked_id}",
            {
                "type": "block_status_update",
                "conversation_id": conversation_id,
                "blocker_id": blocker_id,
                "blocked_id": blocked_id,
                "block_status": "success"
            }
        )

    async def block_status_update(self, event):

        await self.send(text_data=json.dumps({
            "type": "block_status_update",
            "conversation_id": event["conversation_id"],
            "blocker_id": event["blocker_id"],
            "blocked_id": event["blocked_id"],
            "block_status": event["block_status"],
        }))

    @sync_to_async
    def set_active_conversation(self, user_id, conversation_id):
        user = User.objects.get(id=user_id)
        user.active_conversation = conversation_id
        user.save()

    @sync_to_async
    def dis_active_conversation(self, user_id, conversation_id):
        user = User.objects.get(id=user_id)
        if user.active_conversation != -1:
            return
        user.active_conversation = conversation_id
        user.save()

    async def update_active_conversation(self, data):
        conversation_id = data.get("conversation_id")

        if not all([conversation_id]):
            raise ValueError("Missing required active conversation parameters")
        
        try:
            conversation_id = int(conversation_id)
        except (ValueError, TypeError):
            raise ValueError("Invalid conversation_id. It must be a number.")
        
        if conversation_id is not None:
            await self.set_active_conversation(self.user.id, conversation_id)

    @sync_to_async
    def get_user_open_chat_status(self, user_id):
        user = User.objects.get(id=user_id)
        return user.open_chat

    @sync_to_async
    def send_notification_to_receiver(self, receiver_id, sender_id, message):
        try:
            sender_user = User.objects.get(id=sender_id)
            receiver_user = User.objects.get(id=receiver_id)

            target_language = receiver_user.profile.preferred_language or 'en'

            try:
                translated_message = translate_text(f"{sender_user.username} sent you a message: ", target_language)
                translated_title = translate_text("New Message", target_language)
            except Exception as e:
                translated_message = f"{sender_user.username} sent you a message: "
                translated_title = "New Message"

            notification = Notification.objects.create(
                user=receiver_user,
                link="/chat",
                state=self.user.username,
                title=translated_title,
                message=f"{translated_message} {message}",
            )

            NotificationConsumer.send_notification_to_user(
                receiver_id, notification)
            
            notification_data = {
                "event": "new_message",
                "from": self.user.username,
                "message": f"{self.user.username} sent you a message.",
            }
            NotificationConsumer.send_notification_to_user(
                receiver_id, notification_data)

        except Exception as e:
            print(f"Failed to send notification: {str(e)}")

    async def handle_send_message(self, data):
        message = data.get("message")
        receiver_id = data.get("receiver_id")
        sender_id = self.user.id
        
        if not all([receiver_id, message]):
            raise ValueError("Missing required send message parameters")

        try:
            receiver_id = int(receiver_id)
        except (ValueError, TypeError):
            raise ValueError("Invalid receiver_id. It must be a number.")

        message = message[:400]

        try:
            conversation = await self.get_or_create_conversation(sender_id, receiver_id)

            if await self.is_conversation_blocked(conversation, sender_id):
                raise ValueError(
                    "Cannot send message. Conversation is blocked.")

            saved_conversation = await self.save_message(sender_id, receiver_id, message)

            await self.channel_layer.group_send(
                f"user_{sender_id}",
                {
                    "type": "chat_message",
                    "message": message,
                    "sender_id": sender_id,
                    "receiver_id": receiver_id,
                    "conversation_id": saved_conversation.id,
                }
            )
            await self.channel_layer.group_send(
                f"user_{receiver_id}",
                {
                    "type": "chat_message",
                    "message": message,
                    "sender_id": sender_id,
                    "receiver_id": receiver_id,
                    "conversation_id": saved_conversation.id,
                }
            )
            await self.handle_notification(receiver_id, sender_id, message)
        except Exception as e:
            target_language = await sync_to_async(
                lambda: self.user.profile.preferred_language or 'en'
            )()
            try:
                translated_message = await sync_to_async(translate_text)(str(e), target_language)
            except Exception:
                translated_message = str(e)
            await self.send(text_data=json.dumps({
                "type": "error",
                "message": translated_message
            }))

    async def handle_notification(self, receiver_id, sender_id, message):
        """
        Separate method to handle notification logic after message is sent
        """
        try:
            is_open_chat = await self.get_user_open_chat_status(receiver_id)
            if not is_open_chat:
                asyncio.create_task(
                    self.send_notification_to_receiver(
                        receiver_id, sender_id, message)
                )
        except Exception as e:
            print(f"Notification error: {str(e)}")

    async def get_or_create_conversation(self, sender_id, receiver_id):
        return await sync_to_async(Conversation.objects.get)(
            user1_id=min(sender_id, receiver_id),
            user2_id=max(sender_id, receiver_id),
        )

    async def is_conversation_blocked(self, conversation, sender_id):
        conversation = await sync_to_async(Conversation.objects.get)(id=conversation.id)

        if conversation.user1_block_status == "blocker" or conversation.user1_block_status == "blocked":
            return True
        if conversation.user2_block_status == "blocker" or conversation.user2_block_status == "blocker":
            return True
        return False

    async def handle_typing_status(self, data):
        typing = data.get("typing", False)
        receiver_id = data.get("receiver_id")
        sender_id = self.user.id

        if not all([receiver_id]):
            raise ValueError("Missing required typing status parameters")
        
        try:
            receiver_id = int(receiver_id)
        except (ValueError, TypeError):
            raise ValueError("Invalid receiver_id. It must be a number.")

        await self.channel_layer.group_send(
            f"user_{receiver_id}",
            {
                "type": "typing_status",
                "typing": typing,
                "sender_id": sender_id,
            }
        )

    async def handle_mark_as_read(self, data):
        conversation_id = data.get("conversation_id")
        
        if not all([conversation_id]):
            raise ValueError("Missing required conversation_id parameters")

        try:
            conversation_id = int(conversation_id)
        except (ValueError, TypeError):
            raise ValueError("Invalid conversation_id. It must be a number.")
        
        await self.mark_conversation_as_read(conversation_id, self.user)

        await self.send(text_data=json.dumps({
            "type": "mark_as_read",
            "status": "success",
            "conversation_id": conversation_id
        }))

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "type": "chat_message",
            "message": event["message"],
            "sender_id": event["sender_id"],
            "receiver_id": event["receiver_id"],
            "conversation_id": event["conversation_id"],
        }))

    async def typing_status(self, event):
        await self.send(text_data=json.dumps({
            "type": "typing_status",
            "typing": event["typing"],
            "sender_id": event["sender_id"],
        }))

    @sync_to_async
    def save_message(self, sender_id, receiver_id, message):
        sender = User.objects.get(id=sender_id)
        receiver = User.objects.get(id=receiver_id)

        conversation = Conversation.objects.get(
            user1=min(sender, receiver, key=lambda user: user.id),
            user2=max(sender, receiver, key=lambda user: user.id)
        )

        Message.objects.create(
            conversation=conversation,
            sender=sender,
            receiver=receiver,
            content=message
        )
        conversation.last_message = message
        is_active = receiver.active_conversation == conversation.id
        if not is_active:
            if receiver == conversation.user1:
                conversation.unread_messages_user1 += 1
            elif receiver == conversation.user2:
                conversation.unread_messages_user2 += 1
        conversation.save()
        return conversation

    @sync_to_async
    def mark_conversation_as_read(self, conversation_id, user):
        conversation = Conversation.objects.get(id=conversation_id)

        if user == conversation.user1:
            conversation.unread_messages_user1 = 0
        elif user == conversation.user2:
            conversation.unread_messages_user2 = 0

        conversation.save()
