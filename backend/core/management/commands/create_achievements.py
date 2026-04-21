from django.core.management.base import BaseCommand
from accounts.models import Achievement


class Command(BaseCommand):
    help = "Create global achievements"

    def handle(self, *args, **kwargs):
        achievements = [
            {"name": "First Paddle", "description": "Win your first match.", "reward_points": 10,
                "image": "achievements/firstPaddle.svg", "threshold": 1, "condition_name": "games_won", "name_trans": "first_paddle", "condition": {"games_won": 1}},

            {"name": "Persistent Player", "description": "Log in 7 days in a row!", "reward_points": 30,
                "image": "achievements/persisten.svg", "threshold": 7, "condition_name": "logins", "name_trans": "persistent_player", "condition": {"logins": 7}},


            {"name": "Bronze Champ", "description": "Win 5 matches.", "reward_points": 40,
                "image": "achievements/bronzeChamp.svg", "threshold": 5, "condition_name": "games_won", "name_trans": "bronze_champ", "condition": {"games_won": 5}},


            {"name": "Silver Smash", "description": "Win 10 matches.", "reward_points": 70,
                "image": "achievements/silverSmash.svg", "threshold": 10, "condition_name": "games_won", "name_trans": "silver_smash", "condition": {"games_won": 10}},


            {"name": "Gold Ace", "description": "Win 20 matches.", "reward_points": 110,
                "image": "achievements/goldace.svg", "threshold": 20, "condition_name": "games_won", "name_trans": "gold_ace", "condition": {"games_won": 20}},


            {"name": "Marathon Match", "description": "Play a match lasting more than 5 minutes.", "reward_points": 30,
                "image": "achievements/marathon.svg", "threshold": 300, "condition_name": "play_time", "name_trans": "marathon_match", "condition": {"play_time": 300}},


            {"name": "FT-PONG Legend", "description": "Win 50 matches", "reward_points": 150,
                "image": "achievements/ft-pong.svg", "threshold": 100, "condition_name": "games_won", "name_trans": "ft_pong_legend", "condition": {"games_won": 50}}
        ]
        for achievement in achievements:
            Achievement.objects.get_or_create(**achievement)
        self.stdout.write(self.style.SUCCESS(
            'Achievements created successfully!'))
