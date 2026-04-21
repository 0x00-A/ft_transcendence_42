from rest_framework import serializers

from accounts.models import Profile


class LeaderBoardSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    win_rate = serializers.SerializerMethodField()
    lose_rate = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ['rank', 'avatar', 'username', 'played_games', 'win_rate', 'lose_rate', 'score']

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
