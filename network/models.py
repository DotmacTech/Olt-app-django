from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.core.validators import MaxValueValidator, MinValueValidator
class OLT(models.Model):
    # Basic Information
    name = models.CharField(max_length=100)
    ip_address = models.GenericIPAddressField()
    location = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    model = models.CharField(max_length=100)
    serial_number = models.CharField(max_length=100, unique=True)
    hardware_version = models.CharField(max_length=50)
    software_version = models.CharField(max_length=50)
    firmware_version = models.CharField(max_length=100)
    
    # Access Information
    vpn_reachable = models.BooleanField(default=True, help_text='Reachable via VPN tunnel')
    telnet_port = models.IntegerField(default=23)
    telnet_username = models.CharField(max_length=100)
    telnet_password = models.CharField(max_length=100)
    snmp_ro_community = models.CharField(max_length=100, help_text='SNMP read-only community')
    snmp_rw_community = models.CharField(max_length=100, help_text='SNMP read-write community')
    snmp_port = models.IntegerField(default=161, help_text='SNMP UDP port')
    
    # Features and Capabilities
    iptv_module = models.BooleanField(default=False)
    supported_pon_types = models.CharField(max_length=100, default='GPON')
    tr069_profile = models.CharField(max_length=100, blank=True)
    
    # Status Information
    status = models.CharField(max_length=20, choices=[
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('maintenance', 'Maintenance'),
        ('error', 'Error')
    ], default='inactive')
    uptime = models.CharField(max_length=100, blank=True)
    last_seen = models.DateTimeField(auto_now=True)
    
    # Hardware Information
    cpu_usage = models.FloatField(null=True, blank=True)
    # memory_usage = models.FloatField(null=True, blank=True) # Removed duplicate definition
    env_temperature = models.FloatField(null=True, blank=True)
    power_supply_status = models.CharField(max_length=20, choices=[
        ('normal', 'Normal'),
        ('warning', 'Warning'),
        ('critical', 'Critical')
    ], default='normal')
    
    # Network Information
    management_vlan = models.IntegerField()
    snmp_version = models.CharField(max_length=10, choices=[
        ('v1', 'Version 1'),
        ('v2c', 'Version 2c'),
        ('v3', 'Version 3')
    ], default='v2c')
    snmp_community = models.CharField(max_length=100, blank=True)
    
    # System Metrics
    temperature = models.FloatField(null=True, blank=True)
    memory_usage = models.FloatField(null=True, blank=True)
    memory_total = models.BigIntegerField(null=True, blank=True)  # in bytes
    memory_free = models.BigIntegerField(null=True, blank=True)   # in bytes
    storage_usage = models.FloatField(null=True, blank=True)
    last_metrics_update = models.DateTimeField(null=True, blank=True)
    metrics_status = models.CharField(max_length=50, default='unknown')  # success, error, unknown
    metrics_error = models.TextField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'OLT'
        verbose_name_plural = 'OLTS'

    def get_total_cards(self):
        return self.cards.count()

    # def get_total_pon_ports(self):
    #     return self.pon_ports.count()

    # def get_total_uplink_ports(self):
    #     return self.uplink_ports.count()

    # def get_total_vlans(self):
    #     return self.vlans.count()

    # def get_active_onus(self):
    #     return sum(port.onus.filter(status='active').count() for port in self.pon_ports.all())

class Card(models.Model):
    olt = models.ForeignKey(OLT, on_delete=models.CASCADE, related_name='cards')
    slot_number = models.IntegerField()
    card_type = models.CharField(max_length=100)
    status = models.CharField(max_length=50)
    port_count = models.IntegerField(default=0, help_text='Number of ports on this card')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.olt.name} - Slot {self.slot_number}"

    class Meta:
        # Ensures that for a given OLT, each slot_number is unique
        unique_together = ('olt', 'slot_number')

class PONPort(models.Model):
    card = models.ForeignKey(Card, on_delete=models.CASCADE, related_name='pon_ports')
    port_index_on_card = models.IntegerField(help_text="Index of the port on the card, e.g., 0-15")
    description = models.CharField(max_length=255, blank=True, null=True)
    # status field stores the raw status from SNMP, e.g., "1" for up, "2" for down
    status = models.CharField(max_length=50, blank=True, null=True) 
    configured_onts = models.IntegerField(default=0)
    online_onts = models.IntegerField(default=0)
    tx_power = models.FloatField(null=True, blank=True, help_text="OLT Port Transmit Power (dBm)")
    rx_power = models.FloatField(null=True, blank=True, help_text="OLT Port Receive Power (dBm)")
    # signal_strength = models.FloatField(null=True, blank=True) # Retaining if used for other purposes
    # is_outage = models.BooleanField(default=False) # Retaining if used for other purposes, can be derived from status
    
    last_snmp_update = models.DateTimeField(null=True, blank=True, help_text="Timestamp of the last successful SNMP data fetch for this port")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.card.olt.name} - Card {self.card.slot_number} - Port {self.port_index_on_card}"

