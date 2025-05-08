from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import asyncio
from network.utils.snmp_utils import get_system_metrics

class SystemMetricsAPIView(APIView):
    def get(self, request):
        from network.models import OLT
        olt_id = request.query_params.get('olt_id')
        board = request.query_params.get('board')
        if not olt_id:
            return Response({'error': 'olt_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            olt = OLT.objects.get(id=olt_id)
        except OLT.DoesNotExist:
            return Response({'error': 'OLT not found'}, status=status.HTTP_404_NOT_FOUND)
        host = olt.ip_address
        ssh_username = olt.telnet_username
        ssh_password = olt.telnet_password
        try:
            metrics = get_system_metrics(host, ssh_username, ssh_password, board)
            print("[API DEBUG] metrics to return:", metrics)
            return Response(metrics)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)