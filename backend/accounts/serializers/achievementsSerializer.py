from rest_framework import serializers

from accounts.models import Achievement, UserAchievement
from django.conf import settings

class AchievementSerializer(serializers.ModelSerializer):

    image = serializers.SerializerMethodField()

    class Meta:
        model = Achievement
        fields = ['name', 'description', 'condition_name', 'name_trans', 'condition', 'reward_points', 'image',
                    'progress_percentage', 'is_unlocked']

    def get_image(self, obj):
        return f'{settings.SERVER_URL}{obj.image.url}'

class UserAchievementsSerializer(serializers.ModelSerializer):
    achievement = AchievementSerializer()

    class Meta:
        model = UserAchievement
        fields = ['achievement', 'progress', 'is_unlocked', 'unlocked_at']