import React, { useState, useEffect } from 'react';
import { getDashboardSummary, getPONOutageList, refreshComponents, refreshAllOnts, refreshAllOlts } from '../services/api';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table, 
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  ButtonGroup,
  Tooltip,
  Snackbar,
  IconButton
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { formatDistanceToNow } from 'date-fns'; 

function DashboardPage() {
  const [summaryData, setSummaryData] = useState(null);
  const [outageData, setOutageData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState({
    onts: false,
    olts: false,
    ponPorts: false
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // WebSocket ref (to persist between renders)
  const wsRef = React.useRef(null);

  // Handle refresh button clicks
  const handleRefresh = async (component) => {
    console.log(`Starting refresh for ${component}`);
    try {
      // Set loading state for the specific component
      setRefreshing(prev => ({ ...prev, [component]: true }));
      
      let responseData;
      let success = true;
      let errorMessage = '';
      
      // Special handling for different component types
      if (component === 'onts') {
        try {
          responseData = await refreshAllOnts();
          console.log('ONT refresh response:', responseData);
          success = true;
        } catch (error) {
          console.error('Error refreshing ONTs:', error);
          success = false;
          errorMessage = error.message || 'Failed to refresh ONTs';
        }
      } else if (component === 'olts') {
        try {
          responseData = await refreshAllOlts();
          console.log('OLT refresh response:', responseData);
          success = true;
        } catch (error) {
          console.error('Error refreshing OLTs:', error);
          success = false;
          errorMessage = error.message || 'Failed to refresh OLTs';
        }
      } else {
        // For other components, use the existing fetch logic
        const csrfToken = getCookie('csrftoken');
        console.log('CSRF Token:', csrfToken ? 'Found' : 'Not found');
        
        if (!csrfToken) {
          throw new Error('CSRF token not found. Please refresh the page and try again.');
        }
        
        // Map components to their endpoints
        const endpoints = {
          olt_metrics: '/api/olts/refresh-metrics/',
          pon_ports: '/api/pon-ports/refresh/'
        };
        
        const endpoint = endpoints[component];
        console.log('Using endpoint:', endpoint);
        
        if (!endpoint) {
          throw new Error(`No refresh endpoint configured for ${component}`);
        }
        
        try {
          // Call the specific refresh API endpoint
          console.log('Sending request to:', endpoint);
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': csrfToken,
            },
            credentials: 'include',
          });
          
          const responseText = await response.text();
          responseData = responseText ? JSON.parse(responseText) : {};
          
          if (!response.ok) {
            throw new Error(responseData.error || responseData.detail || `Failed to refresh ${component}`);
          }
          success = true;
        } catch (error) {
          console.error(`Error refreshing ${component}:`, error);
          success = false;
          errorMessage = error.message || `Failed to refresh ${component}`;
        }
      }

      if (!success) {
        throw new Error(errorMessage);
      }

      setSnackbar({
        open: true,
        message: responseData.message || responseData.detail || `${component.replace('_', ' ').toUpperCase()} refresh started successfully`,
        severity: 'success'
      });
      
    } catch (error) {
      console.error(`Error refreshing ${component}:`, error);
      setSnackbar({
        open: true,
        message: error.message || `Failed to refresh ${component}`,
        severity: 'error'
      });
    } finally {
      // Reset loading state
      setRefreshing(prev => ({ ...prev, [component]: false }));
    }
  };

  // Helper function to get CSRF token
  const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // WebSocket connection and reconnection logic
  const connectWebSocket = React.useCallback(() => {
    setLoading(true);
    setError(null);
    
    // Use environment variable or fallback to current host
    const backendHost = process.env.REACT_APP_WS_BACKEND_HOST || 
                      `${window.location.hostname}:${window.location.port || (window.location.protocol === 'https:' ? '443' : '80')}`;
    
    // Use wss:// if the current page is loaded over https, otherwise use ws://
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${backendHost}/ws/pon_outages/`;
    
    console.log('Connecting to WebSocket:', wsUrl);
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setLoading(false);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (!msg || !msg.type) {
            console.warn('Received message without type:', msg);
            return;
          }
          
          console.log('Received message type:', msg.type, 'data:', msg.data);
          
          switch(msg.type) {
            case 'dashboard_summary':
              setSummaryData(msg.data);
              break;
              
            case 'new_outage':
            case 'updated_outage':
            case 'resolved_outage':
              if (!msg.data) {
                console.warn('Received outage event without data:', msg);
                return;
              }
              setOutageData(prev => {
                switch(msg.type) {
                  case 'new_outage':
                    return [msg.data, ...prev];
                  case 'updated_outage':
                    return prev.map(item => item.id === msg.data.id ? msg.data : item);
                  case 'resolved_outage':
                    return prev.filter(item => item.id !== msg.data.id);
                  default:
                    return prev;
                }
              });
              break;
              
            default:
              console.warn('Unhandled message type:', msg.type);
          }
        } catch (e) {
          console.error('Error processing WebSocket message:', e);
          setError('Error processing server message');
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error. Reconnecting...');
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        if (!wsRef.current) return; // Component unmounted
        
        // Attempt to reconnect after a delay
        setError('Disconnected. Reconnecting...');
        setTimeout(() => {
          if (wsRef.current) { // Check if component is still mounted
            connectWebSocket();
          }
        }, 3000); // Reconnect after 3 seconds
      };
      
      return ws;
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      setError('Failed to connect. Retrying...');
      // Retry connection after delay
      const retryTimer = setTimeout(() => {
        if (wsRef.current) { // Check if component is still mounted
          connectWebSocket();
        }
      }, 5000);
      
      return () => clearTimeout(retryTimer);
    }
  }, []);

  // Initialize WebSocket connection on component mount
  useEffect(() => {
    const ws = connectWebSocket();
    
    // Cleanup function
    return () => {
      console.log('Cleaning up WebSocket');
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connectWebSocket]);

  const getOltStatusChip = (statusValue, statusDisplay) => {
    if (statusValue?.toLowerCase() === "active") {
      return <Chip label={statusDisplay || "Active"} color="success" size="small" />;
    } else if (statusValue?.toLowerCase() === "inactive" || statusValue?.toLowerCase() === "offline") {
      return <Chip label={statusDisplay || "Inactive"} color="error" size="small" />;
    } else if (statusDisplay) {
      return <Chip label={statusDisplay} color="warning" size="small" />;
    }
    return <Chip label="Unknown" size="small" />;
  };

  const formatTemperature = (temp) => (temp !== null && temp !== undefined ? `${temp}°C` : 'N/A');

  const formatTimeSince = (dateTimeString) => {
      if (!dateTimeString) return 'N/A';
      try {
          const date = new Date(dateTimeString);
          return formatDistanceToNow(date, { addSuffix: true });
      } catch (e) {
          console.error("Error formatting date:", dateTimeString, e);
          return 'Invalid Date';
      }
  };

  if (loading && !summaryData && outageData.length === 0) {
    // Only show full loading spinner on initial load
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;
  }

  if (error && !summaryData && outageData.length === 0) {
     // Only show full error on initial load
    return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Box sx={{ p: 3, width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4">Dashboard</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Tooltip title="Refresh all ONTs">
              <Button 
                variant="outlined"
                size="small"
                onClick={() => handleRefresh('onts')}
                disabled={refreshing.onts}
                startIcon={<RefreshIcon />}
                sx={{ minWidth: 120 }}
              >
                {refreshing.onts ? 'Refreshing...' : 'Refresh ONTs'}
              </Button>
            </Tooltip>
            <Tooltip title="Refresh all OLTs">
              <Button 
                variant="outlined"
                size="small"
                onClick={() => handleRefresh('olts')}
                disabled={refreshing.olts}
                startIcon={<RefreshIcon />}
                sx={{ minWidth: 120 }}
              >
                {refreshing.olts ? 'Refreshing...' : 'Refresh OLTs'}
              </Button>
            </Tooltip>
            <Tooltip title="Refresh all PON Ports">
              <Button 
                variant="outlined"
                size="small"
                onClick={() => handleRefresh('pon_ports')}
                disabled={refreshing.ponPorts}
                startIcon={<RefreshIcon />}
                sx={{ minWidth: 140 }}
              >
                {refreshing.ponPorts ? 'Refreshing...' : 'Refresh PON Ports'}
              </Button>
            </Tooltip>
          </Box>
        </Box>

        {error && (
           // Show error as a banner if data was partially loaded
           <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>Total OLTs</Typography>
                <Typography variant="h5">{summaryData?.total_olts ?? '...'}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>Online OLTs</Typography>
                <Typography variant="h5" color="success.main">{summaryData?.online_olts_count ?? '...'}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>Total ONTs</Typography>
                <Typography variant="h5">
                  <Link to="/all-onts" style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
                    {summaryData?.total_onts ?? '...'}
                  </Link>
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>Online ONTs</Typography>
                <Typography variant="h5" color="success.main">{summaryData?.online_onts_count ?? '...'}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>Offline ONTs</Typography>
                <Typography variant="h5" color="error.main">{summaryData?.offline_onts_count ?? '...'}</Typography>
              </CardContent>
            </Card>
          </Grid>
           <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>Offline (Power)</Typography>
                <Typography variant="h5" color="error.main">{summaryData?.offline_power_onts_count ?? '...'}</Typography>
              </CardContent>
            </Card>
          </Grid>
           <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>Offline (LOS)</Typography>
                <Typography variant="h5" color="error.main">{summaryData?.offline_los_onts_count ?? '...'}</Typography>
              </CardContent>
            </Card>
          </Grid>
           {/* Add other ONT offline reasons if tracked */}
        </Grid>

        {/* Online OLTs Table */}
        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>OLT Status</Typography>
         <TableContainer component={Paper} elevation={1} sx={{ mb: 4 }}>
             <Table size="small">
                 <TableHead>
                     <TableRow>
                         <TableCell>OLT Name</TableCell>
                          <TableCell>Status</TableCell>
                         <TableCell>Uptime</TableCell>
                         <TableCell>Temperature</TableCell>
                     </TableRow>
                 </TableHead>
                 <TableBody>
                     {summaryData?.all_olts_details && summaryData.all_olts_details.length > 0 ? (
                         summaryData.all_olts_details.map((olt) => (
                             <TableRow key={olt.id}>
                                 <TableCell>{olt.name}</TableCell>
                                 <TableCell>{getOltStatusChip(olt.status, olt.status_display)}</TableCell>
                                 <TableCell>{olt.uptime || 'N/A'}</TableCell> {/* Display raw uptime string */}
                                 <TableCell>{formatTemperature(olt.temperature)}</TableCell>
                             </TableRow>
                         ))
                     ) : (
                         <TableRow><TableCell colSpan={4}>No OLTs found.</TableCell></TableRow>
                     )}
                 </TableBody>
             </Table>
         </TableContainer>

        {/* PON Outage Table */}
        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>Recent PON Outages</Typography>
        <TableContainer component={Paper} elevation={1}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>OLT Name</TableCell>
                <TableCell>Slot/Port</TableCell>
                <TableCell>Affected ONUs</TableCell>
                {/* LOS and Power columns might be redundant if covered by Possible Cause, but can be added if needed */}
                <TableCell>Possible Cause</TableCell>
                <TableCell>Time Since Failure</TableCell>
                <TableCell>End Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {outageData.length > 0 ? (
                outageData.map((outage) => (
                  <TableRow key={outage.id}>
                    <TableCell>{outage.olt_name}</TableCell>
                    <TableCell>{outage.slot_port}</TableCell>
                    <TableCell>{outage.affected_ont_count}</TableCell>
                    <TableCell>{outage.possible_cause || 'Unknown'}</TableCell>
                    <TableCell>{formatTimeSince(outage.start_time)}</TableCell>
                    <TableCell>{outage.end_time ? formatTimeSince(outage.end_time) + ' ago' : 'Active'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={6}>No recent PON outages found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default DashboardPage;