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
        # self.player_id = GlobalData.increment_user_id_counter()
        # self.player_id = random.randint(1, 100000)
        # await self.accept()
        # Register the client when connected

        if user and not isinstance(user, AnonymousUser):
            await self.accept()
            # profile = await sync_to_async(Profile.objects.get)(
            #     user=user
            # )
            self.player_id = user.id
            await Matchmaker.register_client(self.player_id, self)
            # You can now use self.scope['user'] to identify the user
            await self.send(text_data=f"Hello {user.username}, you are authenticated!")
        else:
            # Reject the connection if user is not authenticated
            print(f"##################### User not found ##########################")
            await self.close()

    async def disconnect(self, close_code):
        # Unregister the client when disconnected
        # if self.player_id:
        # Matchmaker.games_queue.remove(self.player_id)
        await Matchmaker.unregister_client(self.player_id)

    async def receive(self, text_data):
        data = json.loads(text_data)
        event = data['event']
        if event == 'request_remote_game':
            await Matchmaker.request_remote_game(self.player_id)
        elif event == 'request_tournament':
            tournament_name = data.get('tournament_name')
            number_of_players = int(data.get('number_of_players'))
            await Matchmaker.create_tournament(self.player_id, tournament_name, number_of_players)
        elif event == 'join_tournament':
            tournament_id = data.get('tournament_id')
            await Matchmaker.join_tournament(self.player_id, tournament_id)
        # Handle other events similarly...

    # This method sends a message to the WebSocket client
    async def send_message(self, message):
        await self.send(text_data=json.dumps(message))
