import math
import json
import random
import uuid

from channels.generic.websocket import AsyncWebsocketConsumer

canvas_width: int = 650
canvas_height: int = 480
winning_score: int = 5
pW: int = 10
pH: int = 100
ball_raduis: int = 8
initial_ball_speed = 3


class Paddle:
    def __init__(self, x, y, width, height):
        self.x = x
        self.y = y
        self.width = width
        self.height = height
        self.speed = 10  # Paddle speed

    def move_up(self):
        self.y -= self.speed

    def move_down(self):
        self.y += self.speed


class Ball:
    def __init__(self, x, y, radius, dx, dy):
        self.x = x
        self.y = y
        self.radius = radius
        self.dx = dx
        self.dy = dy
        self.speed = math.sqrt(self.dx * self.dx + self.dy * self.dy)

    def move(self):
        self.x += self.dx
        self.y += self.dy

    def bounce(self):
        self.dx = -self.dx  # Reverse x direction on bounce


class GameInstance:
    def __init__(self, room_id):
        self.room_id = room_id
        self.player1_paddle = Paddle(
            x=10, y=canvas_height / 2 - pH / 2, width=pW, height=pH)
        self.player2_paddle = Paddle(
            x=canvas_width - 10 - pW, y=canvas_height / 2 - pH / 2, width=pW, height=pH)
        self.ball = self.init_ball()
        self.player1_score = 0
        self.player2_score = 0

    def init_ball(self):
        initial_angle = (random.random() * math.pi) / 2 - math.pi / 4

        # 1 = right (Player 2), -1 = left (Player 1)
        serve_direction = 1 if random.random() < 0.5 else -1

        ball_dx = serve_direction * \
            initial_ball_speed * math.cos(initial_angle)
        ball_dy = initial_ball_speed * math.sin(initial_angle)

        return Ball(x=canvas_width / 2, y=canvas_height / 2, radius=ball_raduis, dx=ball_dx, dy=ball_dy)

    def update(self):
        # Logic to update the game state, such as moving the ball and checking for collisions
        self.ball.move()

    def check_for_winner(self):
        # Logic to determine if a player has won and handle the end of the game
        if self.player1_score >= 10:
            return "Player 1 wins!"
        elif self.player2_score >= 10:
            return "Player 2 wins!"
        return None


# Managing multiple game instances
games = {}


def create_game(room_id):
    games[room_id] = GameInstance(room_id)


def get_game(room_id):
    return games.get(room_id)


def remove_game(room_id):
    if room_id in games:
        del games[room_id]


# Example of creating a new game instance
create_game("room_1")

# Example of updating the game instance
game_instance = get_game("room_1")
if game_instance:
    game_instance.update()


def do_line_segments_intersect(x1, y1, x2, y2, x3, y3, x4, y4):
    denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)

    # Lines are parallel if the denominator is 0
    if denominator == 0:
        return False

    t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator
    u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denominator

    return 0 <= t <= 1 and 0 <= u <= 1


def is_colliding_with_paddle(ball, paddle):
    # Previous and current position of the ball
    next_x = ball['x'] + ball['dx']
    next_y = ball['y'] + ball['dy']

    # Paddle edges as line segments
    paddle_left = paddle['x']
    paddle_right = paddle['x'] + paddle['width']
    paddle_top = paddle['y']
    paddle_bottom = paddle['y'] + paddle['height']

    # Check for intersection with paddle's vertical sides (left and right)
    intersects_left = do_line_segments_intersect(
        ball['x'], ball['y'], next_x, next_y,
        paddle_left, paddle_top, paddle_left, paddle_bottom
    )

    intersects_right = do_line_segments_intersect(
        ball['x'], ball['y'], next_x, next_y,
        paddle_right, paddle_top, paddle_right, paddle_bottom
    )

    # Check for intersection with paddle's horizontal sides (top and bottom)
    intersects_top = do_line_segments_intersect(
        ball['x'], ball['y'], next_x, next_y,
        paddle_left, paddle_top, paddle_right, paddle_top
    )

    intersects_bottom = do_line_segments_intersect(
        ball['x'], ball['y'], next_x, next_y,
        paddle_left, paddle_bottom, paddle_right, paddle_bottom
    )

    # Return true if any of the paddle's edges intersect with the ball's path
    return intersects_left or intersects_right or intersects_top or intersects_bottom


def handle_paddle_collision(ball, paddle):
    # Check if the ball is hitting the top/bottom or the sides
    ball_from_left = ball['x'] < paddle['x']
    ball_from_right = ball['x'] > paddle['x'] + paddle['width']

    ball_from_top = ball['y'] < paddle['y']
    ball_from_bottom = ball['y'] > paddle['y'] + paddle['height']

    # Handle side collision
    if ball_from_left or ball_from_right:
        ball['dx'] *= -1  # Reverse the horizontal velocity

        relative_impact = (
            ball['y'] - (paddle['y'] + paddle['height'] / 2)) / (paddle['height'] / 2)
        max_bounce_angle = math.pi / 4  # 45 degrees maximum bounce angle

        # Calculate new angle based on relative impact
        new_angle = relative_impact * max_bounce_angle

        # Update ball's velocity (dx, dy) based on the new angle
        direction = 1 if ball['dx'] > 0 else -1
        speed = ball['speed']
        ball['dx'] = direction * speed * \
            math.cos(new_angle)  # Horizontal velocity
        ball['dy'] = speed * math.sin(new_angle)  # Vertical velocity

    # Handle top/bottom collision
    if ball_from_top or ball_from_bottom:
        ball['dy'] *= -1


