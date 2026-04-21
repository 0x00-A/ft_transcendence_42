from rest_framework import serializers
# from django.contrib.auth import get_user_model
# User = get_user_model()

from relationships.models import FriendRequest
from accounts.serializers import UserSerializer


class FriendRequestSerializer(serializers.ModelSerializer):
    sender = UserSerializer()
    receiver = UserSerializer()
    class Meta:
        model = FriendRequest
        fields = ['id', 'receiver', 'sender', 'status', 'timestamp']
