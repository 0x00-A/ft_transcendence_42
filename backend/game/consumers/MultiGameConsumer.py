from matchmaker.matchmaker import Matchmaker
from matchmaker.models import MultiGame
from asgiref.sync import sync_to_async
import math
import json
import random
from django.contrib.auth.models import AnonymousUser


from channels.generic.websocket import AsyncWebsocketConsumer

from channels.layers import get_channel_layer

from asgiref.sync import async_to_sync

import asyncio

from collections import defaultdict

channel_layer = get_channel_layer()

canvas_size: int = 480
canvas_width: int = 480
canvas_height: int = 480
losing_score: int = 7

ball_raduis: int = 8
initial_ball_speed = 3
initial_paddle_speed = 3
initial_ball_angle = (random.random() * math.pi) / 2 - math.pi / 4


games = {}
# connected_players = defaultdict(set)


class Ball:
    def __init__(self, x, y, radius, angle):
        serve_direction = 1 if random.random() < 0.5 else -1
        self.x = x
        self.y = y
        self.radius = radius
        self.angle = angle
        self.dx = serve_direction * \
            initial_ball_speed * math.cos(self.angle)
        self.dy = initial_ball_speed * math.sin(self.angle)
        self.speed = initial_ball_speed
        self.color = 'white'

    def move(self):
        self.x += self.dx
        self.y += self.dy


