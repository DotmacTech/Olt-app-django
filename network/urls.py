from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    OLTViewSet, CardViewSet, PONPortViewSet,
    UplinkPortViewSet, VLANViewSet, ONUTypeViewSet,
    ONUViewSet, ZoneViewSet, ODBViewSet, SpeedProfileViewSet
)
# from .api.views import OLTViewSet
from django.urls import path, include

router = DefaultRouter()
router.register(r'olts', OLTViewSet)
router.register(r'cards', CardViewSet)
router.register(r'pon-ports', PONPortViewSet)
router.register(r'uplink-ports', UplinkPortViewSet)
router.register(r'vlans', VLANViewSet)
router.register(r'onu-types', ONUTypeViewSet)
router.register(r'onus', ONUViewSet)
router.register(r'zones', ZoneViewSet)
router.register(r'odbs', ODBViewSet)
router.register(r'speed-profiles', SpeedProfileViewSet)

from network.api.system_metrics_api import SystemMetricsAPIView

urlpatterns = [
    path('', include(router.urls)),
    path('system-metrics/', SystemMetricsAPIView.as_view(), name='system-metrics'),
]
