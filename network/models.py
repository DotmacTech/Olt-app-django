from django.db import models

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
    image_url = models.URLField()
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
    name = models.CharField(max_length=100)
    download_speed = models.CharField(max_length=50)
    upload_speed = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
