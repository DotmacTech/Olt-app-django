from django.test import TestCase
from unittest.mock import patch

from .models import OLT
from .tasks import check_for_new_onts


class CheckForNewONTsTaskTest(TestCase):
    """
    Test suite for the check_for_new_onts Celery task.
    """

    @patch('network.tasks.discover_unconfigured_onts_task.delay')
    def test_check_for_new_onts_calls_discovery_for_active_olts_only(self, mock_discover_task_delay):
        """
        Verify that check_for_new_onts() triggers the discovery task
        only for OLTs with 'active' status.
        """
        # 1. Setup: Create OLTs with different statuses
        active_olt = OLT.objects.create(
            name="Active-OLT-1",
            ip_address="10.0.0.1",
            status='active',
            model="Generic OLT",
            serial_number="SN_ACTIVE_001",
            hardware_version="1.0",
            software_version="1.0",
            firmware_version="1.0",
            telnet_username="admin",
            telnet_password="password",
            management_vlan=100,
            snmp_ro_community="public"
        )
        OLT.objects.create(
            name="Inactive-OLT-1",
            ip_address="10.0.0.2",
            status='inactive',
            model="Generic OLT",
            serial_number="SN_INACTIVE_001",
            hardware_version="1.0",
            software_version="1.0",
            firmware_version="1.0",
            telnet_username="admin",
            telnet_password="password",
            management_vlan=100,
            snmp_ro_community="public"
        )

        # 2. Action: Execute the task
        check_for_new_onts()

        # 3. Assertions: Check if the discovery task was called correctly
        # It should be called once, for the active OLT.
        mock_discover_task_delay.assert_called_once_with(active_olt.id)
