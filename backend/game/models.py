# from django.contrib.auth import get_user_model
# from django.db import models

# User = get_user_model()

# #
# # to add in User model
# # stats = models.JSONField(default=dict, blank=True)
# #


# class Game(models.Model):
#     player1 = models.ForeignKey(
#         User, related_name='games_as_player1', on_delete=models.CASCADE)
#     player2 = models.ForeignKey(
#         User, related_name='games_as_player2', on_delete=models.CASCADE)
#     winner = models.ForeignKey(
#         User, related_name='games_as_winner', on_delete=models.CASCADE, null=True)
#     p1_wins = models.IntegerField(default=0)
#     p2_wins = models.IntegerField(default=0)
#     date = models.DateTimeField()


# class TournamentManager(models.Manager):
#     def active_tournaments(self):
#         return self.filter(status='active')


# class Tournament(models.Model):
#     creator = models.ForeignKey(User, on_delete=models.CASCADE)
#     name = models.CharField(max_length=100)
#     number_of_players = models.IntegerField()
#     start_time = models.DateTimeField()
#     status = models.CharField(max_length=20)
#     winner = models.ForeignKey(
#         User, related_name='won_tournaments', on_delete=models.CASCADE, null=True)
#     players = models.ManyToManyField(User, related_name='tournaments')

#     objects = TournamentManager()


# class GlobalData(models.Model):
#     game_id_counter = models.IntegerField(default=0)

#     def increment_game_id_counter(self):
#         self.game_id_counter += 1
#         self.save()

#     @classmethod
#     def get_global_data(cls):
#         # Ensures there is always a GlobalData object in the database
#         global_data, created = cls.objects.get_or_create(id=1)
#         return global_data
