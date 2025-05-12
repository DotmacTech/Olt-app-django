import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
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
  Button,
  Snackbar,
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
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { triggerOLTMetricsRefresh } from '../services/api'; // We'll use this for refresh

function OLTDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  // Use data and refresh function from OLTDashboard context
  const { oltData, loading: initialLoading, error: initialError, refreshOltData } = useOutletContext();
  const [isRefreshingMetrics, setIsRefreshingMetrics] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  // Helper to format values, can be expanded
  const formatValue = (value, unit = '') => {
    if (value === null || value === undefined || value === '') {
      return 'N/A';
    }
    return `${value}${unit}`;
  };

  const handleRefreshMetrics = async () => {
    if (!id) return;
    setIsRefreshingMetrics(true);
    setNotification({ open: false, message: '', severity: 'info' }); // Clear previous
    try {
      await triggerOLTMetricsRefresh(id);
      setNotification({ open: true, message: 'Metrics refresh initiated. Please wait a moment for data to update.', severity: 'info' });
      // Wait for backend to process (adjust delay as needed)
      // A longer delay might be needed if SSH connection + commands are slow
      await new Promise(resolve => setTimeout(resolve, 10000)); // 10 seconds delay
      
      if (refreshOltData) {
        await refreshOltData(); // Call the refresh function from OLTDashboard context
      }
      // Check oltData again after refresh, though notification might be optimistic
      setNotification({ open: true, message: 'Metrics refresh process completed. Data should be updated.', severity: 'success' });
    } catch (err) {
      console.error("Failed to trigger OLT metrics refresh:", err);
      setNotification({ open: true, message: `Failed to refresh metrics: ${err.response?.data?.message || err.message}`, severity: 'error' });
    } finally {
      setIsRefreshingMetrics(false);
    }
  };

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

  if (initialLoading && !oltData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }
  
  if (initialError && !oltData) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {initialError}
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Removed back button as it's part of OLTDashboard layout */}
          <Typography variant="h5">OLT Overview</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={handleRefreshMetrics}
          disabled={isRefreshingMetrics || initialLoading}
        >
          {isRefreshingMetrics ? 'Refreshing...' : 'Refresh Metrics'}
        </Button>
      </Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
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
                <Grid item xs={8}><Typography>{formatValue(oltData.name)}</Typography></Grid>
                
                <Grid item xs={4}><Typography color="text.secondary">IP Address</Typography></Grid>
                <Grid item xs={8}><Typography>{formatValue(oltData.ip_address)}</Typography></Grid>
                
                <Grid item xs={4}><Typography color="text.secondary">Location</Typography></Grid>
                <Grid item xs={8}><Typography>{formatValue(oltData.location)}</Typography></Grid>
                
                <Grid item xs={4}><Typography color="text.secondary">Model</Typography></Grid>
                <Grid item xs={8}><Typography>{formatValue(oltData.model)}</Typography></Grid>
                
                <Grid item xs={4}><Typography color="text.secondary">Serial Number</Typography></Grid>
                <Grid item xs={8}><Typography>{formatValue(oltData.serial_number)}</Typography></Grid>
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
                    <SpeedIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} /> {/* Changed to SpeedIcon for CPU */}
                    <Typography variant="h6">{formatValue(oltData.cpu_usage, '%')}</Typography>
                    <Typography color="text.secondary">CPU Usage</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <MemoryIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} /> {/* Changed to MemoryIcon for Memory */}
                    <Typography variant="h6">{formatValue(oltData.memory_usage, '%')}</Typography>
                    <Typography color="text.secondary">Memory Usage</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                </Grid>
                <Grid item xs={4}><Typography color="text.secondary">Uptime</Typography></Grid>
                <Grid item xs={8}><Typography>{formatValue(oltData.uptime)}</Typography></Grid>
                
                <Grid item xs={4}><Typography color="text.secondary">Board Temperature</Typography></Grid>
                <Grid item xs={8}><Typography>{formatValue(oltData.temperature, '°C')}</Typography></Grid>

                {/* Displaying env_temperature if available and different from board temperature */}
                {oltData.env_temperature !== null && oltData.env_temperature !== undefined && oltData.env_temperature !== oltData.temperature && (
                  <>
                    <Grid item xs={4}><Typography color="text.secondary">Env. Temperature</Typography></Grid>
                    <Grid item xs={8}><Typography>{formatValue(oltData.env_temperature, '°C')}</Typography></Grid>
                  </>
                )}

                <Grid item xs={4}><Typography color="text.secondary">Total Cards (from DB)</Typography></Grid>
                <Grid item xs={8}><Typography>{formatValue(oltData.total_cards)}</Typography></Grid>
                {/* Note: total_cards from getSystemMetrics is not directly used here anymore, relying on oltData.total_cards */}


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

        {/* Metrics Polling Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Metrics Polling Status</Typography>
              <Grid container spacing={1}>
                <Grid item xs={5}><Typography color="text.secondary">Last Update:</Typography></Grid>
                <Grid item xs={7}><Typography>{oltData.last_metrics_update ? new Date(oltData.last_metrics_update).toLocaleString() : 'N/A'}</Typography></Grid>
                
                <Grid item xs={5}><Typography color="text.secondary">Status:</Typography></Grid>
                <Grid item xs={7}><Typography>{formatValue(oltData.metrics_status)}</Typography></Grid>
                
                <Grid item xs={5}><Typography color="text.secondary">Error:</Typography></Grid>
                <Grid item xs={7}><Typography sx={{ color: oltData.metrics_error ? 'error.main' : 'inherit' }}>{formatValue(oltData.metrics_error) || 'None'}</Typography></Grid>
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
                      <Typography variant="h5">{formatValue(oltData.total_cards, '')}</Typography>
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
                      <Typography variant="h5">{formatValue(oltData.total_uplink_ports, '')}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Temperature
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" sx={{
                        color: (theme) =>
                          oltData.temperature > 70 ? theme.palette.error.main :
                          oltData.temperature > 60 ? theme.palette.warning.main :
                          'inherit'
                      }}>
                        {formatValue(oltData.temperature, '°C')}
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
                        {formatValue(oltData.uptime)}
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
                      <Typography variant="h5">{formatValue(oltData.total_pon_ports, '')}</Typography>
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
                      <Typography variant="h5">{formatValue(oltData.active_onus, '')}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setNotification({ ...notification, open: false })} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default OLTDetails;
