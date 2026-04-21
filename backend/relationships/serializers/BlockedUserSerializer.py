from rest_framework import serializers
from relationships.models import BlockRelationship

from accounts.serializers.userSerializer import UserSerializer

class BlockedUserSerializer(serializers.ModelSerializer):
    blocker = UserSerializer(read_only=True)
    blocked = UserSerializer(read_only=True)

    class Meta:
        model = BlockRelationship
        fields = ['blocker', 'blocked', 'date_blocked']
