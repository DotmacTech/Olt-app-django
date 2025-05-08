import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import StraightenIcon from '@mui/icons-material/Straighten';
import EventIcon from '@mui/icons-material/Event';
import SystemUpdateIcon from '@mui/icons-material/SystemUpdate';
import ScheduleIcon from '@mui/icons-material/Schedule';
import {
  Memory as MemoryIcon,
  Speed as SpeedIcon,
  DeviceHub as DeviceHubIcon,
  Router as RouterIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  ArrowBack as ArrowBackIcon,
  SwapHoriz as SwapHorizIcon,
  SettingsEthernet as SettingsEthernetIcon,
} from '@mui/icons-material';
import { getOLTDetails, getSystemMetrics } from '../services/api';

function OLTDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [oltData, setOltData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({});
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getOLTDetails(id);
        setOltData(data);
        console.log('OLT Details API response:', data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch OLT details: ' + (err.response?.data?.detail || err.message));
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!oltData || !oltData.id) return;
      setMetricsLoading(true);
      setMetricsError(null);
      try {
        const data = await getSystemMetrics(oltData.id);
        console.log('System Metrics API response:', data);
        setMetrics({
          uptime: data.uptime,
          temperature: data.temperature,
          cpu: data.cpu,
          memory: data.memory,
          total_cards: data.total_cards
        });
      } catch (err) {
        console.error('System Metrics API error:', err);
        setMetricsError('Failed to fetch system metrics');
        setMetrics({ uptime: null, temperature: null });
      } finally {
        setMetricsLoading(false);
      }
    };
    fetchMetrics();
  }, [oltData]);

  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      inactive: 'error',
      maintenance: 'warning',
      error: 'error',
      normal: 'success',
      warning: 'warning',
      critical: 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
      case 'normal':
        return <CheckCircleIcon color="success" />;
      case 'warning':
      case 'maintenance':
        return <WarningIcon color="warning" />;
      case 'error':
      case 'critical':
      case 'inactive':
        return <ErrorIcon color="error" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  // Add this check: If not loading and no error, but oltData is still null/undefined,
  // it means the fetch might have completed without valid data yet.
  if (!oltData) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>OLT data not available or still loading...</Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/')} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5">OLT Details</Typography>
        </Box>
        <Chip
          label={oltData.status?.toUpperCase() || 'UNKNOWN'} // Use optional chaining and provide a default
          color={getStatusColor(oltData.status || 'unknown')} // Use default for color lookup too
          icon={getStatusIcon(oltData.status || 'unknown')} // Use default for icon lookup too
        />
      </Box>

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Basic Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}><Typography color="text.secondary">Name</Typography></Grid>
                <Grid item xs={8}><Typography>{oltData.name}</Typography></Grid>
                
                <Grid item xs={4}><Typography color="text.secondary">IP Address</Typography></Grid>
                <Grid item xs={8}><Typography>{oltData.ip_address}</Typography></Grid>
                
                <Grid item xs={4}><Typography color="text.secondary">Location</Typography></Grid>
                <Grid item xs={8}><Typography>{oltData.location}</Typography></Grid>
                
                <Grid item xs={4}><Typography color="text.secondary">Model</Typography></Grid>
                <Grid item xs={8}><Typography>{oltData.model}</Typography></Grid>
                
                <Grid item xs={4}><Typography color="text.secondary">Serial Number</Typography></Grid>
                <Grid item xs={8}><Typography>{oltData.serial_number}</Typography></Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Status Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>System Status</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <MemoryIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    {metricsLoading ? <CircularProgress size={18} /> : metrics.cpu !== undefined && metrics.cpu !== null ? (
                      <Typography variant="h6">{metrics.cpu}%</Typography>
                    ) : (
                      <Typography variant="h6">-</Typography>
                    )}
                    <Typography color="text.secondary">CPU Usage</Typography>
                    {metricsError && <Typography color="error" variant="caption">{metricsError}</Typography>}
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <SpeedIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    {metricsLoading ? <CircularProgress size={18} /> : metrics.memory !== undefined && metrics.memory !== null ? (
                      <Typography variant="h6">{metrics.memory}%</Typography>
                    ) : (
                      <Typography variant="h6">-</Typography>
                    )}
                    <Typography color="text.secondary">Memory Usage</Typography>
                    {metricsError && <Typography color="error" variant="caption">{metricsError}</Typography>}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                </Grid>
                <Grid item xs={4}><Typography color="text.secondary">Uptime</Typography></Grid>
                <Grid item xs={8}>
                  {metricsLoading ? <CircularProgress size={18} /> : metrics.uptime !== undefined && metrics.uptime !== null ? `${metrics.uptime}` : '- None'}
                  {metricsError && <Typography color="error" variant="caption">{metricsError}</Typography>}
                </Grid>
                
                <Grid item xs={4}><Typography color="text.secondary">Temperature</Typography></Grid>
                <Grid item xs={8}>
                  {metricsLoading ? <CircularProgress size={18} /> : metrics.temperature !== undefined && metrics.temperature !== null ? `${metrics.temperature}°C` : '-'}
                  {metricsError && <Typography color="error" variant="caption">{metricsError}</Typography>}
                </Grid>

                <Grid item xs={4}><Typography color="text.secondary">Total Cards</Typography></Grid>
                <Grid item xs={8}>
                  {metricsLoading ? <CircularProgress size={18} /> : metrics.total_cards !== undefined && metrics.total_cards !== null ? metrics.total_cards : '-'}
                  {metricsError && <Typography color="error" variant="caption">{metricsError}</Typography>}
                </Grid>

                <Grid item xs={4}><Typography color="text.secondary">Power Supply</Typography></Grid>
                <Grid item xs={8}>
                  <Chip
                    size="small"
                    label={oltData.power_supply_status?.toUpperCase() || 'UNKNOWN'} // Use optional chaining and provide a default
                    color={getStatusColor(oltData.power_supply_status || 'unknown')} // Use default for color lookup too
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Features and Capabilities */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Features and Capabilities
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2">
                  <strong>IPTV Module:</strong> {oltData.iptv_module ? 'Enabled' : 'Disabled'}
                </Typography>
                <Typography variant="body2">
                  <strong>Supported PON Types:</strong> {oltData.supported_pon_types}
                </Typography>
                <Typography variant="body2">
                  <strong>TR069 Profile:</strong> {oltData.tr069_profile || 'Not configured'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* ONT Metrics */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">ONT Metrics</Typography>
                <Typography variant="body2" color="text.secondary">
                  Status: {oltData.onu_status || 'Unknown'} | PON Port: {oltData.onu_pon_port || 'N/A'}
                </Typography>
              </Box>
              {oltData.onu_description && (
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {oltData.onu_description}
                </Typography>
              )}
              <Grid container spacing={3}>
                {/* RX Power */}
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <SignalCellularAltIcon color="primary" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        RX Power
                      </Typography>
                      <Typography variant="h6">
                        {oltData.rx_power ? `${oltData.rx_power.toFixed(2)} dBm` : 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* TX Power */}
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <SignalCellularAltIcon color="primary" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        TX Power
                      </Typography>
                      <Typography variant="h6">
                        {oltData.tx_power ? `${oltData.tx_power.toFixed(2)} dBm` : 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* Distance */}
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <StraightenIcon color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Distance
                      </Typography>
                      <Typography variant="h6">
                        {oltData.distance ? `${oltData.distance} m` : 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* Last Online */}
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <EventIcon color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Last Online
                      </Typography>
                      <Typography variant="h6">
                        {oltData.last_online ? new Date(oltData.last_online).toLocaleString() : 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* Signal Status */}
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {oltData.los_detected ? (
                      <WarningIcon color="error" />
                    ) : (
                      <CheckCircleIcon color="success" />
                    )}
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Signal Status
                      </Typography>
                      <Typography variant="h6" color={oltData.los_detected ? 'error.main' : 'success.main'}>
                        {oltData.los_detected ? 'LOS Detected' : 'Signal OK'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* Firmware Version */}
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <SystemUpdateIcon color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Firmware Version
                      </Typography>
                      <Typography variant="h6">
                        {oltData.firmware_version || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* System Overview */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DeviceHubIcon color="primary" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Cards
                      </Typography>
                      <Typography variant="h5">{metrics.total_cards || 0}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SwapHorizIcon color="primary" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Uplink Ports
                      </Typography>
                      <Typography variant="h5">{oltData.total_uplink_ports || 0}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Temperature
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" sx={{
                        color: (theme) =>
                          metrics.temperature > 70 ? theme.palette.error.main :
                          metrics.temperature > 60 ? theme.palette.warning.main :
                          'inherit'
                      }}>
                        {metrics.temperature?.toFixed(1) || 'N/A'}°C
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      System Uptime
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ScheduleIcon color="action" />
                      <Typography variant="h6">
                        {metrics.uptime || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <RouterIcon color="primary" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        PON Ports
                      </Typography>
                      <Typography variant="h5">{oltData.total_pon_ports || 0}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SettingsEthernetIcon color="primary" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Active ONUs
                      </Typography>
                      <Typography variant="h5">{oltData.active_onus || 0}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}

export default OLTDetails;
