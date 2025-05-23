from django.urls import re_path
from .consumers import PONPortConsumer, PONOutageConsumer, PonPortRefreshConsumer

websocket_urlpatterns = [
    re_path(r'ws/pon_outages/$', PONOutageConsumer.as_asgi()),
    re_path(r'ws/pon_ports/$', PONPortConsumer.as_asgi()),
    re_path(r'ws/pon_port_refresh/(?P<pon_port_id>\w+)/$', PonPortRefreshConsumer.as_asgi()),
]