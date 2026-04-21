from django.utils import timezone
from django.contrib.auth import get_user_model
from django.db import models
from matchmaker.models import Match
from django.shortcuts import get_object_or_404


User = get_user_model()


class TournamentManager(models.Manager):
    def active_tournaments(self):
        return self.filter(status='active')


class Tournament(models.Model):
    TOURNAMENT_STATUS_CHOICES = [
        ('waiting', 'Waiting for players'),
        ('ongoing', 'Ongoing'),
        ('ended', 'Ended'),
        ('aborted', 'Aborted'),
    ]

    creator = models.ForeignKey(
        User, related_name='created_tournaments', on_delete=models.CASCADE)

    name = models.CharField(max_length=100)
    number_of_players = models.IntegerField(default=4)
    created_at = models.DateTimeField(default=timezone.now)

    status = models.CharField(
        max_length=20, choices=TOURNAMENT_STATUS_CHOICES, default='waiting')
    winner = models.ForeignKey(
        User, related_name='won_tournaments', on_delete=models.CASCADE, null=True)
    players = models.ManyToManyField(User, related_name='tournaments')
    current_match_index = models.IntegerField(default=0)
    is_full = models.BooleanField(default=False)

    objects = TournamentManager()

    def check_if_full(self):
        if self.players.count() >= self.number_of_players:
            self.is_full = True
            self.save()
            return True
        return False

    def join_tournament(self, player):
        if self.players.count() < self.number_of_players:
            self.players.add(player)
            return True
        return False

    def start_tournament(self):
        if self.players.count() == self.max_players:
            self.status = 'ongoing'
            self.save()
            self.generate_matches()

    def end_tournament(self):
        self.status = 'ended'
        self.save()

    def abort_tournament(self):
        self.status = 'aborted'
        self.winner = None
        self.save()

    def to_presentation(self):
        # tournament = get_object_or_404(Tournament, id=self.)

        matches = Match.objects.filter(
            tournament=self).order_by('start_time')

        rounds = {"1": [], "2": []}

        for match in matches:
            if len(rounds["1"]) < 2:
                rounds["1"].append({
                    'match_id': match.match_id,
                    'player1': match.player1.username if match.player1 else None,
                    'player2': match.player2.username if match.player2 else None,
                    'p1_score': match.p1_score,
                    'p2_score': match.p2_score,
                    'status': match.status,
                    'winner': match.winner.username if match.winner else None,
                    'player1_ready': match.player1_ready,
                    'player2_ready': match.player2_ready,
                })
            else:
                rounds["2"].append({
                    'match_id': match.match_id,
                    'player1': match.player1.username if match.player1 else None,
                    'player2': match.player2.username if match.player2 else None,
                    'p1_score': match.p1_score,
                    'p2_score': match.p2_score,
                    'status': match.status,
                    'winner': match.winner.username if match.winner else None,
                    'player1_ready': match.player1_ready,
                    'player2_ready': match.player2_ready,
                })

        tournament_state = {
            'tournament_id': self.id,
            'name': self.name,
            'status': self.status,
            'created_at': self.created_at.strftime("%B %d, %Y %I:%M %p"),
            'players': [player.username for player in self.players.all()],
            'winner': self.winner.username if self.winner else None,
            'rounds': rounds
        }

        return tournament_state

    def generate_matches_for_tournament(self):
        players = list(self.players.all())

        if len(players) != self.number_of_players:
            raise ValueError(
                "Tournament must have exactly 4 players to start.")

        round1_match1 = Match.objects.create(
            tournament=self,
            player1=players[0],
            player2=players[1],
            status='waiting',
            start_time=timezone.now()
        )

        round1_match2 = Match.objects.create(
            tournament=self,
            player1=players[2],
            player2=players[3],
            status='waiting',
            start_time=timezone.now()
        )

        # matches = {
        #     "1": [round1_match1, round1_match2],
        #     "2": []
        # }

        # return matches

    def start_tournament(self):
        if not self.is_full:
            return False

        self.status = 'ongoing'
        self.save()

        self.generate_matches_for_tournament()

        return True

    def progress_to_next_round(self):
        round_1_matches = Match.objects.filter(
            tournament=self, status='ended')

        if round_1_matches.count() == 2:
            player1 = round_1_matches[0].winner
            player2 = round_1_matches[1].winner

            final_match = Match.objects.create(
                tournament=self,
                player1=player1,
                player2=player2,
                status='waiting',
                start_time=timezone.now()
            )
            return final_match
        elif round_1_matches.count() == 3:
            self.finalize_tournament()

    def finalize_tournament(self):
        final_match = Match.objects.filter(
            tournament=self, status='ended').order_by('-end_time').first()

        if final_match:
            self.winner = final_match.winner
            self.status = 'ended'
            self.save()
        else:
            raise ValueError("Final match is not completed yet.")

    def __str__(self):
        return f"Tournament {self.name} - Status: {self.status}"
