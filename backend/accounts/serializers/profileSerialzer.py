from rest_framework import serializers
import os
from datetime import datetime

from accounts.models import Profile, User
from accounts.serializers.badgeSerializer import BadgeSerializer
from app.settings import SERVER_URL, MEDIA_URL, DEFAULT_AVATAR


class ProfileSerializer(serializers.ModelSerializer):

    username = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()
    win_rate = serializers.SerializerMethodField()
    lose_rate = serializers.SerializerMethodField()
    badge = BadgeSerializer()

    class Meta:
        model = Profile
        fields = ['id', 'username', 'avatar', 'level', 'score', 'played_games',
                  'wins', 'losses', 'win_rate', 'lose_rate',
                  'rank', 'badge', 'stats', 'is_online', 'blocked_user_name', 'preferred_language']

    def get_avatar(self, obj):
        return SERVER_URL + obj.avatar.url

    def get_username(self, obj):
        return obj.user.username

    def get_win_rate(self, obj):
        if obj.played_games == 0:
            return 0
        return (obj.wins / obj.played_games) * 100

    def get_lose_rate(self, obj):
        if obj.played_games == 0:
            return 0
        return (obj.losses / obj.played_games) * 100


class EditProfileSerializer(serializers.ModelSerializer):
    # username = serializers.CharField(required=False)
    avatar = serializers.ImageField(required=False)
    removeAvatar = serializers.CharField(required=False)

    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name',
                  'avatar', 'removeAvatar', 'password']

    def validate_username(self, value):
        if any(ch.isupper() for ch in value):
            raise serializers.ValidationError(
                {'Username must be lowercase!'})
        if len(value) < 4:
            raise serializers.ValidationError(
                {'username': 'Username must be at least 4 characters!'})
        if len(value) > 14:
            raise serializers.ValidationError(
                {'username': 'Username must be at most 14 characters!'})
        return value

    def validate_avatar(self, value):
        if value.size >= 5 * 1024 * 1024:
            raise serializers.ValidationError(
                {'avatar': 'Image size should be less than 5MB!'})
        if value.content_type not in ['image/jpeg', 'image/png', 'image/jpg']:
            raise serializers.ValidationError(
                {'avatar': 'Image format should be jpeg or png or jpg!'})
        value.name = f"{self.context['request'].user.username}_{datetime.now()}.png"
        return value

    def validate_first_name(self, value):
        if value == '':
            return value
        if len(value) < 3:
            raise serializers.ValidationError(
                {'first_name': 'First name must be at least 3 characters!'})
        if len(value) > 20:
            raise serializers.ValidationError(
                {'first_name': 'First name must be at most 20 characters!'})
        return value

    def validate_last_name(self, value):
        if value == '':
            return value
        if len(value) < 3:
            raise serializers.ValidationError(
                {'last_name': 'Last name must be at least 3 characters!'})
        if len(value) > 20:
            raise serializers.ValidationError(
                {'last_name': 'Last name must be at most 20 characters!'})
        return value

    def validate(self, attrs):
        password = attrs.get('password')
        if password is None:
            raise serializers.ValidationError(
                {'password': 'Password is required to update your informations!'})
        user = self.context['request'].user
        if not user.check_password(password):
            raise serializers.ValidationError(
                {'password': 'Incorrect password!'})
        return super().validate(attrs)

    def update(self, instance, validated_data):
        if 'username' in validated_data:
            instance.username = validated_data.get('username')
        if 'first_name' in validated_data:
            instance.first_name = validated_data.get('first_name')
        if 'last_name' in validated_data:
            instance.last_name = validated_data.get('last_name')
        if 'avatar' in validated_data:
            if instance.profile.avatar != f'avatars/{DEFAULT_AVATAR}':
                instance.profile.avatar.delete()
            instance.profile.avatar = validated_data.get('avatar')
        if 'removeAvatar' in validated_data:
            if instance.profile.avatar != f'avatars/{DEFAULT_AVATAR}':
                if os.path.isfile(instance.profile.avatar.path):
                    os.remove(instance.profile.avatar.path)
            if validated_data.get('removeAvatar') == 'true':
                instance.profile.avatar = f'avatars/{DEFAULT_AVATAR}'
        instance.save()
        return instance
