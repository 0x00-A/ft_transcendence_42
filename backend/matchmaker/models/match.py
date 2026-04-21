from django.utils import timezone
from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


class Match(models.Model):
    GAME_STATUS_CHOICES = [
        ('waiting', 'Game Waiting'),
        ('started', 'Game started'),
        ('ended', 'Game ended'),
        ('aborted', 'Game aborted'),
    ]
    player1 = models.ForeignKey(
        User, related_name='matches_as_player1', on_delete=models.CASCADE)
    player2 = models.ForeignKey(
        User, related_name='matches_as_player2', on_delete=models.CASCADE)
    match_id = models.CharField(
        max_length=100, unique=True, blank=True, null=True)
    tournament = models.ForeignKey(
        'Tournament', on_delete=models.CASCADE, related_name='matches', null=True)
    winner = models.ForeignKey(
        User, related_name='matches_as_winner', on_delete=models.CASCADE, null=True)
    p1_score = models.IntegerField(default=0)
    p2_score = models.IntegerField(default=0)
    status = models.CharField(
        max_length=20, choices=GAME_STATUS_CHOICES, default='waiting')
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(blank=True, null=True)
    player1_ready = models.BooleanField(default=False)
    player2_ready = models.BooleanField(default=False)
    players_connected = models.BooleanField(default=False)

    def ready(self):
        return self.player1_ready and self.player2_ready

    def save(self, *args, **kwargs):
        if not self.id:
            super().save(*args, **kwargs)
            self.match_id = f"match_{self.id}"
            super().save(update_fields=["match_id"])
        else:
            super().save(*args, **kwargs)

    def end_match(self, winner, p1_score, p2_score):

        self.winner = self.player1 if winner == 1 else self.player2
        self.p1_score = p1_score
        self.p2_score = p2_score
        self.status = 'ended'
        self.end_time = timezone.now()
        self.save()