def check_collision(game: GameInstance):
    newX = game.ball.x + game.ball.dx + \
        game.ball.radius if game.ball.dx > 0 else -game.ball.radius
    newY = game.ball.y + game.ball.dy + \
        game.ball.radius if game.ball.dy > 0 else -game.ball.radius

    if newY >= canvas_height or newY <= 0:
        game.ball.dy *= -1

    if newY <= 0:
        game.ball.y = game.ball.radius
    elif newY >= canvas_height:
        game.ball.y = canvas_height - game.ball.radius

    if is_colliding_with_paddle(game.ball, game.player1_paddle):
        handle_paddle_collision(game.ball, game.player1_paddle)
    elif is_colliding_with_paddle(game.ball, game.player2_paddle):
        handle_paddle_collision(game.ball, game.player2_paddle)
    elif newX >= canvas_width:
        game.player1_score += 1
        if game.player1_score >= winning_score:
            game.is_over = True
            game.winner = 'player1'
    elif (newX <= 0):
        game.player2_score += 1
        if game.player2_score >= winning_score:
            game.is_over = True
            game.winner = 'player2'


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = "chat_%s" % self.room_name

        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name, {"type": "chat_message", "message": message}
        )

    # Receive message from room group
    async def chat_message(self, event):
        message = event["message"]

        # Send message to WebSocket
        await self.send(text_data=json.dumps({"message": message}))


class MatchmakingConsumer(AsyncWebsocketConsumer):
    waiting_players = set()

    async def connect(self):
        # Accept the WebSocket connection
        await self.accept()

        self.player_id = str(uuid.uuid4())
        await self.send(text_data=json.dumps({
            'type': 'connection',
            'player_id': self.player_id,
        }))
        # Add the player to the waiting room
        MatchmakingConsumer.waiting_players.add(self.channel_name)
        # Attempt to find a match
        await self.find_match()

    async def receive(self, text_data):
        data = json.loads(text_data)

        # Check if it's a connect message
        if data.get('type') == 'CONNECT':
            self.canvas_width = data.get('canvasWidth')
            self.canvas_height = data.get('canvasHeight')

            # You can store these dimensions in the game instance or any relevant data structure

        # Handle other incoming messages...

    async def disconnect(self, close_code):
        # Remove player from the waiting room
        MatchmakingConsumer.waiting_players.discard(self.channel_name)
        # Get the game room the player is in from the scope
        game_room_id = self.scope.get('game_room')
        remove_game(game_room_id)

        if game_room_id:
            # Remove the player from the game room group
            await self.channel_layer.group_discard(game_room_id, self.channel_name)

            # Optionally notify the other player that their opponent disconnected
            await self.channel_layer.group_send(
                game_room_id,
                {
                    'type': 'player_disconnected',
                    'message': 'Your opponent has disconnected.'
                }
            )

    async def find_match(self):
        # Check if there are at least two players waiting
        if len(MatchmakingConsumer.waiting_players) >= 2:
            # Create a new game room ID
            game_room_id = 'game_' + str(uuid.uuid4())
            self.scope['game_room'] = game_room_id

            create_game(game_room_id)

            # Create a list of members to match
            members = list(MatchmakingConsumer.waiting_players)[:2]

            # Add the members to the game room
            for member in members:
                await self.channel_layer.group_add(game_room_id, member)

            # Send a message to all members that they are matched
            await self.channel_layer.group_send(
                game_room_id,
                {
                    "type": "game_message",  # This matches the method name
                    "room_id": game_room_id,
                    "message": 'game_started'
                }
            )

            # Remove all players from the waiting room
            for member in members:
                MatchmakingConsumer.waiting_players.discard(member)

    async def game_message(self, event):
        message = event["message"]
        room_id = event["room_id"]
        await self.send(text_data=json.dumps(
            {
                "type": 'game_started',
                "game_room_id": room_id,
                "players": {
                    "player1": {
                        "id": self.player_id,
                        "role": "host"  # or "client", depending on the role
                    },
                    "player2": {
                        "id": "player2_id",
                        "role": "client"  # or "host" for the second player
                    }
                },
                # "game_start": True,
                # "game_config": {
                #     "game_mode": "1v1",
                #     "difficulty": "medium",
                #     "ball_speed": 1.5
                # }
            }
        ))

    async def player_disconnected(self, event):
        message = event["type"]
        await self.send(text_data=json.dumps(
            {
                "type": message,
            }
        ))

    # async def connect(self):
    #     # Check if waiting room exists
    #     if not self.channel_layer.exists('waiting_room'):
    #         # First player connects
    #         await self.channel_layer.group_add('waiting_room', self.channel_name)
    #         self.is_waiting = True
    #     else:
    #         # Create a unique game room ID
    #         game_room_id = 'game_' + str(uuid.uuid4())

    #         # Move both players to the game room
    #         await self.channel_layer.group_add(game_room_id, self.channel_name)

    #         # Retrieve members of waiting_room
    #         members = await self.channel_layer.group_channels('waiting_room')
    #         await self.channel_layer.group_add(game_room_id, members[0])
    #         await self.channel_layer.group_discard('waiting_room', members[0])

    #         await self.channel_layer.group_send(
    #             game_room_id,
    #             {
    #                 "type": "chat_message",  # This matches the method name
    #                 "room_id": game_room_id,
    #                 "message": 'game_started'
    #             }
    #         )
