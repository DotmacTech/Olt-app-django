# import os
# from django.core.asgi import get_asgi_application
# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'oltmanager.settings')
# application = get_asgi_application()


import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack # If you need auth for WebSockets
import network.routing # We'll create this next

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'oltmanager.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(), # Django's default HTTP handling
    # "websocket": AuthMiddlewareStack( # For authenticated WebSockets
    #     URLRouter(
    #         network.routing.websocket_urlpatterns
    #     )
    # ),
    "websocket": URLRouter(network.routing.websocket_urlpatterns),
    # You could also have a simple URLRouter without AuthMiddlewareStack
    # if your outage notifications are public
    # "websocket": URLRouter(network.routing.websocket_urlpatterns),
})