class UplinkPort(models.Model):
    olt = models.ForeignKey(OLT, on_delete=models.CASCADE, related_name='uplink_ports')
    port_number = models.IntegerField()
    status = models.CharField(max_length=50)
    speed = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.olt.name} - Uplink {self.port_number}"

class VLAN(models.Model):
    olt = models.ForeignKey(OLT, on_delete=models.CASCADE, related_name='vlans')
    vlan_id = models.IntegerField()
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} (VLAN {self.vlan_id})"

class ONUType(models.Model):
    unique_id = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=100)
    pon_type = models.CharField(max_length=50)
    ethernet_ports = models.PositiveIntegerField(default=0)
    wifi_ssids = models.PositiveIntegerField(default=0)
    voip_ports = models.PositiveIntegerField(default=0)
    catv = models.BooleanField(default=False)
    allow_custom_profiles = models.BooleanField(default=False)
    default_custom_profile = models.CharField(max_length=100, blank=True, null=True)
    capability = models.CharField(max_length=20, choices=[('Bridging', 'Bridging'), ('Bridging/Routing', 'Bridging/Routing')], default='Bridging/Routing')
    onu_type_image = models.ImageField(upload_to='onu_type_images/', blank=True, null=True, help_text="Maximum image size is 400x90 px")
    ethernet_ports_prefix = models.CharField(max_length=50, default='eth_0/')
    wifi_ssids_prefix = models.CharField(max_length=50, default='wifi_0/')
    voip_ports_prefix = models.CharField(max_length=50, default='pots_0/')
    image_url = models.URLField(blank=True, null=True)  # Retain for compatibility
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class ONU(models.Model):
    pon_port = models.ForeignKey(PONPort, on_delete=models.CASCADE, related_name='onus')
    serial_number = models.CharField(max_length=100, unique=True)
    ont_index_on_port = models.IntegerField(help_text="Index of the ONT on the PON port, e.g., 0-127")
    status = models.CharField(max_length=50, blank=True, null=True, help_text="e.g., online, offline, los") # Raw status from SNMP
    # Signal strength at the ONT (received from OLT)
    rx_power_at_ont = models.FloatField(null=True, blank=True, help_text="ONT Receive Power from OLT (dBm)")
    # Signal strength transmitted by the ONT
    tx_power_at_ont = models.FloatField(null=True, blank=True, help_text="ONT Transmit Power (dBm)")
    # Signal strength from ONT as received by OLT
    rx_power_at_olt = models.FloatField(null=True, blank=True, help_text="OLT Receive Power from ONT (dBm)")
    
    onu_type = models.ForeignKey(ONUType, on_delete=models.CASCADE, related_name='onus')

    # New fields from form image
    board = models.CharField(max_length=50, blank=True, null=True, help_text="Board (optional)")
    port = models.CharField(max_length=50, blank=True, null=True, help_text="Port (optional)")
    onu_mode = models.CharField(max_length=20, choices=[('Routing', 'Routing'), ('Bridging', 'Bridging')], default='Routing')
    user_vlan_id = models.CharField(max_length=50, blank=True, null=True)
    zone = models.ForeignKey('Zone', on_delete=models.SET_NULL, blank=True, null=True, related_name='onus')
    odb = models.ForeignKey('ODB', on_delete=models.SET_NULL, blank=True, null=True, related_name='onus', help_text="ODB (Splitter)")
    odb_port = models.CharField(max_length=50, blank=True, null=True, help_text="ODB port (optional)")
    download_speed = models.CharField(max_length=20, blank=True, null=True)
    upload_speed = models.CharField(max_length=20, blank=True, null=True)
    name = models.CharField(max_length=100, blank=True, null=True)
    address_or_comment = models.TextField(blank=True, null=True)
    onu_external_id = models.CharField(max_length=100, blank=True, null=True, help_text="Use the unique ONU external ID with API or billing systems")
    use_gps = models.BooleanField(default=False)
    use_custom_profile = models.BooleanField(default=False, help_text="For better compatibility with generic ONUs")
    
    last_down_time = models.DateTimeField(null=True, blank=True)
    last_down_cause = models.CharField(max_length=100, blank=True, null=True)
    
    last_snmp_update = models.DateTimeField(null=True, blank=True, help_text="Timestamp of the last successful SNMP data fetch for this ONU")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.serial_number} ({self.onu_type.name})"
    class Meta:
        unique_together = ('pon_port', 'ont_index_on_port') # An ONT index is unique per PON port
