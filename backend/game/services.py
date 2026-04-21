# from .models import Tournament
# import datetime
# from .models import Game  # Assuming Game model exists
# from django.contrib.auth import get_user_model
# import json

# # modify the stats as if you were working with a normal Python dictionary
# # and then save the user instance to commit the changes.


# def game_result_to_user_stats(self, player_id, is_winner, p2_wins, score):
#     try:
#         User = get_user_model()
#         user = User.objects.get(id=player_id)
#         stats = json.loads(user.stats) if user.stats else {}

#         stats['games_played'] = stats.get('games_played', 0) + 1
#         if is_winner:
#             stats['games_won'] = stats.get('games_won', 0) + 1
#         else:
#             stats['games_lost'] = stats.get('games_lost', 0) + 1
#         if score:
#             stats['score'] = stats.get('score', 0) + score

#         user.stats = json.dumps(stats)
#         user.save()
#     except Exception as e:
#         print(f'game_result_to_user_stats: {e}')


# def add_game(self, player1_id, player2_id, winner_id, p1_wins, p2_wins):
#     Game.objects.create(
#         player1_id=player1_id,
#         player2_id=player2_id,
#         winner_id=winner_id,
#         p1_wins=p1_wins,
#         p2_wins=p2_wins,
#         date=datetime.now()
#     )


# def delete_tournament(self, tournament_id):
#     Tournament.objects.filter(id=tournament_id).delete()


# def delete_all_tournaments(self):
#     Tournament.objects.all().delete()


# def change_tournament_status(self, tournament_id, status):
#     Tournament.objects.filter(id=tournament_id).update(status=status)


# def get_display_names(self, player_ids):
#     User = get_user_model()
#     users = User.objects.filter(id__in=player_ids).values('id', 'display_name')
#     return {user['id']: user['display_name'] for user in users}


# def get_display_name(self, player_id):
#     User = get_user_model()
#     user = User.objects.filter(id=player_id).values('display_name').first()
#     return user['display_name'] if user else None


# def add_player_to_tournament(self, tournament_id, player_id):
#     tournament = Tournament.objects.get(id=tournament_id)
#     player = get_user_model().objects.get(id=player_id)
#     tournament.players.add(player)


# def delete_player_from_tournament(self, tournament_id, player_id):
#     tournament = Tournament.objects.get(id=tournament_id)
#     player = get_user_model().objects.get(id=player_id)
#     tournament.players.remove(player)
