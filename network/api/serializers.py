from rest_framework import serializers
from ..models import Zone

class ZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Zone
        fields = ['id', 'name', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']
