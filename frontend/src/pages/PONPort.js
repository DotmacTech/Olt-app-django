import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
  Breadcrumbs, Link, Chip, Button, Snackbar
} from '@mui/material';
import { Home as HomeIcon, Cable as CableIcon, SettingsInputSvideo as SlotIcon, Refresh as RefreshIcon, Router as RouterIcon, ArrowBack as ArrowBackIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { getPonPortDetailsForSlot, triggerPonPortRefresh, getOLTDetails } from '../services/api';



function PONPort() {
  const { oltId, slotNumber } = useParams(); // Get OLT ID and Slot Number from URL
  // ...existing state declarations...

  useEffect(() => {
    let wsUrl;
    const backendHost = process.env.REACT_APP_WS_BACKEND_HOST;
    if (backendHost) {
      wsUrl = `ws://${backendHost}/ws/pon_ports/`;
    } else {
      wsUrl = 'ws://localhost:8000/ws/pon_ports/';
    }
    const ws = new window.WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        // You may want to filter messages for this OLT/slot or handle different message types
        if (message && message.pon_ports) {
          setPonPorts(message.pon_ports);
          setLastUpdated(new Date());
          showNotification('PON port data updated (WebSocket)', 'info');
        }
      } catch (err) {
        console.error('WebSocket message error:', err);
      }
    };
    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
    };
    return () => ws.close();
  }, [oltId, slotNumber]);
  // (Moved to top)
  const [ponPorts, setPonPorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [oltName, setOltName] = useState('');
  const navigate = useNavigate();


  const showNotification = (message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  const fetchOltName = useCallback(async () => {
    try {
      const oltDetails = await getOLTDetails(oltId);
      setOltName(oltDetails.name || `OLT ${oltId}`);
    } catch (err) {
      console.error("Error fetching OLT name for breadcrumbs:", err);
    }
  }, [oltId]);

  const fetchData = useCallback(async (isManualRefresh = false) => {
    if (!oltId || slotNumber === undefined) {
      setError('OLT ID or Slot Number not provided in URL.');
      setError('OLT ID or Slot Number not provided.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getPonPortDetailsForSlot(oltId, slotNumber); // This endpoint now handles DB caching
      if (Array.isArray(data)) {
        setPonPorts(data);
        setLastUpdated(new Date()); // Store the update timestamp
        if (isManualRefresh) {
          showNotification('PON port data refreshed successfully!', 'success');
        }
      } else {
        console.error("Received non-array data for PON ports:", data);
        setError(data.error || 'Received invalid data format for PON ports.');
        setPonPorts([]);
      }
    
    } catch (err) {
      console.error(`Error fetching PON port details for OLT ${oltId}, Slot ${slotNumber}:`, err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch PON port details.';
      setError(errorMessage);
      if (isManualRefresh) {
        showNotification(`Error fetching data: ${errorMessage}`, 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [oltId, slotNumber]); // Removed lastUpdated from dependencies here

  useEffect(() => {
    fetchOltName();
    fetchData(); // Fetch data on initial load or when oltId/slotNumber changes
  }, [oltId, slotNumber, fetchData, fetchOltName]); // Corrected dependency array

  const handleRefresh = async () => {
    if (!oltId || slotNumber === undefined) return;
    setIsRefreshing(true);
    showNotification('Initiating PON port data refresh...', 'info');
    try {
      await triggerPonPortRefresh(oltId, slotNumber);
      // Backend has queued the task. Now, we'll force a re-fetch from the client.
      setLastUpdated(null); // Clear client-side timestamp to force fetchData to run fully
      await fetchData(true); // Pass true to indicate it's a manual refresh for notification
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to initiate refresh.';
      showNotification(`Error initiating refresh: ${errorMessage}`, 'error');
      console.error('Error triggering refresh:', err);
    } finally {
      setIsRefreshing(false);
    }
  };


  const getStatusChip = (status) => {
    // Assuming status "1" is Up/Online and "2" is Down/Offline from your example data
    if (status === "1" || status === 1) {
      return <Chip label="Up" color="success" size="small" />;
    } else if (status === "2" || status === 2) {
      return <Chip label="Down" color="error" size="small" />;
    }
    return <Chip label={status || "Unknown"} color="default" size="small" />;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={() => navigate(`/olt/${oltId}/cards`)} sx={{ mr: 1 }}> {/* Navigate back to cards page */}
          <ArrowBackIcon />
        </IconButton>
        <Breadcrumbs aria-label="breadcrumb">
          <Link component={RouterLink} to="/olt-list" sx={{ display: 'flex', alignItems: 'center' }} color="inherit">
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" /> OLT List
          </Link>
          <Link component={RouterLink} to={`/olt/${oltId}`} sx={{ display: 'flex', alignItems: 'center' }} color="inherit">
            <RouterIcon sx={{ mr: 0.5 }} fontSize="inherit" /> {oltName || `OLT ${oltId}`}
          </Link>
          <Link component={RouterLink} to={`/olt/${oltId}/cards`} sx={{ display: 'flex', alignItems: 'center' }} color="inherit">
            <SlotIcon sx={{ mr: 0.5 }} fontSize="inherit" /> Slot {slotNumber} Cards
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <CableIcon sx={{ mr: 0.5 }} fontSize="inherit" /> PON Ports
          </Typography>
        </Breadcrumbs>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
        PON Ports - OLT: {oltName || oltId}, Slot: {slotNumber}
          {lastUpdated && !loading && ( <Typography variant="caption" sx={{ ml: 2 }}>Client Last Fetched: {lastUpdated.toLocaleTimeString()}</Typography> )}
        </Typography>
        <Button
          variant="contained"
          onClick={handleRefresh}
          disabled={isRefreshing || loading}
          startIcon={isRefreshing ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </Box>
      <Paper sx={{ p: 3 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : ponPorts.length === 0 ? (
          <Alert severity="info">No PON port details found for this slot.</Alert>
        ) : (
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Port ID</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Configured ONTs</TableCell>
                  <TableCell>Online ONTs</TableCell>
                  <TableCell>TX Power (dBm)</TableCell>
                  <TableCell>RX Power (dBm)</TableCell>
                  <TableCell>Last Update</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ponPorts.map((port, index) => (
                  <TableRow key={port.port_id !== undefined ? port.port_id : index}>
                    <TableCell>{port.port_index_on_card}</TableCell>
                    <TableCell>{port.description}</TableCell>
                    <TableCell>{getStatusChip(port.status)}</TableCell>
                    <TableCell>
                      <Link
                        component={RouterLink}
                        to={`/olts/${oltId}/slot/${slotNumber}/ponport/${port.id}/onts`}
                        sx={{ cursor: 'pointer', textDecoration: port.configured_onts > 0 ? 'underline' : 'none', color: port.configured_onts > 0 ? 'primary.main' : 'text.secondary' }}
                        onClick={(e) => { if (port.configured_onts === 0) e.preventDefault(); }} // Prevent navigation if 0
                      >
                        {port.configured_onts}
                      </Link>
                    </TableCell>
                    <TableCell>{port.online_onts}</TableCell>
                    <TableCell>{port.tx_power !== null && port.tx_power !== undefined ? port.tx_power.toFixed(2) : 'N/A'}</TableCell>
                    <TableCell>{port.rx_power !== null && port.rx_power !== undefined ? port.rx_power.toFixed(2) : 'N/A'}</TableCell>
                    <TableCell>{port.last_snmp_update ? new Date(port.last_snmp_update).toLocaleString() : 'N/A'}</TableCell>
                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate(`/olts/${oltId}/slot/${slotNumber}/ponport/${port.id}/onts`)}
                        startIcon={<VisibilityIcon />}
                      >
                        View ONTs
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
        {/* // Temporary test */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <div>{notification.message || "Test Message"}</div>
        </Snackbar>
      {/* 
        // This is the properly commented out section
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
            {notification.message}
          </Alert> 
        </Snackbar> 
      */}
    </Box>
  );
}

export default PONPort;