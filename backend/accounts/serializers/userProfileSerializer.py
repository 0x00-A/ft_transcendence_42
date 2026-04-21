from rest_framework import serializers

from accounts.models import User, Profile, Badge
from relationships.models import FriendRequest, BlockRelationship

from app.settings import MEDIA_URL
from app.settings import SERVER_URL


class BadgeSerializer(serializers.ModelSerializer):
    icon = serializers.SerializerMethodField()
    class Meta:
        model = Badge
        fields = ['id', 'name', 'icon', 'xp_reward', 'level_required']

    def get_icon(self, obj):
        return f"{SERVER_URL}{MEDIA_URL}{obj.icon}"


class ProfileSerializer(serializers.ModelSerializer):

    avatar = serializers.SerializerMethodField()
    badge = BadgeSerializer()

    class Meta:
        model = Profile
        fields = ['id', 'avatar', 'level', 'score',
                  'rank', 'badge', 'stats', 'is_online',
                  'played_games', 'wins', 'losses']

    def get_avatar(self, obj):
        return f"{SERVER_URL}{MEDIA_URL}{obj.avatar}"

class OtherUserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    friend_status = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'friend_status', 'first_name', 'last_name', 'last_seen', 'profile']

    def get_friend_status(self, obj):
        if 'request' not in self.context or self.context['request'].user == obj:
            return 'self'
        try:
            BlockRelationship.objects.get(
                blocker=self.context['request'].user, blocked=obj)
            return 'Blocker'
        except BlockRelationship.DoesNotExist:
            try:
                BlockRelationship.objects.get(
                    blocker=obj, blocked=self.context['request'].user)
                return 'Blocked'
            except BlockRelationship.DoesNotExist:
                pass
        try:
            as_sender = FriendRequest.objects.get(
                sender=self.context['request'].user, receiver=obj)
            if as_sender.status == 'accepted':
                return 'Friends'
            if as_sender.status == 'pending':
                return 'Cancel'
            if as_sender.status == 'rejected':
                return 'Add'
            return as_sender.status
        except FriendRequest.DoesNotExist:
            try:
                as_reciever = FriendRequest.objects.get(
                    sender=obj, receiver=self.context['request'].user)
                if as_reciever.status == 'accepted':
                    return 'Friends'
                if as_reciever.status == 'pending':
                    return 'Accept'
                if as_reciever.status == 'rejected':
                    return 'Add'
                return as_reciever.status
            except FriendRequest.DoesNotExist:
                return 'Add'
            # print('---as reciever-->>', as_reciever.status, '<<--------')
        return None


class UserProfileSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [ 'id', 'username', 'first_name', 'last_name', 'email', 'is_password_set', 'is2fa_active',
                    'profile']

    def get_friend_status(self, obj):
        if 'request' not in self.context or self.context['request'].user == obj:
            return 'self'
        try:
            BlockRelationship.objects.get(
                blocker=self.context['request'].user, blocked=obj)
            return 'Blocker'
        except BlockRelationship.DoesNotExist:
            try:
                BlockRelationship.objects.get(
                    blocker=obj, blocked=self.context['request'].user)
                return 'Blocked'
            except BlockRelationship.DoesNotExist:
                pass
        try:
            as_sender = FriendRequest.objects.get(
                sender=self.context['request'].user, receiver=obj)
            if as_sender.status == 'accepted':
                return 'Friends'
            if as_sender.status == 'pending':
                return 'Cancel'
            if as_sender.status == 'rejected':
                return 'Add'
            return as_sender.status
        except FriendRequest.DoesNotExist:
            try:
                as_reciever = FriendRequest.objects.get(
                    sender=obj, receiver=self.context['request'].user)
                if as_reciever.status == 'accepted':
                    return 'Friends'
                if as_reciever.status == 'pending':
                    return 'Accept'
                if as_reciever.status == 'rejected':
                    return 'Add'
                return as_reciever.status
            except FriendRequest.DoesNotExist:
                return 'Add'
            # print('---as reciever-->>', as_reciever.status, '<<--------')
        return None
    # def get_games(self, obj):
    #     games_as_player1 = obj.games_as_player1.all()
    #     games_as_player2 = obj.games_as_player2.all()

    #     all_games = (games_as_player1 | games_as_player2).order_by('-start_time')
    #     last_5_games = all_games[:5]

    #     return GameSerializer(last_5_games, many=True).data