class GameInstance:
    def __init__(self, game_id):
        # self.update_lock = asyncio.Lock()
        self.game_id = game_id
        self.ball = Ball(x=canvas_width / 2, y=canvas_height / 2,
                         radius=ball_raduis, angle=initial_ball_angle)
        self.player1_id = None
        self.player2_id = None
        self.player3_id = None
        self.player4_id = None
        self.player1_score = 0
        self.player2_score = 0
        self.player3_score = 0
        self.player4_score = 0
        self.player1_score_against = 0
        self.player2_score_against = 0
        self.player3_score_against = 0
        self.player4_score_against = 0
        self.connected_players = 1
        self.is_over = False
        self.winner = 0
        self.paddle_speed = initial_paddle_speed
        self.paddle_width: int = 15
        self.paddle_height: int = 70
        self.corner_size = 10
        self.scorer = None
        self.state = {
            "player1_paddle_x": 10,
            "player1_paddle_y": canvas_height / 2 - self.paddle_height / 2,
            "player1_paddle_w": self.paddle_width,
            "player1_paddle_h": self.paddle_height,
            "player1_paddle_color": '#ff4136',
            "player1_lost": False,

            "player2_paddle_x": canvas_width / 2 - self.paddle_height / 2,
            "player2_paddle_y": 10,
            "player2_paddle_w": self.paddle_height,
            "player2_paddle_h": self.paddle_width,
            "player2_paddle_color": '#2196f3',
            "player2_lost": False,

            "player3_paddle_x": canvas_width - self.paddle_width - 10,
            "player3_paddle_y": canvas_height / 2 - self.paddle_height / 2,
            "player3_paddle_w": self.paddle_width,
            "player3_paddle_h": self.paddle_height,
            "player3_paddle_color": '#2ecc40',
            "player3_lost": False,


            "player4_paddle_x": canvas_width / 2 - self.paddle_height / 2,
            "player4_paddle_y": canvas_height - self.paddle_width - 10,
            "player4_paddle_w": self.paddle_height,
            "player4_paddle_h": self.paddle_width,
            "player4_paddle_color": '#9c27b0',
            "player4_lost": False,
        }

    def update(self):
        self.ball.move()

    def reset_ball(self):
        # reset ball position to the center of the canvas
        self.ball.color = 'white'
        self.ball.x = canvas_width / 2
        self.ball.y = canvas_height / 2

        angle = random.uniform(0, 2 * math.pi)

        # ball direction based on the angle
        self.ball.dx = initial_ball_speed * math.cos(angle)
        self.ball.dy = initial_ball_speed * math.sin(angle)

        self.ball.speed = initial_ball_speed
        self.paddle_speed = initial_paddle_speed

    def increment_score(self, player):
        if player == 1:
            self.player1_score_against += 1
        elif player == 2:
            self.player2_score_against += 1
        elif player == 3:
            self.player3_score_against += 1
        elif player == 4:
            self.player4_score_against += 1

        if self.scorer == 'player1':
            self.player1_score += 1
        elif self.scorer == 'player2':
            self.player2_score += 1
        elif self.scorer == 'player3':
            self.player3_score += 1
        elif self.scorer == 'player4':
            self.player4_score += 1
        self.scorer = None

    def lost_players_count(self):
        count = 0
        players = ['player1', 'player2', 'player3', 'player4']
        for p in players:
            if self.state[f'{p}_lost']:
                count += 1
        return count

    def get_winner(self):
        players = [1, 2, 3, 4]
        for p in players:
            if not self.state[f'player{p}_lost']:
                return p

    def reverse_vertical_direction(self):
        # self.increase_ball_speed()
        self.ball.dy = -self.ball.dy
        # add slight horizontal angle to prevent direct wall bouncing
        if abs(self.ball.dx) < 0.2:
            self.ball.dx += random.uniform(-0.5, 0.5)
        if self.ball.y - self.ball.radius <= 0:
            self.ball.y = self.ball.radius
        else:
            self.ball.y = canvas_height - self.ball.radius

    def reverse_horizontal_direction(self):
        # self.increase_ball_speed()
        self.ball.dx = -self.ball.dx
        # Add slight vertical angle to prevent direct wall bouncing
        if abs(self.ball.dy) < 0.2:
            self.ball.dy += random.uniform(-0.5, 0.5)
        if self.ball.x - self.ball.radius <= 0:
            self.ball.x = self.ball.radius
        else:
            self.ball.x = canvas_size - self.ball.radius

    def is_colliding_with_left_wall(self):
        return self.ball.x - self.ball.radius <= 0

    def is_colliding_with_right_wall(self):
        return self.ball.x + self.ball.radius >= canvas_width

    def is_colliding_with_top_wall(self):
        return self.ball.y - self.ball.radius <= 0

    def is_colliding_with_buttom_wall(self):
        return self.ball.y + self.ball.radius >= canvas_height

    def do_line_segments_intersect(self, x1, y1, x2, y2, x3, y3, x4, y4):
        denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)

        # lines are parallel if the denominator is 0
        if denominator == 0:
            return False

        t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator
        u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denominator

        return 0 <= t <= 1 and 0 <= u <= 1

    def is_colliding_with_paddle(self, paddle):
        if paddle == 'player1_paddle' or paddle == 'player3_paddle':
            next_x = self.ball.x + self.ball.dx + \
                (self.ball.radius if self.ball.dx > 0 else -self.ball.radius)
            next_y = self.ball.y + self.ball.dy

            ball_from_top = self.ball.y < self.state[f"{paddle}_y"]
            ball_from_bottom = self.ball.y > self.state[f"{paddle}_y"] + \
                self.state[f"{paddle}_h"]

            # this fixed edge collision not detected
            next_y += self.ball.radius if ball_from_top else - \
                self.ball.radius if ball_from_bottom else 0
        else:
            next_x = self.ball.x + self.ball.dx
            next_y = self.ball.y + self.ball.dy + \
                (self.ball.radius if self.ball.dy > 0 else -self.ball.radius)

            ball_from_right = self.ball.x < self.state[f"{paddle}_x"]
            ball_from_left = self.ball.x > self.state[f"{paddle}_x"] + \
                self.state[f"{paddle}_w"]
            next_x += self.ball.radius if ball_from_right else - \
                self.ball.radius if ball_from_left else 0

        # paddle edges as line segments
        paddle_left = self.state[f"{paddle}_x"]
        paddle_right = self.state[f"{paddle}_x"] + \
            self.state[f"{paddle}_w"]
        paddle_top = self.state[f"{paddle}_y"]
        paddle_bottom = self.state[f"{paddle}_y"] + \
            self.state[f"{paddle}_h"]

        # intersection with left and right
        intersects_left = self.do_line_segments_intersect(
            self.ball.x, self.ball.y, next_x, next_y,
            paddle_left, paddle_top, paddle_left, paddle_bottom
        )

        intersects_right = self.do_line_segments_intersect(
            self.ball.x, self.ball.y, next_x, next_y,
            paddle_right, paddle_top, paddle_right, paddle_bottom
        )

        # intersection with top and bottom
        intersects_top = self.do_line_segments_intersect(
            self.ball.x, self.ball.y, next_x, next_y,
            paddle_left, paddle_top, paddle_right, paddle_top
        )

        intersects_bottom = self.do_line_segments_intersect(
            self.ball.x, self.ball.y, next_x, next_y,
            paddle_left, paddle_bottom, paddle_right, paddle_bottom
        )

        check = intersects_left or intersects_right or intersects_top or intersects_bottom
        if check:
            self.paddle_collision = True
        return check

    def handle_paddle_collision(self, paddle):
        self.ball.color = self.state[f"{paddle}_color"]
        self.scorer = paddle.split('_')[0]

        ball_from_left = self.ball.x < self.state[f"{paddle}_x"]
        ball_from_right = self.ball.x > self.state[f"{paddle}_x"] + \
            self.state[f"{paddle}_w"]

        ball_from_top = self.ball.y < self.state[f"{paddle}_y"]
        ball_from_bottom = self.ball.y > self.state[f"{paddle}_y"] + \
            self.state[f"{paddle}_h"]

        # side collision
        if ball_from_left or ball_from_right:
            self.ball.dx *= -1

        # top/bottom collision
        if ball_from_top or ball_from_bottom:
            self.ball.dy *= -1

        if paddle == 'player1_paddle' or paddle == 'player3_paddle':
            relative_impact = (
                self.ball.y - (self.state[f"{paddle}_y"] + self.state[f"{paddle}_h"] / 2)) / (self.state[f"{paddle}_h"] / 2)
            max_bounce_angle = math.pi / 3  # 45 degrees maximum bounce angle

            # new angle based on relative impact
            new_angle = relative_impact * max_bounce_angle

            # ball velocity (dx, dy) based on the new angle
            direction = 1 if self.ball.dx > 0 else -1
            # self.increase_ball_speed()
            self.ball.dx = direction * self.ball.speed * \
                math.cos(new_angle)
            self.ball.dy = self.ball.speed * \
                math.sin(new_angle)

        else:  # horizontal paddle
            # relative impact based on x position
            relative_impact = (
                self.ball.x - (self.state[f"{paddle}_x"] + self.state[f"{paddle}_w"] / 2)) / (self.state[f"{paddle}_w"] / 2)
            max_bounce_angle = math.pi / 3  # 45 degrees maximum bounce angle

            new_angle = relative_impact * max_bounce_angle

            direction = 1 if self.ball.dy > 0 else -1
            # self.increase_ball_speed()
            self.ball.dx = self.ball.speed * \
                math.sin(new_angle)
            self.ball.dy = direction * self.ball.speed * \
                math.cos(new_angle)

    def check_corner_collision(self):
        next_x = self.ball.x + self.ball.dx
        next_y = self.ball.y + self.ball.dy
        # corners with their line segments
        corners = [
            # Top-left: (0,corner_size) to (corner_size,0)
            {
                'x1': 0, 'y1': self.corner_size,
                'x2': self.corner_size, 'y2': 0
            },
            # Top-right: (width-corner_size,0) to (width,corner_size)
            {
                'x1': canvas_size - self.corner_size, 'y1': 0,
                'x2': canvas_size, 'y2': self.corner_size
            },
            # Bottom-left: (0,height-corner_size) to (corner_size,height)
            {
                'x1': 0, 'y1': canvas_size - self.corner_size,
                'x2': self.corner_size, 'y2': canvas_size
            },
            # Bottom-right: (width-corner_size,height) to (width,height-corner_size)
            {
                'x1': canvas_size - self.corner_size, 'y1': canvas_size,
                'x2': canvas_size, 'y2': canvas_size - self.corner_size
            }
        ]

        for corner in corners:
            if self.do_line_segments_intersect(
                self.ball.x, self.ball.y, next_x, next_y,
                corner['x1'], corner['y1'], corner['x2'], corner['y2']
            ):
                # self.increase_ball_speed()

                self.ball.dx = -self.ball.dx
                self.ball.dy = -self.ball.dy

                angle = random.uniform(-30, 30) * \
                    math.pi / 180

                # new direction while maintaining speed
                speed = math.sqrt(self.ball.dx * self.ball.dx +
                                  self.ball.dy * self.ball.dy)
                current_angle = math.atan2(self.ball.dy, self.ball.dx)
                new_angle = current_angle + angle

                self.ball.dx = speed * math.cos(new_angle)
                self.ball.dy = speed * math.sin(new_angle)

                return True

        return False

    # def increase_ball_speed(self):
    #     if self.ball.speed < 8:

    #         self.ball.speed += 0.2
    #         self.paddle_speed += 0.1


