import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box, Typography, Paper, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Breadcrumbs, Link, Chip, Button, Snackbar
} from '@mui/material';
import { Home as HomeIcon, Cable as CableIcon, SettingsInputSvideo as SlotIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { getPonPortDetailsForSlot, triggerPonPortRefresh } from '../services/api';


function PONPort() {
  const { oltId, slotNumber } = useParams(); // Get OLT ID and Slot Number from URL
  const [ponPorts, setPonPorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });


  const showNotification = (message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({ ...notification, open: false });
  };

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
    const now = new Date();
    // If lastUpdated is null (first load) or more than 5 mins ago, fetch.
    // The backend now handles its own staleness, so this client cache is mostly for very quick re-visits.
    if (!lastUpdated || (now - lastUpdated) > (60 * 1000)) {
      fetchData();
    } else {
      console.log("Skipping PON port details refresh (client cache) - less than 1 minutes since last update.");
      setLoading(false); // Ensure loading is false if we use cached data
    }
  }, [oltId, slotNumber, fetchData, lastUpdated]); // Add lastUpdated here to re-evaluate if it changes

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
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/olts" underline="hover" color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" /> OLTs
        </Link>
        <Link component={RouterLink} to={`/olts/${oltId}/cards`} underline="hover" color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
          <SlotIcon sx={{ mr: 0.5 }} fontSize="inherit" /> OLT Cards (ID: {oltId})
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <CableIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          PON Ports (Slot: {slotNumber})
        </Typography>
      </Breadcrumbs>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          PON Port Details - OLT ID: {oltId}, Slot: {slotNumber}
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
          <Alert severity="info">No PON port details found for this slot, or the card does not have 16 ports.</Alert>
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
                </TableRow>
              </TableHead>
              <TableBody>
                {ponPorts.map((port, index) => (
                  <TableRow key={port.port_id !== undefined ? port.port_id : index}>
                    <TableCell>{port.port_index_on_card}</TableCell>
                    <TableCell>{port.description}</TableCell>
                    <TableCell>{getStatusChip(port.status)}</TableCell>
                    <TableCell>{port.configured_onts}</TableCell>
                    <TableCell>{port.online_onts}</TableCell>
                    <TableCell>{port.tx_power !== null && port.tx_power !== undefined ? port.tx_power.toFixed(2) : 'N/A'}</TableCell>
                    <TableCell>{port.rx_power !== null && port.rx_power !== undefined ? port.rx_power.toFixed(2) : 'N/A'}</TableCell>
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
      {/* <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {/* Ensure Alert is always rendered if Snackbar is open, even if message is briefly empty */}
        {/* <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert> 
+      </Snackbar> */}
    </Box>
  );
}

export default PONPort;