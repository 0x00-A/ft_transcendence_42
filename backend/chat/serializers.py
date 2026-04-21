from rest_framework import serializers
from .models import Conversation, Message
from app.settings import SERVER_URL, MEDIA_URL
from datetime import datetime


class ConversationSerializer(serializers.ModelSerializer):
    user1_username = serializers.CharField(
        source='user1.username', read_only=True)
    user2_username = serializers.CharField(
        source='user2.username', read_only=True)
    user1_last_seen = serializers.CharField(
        source='user1.last_seen', read_only=True)
    user2_last_seen = serializers.CharField(
        source='user2.last_seen', read_only=True)
    user1_id = serializers.IntegerField(source='user1.id', read_only=True)
    user2_id = serializers.IntegerField(source='user2.id', read_only=True)
    user1_avatar = serializers.SerializerMethodField()
    user2_avatar = serializers.SerializerMethodField()
    user1_is_online = serializers.BooleanField(
        source='user1.profile.is_online', read_only=True)
    user2_is_online = serializers.BooleanField(
        source='user2.profile.is_online', read_only=True)
    user1_block_status = serializers.CharField(read_only=True)
    user2_block_status = serializers.CharField(read_only=True)

    class Meta:
        model = Conversation
        fields = [
            'id',
            'user1_id',
            'user2_id',
            'user1_last_seen',
            'user2_last_seen',
            'user1_username',
            'user1_avatar',
            'user2_username',
            'user2_avatar',
            'last_message',
            'unread_messages_user1',
            'unread_messages_user2',
            'user1_is_online',
            'user2_is_online',
            'created_at',
            'updated_at',
            'user1_block_status',
            'user2_block_status'
        ]

    def get_user1_avatar(self, obj):
        return f"{SERVER_URL}{MEDIA_URL}{obj.user1.profile.avatar}"

    def get_user2_avatar(self, obj):
        return f"{SERVER_URL}{MEDIA_URL}{obj.user2.profile.avatar}"


class MessageSerializer(serializers.ModelSerializer):

    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender',
                    'receiver', 'content', 'timestamp', 'seen']
