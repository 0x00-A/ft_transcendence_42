from django.db import connection
from django.utils import timezone
from django.db import models
from accounts.models import User, Profile, Badge, Achievement, UserAchievement
# from accounts.consumers.NotificationConsumer import NotificationConsumer
# from accounts.models import Notification

# User = get_user_model()
WIN_SCORE = 7



class GameManager(models.Manager):
    def create_game(self, player1, player2):
        game = self.create(
            player1=player1,
            player2=player2,
        )
        return game

    def get_active_games(self):
        return self.filter(game_status='started')

    def get_completed_games(self):
        return self.filter(game_status='ended')


class Game(models.Model):
    GAME_STATUS_CHOICES = [
        # ('waiting', 'Game waiting'),
        ('started', 'Game started'),
        ('ended', 'Game ended'),
    ]
    game_id = models.CharField(
        max_length=100, unique=True, blank=True, null=True)
    player1 = models.ForeignKey(
        User, related_name='games_as_player1', on_delete=models.CASCADE)
    player2 = models.ForeignKey(
        User, related_name='games_as_player2', on_delete=models.CASCADE)
    winner = models.ForeignKey(
        User, related_name='games_as_winner', on_delete=models.CASCADE, null=True)
    p1_score = models.IntegerField(default=0)
    p2_score = models.IntegerField(default=0)
    p1_xp = models.IntegerField(default=0)
    p2_xp = models.IntegerField(default=0)
    status = models.CharField(
        max_length=20, choices=GAME_STATUS_CHOICES, default='started')
    players_connected = models.BooleanField(default=False)

    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(blank=True, null=True)

    objects = GameManager()

    def save(self, *args, **kwargs):
        if not self.id:
            super().save(*args, **kwargs)
            self.game_id = f"game_{self.id}"
            super().save(update_fields=["game_id"])
        else:
            super().save(*args, **kwargs)

    def start_game(self):
        self.game_status = 'started'
        self.save()

    def end_game(self, winner, p1_score, p2_score):
        self.winner = self.player1 if winner == 1 else self.player2
        p1_xp = 0
        p2_xp = 0
        if self.winner == self.player1:
            p1_xp = WIN_SCORE + p1_score - p2_score
            if self.player1.profile.badge.xp_reward > self.player2.profile.badge.xp_reward:
                p1_xp += self.player1.profile.badge.xp_reward * 2
            else:
                p1_xp += self.player1.profile.badge.xp_reward
            p2_xp = p2_score
            if self.player1.profile.badge.xp_reward > self.player2.profile.badge.xp_reward:
                p2_xp -= self.player1.profile.badge.xp_reward * 2
        elif self.winner == self.player2:
            p2_xp = WIN_SCORE + p2_score - p1_score
            if self.player2.profile.badge.xp_reward > self.player1.profile.badge.xp_reward:
                p2_xp += self.player2.profile.badge.xp_reward * 2
            else:
                p2_xp += self.player2.profile.badge.xp_reward
            p1_xp += p1_score
            if self.player2.profile.badge.xp_reward > self.player1.profile.badge.xp_reward:
                p1_xp -= self.player2.profile.badge.xp_reward * 2
        self.p1_score = p1_score
        self.p2_score = p2_score
        self.p1_xp = p1_xp
        self.p2_xp = p2_xp
        self.status = 'ended'
        self.end_time = timezone.now()
        self.save()

    def update_stats(self):
        # from accounts.utils import translate_text

        # for player in [self.player1, self.player2]:
        #     # Initialize stats
        #     if 'wins' not in player.profile.stats:
        #         player.profile.stats['wins'] = 0
        #     if 'losses' not in player.profile.stats:
        #         player.profile.stats['losses'] = 0
        #     if 'games_played' not in player.profile.stats:
        #         player.profile.stats['games_played'] = 0
        #     if 'highest_score' not in player.profile.stats:
        #         player.profile.stats['highest_score'] = 0
        #     if 'best_rank' not in player.profile.stats:
        #         player.profile.stats['best_rank'] = player.profile.rank
        #     player.save()

        self.player1.profile.stats['games_played'] += 1
        self.player2.profile.stats['games_played'] += 1

        self.player1.profile.played_games += 1
        self.player2.profile.played_games += 1

        if self.winner == self.player1:
            self.player1.profile.stats['wins'] += 1
            self.player2.profile.stats['losses'] += 1
            self.player1.profile.stats['win_track'] += 1
            self.player2.profile.stats['win_track'] = 0
            if self.player1.profile.stats['win_track'] > self.player1.profile.stats['win_streak']:
                self.player1.profile.stats['win_streak'] = self.player1.profile.stats['win_track']
            # mahdi added these lines
            self.player1.profile.wins += 1
            self.player2.profile.losses += 1

            # self.player1.profile.score += WIN_SCORE + self.p1_score - self.p2_score
            # if self.player1.profile.badge.xp_reward > self.player2.profile.badge.xp_reward:
            #     self.player1.profile.score += self.player1.profile.badge.xp_reward * 2
            # else:
            #     self.player1.profile.score += self.player1.profile.badge.xp_reward
            # self.player2.profile.score += self.p2_score
            # if self.player1.profile.badge.xp_reward > self.player2.profile.badge.xp_reward:
            #     self.player2.profile.score -= self.player1.profile.badge.xp_reward * 2
            # ----------------------------
        elif self.winner == self.player2:
            self.player2.profile.stats['wins'] += 1
            self.player1.profile.stats['losses'] += 1
            self.player2.profile.stats['win_track'] += 1
            self.player1.profile.stats['win_track'] = 0
            if self.player2.profile.stats['win_track'] > self.player2.profile.stats['win_streak']:
                self.player2.profile.stats['win_streak'] = self.player2.profile.stats['win_track']
            # mahdi added these lines
            self.player2.profile.wins += 1
            self.player1.profile.losses += 1
            # self.player2.profile.score += WIN_SCORE + self.p2_score - self.p1_score
            # if self.player2.profile.badge.xp_reward > self.player1.profile.badge.xp_reward:
            #     self.player2.profile.score += self.player2.profile.badge.xp_reward * 2
            # else:
            #     self.player2.profile.score += self.player2.profile.badge.xp_reward
            # self.player1.profile.score += self.p1_score
            # if self.player2.profile.badge.xp_reward > self.player1.profile.badge.xp_reward:
            #     self.player1.profile.score -= self.player2.profile.badge.xp_reward * 2
            # ----------------------------
        self.player1.profile.score += self.p1_xp
        self.player2.profile.score += self.p2_xp
        if self.player1.profile.score > self.player1.profile.stats['highest_score']:
            self.player1.profile.stats['highest_score'] = self.player1.profile.score
        if self.player2.profile.score > self.player2.profile.stats['highest_score']:
            self.player2.profile.stats['highest_score'] = self.player2.profile.score
        # update level
        self.player1.profile.level = self.player1.profile.score / 100
        self.player2.profile.level = self.player2.profile.score / 100
        # update badge
        badge = Badge.get_badge(self.player1.profile.level)
        if badge and (not self.player1.profile.badge or self.player1.profile.badge.name != badge.name):
            self.player1.profile.badge = badge
        badge = Badge.get_badge(self.player2.profile.level)
        if badge and (not self.player2.profile.badge or self.player2.profile.badge.name != badge.name):
            self.player2.profile.badge = badge

        current_day = self.end_time.strftime('%a')
        duration = (self.end_time -
                    self.start_time).total_seconds() / 3600.0

        for player in [self.player1, self.player2]:
            stats = player.profile.stats.get('performanceData', [])
            day_found = False

            for entry in stats:
                if current_day in entry:
                    entry[current_day] += duration
                    day_found = True
                    break

            if not day_found:
                stats.append({current_day: duration})

            player.profile.stats["performanceData"] = stats
            # player.profile.save()
        # print(f'''-----> player1 = {self.player1.username} - score = {self.player1.profile.score} - level = {self.player1.profile.level} - badge = {self.player1.profile.badge.name} - rank = {self.player1.profile.rank} - played_games = {self.player1.profile.played_games} - wins = {self.player1.profile.wins} - losses = {self.player1.profile.losses}''')
        # print(f'''-----> player2 = {self.player2.username} - score = {self.player2.profile.score} - level = {self.player2.profile.level} - badge = {self.player2.profile.badge.name} - rank = {self.player2.profile.rank} - played_games = {self.player2.profile.played_games} - wins = {self.player2.profile.wins} - losses = {self.player2.profile.losses}''')
        self.player1.profile.save()
        self.player2.profile.save()
        # self.player1.save()
        # self.player2.save()
        # update ranks
        profiles = list(Profile.objects.all().order_by(
            '-score', '-wins', '-played_games'))
        for rank, profile in enumerate(profiles, 1):
            profile.rank = rank
            if rank < profile.stats.get('best_rank'):
                profile.stats['best_rank'] = rank
        Profile.objects.bulk_update(profiles, ['rank', 'stats'])

        # update my not still not saved
        # print(f"----->befor player: {self.player1.username} - rank: {self.player1.profile.rank} - best_rank: {self.player1.profile.stats['best_rank']}")
        # if self.player1.profile.rank < self.player1.profile.stats['best_rank']:
        #     print(f"----->player: {self.player1.username} - new_best_rank: {self.player1.profile.rank} - old_best_rank: {self.player1.profile.stats['best_rank']}")
        #     self.player1.profile.stats['best_rank'] = self.player1.profile.rank
        #     self.player1.profile.save()
        # if self.player2.profile.rank < self.player2.profile.stats['best_rank']:
        #     print(f"----->player: {self.player2.username} - new_best_rank: {self.player2.profile.rank} - old_best_rank: {self.player2.profile.stats['best_rank']}")
        #     self.player2.profile.stats['best_rank'] = self.player2.profile.rank
        #     self.player2.profile.save()

        achievement = Achievement.objects.get(condition__has_key="play_time")

        p1_achievement, created = UserAchievement.objects.get_or_create(
            user=self.player1, achievement=achievement)
        p2_achievement, created = UserAchievement.objects.get_or_create(
            user=self.player2, achievement=achievement)

        if not p1_achievement.is_unlocked:
            if duration * 3600 > achievement.condition["play_time"]:
                p1_achievement.progress["play_time"] = p1_achievement.progress.get(
                    "play_time", 0) + 300
                p1_achievement.is_unlocked = True
                p1_achievement.user.profile.score += achievement.reward_points
                p1_achievement.save()

        if not p2_achievement.is_unlocked:
            if duration * 3600 > achievement.condition["play_time"]:
                p2_achievement.progress["play_time"] = p2_achievement.progress.get(
                    "play_time", 0) + duration * 3600
                p2_achievement.is_unlocked = True
                p2_achievement.user.profile.score += achievement.reward_points
                p2_achievement.save()
