from django.db import models
from accounts.models import User

# from django.contrib.auth import get_user_model
# User = get_user_model()

class Conversation(models.Model):
    user1 = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='conversations_as_user1'
    )
    user2 = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='conversations_as_user2'
    )
    last_message = models.TextField(blank=True, null=True, default='Send first message')
    unread_messages_user1 = models.IntegerField(default=0)
    unread_messages_user2 = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    user1_block_status = models.CharField(
        max_length=10,
        choices=[('blocker', 'Blocker'), ('blocked', 'Blocked'), (None, 'None')],
        blank=True,
        null=True,
        default=None
    )
    user2_block_status = models.CharField(
        max_length=10,
        choices=[('blocker', 'Blocker'), ('blocked', 'Blocked'), (None, 'None')],
        blank=True,
        null=True,
        default=None
    )

    class Meta:
        unique_together = ('user1', 'user2')

    def __str__(self):
        return f"Conversation between {self.user1} and {self.user2}"


class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    seen = models.BooleanField(default=False)

    def __str__(self):
        return f"Message from {self.sender} to {self.receiver} at {self.timestamp}"
