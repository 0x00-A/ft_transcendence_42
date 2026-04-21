from accounts.models import User, Notification
from accounts.models import Profile, User
from accounts.utils.translate_text import translate_text
from .models import Game, Tournament, Match, MultiGame
from asgiref.sync import sync_to_async
import asyncio


from django.db.models import Q


class Matchmaker:

    connected_clients = {}
    # connected_clients = defaultdict(set)
    games_queue = []
    multi_games_queue = []

    @classmethod
    async def register_client(cls, player_id, consumer):
        cls.connected_clients[player_id] = consumer
        # cls.connected_clients[player_id].add(channel_name)
        # cls.connected_clients[player_id].add(channel_name)

    @classmethod
    async def unregister_client(cls, player_id):
        if player_id in cls.connected_clients:
            del cls.connected_clients[player_id]
            # cls.connected_clients[player_id].remove(channel_name)
            # if not cls.connected_clients[player_id]:
            #     del cls.connected_clients[player_id]
        if player_id in cls.games_queue:
            cls.games_queue.remove(player_id)
        if player_id in cls.multi_games_queue:
            cls.multi_games_queue.remove(player_id)

    @classmethod
    async def request_remote_game(cls, player_id):
        if await cls.is_client_already_playing(player_id):
            return
        cls.games_queue.append(player_id)
        message = {
            'event': 'in_queue'
        }
        await cls.send_message_to_client(player_id, message)
        players = await cls.find_two_players()
        if players:
            await cls.create_remote_game(*players)

    @classmethod
    async def request_multi_game(cls, player_id):
        if await cls.is_client_already_playing(player_id):
            return
        cls.multi_games_queue.append(player_id)
        message = {
            'event': 'in_queue'
        }
        await cls.send_message_to_client(player_id, message)
        players = await cls.find_four_players()
        if players:
            await cls.create_multi_game(*players)

    @classmethod
    async def remove_from_queue(cls, player_id):
        if player_id in cls.games_queue:
            cls.games_queue.remove(player_id)
        if player_id in cls.multi_games_queue:
            cls.multi_games_queue.remove(player_id)

    @classmethod
    async def create_remote_game(cls, player1_id, player2_id):
        # print(f"creating game... p1: {player1_id} | p2: {player2_id}")
        p1 = await User.objects.aget(id=player1_id)
        p2 = await User.objects.aget(id=player2_id)
        game = await Game.objects.acreate(
            player1=p1, player2=p2
        )
        game_address = f"game/game_{game.id}"
        message = {
            'event': 'game_address',
            'message': 'Game successfully created',
            'game_address': game_address,
            'player1_id': game.player1.id,
            'player2_id': game.player2.id,
        }
        await cls.send_message_to_client(player1_id, message)
        await cls.send_message_to_client(player2_id, message)
        # await asyncio.gather(
        #     cls.send_message_to_client(player1_id, message),
        #     cls.send_message_to_client(player2_id, message)
        # )

    @classmethod
    async def create_multi_game(cls, player1_id, player2_id, player3_id, player4_id):
        print(
            f"creating multi game... p1: {player1_id} | p2: {player2_id} | p3: {player3_id} | p4: {player4_id}")
        p1 = await User.objects.aget(id=player1_id)
        p2 = await User.objects.aget(id=player2_id)
        p3 = await User.objects.aget(id=player3_id)
        p4 = await User.objects.aget(id=player4_id)
        game = await MultiGame.objects.acreate(
            player1=p1, player2=p2, player3=p3, player4=p4
        )
        game_address = f"multigame/multi_game_{game.id}"
        message = {
            'event': 'multigame_address',
            'message': 'Game successfully created',
            'game_address': game_address,
        }
        # await cls.send_message_to_client(player1_id, message)
        # await cls.send_message_to_client(player2_id, message)
        # await cls.send_message_to_client(player3_id, message)
        # await cls.send_message_to_client(player4_id, message)
        await asyncio.gather(
            cls.send_message_to_client(player1_id, message),
            cls.send_message_to_client(player2_id, message),
            cls.send_message_to_client(player3_id, message),
            cls.send_message_to_client(player4_id, message)
        )

    @classmethod
    async def create_tournament(cls, creator_id, tournament_name):
        # Create a tournament, check for limits, and notify the creator
        # if await sync_to_async(Tournament.objects.count)() >= 100:
        #     message = {'event': 'error',
        #                'message': 'Maximum tournaments reached'}
        #     await cls.send_message_to_client(creator_id, message)
        #     return
        if await Tournament.objects.filter(players__id=creator_id).exclude(status='ended').exclude(status='aborted').aexists():
            message = {'event': 'error',
                       'message': 'You can\'t create a new tournament until your current tournament ends.'}
            await cls.send_message_to_client(creator_id, message)
            return

        new_tournament = await Tournament.objects.acreate(
            creator_id=creator_id, name=tournament_name
        )
        user = await User.objects.aget(id=creator_id)
        await new_tournament.players.aadd(user)
        await new_tournament.asave()
        message = {
            'event': 'success',
            'message': f'Tournament {new_tournament.name} created',
            # 'tournament_id': new_tournament.id,
            # 'tournament_stat': await sync_to_async(new_tournament.to_presentation)(),
        }
        await cls.send_message_to_client(creator_id, message)

    @classmethod
    async def join_tournament(cls, player_id, tournament_id):
        if await Tournament.objects.filter(players__id=player_id).exclude(status='ended').exclude(status='aborted').aexists():
            if await Tournament.objects.filter(id=tournament_id, players__id=player_id).exclude(status='ended').aexists():
                message = {'event': 'error',
                           'message': 'Already in tournament'}
                await cls.send_message_to_client(player_id, message)
            else:
                message = {'event': 'error',
                           'message': 'Cannot join more tournaments until your current tournament ends'}
                await cls.send_message_to_client(player_id, message)
            return
        try:
            tournament = await Tournament.objects.aget(id=tournament_id)
            if await sync_to_async(tournament.check_if_full)():
                message = {'event': 'error',
                           'message': 'Tournament is full'}
                await cls.send_message_to_client(player_id, message)
            else:
                await tournament.players.aadd(player_id)
                message = {'event': 'success',
                           'message': f'Joined tournament {tournament.name} successfully',
                           #    'tournament_id': tournament_id,
                           #    'tournament_stat': await sync_to_async(tournament.to_presentation)(),
                           }
                await cls.send_message_to_client(player_id, message)
                message = {'event': 'tournament_update',
                           'tournament_id': tournament_id,
                           'tournament_stat': await sync_to_async(tournament.to_presentation)(),
                           }
                players = await sync_to_async(list)(tournament.players.all())
                for p in players:
                    await cls.send_message_to_client(p.id, message)
                await sync_to_async(tournament.check_if_full)()
                if await sync_to_async(tournament.start_tournament)():
                    message = {'event': 'tournament_update',
                               'tournament_id': tournament_id,
                               'tournament_stat': await sync_to_async(tournament.to_presentation)(),
                               }
                    players = await sync_to_async(list)(tournament.players.all())
                    for p in players:
                        await cls.send_message_to_client(p.id, message)

        except Tournament.DoesNotExist:
            await cls.send_message_to_client(player_id, {'error': 'Tournament does not exist'})

    @classmethod
    async def leave_tournament(cls, player_id):
        from accounts.consumers import NotificationConsumer

        if await Tournament.objects.filter(players__id=player_id).exclude(status='ended').exclude(status='aborted').aexists():
            try:
                tournament = await Tournament.objects.aget(Q(status='waiting') | Q(status='ongoing'), players__id=player_id, )
                if tournament.status == 'waiting' \
                    or (tournament.status == 'ongoing'
                        and (not await Match.objects.filter(Q(player1__id=player_id) | Q(player2__id=player_id), status='waiting').aexists()
                             and not await Match.objects.filter(winner__id=player_id, tournament=tournament).aexists())):
                    await tournament.players.aremove(player_id)
                    await tournament.asave()
                    message = {'event': 'tournament_update',
                               'tournament_id': tournament.id,
                               'tournament_stat': await sync_to_async(tournament.to_presentation)(),
                               }
                    await cls.send_message_to_client(player_id, message)
                    players = await sync_to_async(list)(tournament.players.all())
                    for p in players:
                        await cls.send_message_to_client(p.id, message)
                elif tournament.status == 'ongoing':
                    await sync_to_async(tournament.abort_tournament)()
                    await Match.objects.filter(tournament=tournament).adelete()
                    message = {'event': 'tournament_update',
                               'tournament_id': tournament.id,
                               'tournament_stat': await sync_to_async(tournament.to_presentation)(),
                               }

                    players = await sync_to_async(list)(tournament.players.all())
                    for p in players:
                        await cls.send_message_to_client(p.id, message)
                        profile = await sync_to_async(lambda: p.profile)()
                        target_language = await sync_to_async(lambda: profile.preferred_language if profile else 'en')()
                        try:
                            translated_message = await sync_to_async(translate_text)(f"Tournament {tournament.name} aborted because a player left!", target_language)
                            translated_title = await sync_to_async(translate_text)("Tournament Aborted", target_language)
                        except Exception as e:
                            translated_message = f"Tournament {
                                tournament.name} aborted because a player left!"
                            translated_title = "Tournament Aborted"
                        notification = await Notification.objects.acreate(
                            user=p, title=translated_title, message=translated_message)
                        await notification.asave()
                        await sync_to_async(NotificationConsumer.send_notification_to_user)(
                            p.id, notification)
            except Tournament.DoesNotExist:
                await cls.send_message_to_client(player_id, {'event': 'error', 'message': 'Tournament does not exist'})
        else:
            await cls.send_message_to_client(player_id, {'event': 'error', 'message': 'You are not in tournament'})

    @classmethod
    async def send_message_to_client(cls, player_id, message):
        # await asyncio.sleep(0.1)
        # channel_layer = get_channel_layer()
        consumer = cls.connected_clients.get(player_id)
        if consumer:
            # channel_name = consumer.channel_name
            # Retrieve the user's preferred language
            try:
                user = await User.objects.aget(id=player_id)
                target_language = await sync_to_async(lambda: user.profile.preferred_language or 'en')()
            except Exception:
                target_language = 'en'

            if isinstance(message, dict) and 'message' in message:
                try:
                    message_text = message['message']
                    message['message'] = await sync_to_async(translate_text)(message_text, target_language)
                except Exception as e:
                    print(f"Translation failed: {e}")

            await consumer.send_message(message)
            # for channel in cls.connected_clients.get(player_id, []):
            # await channel_layer.send(
            #     channel_name,
            #     {
            #         "type": "user.message",
            #         "message": message,
            #     }
            # )
            # await send_message_to_channel(channel, message)
        else:
            print("MatchmakerConsumer: User is not connected.")

    @classmethod
    async def is_client_already_playing(cls, player_id):
        if player_id in cls.games_queue or player_id in cls.multi_games_queue:
            message = {
                'event': 'error',
                'message': 'Already in queue!'
            }
            await cls.send_message_to_client(player_id, message)
            return True

        if await Game.objects.filter(
            (Q(player1=player_id) | Q(player2=player_id)) & Q(
                status="started") & Q(players_connected=True)
        ).aexists() or await MultiGame.objects.filter(
            (Q(player1=player_id) | Q(player2=player_id) | Q(player3=player_id) | Q(player4=player_id)) & Q(
                status="started") & Q(players_connected=True)
        ).aexists():
            message = {
                'event': 'error',
                'message': 'Already in a game!'

            }
            await cls.send_message_to_client(player_id, message)
            return True
        return False

    # @classmethod
    # async def check_is_player_in_any_tournament(cls, player_id):
    #     if await Tournament.objects.filter(players__id=player_id).exclude(status='ended').aexists():
    #         tournament = await sync_to_async(Tournament.objects.exclude(status='ended').get)(
    #             players__id=player_id
    #         )
    #         message = {
    #             'event': 'already_in_tournament',
    #             'tournament_id': tournament.id,
    #             'tournament_stat': await sync_to_async(tournament.to_presentation)(),
    #         }
    #         await cls.send_message_to_client(player_id, message)

    #         try:
    #             match = await sync_to_async(Match.objects.get)(
    #                 (Q(player1_id=player_id) | Q(
    #                     player2_id=player_id)) & ~Q(status='ended')
    #             )
    #             if match.player1_id == player_id and match.player2_ready:
    #                 # match.player1_ready = False
    #                 message = {
    #                     'event': 'opponent_ready',
    #                     "message": "Your oponent is ready!",
    #                 }
    #                 await cls.(match.player1_id, message)
    #             elif match.player2_id == player_id and match.player1_ready:
    #                 match.player2_ready = False
    #                 message = {
    #                     'event': 'opponent_ready',
    #                     "message": "Your oponent is ready!",
    #                 }
    #                 await cls.send_message_to_client(match.player2_id, message)

    #             await sync_to_async(match.save)()
    #         except Match.DoesNotExist:
    #             return None

    @classmethod
    async def find_two_players(cls):
        if len(cls.games_queue) >= 2:
            player1 = cls.games_queue.pop(0)
            player2 = cls.games_queue.pop(0)
            return (player1, player2)
        return None

    @classmethod
    async def find_four_players(cls):
        if len(cls.multi_games_queue) >= 4:
            player1 = cls.multi_games_queue.pop(0)
            player2 = cls.multi_games_queue.pop(0)
            player3 = cls.multi_games_queue.pop(0)
            player4 = cls.multi_games_queue.pop(0)
            return (player1, player2, player3, player4)
        return None

    @classmethod
    async def process_result(cls, game_id, winner, p1_score, p2_score):
        if await Game.objects.filter(game_id=game_id).aexists():
            await cls.process_game_result(game_id, winner, p1_score, p2_score)
            return
        if await Match.objects.filter(match_id=game_id).aexists():
            await cls.process_tournament_match(game_id, winner, p1_score, p2_score)
            return

        # print(f"Game ID {game_id} not found.")

    @classmethod
    async def process_game_result(cls, game_id, winner, p1_score, p2_score):
        game = await Game.objects.aget(game_id=game_id)

        await sync_to_async(game.end_game)(winner, p1_score, p2_score)
        await sync_to_async(game.update_stats)()

    @classmethod
    async def process_multi_game_result(cls, game_id, winner, p1_score, p2_score, p3_score, p4_score):
        game = await MultiGame.objects.aget(game_id=game_id)

        await sync_to_async(game.end_game)(winner, p1_score, p2_score, p3_score, p4_score)
        await sync_to_async(game.update_stats)()

    @classmethod
    async def process_tournament_match(cls, match_id, winner, p1_score, p2_score):
        match = await Match.objects.aget(match_id=match_id)

        await sync_to_async(match.end_match)(winner, p1_score, p2_score)

        tournament = await sync_to_async(lambda: match.tournament)()
        if not await tournament.matches.filter(status='waiting').aexists():
            completed_count = await sync_to_async(tournament.matches.filter(status='ended').count)()
            if completed_count == tournament.number_of_players // 2:
                await sync_to_async(tournament.progress_to_next_round)()
            elif completed_count == tournament.number_of_players - 1:
                await sync_to_async(tournament.finalize_tournament)()

        message = {'event': 'tournament_update',
                   'tournament_id': match.tournament.id,
                   'tournament_stat': await sync_to_async(tournament.to_presentation)(),
                   }
        players = await sync_to_async(list)(tournament.players.all())
        for player in players:
            await cls.send_message_to_client(player.id, message)

    @classmethod
    async def handle_player_unready(cls, player_id):
        from accounts.consumers import NotificationConsumer
        try:
            match = await sync_to_async(Match.objects.get)(
                (Q(player1_id=player_id) | Q(
                    player2_id=player_id)) & Q(status='waiting')
            )
            if match.player1_id == player_id and match.player1_ready:
                match.player1_ready = False
                message = {
                    'event': 'opponent_unready',
                    "message": "Your oponent is not ready!",
                }
                await sync_to_async(NotificationConsumer.send_notification_to_user)(match.player2_id, message)
                await cls.send_message_to_client(match.player2_id, message)
            elif match.player2_id == player_id and match.player2_ready:
                match.player2_ready = False
                message = {
                    'event': 'opponent_unready',
                    "message": "Your oponent is not ready!",
                }
                await sync_to_async(NotificationConsumer.send_notification_to_user)(match.player1_id, message)
                await cls.send_message_to_client(match.player1_id, message)

            await sync_to_async(match.save)()
        except Match.DoesNotExist:
            return None

    @classmethod
    async def handle_player_ready(cls, player_id, match_id):
        from accounts.consumers import NotificationConsumer
        # match = await Match.objects.aget(match_id=match_id)
        # tournament = await sync_to_async(lambda: match.tournament)()
        match = await sync_to_async(
            lambda: Match.objects.filter(
                Q(player1__id=player_id) | Q(player2__id=player_id),
                status='waiting'
            ).first()
        )()

        if not match:
            print(f"\033[033mMatch does not exist\033[0m")
            return
        if match.player1_id == player_id:
            match.player1_ready = True
            message = {
                'event': 'opponent_ready',
                "message": "Your oponent is ready!",
            }
            await sync_to_async(NotificationConsumer.send_notification_to_user)(match.player2_id, message)
            await cls.send_message_to_client(match.player2_id, message)
        elif match.player2_id == player_id:
            match.player2_ready = True
            message = {
                'event': 'opponent_ready',
                "message": "Your oponent is ready!",
            }
            await sync_to_async(NotificationConsumer.send_notification_to_user)(match.player1_id, message)
            await cls.send_message_to_client(match.player1_id, message)
        # message = {'event': 'tournament_update',
        #     'tournament_id': match.tournament.id,
        #     'tournament_stat': await sync_to_async(tournament.to_presentation)(),
        #     }
        # await cls.send_message_to_client(match.player1_id, message)
        # await cls.send_message_to_client(match.player2_id, message)

        await sync_to_async(match.save)()

        if match.ready():

            # move this to game_comsumer and add connected_players to match
            # match.status = 'started'
            # match.start_time = timezone.now()
            # await match.asave()

            match_address = f"game/match_{match.id}"

            message = {
                'event': 'match_start',
                'match_address': match_address,
                "message": "Match started!",
                'player1_id': match.player1_id,
                'player2_id': match.player2_id,
            }
            await asyncio.gather(
                cls.send_message_to_client(match.player1_id, message),
                cls.send_message_to_client(match.player2_id, message)
            )
            match.player1_ready = False
            match.player2_ready = False
            await sync_to_async(match.save)()

    @classmethod
    async def send_tournament_invite(cls, player_id, sender, to, tournament_id):
        from accounts.consumers import NotificationConsumer

        reciever = await User.objects.aget(username=to)
        if reciever:
            if await Tournament.objects.filter(Q(id=tournament_id) & Q(players__id=reciever.id)).aexists():
                await cls.send_message_to_client(player_id, {
                    'event': 'error',
                    'message': 'User already in tournament!'
                })
                return

            message = {
                "event": "tournament_invite",
                "from": sender,
                "tournamentId": tournament_id,
            }

            await sync_to_async(NotificationConsumer.send_notification_to_user)(reciever.id, message)
