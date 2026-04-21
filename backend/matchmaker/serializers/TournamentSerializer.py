from rest_framework import serializers

from accounts.serializers import UserSerializer
from matchmaker.models import Tournament


class TournamentSerializer(serializers.ModelSerializer):
    participants_count = serializers.SerializerMethodField()
    creator = UserSerializer()
    winner = UserSerializer()
    user_id = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S")

    class Meta:
        model = Tournament
        fields = '__all__'
        read_only_fields = ['creator', 'is_full']
        # depth = 1

    def get_participants_count(self, obj):
        return obj.players.count()

    def get_user_id(self, obj):
        # Access the user_id from the context
        return self.context.get('user_id')

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        representation['state'] = instance.to_presentation()
        return representation