class Zone(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class ODB(models.Model):
    zone = models.ForeignKey(Zone, on_delete=models.CASCADE, related_name='odbs')
    name = models.CharField(max_length=100)
    latitude = models.DecimalField(max_digits=10, decimal_places=8)
    longitude = models.DecimalField(max_digits=11, decimal_places=8)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class SpeedProfile(models.Model):
    name = models.CharField(max_length=100, default='Default Profile')
    download_speed = models.PositiveIntegerField(
        default=100,
        help_text="Download speed in Mbps"
    )
    upload_speed = models.PositiveIntegerField(
        default=50,
        help_text="Upload speed in Mbps"
    )
    type = models.CharField(
        max_length=50,
        choices=[
            ('INTERNET', 'Internet'),
            ('VOIP', 'VoIP'),
            ('IPTV', 'IPTV'),
            ('TR069', 'TR069')
        ],
        default='INTERNET'
    )
    vlan = models.PositiveIntegerField(
        default=1,
        help_text="VLAN ID"
    )
    priority = models.PositiveSmallIntegerField(
        default=0,
        help_text="Priority level (0-7, where 0 is highest)",
        validators=[MinValueValidator(0), MaxValueValidator(7)]
    )
    dscp = models.CharField(
        max_length=50,
        default='AF41',
        blank=True,
        help_text="DSCP marking (e.g., AF11, EF, CS1, etc.)"
    )
    policer_cir = models.PositiveIntegerField(
        default=100000,  # 100 Mbps
        help_text="Committed Information Rate (kbps)"
    )
    policer_cbs = models.PositiveIntegerField(
        default=2000,  # 2000 bytes
        help_text="Committed Burst Size (bytes)"
    )
    policer_eir = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Excess Information Rate (kbps, optional)"
    )
    policer_ebs = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Excess Burst Size (bytes, optional)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Speed Profile'
        verbose_name_plural = 'Speed Profiles'

    def __str__(self):
        return f"{self.name} ({self.download_speed}D/{self.upload_speed}U Mbps)"

    @property
    def speed_display(self):
        """Return a formatted string of the speed profile"""
        return f"{self.download_speed}/{self.upload_speed} Mbps"

    def save(self, *args, **kwargs):
        # Add any validation or pre-save logic here
        super().save(*args, **kwargs)

class NetworkStatus(models.Model):
    """Tracks the status of various network components."""
    STATUS_CHOICES = [
        ('up', 'Up'),
        ('down', 'Down'),
        ('degraded', 'Degraded'),
        ('maintenance', 'Maintenance'),
    ]
    
    name = models.CharField(max_length=100, unique=True, help_text="Name of the network component")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='up')
    last_checked = models.DateTimeField(auto_now=True)
    response_time = models.FloatField(null=True, blank=True, help_text="Response time in milliseconds")
    uptime = models.FloatField(default=100.0, help_text="Uptime percentage")
    component_type = models.CharField(max_length=50, help_text="Type of network component")
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    location = models.CharField(max_length=200, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    is_monitored = models.BooleanField(default=True)
    last_status_change = models.DateTimeField(auto_now_add=True)
    
    # Additional metrics
    cpu_usage = models.FloatField(null=True, blank=True, help_text="CPU usage percentage")
    memory_usage = models.FloatField(null=True, blank=True, help_text="Memory usage percentage")
    disk_usage = models.FloatField(null=True, blank=True, help_text="Disk usage percentage")
    
    # Network specific metrics
    bandwidth_usage = models.FloatField(null=True, blank=True, help_text="Bandwidth usage percentage")
    packet_loss = models.FloatField(null=True, blank=True, help_text="Packet loss percentage")
    
    class Meta:
        verbose_name_plural = 'Network Statuses'
        ordering = ['component_type', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.get_status_display()})"
    
    def save(self, *args, **kwargs):
        # Update last_status_change if status changed
        if self.pk:
            old_status = NetworkStatus.objects.get(pk=self.pk).status
            if old_status != self.status:
                self.last_status_change = timezone.now()
        super().save(*args, **kwargs)

class PONOutageEvent(models.Model):
    """
    Records detected PON port outages.
    """
    pon_port = models.ForeignKey(PONPort, on_delete=models.CASCADE, related_name='outage_events')
    start_time = models.DateTimeField(default=timezone.now)
    end_time = models.DateTimeField(null=True, blank=True)
    # Store a summary or count of affected ONTs at the time of detection
    affected_ont_count = models.PositiveIntegerField(default=0)
    # Store the most common detected cause among affected ONTs
    possible_cause = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        status = "Active" if self.end_time is None else f"Ended {self.end_time.strftime('%Y-%m-%d %H:%M')}"
        return f"Outage on {self.pon_port} ({status})"

    class Meta:
        ordering = ['-start_time']

class NetworkStatusData(models.Model):
    """
    Stores historical network status data for charting and analysis.
    """
    timestamp = models.DateTimeField(default=timezone.now)
    online_onts = models.PositiveIntegerField(default=0)
    offline_onts = models.PositiveIntegerField(default=0)
    signal_loss_onts = models.PositiveIntegerField(default=0)
    power_failure_onts = models.PositiveIntegerField(default=0)
    total_onts = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=[
        ('up', 'Up'),
        ('degraded', 'Degraded'),
        ('down', 'Down'),
        ('maintenance', 'Maintenance')
    ], default='up')
    
    # Additional metrics
    avg_rx_power = models.FloatField(null=True, blank=True)
    avg_tx_power = models.FloatField(null=True, blank=True)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Network Status Data'
        verbose_name_plural = 'Network Status Data'
        
    def __str__(self):
        return f"Network Status at {self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}"
