from django.utils import timezone
from matchmaker.matchmaker import Matchmaker
from matchmaker.models import Game, Match
from asgiref.sync import sync_to_async
import math
import json
import random
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
import asyncio

channel_layer = get_channel_layer()

canvas_width: int = 650
canvas_height: int = 480
winning_score: int = 7

ball_raduis: int = 8
initial_ball_speed = 4
ball_max_speed = 8
initial_ball_angle = (random.random() * math.pi) / 2 - math.pi / 4

games = {}


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

    def move(self):
        self.x += self.dx
        self.y += self.dy

    # def bounce(self):
    #     self.dx = -self.dx


class GameInstance:
    def __init__(self, game_id):
        # self.update_lock = asyncio.Lock()
        self.game_id = game_id
        self.status = 'waiting'
        self.ball = Ball(x=canvas_width / 2, y=canvas_height / 2,
                         radius=ball_raduis, angle=initial_ball_angle)
        self.player1_score = 0
        self.player2_score = 0
        self.is_over = False
        self.winner = 0
        self.paddle_speed = 3
        self.paddle_width: int = 20
        self.paddle_height: int = 80
        self.state = {
            "player1_paddle_x": 10,
            "player1_paddle_y": canvas_height / 2 - self.paddle_height / 2,
            "player2_paddle_x": canvas_width - 10 - self.paddle_width,
            "player2_paddle_y": canvas_height / 2 - self.paddle_height / 2,
            # "player1_score": 0,
            # "player2_score": 0,
        }

    def update(self):
        self.ball.move()

    def reset_ball(self):
        self.ball.x = 3 * canvas_width / 4 if self.ball.dx > 0 else canvas_width / 4
        self.ball.y = canvas_height / 2
        self.ball.angle = (random.random() * math.pi) / 2 - math.pi / 4
        self.ball.speed = initial_ball_speed
        serve_sirection = -1 if self.ball.dx > 0 else 1
        self.ball.dx = serve_sirection * initial_ball_speed * \
            math.cos(self.ball.angle)
        self.ball.dy = initial_ball_speed * math.sin(self.ball.angle)

    def increment_score(self, player):
        if player == 1:
            self.player1_score += 1
        else:
            self.player2_score += 1
        if self.player1_score >= winning_score:
            self.winner = 1
            self.is_over = True
        elif self.player2_score >= winning_score:
            self.winner = 2
            self.is_over = True

    def reverse_vertical_direction(self):
        self.ball.dy = -self.ball.dy
        if self.ball.y - self.ball.radius <= 0:
            self.ball.y = self.ball.radius
        else:
            self.ball.y = canvas_height - self.ball.radius

    def is_colliding_with_left_wall(self):
        return self.ball.x - self.ball.radius <= 0

    def is_colliding_with_right_wall(self):
        return self.ball.x + self.ball.radius >= canvas_width

    def is_colliding_with_top_buttom_walls(self):
        return self.ball.y - self.ball.radius <= 0 or self.ball.y + self.ball.radius >= canvas_height

    def do_line_segments_intersect(self, x1, y1, x2, y2, x3, y3, x4, y4):
        denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)

        # lines are parallel if the denominator is 0
        if denominator == 0:
            return False

        t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator
        u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denominator

        return 0 <= t <= 1 and 0 <= u <= 1

    def is_colliding_with_paddle(self, paddle):
        ball_from_top = self.ball.y < self.state[f"{paddle}_y"]
        ball_from_bottom = self.ball.y > self.state[f"{
            paddle}_y"] + self.paddle_height

        next_x = self.ball.x + self.ball.dx + \
            (self.ball.radius if self.ball.dx > 0 else -self.ball.radius)
        next_y = self.ball.y + self.ball.dy

        next_y += self.ball.radius if ball_from_top else - \
            self.ball.radius if ball_from_bottom else 0

        # paddle edges as line segments
        paddle_left = self.state[f"{paddle}_x"]
        paddle_right = self.state[f"{paddle}_x"] + self.paddle_width
        paddle_top = self.state[f"{paddle}_y"]
        paddle_bottom = self.state[f"{paddle}_y"] + self.paddle_height

        intersects_left = self.do_line_segments_intersect(
            self.ball.x, self.ball.y, next_x, next_y,
            paddle_left, paddle_top, paddle_left, paddle_bottom
        )

        intersects_right = self.do_line_segments_intersect(
            self.ball.x, self.ball.y, next_x, next_y,
            paddle_right, paddle_top, paddle_right, paddle_bottom
        )

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
        ball_from_left = self.ball.x < self.state[f"{paddle}_x"]
        ball_from_right = self.ball.x > self.state[f"{paddle}_x"] + \
            self.paddle_width

        ball_from_top = self.ball.y < self.state[f"{paddle}_y"]
        ball_from_bottom = self.ball.y > self.state[f"{paddle}_y"] + \
            self.paddle_height

        # side collision
        if ball_from_left or ball_from_right:
            self.ball.dx *= -1

            relative_impact = (
                self.ball.y - (self.state[f"{paddle}_y"] + self.paddle_height / 2)) / (self.paddle_height / 2)
            max_bounce_angle = math.pi / 4  # 45 degrees maximum bounce angle

            # new angle based on relative impact
            new_angle = relative_impact * max_bounce_angle

            direction = 1 if self.ball.dx > 0 else -1
            if self.ball.speed < ball_max_speed:
                self.ball.speed += 0.1
            self.ball.dx = direction * self.ball.speed * \
                math.cos(new_angle)
            self.ball.dy = self.ball.speed * \
                math.sin(new_angle)

        # top/bottom collision
        if ball_from_top or ball_from_bottom:
            self.ball.dy *= -1


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


class GameConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        user = self.scope['user']
        self.game_id = None

        if user.is_authenticated:
            await self.accept()
            self.game_id = self.scope['url_route']['kwargs']['game_id']
            await self.channel_layer.group_add(self.game_id, self.channel_name)

            async with lock:
                if not get_game(self.game_id):
                    create_game(self.game_id)
                    await self.set_player_id_name()

                else:
                    game: GameInstance = get_game(self.game_id)
                    if await Game.objects.filter(game_id=self.game_id).aexists():
                        await Game.objects.filter(game_id=self.game_id).aupdate(players_connected=True)
                    elif await Match.objects.filter(match_id=self.game_id).aexists():
                        await Match.objects.filter(match_id=self.game_id).aupdate(players_connected=True, status='started', start_time=timezone.now())
                    game.status = 'started'
                    await self.set_player_id_name()
                    asyncio.create_task(self.start_game(self.game_id))
        else:
            print(f"\033[31mGameConsumer: User not authenticated!\033[0m")
            await self.close()

    async def disconnect(self, close_code):
        # print(
        #     f"\033[31mGameConsumer: player {1 if self.player_id == 'player1' else 2} disconnected!\033[0m")
        await self.channel_layer.group_discard(self.game_id, self.channel_name)
        if self.game_id and hasattr(self, 'player_id'):
            async with lock:
                game: GameInstance = get_game(self.game_id)
                if game and not game.is_over:
                    if game.status == 'waiting':
                        remove_game(self.game_id)
                    else:
                        game.winner = 1 if self.player_id == 'player2' else 2
                        # print(
                        #     f"\033[31mGameConsumer: Winner is {game.winner}\033[0m")
                        game.is_over = True
                        await self.broadcast_score_state()
        return await super().disconnect(close_code)

    async def send_countdown_to_clients(self):
        for count in range(3, -1, -1):
            await self.channel_layer.group_send(
                self.game_id,
                {
                    "type": "game.countdown",
                    "count": count,
                },
            )
            await self.send(text_data=json.dumps(
                {
                    "type": "game_countdown",
                    "count": count,
                },
            ))
            await asyncio.sleep(1)

    async def game_countdown(self, event):
        await self.send(text_data=json.dumps(
            {
                'type': 'game_countdown',
                'count': event['count']
            }
        ))

    async def set_player_id_name(self):
        user = self.scope['user']
        if await Game.objects.filter(game_id=self.game_id).aexists():
            if await user.games_as_player1.filter(game_id=self.game_id).aexists():
                self.player_id = 'player1'
            else:
                self.player_id = 'player2'
        elif await Match.objects.filter(match_id=self.game_id).aexists():
            if await user.matches_as_player1.filter(match_id=self.game_id).aexists():
                self.player_id = 'player1'
            else:
                self.player_id = 'player2'
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
        if game:
            await self.channel_layer.group_send(
                self.game_id,
                {
                    "type": "game.init",
                    # "room_id": game_room_id,
                    # "message": 'game_started'
                    'player1_state': {
                        'player1_paddle_x': game.state["player1_paddle_x"],
                        'player2_paddle_x': game.state["player2_paddle_x"],
                    },
                    'player2_state': {
                        'player1_paddle_x': canvas_width - game.state["player2_paddle_x"] - game.paddle_width,
                        'player2_paddle_x': canvas_width - game.state["player1_paddle_x"] - game.paddle_width,
                    },
                }
            )

    async def receive(self, text_data):
        data = json.loads(text_data)
        game: GameInstance = get_game(self.game_id)

        if data['type'] == 'keydown':
            await self.handle_keydown(data['direction'])
        if data['type'] == 'player_left':
            await self.handle_player_left()

    async def handle_keydown(self, direction):
        game: GameInstance = get_game(self.game_id)
        if direction == 'up':
            new_position = max(
                0, game.state[f"{self.player_id}_paddle_y"] - game.paddle_speed)
        elif direction == 'down':
            new_position = min(canvas_height - game.paddle_height,
                               game.state[f"{self.player_id}_paddle_y"] + game.paddle_speed)
        game.state[f"{self.player_id}_paddle_y"] = new_position

    async def handle_player_left(self):
        if self.game_id:
            remove_game(self.game_id)

    async def start_game(self, game_id):
        game: GameInstance = games[game_id]
        # Game loop
        await self.send_countdown_to_clients()
        await self.broadcast_initial_state()
        while True:
            await self.broadcast_game_state(game_id)

            game.update()

            await self.check_collision(game)

            if game.winner:
                await Matchmaker.process_result(game_id, game.winner, game.player1_score, game.player2_score)
                remove_game(self.game_id)
                break

            await asyncio.sleep(1 / 60)

    async def check_collision(self, game: GameInstance):
        if game.is_colliding_with_paddle("player1_paddle"):
            await self.play_paddle_sound(game)
            game.handle_paddle_collision("player1_paddle")
        elif game.is_colliding_with_paddle("player2_paddle"):
            await self.play_paddle_sound(game)
            game.handle_paddle_collision("player2_paddle")

        if game.is_colliding_with_top_buttom_walls():
            await self.play_wall_sound(game)
            game.reverse_vertical_direction()

        if game.is_colliding_with_left_wall():
            game.increment_score(2)
            await self.broadcast_score_state()
            game.reset_ball()
        if game.is_colliding_with_right_wall():
            game.increment_score(1)
            await self.broadcast_score_state()
            game.reset_ball()

    async def play_paddle_sound(self, game):
        await self.channel_layer.group_send(
            game.game_id,
            {
                "type": "play_sound",
                "collision": "paddle"
            }
        )

    async def play_wall_sound(self, game):
        await self.channel_layer.group_send(
            game.game_id,
            {
                "type": "play_sound",
                "collision": "wall"
            }
        )

    async def broadcast_score_state(self):
        game: GameInstance = games[self.game_id]
        await self.channel_layer.group_send(
            game.game_id,
            {
                'type': 'score.update',
                'player1_state': {
                    'player1_score': game.player1_score,
                    'player2_score': game.player2_score,
                    "is_winner": True if game.winner == 1 else False,
                    "game_over": True if game.winner else False,
                },
                'player2_state': {
                    'player1_score': game.player2_score,
                    'player2_score': game.player1_score,
                    "is_winner": True if game.winner == 2 else False,
                    "game_over": True if game.winner else False,
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
                    'player2_paddle_y': game.state["player2_paddle_y"],
                    'ball': {
                        'x': game.ball.x,
                        'y': game.ball.y,
                    },
                },
                'player2_state': {
                    'player1_paddle_y': game.state["player2_paddle_y"],
                    'player2_paddle_y': game.state["player1_paddle_y"],
                    'ball': {
                        'x': canvas_width - game.ball.x,
                        'y': game.ball.y,
                    },
                },
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
