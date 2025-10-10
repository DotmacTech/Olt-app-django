from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from .views import (
    OLTViewSet, CardViewSet, PONPortViewSet, UplinkPortViewSet, VLANViewSet,
    ONUTypeViewSet, ONUViewSet, ODBViewSet, SpeedProfileViewSet, NetworkStatusDataViewSet,
    SystemMetricsAPIView, get_olt_pon_port_context_info, dashboard_summary_view,
    pon_outage_list_view, refresh_components, refresh_onts, refresh_olts, refresh_pon_ports,
    unconfigured_ont_list, AllONTListAPIView  # Add AllONTListAPIView to imports
)
from .api.views import ZoneViewSet

# Base router
router = DefaultRouter()
router.register(r'olts', OLTViewSet)
router.register(r'cards', CardViewSet, basename='card')
router.register(r'pon-ports', PONPortViewSet, basename='ponport') # Top-level access to PON ports
router.register(r'uplink-ports', UplinkPortViewSet)
router.register(r'vlans', VLANViewSet)
router.register(r'onu-types', ONUTypeViewSet)
router.register(r'onts', ONUViewSet, basename='ont')
router.register(r'zones', ZoneViewSet)
router.register(r'odbs', ODBViewSet)
router.register(r'speed-profiles', SpeedProfileViewSet)
router.register(r'network-status', NetworkStatusDataViewSet, basename='network-status')

# Custom URLs (add these BEFORE including router.urls)
custom_urls = [
    # Discovery and unconfigured ONTs endpoints
    path('unconfigured-onts/', unconfigured_ont_list, name='unconfigured-ont-list'),
    path('all-onts/', AllONTListAPIView.as_view(), name='all-onts-list'),  # Change path to avoid conflict

    # System metrics and monitoring
    path('system-metrics/', SystemMetricsAPIView.as_view(), name='system-metrics'),
    
    # Dashboard endpoints
    path('dashboard/summary/', dashboard_summary_view, name='dashboard-summary'),
    path('dashboard/pon-outages/', pon_outage_list_view, name='dashboard-pon-outages'),

    # Refresh endpoints
    path('onts/refresh/', refresh_onts, name='refresh-onts'),
    path('olts/refresh/', refresh_olts, name='refresh-olts'),
    path('pon-ports/refresh/', refresh_pon_ports, name='refresh-pon-ports'),

    # ONT and PON Port specific endpoints
    path('onts/', AllONTListAPIView.as_view(), name='all-onts-list'),
    path(
        'olts/<int:olt_id>/slot/<int:slot_number>/ponport/<int:pon_port_id>/info-for-ont-list/',
        get_olt_pon_port_context_info,
        name='olt-ponport-context-info'
    ),
]

# Nested router for OLTs
olts_router = routers.NestedSimpleRouter(router, r'olts', lookup='olt')
olts_router.register(r'cards', CardViewSet, basename='olt-cards')
# olts_router.register(r'pon-ports', PONPortViewSet, basename='olt-ponports') # If you want OLT -> PONPort

# Nested router for PONPorts -> ONUs
# This will create URLs like /api/pon-ports/{pon_port_pk}/onts/
pon_ports_router = routers.NestedSimpleRouter(router, r'pon-ports', lookup='pon_port')
pon_ports_router.register(r'onts', ONUViewSet, basename='ponport-onts')

urlpatterns = [
    # Include custom URLs first (higher priority)
    *custom_urls,
    
    # Include router URLs
    path('', include(router.urls)),
    path('', include(olts_router.urls)),
    path('', include(pon_ports_router.urls)),
]
