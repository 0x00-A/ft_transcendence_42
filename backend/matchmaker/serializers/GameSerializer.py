# serializers.py
from rest_framework import serializers
from matchmaker.models import Game
from accounts.serializers.userSerializer import UserSerializer
from app.settings import SERVER_URL, MEDIA_URL


class GameSerializer(serializers.ModelSerializer):
    player1 = UserSerializer()
    player2 = UserSerializer()
    winner = UserSerializer()

    class Meta:
        model = Game
        fields = ['id', 'player1', 'player2', 'p1_score',
                  'p2_score', 'status', 'winner', 'start_time']


class ProfileGamesSerializer(serializers.ModelSerializer):

    game_duration = serializers.SerializerMethodField()
    result = serializers.SerializerMethodField()
    my_score = serializers.SerializerMethodField()
    opponent_score = serializers.SerializerMethodField()
    opponent_avatar = serializers.SerializerMethodField()
    opponent_username = serializers.SerializerMethodField()
    xp_gained = serializers.SerializerMethodField()

    class Meta:
        model = Game
        fields = ['id', 'start_time', 'opponent_username', 'xp_gained', 'opponent_score',
                  'opponent_avatar', 'result', 'my_score', 'game_duration']

    # def validate(self, data):
    #     print(f'Validating data: {data}')
    #     return data

    def get_opponent_username(self, obj):
        if obj.player1 == self.context['user']:
            return obj.player2.username
        return obj.player1.username

    def get_opponent_avatar(self, obj):
        if obj.player1 == self.context['user']:
            return f"{SERVER_URL}{MEDIA_URL}{obj.player2.profile.avatar}"
        return f"{SERVER_URL}{MEDIA_URL}{obj.player1.profile.avatar}"

    def get_result(self, obj):
        if obj.winner == self.context['user']:
            return 'Win'
        return 'Lose'

    def get_xp_gained(self, obj):
        if obj.player1 == self.context['user']:
            return obj.p1_xp
        return obj.p2_xp

    def get_my_score(self, obj):
        if obj.player1 == self.context['user']:
            return obj.p1_score
        return obj.p2_score

    def get_opponent_score(self, obj):
        if obj.player1 == self.context['user']:
            return obj.p2_score
        return obj.p1_score

    def get_game_duration(self, obj):
        if not obj.end_time or not obj.start_time:
            return 0
        duration = obj.end_time - obj.start_time
        return duration.total_seconds() / 60
