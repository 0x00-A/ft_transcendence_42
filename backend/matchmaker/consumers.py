import random
from uuid import uuid1
from channels.generic.websocket import AsyncWebsocketConsumer
import json
from accounts.models import Profile
from asgiref.sync import sync_to_async
from django.contrib.auth.models import AnonymousUser

from .matchmaker import Matchmaker


class MatchmakingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope['user']
        self.player_id = None

        if user.is_authenticated:
            if user.id in Matchmaker.connected_clients:
                previous_consumer = Matchmaker.connected_clients[user.id]
                previous_consumer.is_being_closed = True
                await self.channel_layer.send(previous_consumer.channel_name, {
                    "type": "close.connection"
                })
            self.player_id = user.id
            await Matchmaker.register_client(self.player_id, self)
            await self.accept()
        else:
            await self.close()

    async def disconnect(self, close_code):
        await Matchmaker.handle_player_unready(self.player_id)
        # if hasattr(self, 'is_being_closed') and self.is_being_closed:
        # return
        await Matchmaker.remove_from_queue(self.player_id)

        if not hasattr(self, 'is_being_closed') or not self.is_being_closed:
            await Matchmaker.unregister_client(self.player_id)
        return await super().disconnect(close_code)

    async def close_connection(self, event):
        # Custom close type to handle connection close
        await self.send(text_data=json.dumps(
            {
                "event": "close_connection",
            }
        ))
        await self.close()

    async def receive(self, text_data):
        data = json.loads(text_data)
        event = data['event']
        # print(f'Websocket Message Recieved: {event}')
        if event == 'request_remote_game':
            await Matchmaker.request_remote_game(self.player_id)
        elif event == 'request_multiple_game':
            await Matchmaker.request_multi_game(self.player_id)
        elif event == 'request_tournament':
            tournament_name = data.get('tournament_name')
            await Matchmaker.create_tournament(self.player_id, tournament_name)
        elif event == 'join_tournament':
            tournament_id = data.get('tournament_id')
            await Matchmaker.join_tournament(self.player_id, tournament_id)
        elif event == 'player_ready':
            await Matchmaker.handle_player_ready(self.player_id, data.get('match_id'))
        elif event == 'player_unready':
            await Matchmaker.handle_player_unready(self.player_id)
        elif event == 'remove_from_queue':
            await Matchmaker.remove_from_queue(self.player_id)
        elif event == 'player_left':
            await Matchmaker.leave_tournament(self.player_id)
        elif event == 'tournament_invite':
            await Matchmaker.send_tournament_invite(self.player_id, data.get('from'), data.get('to'), data.get('tournamentId'))

    # async def user_message(self, event):
    #     message = event["message"]

    #     await self.send(text_data=json.dumps(message))

    async def send_message(self, message):
        await self.send(text_data=json.dumps(message))
