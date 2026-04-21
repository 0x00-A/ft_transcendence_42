"""
ASGI config for app project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""
import asyncio
import logging
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')


django.setup()


import chat.routing  # noqa
import accounts.routing  # noqa
import game.routing  # noqa
import matchmaker.routing  # noqa
from .middlewares import JwtAuthMiddleware  # noqa
from channels.security.websocket import AllowedHostsOriginValidator  # noqa
from channels.routing import ProtocolTypeRouter, URLRouter  # noqa
from django.core.asgi import get_asgi_application  # noqa


# Initialize Django ASGI application early to ensure the AppRegistry
# is populated before importing code that may import ORM models.
django_asgi_app = get_asgi_application()


application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AllowedHostsOriginValidator(
        JwtAuthMiddleware(URLRouter(matchmaker.routing.websocket_urlpatterns +
                                    game.routing.websocket_urlpatterns +
                                    accounts.routing.websocket_urlpatterns +
                                    chat.routing.websocket_urlpatterns
                                    ))
    )
})


# logger = logging.getLogger('django')
# async def ft():
#     while True:
#         logger.debug("This is a test log!")
#         await asyncio.sleep(1/60)

# asyncio.run(ft())
