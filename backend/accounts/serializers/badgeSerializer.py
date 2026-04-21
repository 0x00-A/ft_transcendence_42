from rest_framework import serializers

from accounts.models import Badge
from app.settings import MEDIA_URL
from app.settings import SERVER_URL

class BadgeSerializer(serializers.ModelSerializer):
    icon = serializers.SerializerMethodField()
    class Meta:
        model = Badge
        fields = ['id', 'name', 'icon', 'xp_reward', 'level_required']

    def get_icon(self, obj):
        return SERVER_URL + obj.icon.url