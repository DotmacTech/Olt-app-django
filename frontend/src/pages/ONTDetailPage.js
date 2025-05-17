import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  Breadcrumbs,
  Link,
  IconButton,
  Chip,
  Divider,
  Button, // Import Button for management actions
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getONTDetails, getOltAndPonPortInfoForONTList } from '../services/api'; // We'll add getONTDetails

function ONTDetailPage() {
  const { oltId, slotNumber, ponPortId, ontId } = useParams();
  const navigate = useNavigate();
  const [ontData, setOntData] = useState(null);
  const [parentInfo, setParentInfo] = useState({ oltName: '', ponPortIndex: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchONTData = useCallback(async () => {
    if (!ponPortId || !ontId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getONTDetails(ponPortId, ontId); // API call to /api/network/pon-ports/<ponPortId>/onts/<ontId>/
      setOntData(data);
    } catch (err) {
      console.error(`ONTDetailPage: Error fetching ONT details for ponPortId ${ponPortId}, ontId ${ontId}:`, err);
      setError(err.response?.data?.detail || err.message || 'Failed to fetch ONT details.');
    } finally {
      setLoading(false);
    }
  }, [ponPortId, ontId]);

  const fetchParentInfo = useCallback(async () => {
    if (!oltId || !slotNumber || !ponPortId) return;
    try {
      const info = await getOltAndPonPortInfoForONTList(oltId, slotNumber, ponPortId);
      setParentInfo({ oltName: info.olt_name, ponPortIndex: info.pon_port?.port_index_on_card });
    } catch (err) {
      console.error('ONTDetailPage: Error fetching parent info:', err);
      // Non-critical error, page can still function
    }
  }, [oltId, slotNumber, ponPortId]);

  useEffect(() => {
    fetchParentInfo();
    fetchONTData();
  }, [fetchParentInfo,fetchONTData]);

  const getStatusChip = (status) => {
    if (status?.toLowerCase() === "online") {
      return <Chip label="Online" color="success" size="small" />;
    } else if (status?.toLowerCase() === "offline") {
      return <Chip label="Offline" color="error" size="small" />;
    } else if (status) {
      return <Chip label={status.toUpperCase()} color="warning" size="small" />;
    }
    return <Chip label="Unknown" size="small" />;
  };

  const formatPower = (power) => (power !== null && power !== undefined ? `${power.toFixed(2)} dBm` : 'N/A');
  const formatDate = (dateString) => (dateString ? new Date(dateString).toLocaleString() : 'N/A');

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
  }

  if (!ontData) {
    return <Alert severity="info" sx={{ m: 2 }}>ONT data not found.</Alert>;
  }

  const breadcrumbPath = `/olts/${oltId}/slot/${slotNumber}/ponport/${ponPortId}/onts`;

  return (
    <Box>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link component={RouterLink} underline="hover" color="inherit" to="/olt-list">OLTs</Link>
        <Link component={RouterLink} underline="hover" color="inherit" to={`/olt/${oltId}/cards`}>{parentInfo.oltName || `OLT ${oltId}`}</Link>
        <Link component={RouterLink} underline="hover" color="inherit" to={`/olts/${oltId}/slot/${slotNumber}/ponports`}>Slot {slotNumber}</Link>
        <Link component={RouterLink} underline="hover" color="inherit" to={breadcrumbPath}>
          PON Port {parentInfo.ponPortIndex !== null ? parentInfo.ponPortIndex : ponPortId} ONTs
        </Link>
        <Typography color="text.primary">ONT: {ontData.serial_number || ontData.external_id || 'N/A'}</Typography>
      </Breadcrumbs>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => navigate(breadcrumbPath)} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1">
            ONT Details: {ontData.serial_number || ontData.external_id || 'N/A'}
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }}/>

        {/* Main Grid Container for Two Columns */}
        <Grid container spacing={2}>
          {/* Left Column (8/12 width on medium/large screens, full width on small) */}
          <Grid item xs={12} md={8}>
            {/* General & Location Card */}
            <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>General & Location</Typography>
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6}><Typography><strong>External ID:</strong> {ontData.external_id || ontData.serial_number || 'N/A'}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography><strong>Serial Number:</strong> {ontData.serial_number || ontData.external_id || 'N/A'}</Typography></Grid> {/* Display both if available */}
                <Grid item xs={12} sm={6}><Typography><strong>Status:</strong> {getStatusChip(ontData.status)}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography><strong>Last Status Update:</strong> {formatDate(ontData.last_status_update)}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography><strong>ONT Index on Port:</strong> {ontData.ont_index_on_port || 'N/A'}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography><strong>ONU Type:</strong> {ontData.onu_type_name || ontData.device_type || 'N/A'}</Typography></Grid> {/* Use onu_type_name or device_type */}
                <Grid item xs={12} sm={6}><Typography><strong>Zone:</strong> {ontData.zone || 'N/A'}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography><strong>Location:</strong> {ontData.address || 'N/A'}</Typography></Grid>
              </Grid>
            </Paper>

            {/* Network Configuration Card */}
            <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>Network Configuration</Typography>
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6}><Typography><strong>Service VLAN:</strong> {ontData.service_vlan || 'N/A'}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography><strong>Operating Mode:</strong> {ontData.operating_mode || 'N/A'}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography><strong>WAN VLAN:</strong> {ontData.wan_vlan || 'N/A'}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography><strong>Management IP (on VLAN {ontData.management_vlan || 'N/A'}):</strong> {ontData.management_ip || 'N/A'}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography><strong>WAN Connection Setup:</strong> {ontData.wan_connection_mode || 'N/A'}</Typography></Grid>
                {/* Add other network config details here */}
              </Grid>
            </Paper>

            {/* Ethernet Ports Card */}
            <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>Ethernet Ports (LAN)</Typography>
              {ontData.ethernet_ports && ontData.ethernet_ports.length > 0 ? (
                <>
                  <Grid container spacing={1}>
                    {ontData.ethernet_ports.map((port, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Typography>
                          <strong>{port.name || `Port ${index + 1}`}:</strong> {port.status || 'N/A'} (DHCP: {port.dhcp_status || 'N/A'})
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                  {ontData.lan_dhcp_overall_status && (
                    <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                      Overall DHCP Control on LAN ports: {ontData.lan_dhcp_overall_status}
                    </Typography>
                  )}
                </>
              ) : (
                <Typography>No Ethernet port information available.</Typography>
              )}
            </Paper>

            {/* WiFi Configuration Card */}
            <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>WiFi Configuration</Typography>
              {ontData.wifi_configurations && ontData.wifi_configurations.length > 0 ? (
                <Grid container spacing={1}>
                  {ontData.wifi_configurations.map((wifi, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Typography>
                        <strong>{wifi.ssid_name_or_type || `WiFi ${index + 1}`}:</strong> Status: {wifi.status || 'N/A'}, DHCP: {wifi.dhcp_status || 'N/A'}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography>No WiFi configuration information available.</Typography>
              )}
            </Paper>

             {/* Last Event Card (Keeping existing data) */}
            <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>Last Event</Typography>
               <Grid container spacing={1}>
                <Grid item xs={12} sm={6}><Typography><strong>Last Down Time:</strong> {formatDate(ontData.last_down_time)}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography><strong>Last Down Cause:</strong> {ontData.last_down_cause || 'N/A'}</Typography></Grid>
               </Grid>
            </Paper>

             {/* Timestamps Card (Keeping existing data) */}
            <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>Timestamps</Typography>
               <Grid container spacing={1}>
                <Grid item xs={12} sm={6}><Typography><strong>Last SNMP Update:</strong> {formatDate(ontData.last_snmp_update)}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography><strong>Created At:</strong> {formatDate(ontData.created_at)}</Typography></Grid>
               </Grid>
            </Paper>

          </Grid>

          {/* Right Column (4/12 width on medium/large screens, full width on small) */}
          <Grid item xs={12} md={4}>
            {/* Signal Quality Card (Keeping existing data) */}
            <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>Signal Quality</Typography>
              <Typography><strong>RX Power at ONT:</strong> {formatPower(ontData.rx_power_at_ont)}</Typography>
              <Typography><strong>TX Power at ONT:</strong> {formatPower(ontData.tx_power_at_ont)}</Typography>
              <Typography><strong>RX Power at OLT:</strong> {formatPower(ontData.rx_power_at_olt)}</Typography>
              <Typography><strong>Distance:</strong> approx. {ontData.distance !== undefined && ontData.distance !== null ? ontData.distance + ' meters' : 'N/A'}</Typography> {/* Added Distance */}
            </Paper>

            {/* Features Card */}
            <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>Features</Typography>
              <Typography><strong>VoIP:</strong> {ontData.voip_status || 'N/A'}</Typography> {/* Added VoIP */}
              <Typography><strong>CATV Support:</strong> {ontData.catv_support_status || 'N/A'}</Typography> {/* Added CATV */}
            </Paper>

            {/* Management Actions Card */}
            <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>Management Actions</Typography>
              <Box sx={{ display: 'grid', gap: 1 }}> {/* Use Box with display grid for button layout */}
                {/* Replace # with actual frontend routes or backend endpoints */}
                <Button component={RouterLink} to={`/onts/${ontId}/configure-sn`} variant="outlined" size="small">Configure SN</Button>
                <Button component={RouterLink} to={`/onts/${ontId}/configure-type`} variant="outlined" size="small">Configure Type</Button>
                <Button component={RouterLink} to={`/onts/${ontId}/configure-location`} variant="outlined" size="small">Configure Location</Button>
                <Button component={RouterLink} to={`/onts/${ontId}/configure-vlans`} variant="outlined" size="small">Configure VLANs</Button>
                <Button component={RouterLink} to={`/onts/${ontId}/speed-profiles`} variant="outlined" size="small">Speed Profiles</Button>
                <Button component={RouterLink} to={`/onts/${ontId}/port-settings`} variant="outlined" size="small">Port Settings</Button>
                {/* Add more action buttons as needed */}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}

export default ONTDetailPage;