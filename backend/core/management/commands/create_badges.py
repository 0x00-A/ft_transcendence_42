from django.core.management.base import BaseCommand
from accounts.models import Badge


class Command(BaseCommand):
    help = "Create global Badges"

    def handle(self, *args, **kwargs):
        badges = [
            {"name": "Bronze", "icon": "/badges/Bronze.svg", "xp_reward": 10, "level_required": 0},
            {"name": "Silver", "icon": "/badges/Silver.svg", "xp_reward": 8, "level_required": 5},
            {"name": "Gold", "icon": "/badges/Gold.svg", "xp_reward": 6, "level_required": 10},
            {"name": "Platinum", "icon": "/badges/Platinum.svg", "xp_reward": 4, "level_required": 15},
            {"name": "Diamond", "icon": "/badges/Diamond.svg", "xp_reward": 2, "level_required": 20},
            {"name": "Ft-Pong", "icon": "/badges/Ft-Pong.svg", "xp_reward": 0, "level_required": 25},
        ]
        for badge in badges:
            Badge.objects.get_or_create(**badge)
        self.stdout.write(self.style.SUCCESS(
            'Badges created successfully!'))