def create_game(game_id):
    games[game_id] = GameInstance(game_id)


def get_game(game_id):
    # game_instance = get_game("game_id")
    # if not game_instance:
    #     pass
    return games.get(game_id)


def remove_game(game_id):
    if game_id in games:
        del games[game_id]


lock = asyncio.Lock()


class MultiGameConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        user = self.scope['user']
        self.game_id = None

        if user.is_authenticated:
            await self.accept()
            self.game_id = self.scope['url_route']['kwargs']['game_id']

            async with lock:
                if not get_game(self.game_id):
                    create_game(self.game_id)
                    await self.set_player_id_name()
                else:
                    game: GameInstance = get_game(self.game_id)
                    game.connected_players += 1
                    await self.set_player_id_name()
            await self.channel_layer.group_add(self.game_id, self.channel_name)

            game: GameInstance = get_game(self.game_id)
            if game.connected_players == 4:
                await self.broadcast_initial_state()
                await self.send_countdown_to_clients()
                await MultiGame.objects.filter(game_id=self.game_id).aupdate(players_connected=True)
                asyncio.create_task(self.start_game(self.game_id))
        else:
            print(f"\033[31mMultiGameConsumer: User not authenticated!\033[0m")
            await self.close()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.game_id, self.channel_name)
        game_id = self.game_id
        if game_id and hasattr(self, 'player_id'):
            async with lock:
                game: GameInstance = get_game(game_id)
                game.state[f"{self.player_id}_lost"] = True
                game.connected_players -= 1
                await self.broadcast_player_lost_state()
                if game.connected_players <= 0:
                    game.is_over = True
                    remove_game(game_id)
        return await super().disconnect(close_code)

    async def receive(self, text_data):
        data = json.loads(text_data)
        game: GameInstance = get_game(self.game_id)

        if data['type'] == 'keydown':
            await self.handle_keydown(data['direction'])

    async def handle_keydown(self, direction):
        game: GameInstance = get_game(self.game_id)
        corner_size = 0
        if self.player_id == 'player3':
            if direction == 'down':
                new_position = max(
                    corner_size, game.state[f"{self.player_id}_paddle_y"] - game.paddle_speed)
            elif direction == 'up':
                new_position = min(canvas_height - game.state[f"{self.player_id}_paddle_h"] - corner_size,
                                   game.state[f"{self.player_id}_paddle_y"] + game.paddle_speed)
            game.state[f"{self.player_id}_paddle_y"] = new_position
        elif self.player_id == 'player1':
            if direction == 'up':
                new_position = max(
                    corner_size, game.state[f"{self.player_id}_paddle_y"] - game.paddle_speed)
            elif direction == 'down':
                new_position = min(canvas_height - game.state[f"{self.player_id}_paddle_h"] - corner_size,
                                   game.state[f"{self.player_id}_paddle_y"] + game.paddle_speed)
            game.state[f"{self.player_id}_paddle_y"] = new_position
        elif self.player_id == 'player4':
            if direction == 'up':
                new_position = max(
                    corner_size, game.state[f"{self.player_id}_paddle_x"] -
                    game.paddle_speed
                )
            elif direction == 'down':
                new_position = min(
                    canvas_width -
                    game.state[f"{self.player_id}_paddle_w"] -
                    corner_size,
                    game.state[f"{self.player_id}_paddle_x"] +
                    game.paddle_speed
                )
            game.state[f"{self.player_id}_paddle_x"] = new_position
        else:
            if direction == 'down':
                new_position = max(
                    corner_size, game.state[f"{self.player_id}_paddle_x"] -
                    game.paddle_speed
                )
            elif direction == 'up':
                new_position = min(
                    canvas_width -
                    game.state[f"{self.player_id}_paddle_w"] -
                    corner_size,
                    game.state[f"{self.player_id}_paddle_x"] +
                    game.paddle_speed
                )
            game.state[f"{self.player_id}_paddle_x"] = new_position

    async def send_countdown_to_clients(self):
        for count in range(3, -1, -1):
            await asyncio.sleep(1)

        await self.channel_layer.group_send(
            self.game_id,
            {
                "type": "game.countdown",
                "count": count,
            },
        )

    async def game_countdown(self, event):
        if self.channel_name is not None:
            await self.send(text_data=json.dumps(
                {
                    'type': 'game_countdown',
                }
            ))

    async def set_player_id_name(self):
        game: GameInstance = get_game(self.game_id)
        user = self.scope['user']
        if await MultiGame.objects.filter(game_id=self.game_id).aexists():
            if await user.multi_games_as_player1.filter(game_id=self.game_id).aexists():
                self.player_id = 'player1'
                game.player1_id = user.id
            elif await user.multi_games_as_player2.filter(game_id=self.game_id).aexists():
                self.player_id = 'player2'
                game.player2_id = user.id
            elif await user.multi_games_as_player3.filter(game_id=self.game_id).aexists():
                self.player_id = 'player3'
                game.player3_id = user.id
            elif await user.multi_games_as_player4.filter(game_id=self.game_id).aexists():
                self.player_id = 'player4'
                game.player4_id = user.id
        else:
            await self.close()
            return
        await self.send(text_data=json.dumps(
            {
                'type': 'player_id',
                'player': self.player_id,
            }
        ))

    async def broadcast_initial_state(self):
        game: GameInstance = get_game(self.game_id)
        await self.channel_layer.group_send(
            self.game_id,
            {
                "type": "game.init",
                'player1_state': {
                    'player1_paddle_x': game.state["player1_paddle_x"],
                    'player2_paddle_y': game.state["player2_paddle_y"],
                    'player3_paddle_x': game.state["player3_paddle_x"],
                    'player4_paddle_y': game.state["player4_paddle_y"],
                    'player1_id': game.player1_id,
                    'player2_id': game.player2_id,
                    'player3_id': game.player3_id,
                    'player4_id': game.player4_id,
                    'player1_color': game.state["player1_paddle_color"],
                    'player2_color': game.state["player2_paddle_color"],
                    'player3_color': game.state["player3_paddle_color"],
                    'player4_color': game.state["player4_paddle_color"],
                },
                'player2_state': {
                    'player1_paddle_x': game.state["player2_paddle_y"],
                    'player2_paddle_y': canvas_size - game.state["player3_paddle_x"] - game.paddle_width,
                    'player3_paddle_x': game.state["player4_paddle_y"],
                    'player4_paddle_y': canvas_size - game.state["player1_paddle_x"] - game.paddle_width,

                    'player1_id': game.player2_id,
                    'player2_id': game.player3_id,
                    'player3_id': game.player4_id,
                    'player4_id': game.player1_id,
                    'player1_color': game.state["player2_paddle_color"],
                    'player2_color': game.state["player3_paddle_color"],
                    'player3_color': game.state["player4_paddle_color"],
                    'player4_color': game.state["player1_paddle_color"],
                },
                'player3_state': {
                    'player1_paddle_x': canvas_size - game.state["player3_paddle_x"] - game.paddle_width,
                    'player2_paddle_y': canvas_size - game.state["player4_paddle_y"] - game.paddle_width,
                    'player3_paddle_x': canvas_size - game.state["player1_paddle_x"] - game.paddle_width,
                    'player4_paddle_y': canvas_size - game.state["player2_paddle_y"] - game.paddle_width,
                    'player1_id': game.player3_id,
                    'player2_id': game.player4_id,
                    'player3_id': game.player1_id,
                    'player4_id': game.player2_id,
                    'player1_color': game.state["player3_paddle_color"],
                    'player2_color': game.state["player4_paddle_color"],
                    'player3_color': game.state["player1_paddle_color"],
                    'player4_color': game.state["player2_paddle_color"],
                },
                'player4_state': {
                    'player1_paddle_x': canvas_size - game.state["player4_paddle_y"] - game.paddle_width,
                    'player2_paddle_y': game.state["player1_paddle_x"],
                    'player3_paddle_x': canvas_size - game.state["player2_paddle_y"] - game.paddle_width,
                    'player4_paddle_y': game.state["player3_paddle_x"],
                    'player1_id': game.player4_id,
                    'player2_id': game.player1_id,
                    'player3_id': game.player2_id,
                    'player4_id': game.player3_id,
                    'player1_color': game.state["player4_paddle_color"],
                    'player2_color': game.state["player1_paddle_color"],
                    'player3_color': game.state["player2_paddle_color"],
                    'player4_color': game.state["player3_paddle_color"],
                },
            }
        )

    async def start_game(self, game_id):
        game: GameInstance = games[game_id]
        # Game loop
        while True:
            await self.broadcast_game_state(game_id)

            game.update()

            await self.check_collision(game)

            if game.winner:
                await Matchmaker.process_multi_game_result(game_id, game.winner, game.player1_score, game.player2_score, game.player3_score, game.player4_score)
                break

            await asyncio.sleep(1 / 60)

    async def check_collision(self, game: GameInstance):
        if game.check_corner_collision():
            await self.play_wall_sound(game)
            return

        if not game.state['player1_lost'] and game.is_colliding_with_paddle("player1_paddle"):
            await self.play_paddle_sound(game)
            game.handle_paddle_collision("player1_paddle")
            return
        if not game.state['player3_lost'] and game.is_colliding_with_paddle("player3_paddle"):
            await self.play_paddle_sound(game)
            game.handle_paddle_collision("player3_paddle")
            return
        if not game.state['player2_lost'] and game.is_colliding_with_paddle("player2_paddle"):
            await self.play_paddle_sound(game)
            game.handle_paddle_collision("player2_paddle")
            return
        if not game.state['player4_lost'] and game.is_colliding_with_paddle("player4_paddle"):
            await self.play_paddle_sound(game)
            game.handle_paddle_collision("player4_paddle")
            return

        if game.is_colliding_with_top_wall():
            if game.state['player2_lost']:
                await self.play_wall_sound(game)
                game.reverse_vertical_direction()
            else:
                game.increment_score(2)
                await self.broadcast_score_state()
                game.reset_ball()
        elif game.is_colliding_with_buttom_wall():
            if game.state['player4_lost']:
                await self.play_wall_sound(game)
                game.reverse_vertical_direction()
            else:
                game.increment_score(4)
                game.reset_ball()
                await self.broadcast_score_state()
        elif game.is_colliding_with_left_wall():
            if game.state['player1_lost']:
                await self.play_wall_sound(game)
                game.reverse_horizontal_direction()
            else:
                game.increment_score(1)
                game.reset_ball()
                await self.broadcast_score_state()
        elif game.is_colliding_with_right_wall():
            if game.state['player3_lost']:
                await self.play_wall_sound(game)
                game.reverse_horizontal_direction()
            else:
                game.increment_score(3)
                game.reset_ball()
                await self.broadcast_score_state()

        if not game.state['player1_lost'] and game.player1_score_against >= losing_score:
            game.state['player1_lost'] = True
            await self.broadcast_player_lost_state()
        if not game.state['player2_lost'] and game.player2_score_against >= losing_score:
            game.state['player2_lost'] = True
            await self.broadcast_player_lost_state()
        if not game.state['player3_lost'] and game.player3_score_against >= losing_score:
            game.state['player3_lost'] = True
            await self.broadcast_player_lost_state()
        if not game.state['player4_lost'] and game.player4_score_against >= losing_score:
            game.state['player4_lost'] = True
            await self.broadcast_player_lost_state()

        if game.lost_players_count() >= 3:
            game.winner = game.get_winner()
            game.is_over = True
            await self.broadcast_score_state()

    async def broadcast_score_state(self):
        game: GameInstance = games[self.game_id]
        await self.channel_layer.group_send(
            game.game_id,
            {
                'type': 'score.update',
                'player1_state': {
                    'player1_score': [game.player1_score, game.player1_score_against],
                    'player2_score': [game.player2_score, game.player2_score_against],
                    'player3_score': [game.player3_score, game.player3_score_against],
                    'player4_score': [game.player4_score, game.player4_score_against],
                    "is_winner": True if game.winner == 1 else False,
                    "game_over": True if game.winner else False,
                },
                'player2_state': {
                    'player1_score': [game.player2_score, game.player2_score_against],
                    'player2_score': [game.player3_score, game.player3_score_against],
                    'player3_score': [game.player4_score, game.player4_score_against],
                    'player4_score': [game.player1_score, game.player1_score_against],
                    "is_winner": True if game.winner == 2 else False,
                    "game_over": True if game.winner else False,
                },
                'player3_state': {
                    'player1_score': [game.player3_score, game.player3_score_against],
                    'player2_score': [game.player4_score, game.player4_score_against],
                    'player3_score': [game.player1_score, game.player1_score_against],
                    'player4_score': [game.player2_score, game.player2_score_against],
                    "is_winner": True if game.winner == 3 else False,
                    "game_over": True if game.winner else False,
                },
                'player4_state': {
                    'player1_score': [game.player4_score, game.player4_score_against],
                    'player2_score': [game.player1_score, game.player1_score_against],
                    'player3_score': [game.player2_score, game.player2_score_against],
                    'player4_score': [game.player3_score, game.player3_score_against],
                    "is_winner": True if game.winner == 4 else False,
                    "game_over": True if game.winner else False,
                },
            }
        )

    async def broadcast_player_lost_state(self):
        game: GameInstance = games[self.game_id]
        await self.channel_layer.group_send(
            game.game_id,
            {
                'type': 'player.lost',
                'player1_state': {
                    'player1_lost': game.state["player1_lost"],
                    'player2_lost': game.state["player2_lost"],
                    'player3_lost': game.state["player3_lost"],
                    'player4_lost': game.state["player4_lost"],
                },
                'player2_state': {
                    'player1_lost': game.state["player2_lost"],
                    'player2_lost': game.state["player3_lost"],
                    'player3_lost': game.state["player4_lost"],
                    'player4_lost': game.state["player1_lost"],
                },
                'player3_state': {
                    'player1_lost': game.state["player3_lost"],
                    'player2_lost': game.state["player4_lost"],
                    'player3_lost': game.state["player1_lost"],
                    'player4_lost': game.state["player2_lost"],
                },
                'player4_state': {
                    'player1_lost': game.state["player4_lost"],
                    'player2_lost': game.state["player1_lost"],
                    'player3_lost': game.state["player2_lost"],
                    'player4_lost': game.state["player3_lost"],
                },
            }
        )

    async def broadcast_game_state(self, game_id):
        game: GameInstance = games[game_id]
        await self.channel_layer.group_send(
            game.game_id,
            {
                'type': 'game.state.update',
                'player1_state': {
                    'player1_paddle_y': game.state["player1_paddle_y"],
                    'player2_paddle_x': game.state["player2_paddle_x"],
                    'player3_paddle_y': game.state["player3_paddle_y"],
                    'player4_paddle_x': game.state["player4_paddle_x"],
                    'ball': {
                        'x': game.ball.x,
                        'y': game.ball.y,
                        'color': game.ball.color,
                    },
                },
                'player2_state': {
                    'player1_paddle_y': canvas_size - game.state["player2_paddle_x"] - game.paddle_height,
                    'player2_paddle_x': game.state["player3_paddle_y"],
                    'player3_paddle_y': canvas_size - game.state["player4_paddle_x"] - game.paddle_height,
                    'player4_paddle_x': game.state["player1_paddle_y"],
                    'ball': {
                        'x': game.ball.y,
                        'y': canvas_size - game.ball.x,
                        'color': game.ball.color,
                    },
                },
                'player3_state': {
                    'player1_paddle_y': canvas_size - game.state["player3_paddle_y"] - game.paddle_height,
                    'player2_paddle_x': canvas_size - game.state["player4_paddle_x"] - game.paddle_height,
                    'player3_paddle_y': canvas_size - game.state["player1_paddle_y"] - game.paddle_height,
                    'player4_paddle_x': canvas_size - game.state["player2_paddle_x"] - game.paddle_height,
                    'ball': {
                        'x': canvas_size - game.ball.x,
                        'y': canvas_size - game.ball.y,
                        'color': game.ball.color,
                    },
                },
                'player4_state': {
                    'player1_paddle_y': game.state["player4_paddle_x"],
                    'player2_paddle_x': canvas_size - game.state["player1_paddle_y"] - game.paddle_height,
                    'player3_paddle_y': game.state["player2_paddle_x"],
                    'player4_paddle_x': canvas_size - game.state["player3_paddle_y"] - game.paddle_height,
                    'ball': {
                        'x': canvas_size - game.ball.y,
                        'y': game.ball.x,
                        'color': game.ball.color,
                    },
                },
            }
        )

    async def play_paddle_sound(self, game):
        if self.channel_name is not None:
            await self.channel_layer.group_send(
                game.game_id,
                {
                    "type": "play_sound",
                    "collision": "paddle"
                }
            )

    async def play_wall_sound(self, game):
        if self.channel_name is not None:
            await self.channel_layer.group_send(
                game.game_id,
                {
                    "type": "play_sound",
                    "collision": "wall"
                }
            )

    async def score_update(self, event):
        if self.channel_name is not None:
            await self.send(text_data=json.dumps(
                {
                    'type': 'score_update',
                    'state': event[f"{self.player_id}_state"]
                }
            ))

    async def player_lost(self, event):
        if self.channel_name is not None:
            await self.send(text_data=json.dumps(
                {
                    'type': 'player_lost',
                    'state': event[f"{self.player_id}_state"]
                }
            ))

    async def game_state_update(self, event):
        if self.channel_name is not None:
            await self.send(text_data=json.dumps(
                {
                    'type': 'game_update',
                    'state': event[f"{self.player_id}_state"]

                }
            ))

    async def play_sound(self, event):
        if self.channel_name is not None:
            await self.send(text_data=json.dumps({
                'type': event['type'],
                'collision': event['collision']
            }))

    async def game_init(self, event):
        if self.channel_name is not None:
            await self.send(text_data=json.dumps(
                {
                    "type": 'game_started',
                    'state': event[f"{self.player_id}_state"]
                }
            ))
