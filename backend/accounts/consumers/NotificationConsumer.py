import json
from channels.generic.websocket import AsyncWebsocketConsumer

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from accounts.models import User
from accounts.models import Notification
from accounts.utils.translate_text import translate_text
from matchmaker.models import Tournament
from matchmaker.models.game import Game
from matchmaker.matchmaker import Matchmaker
from django.db.models import Q
from accounts.models import Profile
from django.utils import timezone
from asgiref.sync import sync_to_async


connected_users = {}


class NotificationConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        user = self.scope['user']
        self.username = None
        if user.is_authenticated:
            await self.accept()
            self.username = user.username
            self.id = user.id
            await self.set_online_status(True)
            await self.set_active_conversation(-1)

            connected_users[self.username] = self.channel_name
        else:
            await self.close()

    async def set_online_status(self, is_online):
        if self.username:
            try:
                profile = await Profile.objects.aget(user__username=self.username)
                profile.is_online = is_online
                await profile.asave()
            except Profile.DoesNotExist:
                return

    async def set_active_conversation(self, value):
        if self.username:
            try:
                user = await User.objects.aget(username=self.username)
                user.objects_conversation = value
                await user.asave()
            except User.DoesNotExist:
                return

    async def set_last_seen(self):
        if self.username:
            try:
                user = await User.objects.aget(username=self.username)
                user.last_seen = timezone.now().strftime("%H:%M")
                await user.asave()
            except User.DoesNotExist:
                return

    async def receive(self, text_data):
        data = json.loads(text_data)
        event = data['event']
        if event == 'game_invite':
            await self.handle_invite(self.username, data.get('to'))
        if event == 'invite_accept':
            await self.handle_accept(data.get('from'), self.username)
        if event == 'invite_reject':
            await self.handle_reject(data.get('from'), self.username)
        if event == 'tournament_invite_accept':
            await self.handle_tournament_accept(data.get('tournamentId'), self.username)

    async def disconnect(self, close_code):
        if self.username in connected_users:
            del connected_users[self.username]
        await self.set_online_status(False)
        await self.set_last_seen()
        return await super().disconnect(close_code)

    async def handle_accept(self, sender, recipient):
        if sender not in connected_users:
            # print(f'sender not found ... {sender}')
            await self.send_message(recipient, {
                "event": "error",
                "message": f"{sender} is currently offline.",
            })
            return
        if await self.is_already_playing(sender):
            message = {
                'event': 'error',
                'message': f"{sender} is currently playing!"
            }
            await self.send_message(recipient, message)
            return
        if await self.is_already_playing(recipient):
            message = {
                'event': 'error',
                'message': f"You are already in a game!"
            }
            await self.send_message(recipient, message)
            return

        print(f"creating game... p1: {sender} | p2: {recipient}")
        # Store the game in your database (using Django ORM models)
        # User = get_user_model()
        p1 = await User.objects.aget(username=sender)
        p2 = await User.objects.aget(username=recipient)
        game = await Game.objects.acreate(
            player1=p1, player2=p2
        )
        game_address = f"game/game_{game.id}"
        message = {
            'event': 'game_address',
            'message': 'toast.gameAddress',
            'game_address': game_address,
            'p1_id': p1.id,
            'p2_id': p2.id,
        }
        await self.send_message(sender, message)
        await self.send_message(recipient, message)

    async def is_already_playing(self, sender):
        user_id = await self.get_user_id(sender)
        if user_id:
            if user_id in Matchmaker.games_queue:
                Matchmaker.games_queue.remove(user_id)
                return False
            if await Game.objects.filter(
                (Q(player1=user_id) | Q(player2=user_id)) & Q(
                    status="started") & Q(players_connected=True)
            ).aexists():
                return True
            return False

    async def handle_reject(self, sender, recipient):
        message = {
            "event": "invite_reject",
            "to": recipient,
            "message": f"toast.inviteReject",
        }
        await self.send_message(sender, message)

    async def handle_invite(self, sender, recipient):

        invite_message = {
            "event": "game_invite",
            "from": sender,
            "message": "recieved invite.",
        }

        if recipient in connected_users:
            # print(f'Recipient found sending invite...')
            if await self.is_already_playing(recipient):
                await self.send_message(sender, {
                    "event": "error",
                    "message": f"{recipient} is in a game!",
                })
            else:
                await self.send_message(recipient, invite_message)
        else:
            # print(f'Recipient not found ... {sender}')
            await self.send_message(sender, {
                "event": "error",
                "message": "The recipient is currently offline.",
            })

    async def handle_tournament_accept(self, tournament_id, invitee):
        from matchmaker.consumers import Matchmaker
        print(f"\033[33m{invitee} Accepted Tournament Invite")
        player = await User.objects.aget(username=invitee)

        if await Tournament.objects.filter(players__id=player.id).exclude(status='ended').exclude(status='aborted').aexists():
            if await Tournament.objects.filter(id=tournament_id, players__id=player.id).exclude(status='ended').aexists():
                await self.send_message(invitee, {'event': 'error',
                                                  'message': 'Already in tournament'})
            else:
                await self.send_message(invitee, {'event': 'error',
                                                  'message': 'Cannot join more tournaments until your current tournament ends'})
            return
        try:
            tournament = await Tournament.objects.aget(id=tournament_id)
            if await sync_to_async(tournament.check_if_full)():
                await self.send_message(invitee, {'event': 'error',
                                                  'message': 'Tournament is full'})
            else:
                await tournament.players.aadd(player.id)
                await self.send_message(invitee, {'event': 'success',
                                                  'message': f'Joined tournament {tournament.name} successfully',
                                                  })
                players = await sync_to_async(list)(tournament.players.all())
                for p in players:
                    await Matchmaker.send_message_to_client(p.id, {'event': 'tournament_update',
                                                                   'tournament_id': tournament_id,
                                                                   'tournament_stat': await sync_to_async(tournament.to_presentation)(),
                                                                   })
                await sync_to_async(tournament.check_if_full)()
                if await sync_to_async(tournament.start_tournament)():
                    message = {'event': 'tournament_update',
                               'tournament_id': tournament_id,
                               'tournament_stat': await sync_to_async(tournament.to_presentation)(),
                               }
                    players = await sync_to_async(list)(tournament.players.all())
                    for p in players:
                        await Matchmaker.send_message_to_client(p.id, message)

        except Tournament.DoesNotExist:
            await self.send_message(player.id, {'error': 'Tournament does not exist'})

    async def send_message(self, username, message):
        channel_layer = get_channel_layer()
        channel_name = connected_users.get(
            username)

        if channel_name:
            await channel_layer.send(
                channel_name,
                {
                    "type": "user.message",
                    "message": message,
                }
            )
        else:
            print("NotificationsConsumer: User is not connected.")

    @classmethod
    def send_notification_to_user(cls, user_id, message):
        username = cls.get_username(user_id)
        if username in connected_users:
            channel_layer = get_channel_layer()
            channel_name = connected_users[username]

            if isinstance(message, Notification):
                notification_data = message.to_dict()
                async_to_sync(channel_layer.send)(
                    channel_name,
                    {
                        "type": "user.notification",
                        "message": notification_data,
                    }
                )
            else:
                async_to_sync(channel_layer.send)(
                    channel_name,
                    {
                        "type": "user.message",
                        "message": message,
                    }
                )

    async def user_message(self, event):
        message = event["message"]

        target_language = await sync_to_async(lambda: self.scope['user'].profile.preferred_language or 'en')()
        try:
            message_text = message['message']
            message['message'] = await sync_to_async(translate_text)(message_text, target_language)
        except Exception as e:
            print(f"Translation failed: {e}")

        await self.send(text_data=json.dumps(message))

    async def user_notification(self, event):
        message = event["message"]
        await self.send(text_data=json.dumps({
            'event': 'notification',
            'data': message
        }))

    async def get_user_id(self, username):
        try:
            user = await User.objects.aget(username=username)
            return user.id
        except User.DoesNotExist:
            return None

    @classmethod
    def get_username(cls, user_id):
        try:
            user = User.objects.get(id=user_id)
            return user.username
        except User.DoesNotExist:
            return None
