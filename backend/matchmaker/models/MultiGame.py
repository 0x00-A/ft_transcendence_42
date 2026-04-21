from django.utils import timezone
from django.db import models
from accounts.models import User

# User = get_user_model()


class MultiGameManager(models.Manager):
    def create_game(self, player1, player2, player3, player4):
        game = self.create(
            player1=player1,
            player2=player2,
            player3=player3,
            player4=player4,
        )
        return game

    def get_active_games(self):
        return self.filter(game_status='started')

    def get_completed_games(self):
        return self.filter(game_status='ended')


class MultiGame(models.Model):
    GAME_STATUS_CHOICES = [
        # ('waiting', 'Game waiting'),
        ('started', 'Game started'),
        ('ended', 'Game ended'),
    ]
    game_id = models.CharField(
        max_length=100, unique=True, blank=True, null=True)
    player1 = models.ForeignKey(
        User, related_name='multi_games_as_player1', on_delete=models.CASCADE)
    player2 = models.ForeignKey(
        User, related_name='multi_games_as_player2', on_delete=models.CASCADE)
    player3 = models.ForeignKey(
        User, related_name='multi_games_as_player3', on_delete=models.CASCADE)
    player4 = models.ForeignKey(
        User, related_name='multi_games_as_player4', on_delete=models.CASCADE)
    winner = models.ForeignKey(
        User, related_name='multi_games_as_winner', on_delete=models.CASCADE, null=True)
    p1_score = models.IntegerField(default=0)
    p2_score = models.IntegerField(default=0)
    p3_score = models.IntegerField(default=0)
    p4_score = models.IntegerField(default=0)
    status = models.CharField(
        max_length=20, choices=GAME_STATUS_CHOICES, default='started')
    players_connected = models.BooleanField(default=False)

    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(blank=True, null=True)

    objects = MultiGameManager()

    def save(self, *args, **kwargs):
        if not self.id:
            super().save(*args, **kwargs)
            self.game_id = f"multi_game_{self.id}"
            super().save(update_fields=["game_id"])
        else:
            super().save(*args, **kwargs)

    def start_game(self):
        self.game_status = 'started'
        self.save()

    def end_game(self, winner, p1_score, p2_score, p3_score, p4_score):

        self.winner = self.player1 if winner == 1 else self.player2 if winner == 2 \
            else self.player3 if winner == 3 else self.player4
        self.p1_score = p1_score
        self.p2_score = p2_score
        self.p3_score = p3_score
        self.p4_score = p4_score
        self.status = 'ended'
        self.end_time = timezone.now()
        self.save()

    def update_stats(self):

        for player in [self.player1, self.player2, self.player3, self.player4]:
            # initialize stats
            if 'wins' not in player.profile.stats:
                player.profile.stats['wins'] = 0
            if 'losses' not in player.profile.stats:
                player.profile.stats['losses'] = 0
            if 'games_played' not in player.profile.stats:
                player.profile.stats['games_played'] = 0
            player.save()

        self.player1.profile.stats['games_played'] += 1
        self.player2.profile.stats['games_played'] += 1
        self.player3.profile.stats['games_played'] += 1
        self.player4.profile.stats['games_played'] += 1

        if self.winner == self.player1:
            self.player1.profile.stats['wins'] += 1
            self.player2.profile.stats['losses'] += 1
            self.player3.profile.stats['losses'] += 1
            self.player4.profile.stats['losses'] += 1
        elif self.winner == self.player2:
            self.player2.profile.stats['wins'] += 1
            self.player1.profile.stats['losses'] += 1
            self.player3.profile.stats['losses'] += 1
            self.player4.profile.stats['losses'] += 1
        elif self.winner == self.player3:
            self.player3.profile.stats['wins'] += 1
            self.player1.profile.stats['losses'] += 1
            self.player2.profile.stats['losses'] += 1
            self.player4.profile.stats['losses'] += 1
        elif self.winner == self.player4:
            self.player4.profile.stats['wins'] += 1
            self.player1.profile.stats['losses'] += 1
            self.player2.profile.stats['losses'] += 1
            self.player3.profile.stats['losses'] += 1

        current_day = self.end_time.strftime('%a')
        duration = (self.end_time -
                    self.start_time).total_seconds() / 3600.0
        for player in [self.player1, self.player2, self.player3, self.player4]:
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

        self.player1.save()
        self.player2.save()
        self.player3.save()
        self.player4.save()
