from django.db import models
import os

from .user import User
from .badge import Badge

from django.conf import settings


# Profile.objects.bulk_update(profiles, ['rank'])

class Profile(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(
        upload_to='avatars/', default=f'avatars/{settings.DEFAULT_AVATAR}')
    age = models.PositiveSmallIntegerField(null=True, blank=True)
    score = models.PositiveIntegerField(default=0)
    level = models.PositiveSmallIntegerField(default=0)
    rank = models.PositiveSmallIntegerField(null=True, blank=True)
    badge = models.ForeignKey(
        to=Badge, on_delete=models.SET_NULL, null=True, blank=True)
    stats = models.JSONField(default=dict, blank=True)
    played_games = models.PositiveIntegerField(default=0)
    wins = models.PositiveIntegerField(default=0)
    losses = models.PositiveIntegerField(default=0)
    is_online = models.BooleanField(default=False)
    blocked_user_name = models.CharField(max_length=150, default="none", blank=True)
    preferred_language = models.CharField(max_length=10, default='en')

    # def delete(self, *args, **kwargs):
    #     if self.avatar:
    #         if os.path.isfile(self.avatar.path):
    #             os.remove(self.avatar.path)
    #     super().delete(*args, **kwargs)

    # def update_score(self, win:False, result, p2_badge):
    #     if win:
    #         self.score += WIN_SCORE + result
    #         if self.badge.xp_reward < p2_badge:
    #             self.score += self.badge.xp_reward * 2
    #         else:
    #             self.score += self.badge.xp_reward
    #     else:
    #         self.score += result
    #         if self.badge.xp_reward < p2_badge:
    #             self.score -= p2_badge * 2
    #     self.save()
    #     self.calculate_level()
    #     self.update_badge()
    #     # update_ranks()

    # def calculate_level(self):
    #     self.level = self.score // 100
    #     self.save()

    # def update_badge(self):
    #     badge = Badge.get_badge(self.level)
    #     if badge and (not self.badge or self.badge.name != badge.name):
    #         self.badge = badge
    #         self.save()




    def __str__(self) -> str:
        return self.user.username
