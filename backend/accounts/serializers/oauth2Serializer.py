from rest_framework import serializers

from django.core.files.base import ContentFile
import requests
from datetime import datetime

from accounts.models import User


class Oauth2Serializer(serializers.ModelSerializer):

    avatar_link = serializers.CharField()
    id = serializers.CharField()
    provider = serializers.CharField()

    class Meta:
        model = User
        fields = ['id', 'provider', 'username', 'email', 'avatar_link']

    def validate_username(self, value):
        if any(ch.isupper() for ch in value):
            raise serializers.ValidationError({'Username must be lowercase!'})
        if len(value) < 4:
            raise serializers.ValidationError({'Username must be at least 4 characters!'})
        if len(value) > 14:
            raise serializers.ValidationError({'Username must be at most 14 characters!'})
        return value

    def validate(self, attrs):
        return attrs

    def get_avatar_content(self, avatar_link):
        try:
            res = requests.get(avatar_link)
            res.raise_for_status()
            return res.content
        except requests.exceptions.HTTPError as err:
            # print('-->', err)
            return None
        except Exception as err:
            # print('-->', err)
            return None

    def create(self, validated_data):
        user = User.objects.create(
            username = validated_data['username'],
            email = validated_data['email'],
            is_oauth2_user = True,
            oauth2_id = validated_data['id'],
            oauth2_provider = validated_data['provider'],
        )
        user.set_unusable_password()
        user.is_password_set = False
        avatarContent = self.get_avatar_content(validated_data['avatar_link'])
        if avatarContent is not None:
            user.profile.avatar.save(name=f"{user.username}_{datetime.now()}.png", content=ContentFile(avatarContent), save=True)
        user.save()
        return user
