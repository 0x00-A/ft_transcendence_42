from django.urls import re_path

from .consumers import GameConsumer
from .consumers import MultiGameConsumer

websocket_urlpatterns = [
    re_path(r'ws/game/(?P<game_id>\w+)/$', GameConsumer.as_asgi()),
    re_path(r'ws/multigame/(?P<game_id>\w+)/$', MultiGameConsumer.as_asgi()),
]
