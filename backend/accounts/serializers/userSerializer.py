from rest_framework import serializers

from django.core.exceptions import ValidationError as DjangoValidationError
from django.contrib.auth.password_validation import validate_password

from accounts.models import User, PasswordReset
from relationships.models import FriendRequest, BlockRelationship
from accounts.serializers import ProfileSerializer
from uuid import UUID

# class TokenObtainPairSerializer(TokenObtainPairSerializer):
#     @classmethod
#     def get_token(cls, user: User) -> Token:
#         token = super().get_token(user)
#         token['user_id'] = user.pk
#         token['username'] = user.username
#         return token

class ResetPasswordSerializer(serializers.Serializer):
    new_password = serializers.CharField(write_only=True, required=True, style={
                                     'input_type': 'password'})
    confirm_password = serializers.CharField(write_only=True, required=True, style={
                                      'input_type': 'password'})
    token = serializers.CharField(write_only=True, required=True)

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(str(exc))
        return value

    def validate(self, attrs):
        try:
            UUID(attrs['token'], version=4)
        except ValueError:
            raise serializers.ValidationError({'error': 'Invalid token!'})
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError(
                {'password': 'Passwords do not match'})
        return attrs

    # def update(self, instance, validated_data):
    #     user = instance.user
    #     user.set_password(validated_data['password'])
    #     user.save()
    #     return user


class SetPasswordSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True, required=True, style={
                                     'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, style={
                                      'input_type': 'password'})

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(str(exc))
        return value

    def validate(self, attrs):
        if not self.context['request']:
            raise serializers.ValidationError(
                {'error': 'Request is required'})
        user = self.context['request'].user
        if not user.is_oauth_user:
            raise serializers.ValidationError(
                {'error': 'Only oauth2 users can set password'})
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {'password': 'Passwords do not match'})
        return attrs

    def update(self, instance, validated_data):
        password = validated_data.pop('password')
        instance.set_password(password)
        instance.is_password_set = True
        instance.save()
        return instance




class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    friend_request_status = serializers.CharField(required=False)
    friend_status = serializers.SerializerMethodField()
    # games = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'friend_status', 'username', 'first_name', 'email',
                  'last_name', 'profile', 'friend_request_status', 'last_seen', 'active_conversation', 'is_password_set', 'is2fa_active', 'open_chat']

    def get_friend_status(self, obj):
        if 'request' not in self.context or self.context['request'].user == obj:
            return 'self'
        try:
            BlockRelationship.objects.get(
                blocker=self.context['request'].user, blocked=obj)
            print('-->>>-you are the blocker-<<--------')
            return 'Blocker'
        except BlockRelationship.DoesNotExist:
            try:
                BlockRelationship.objects.get(
                    blocker=obj, blocked=self.context['request'].user)
                print('-->>>-you are the blocked-<<--------')
                return 'Blocked'
            except BlockRelationship.DoesNotExist:
                pass
        try:
            as_sender = FriendRequest.objects.get(
                sender=self.context['request'].user, receiver=obj)
            print('---as sender-->>', as_sender.status, '<<--------')
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
                print('---as reciever-->>', as_reciever.status, '<<--------')
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
