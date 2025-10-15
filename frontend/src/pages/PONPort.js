import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
  Breadcrumbs, Link, Chip, Button, Snackbar, Tooltip
} from '@mui/material';
import { Home as HomeIcon, Cable as CableIcon, SettingsInputSvideo as SlotIcon, Refresh as RefreshIcon, Router as RouterIcon, ArrowBack as ArrowBackIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import { getPonPortDetailsForSlot, triggerPonPortRefresh, getOLTDetails } from '../services/api';



function PONPort() {
  const { oltId, slotNumber } = useParams(); // Get OLT ID and Slot Number from URL
  const navigate = useNavigate();

  // State declarations should be at the top of the component
  const [ponPorts, setPonPorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [oltName, setOltName] = useState('');

  // Callback and function declarations
  const showNotification = useCallback((message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  }, []);

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
  }, [oltId, slotNumber, showNotification]); // Add showNotification to dependency array

  // Effect hooks should come after state and callback declarations
  // Auto-refresh every 1 minute using polling
  useEffect(() => {
    // Do not start polling if we don't have the necessary IDs
    if (!oltId || !slotNumber) {
      return;
    }

    const interval = setInterval(() => {
      // Use the dynamic API function instead of a hardcoded fetch.
      getPonPortDetailsForSlot(oltId, slotNumber)
        .then(data => {
          if (Array.isArray(data)) {
            setPonPorts(data);
            setLastUpdated(new Date());
            showNotification('PON port data auto-refreshed.', 'info');
          } else {
            showNotification('Auto-refresh failed: invalid data format.', 'error');
          }
        })
        .catch(err => {
          showNotification('Auto-refresh failed: ' + (err?.message || 'Unknown error'), 'error');
        });
    }, 60000); // 1 minute
    return () => clearInterval(interval);
  }, [oltId, slotNumber, showNotification]); // Add dependencies to re-create interval if URL params change

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
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <Button variant="contained" color="primary" onClick={handleRefresh} disabled={isRefreshing || loading}>
          Refresh PON ports info
        </Button>
        <Button variant="contained" color="primary">
          Enable all PON ports
        </Button>
        <Button variant="contained" color="primary">
          Enable Autoind
        </Button>
        <Button variant="contained" color="error">
          Reboot all ONUs
        </Button>
      </Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        OLT: {oltName || oltId}, Slot: {slotNumber}
          {lastUpdated && !loading && ( <Typography variant="caption" sx={{ ml: 2 }}>Client Last Fetched: {lastUpdated.toLocaleTimeString()}</Typography> )}
        </Typography>
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
                  <TableCell>Port</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Admin state</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>ONUs</TableCell>
                  <TableCell>Average signal</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Range</TableCell>
                  <TableCell>TX Power</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ponPorts.map((port, index) => (
                  <TableRow key={port.port_id !== undefined ? port.port_id : index}>
                    <TableCell>{port.port_index_on_card}</TableCell>
                    <TableCell>N/A</TableCell>
                    <TableCell>N/A</TableCell>
                    <TableCell>{getStatusChip(port.status)}</TableCell>
                    <TableCell align="center">
                      <Link
                        component={RouterLink}
                        to={`/olts/${oltId}/slot/${slotNumber}/ponport/${port.id}/onts`}
                        sx={{ cursor: 'pointer', textDecoration: port.online_onts > 0 ? 'underline' : 'none', color: port.online_onts > 0 ? 'primary.main' : 'text.secondary' }}
                        onClick={(e) => { if (port.online_onts === 0) e.preventDefault(); }} // Prevent navigation if 0
                      >
                        {`${port.online_onts} / ${port.configured_onts}`}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {port.rx_power !== null && port.rx_power !== undefined ? port.rx_power.toFixed(2) : 'N/A'} dB
                        <SignalCellularAltIcon color="primary" />
                      </Box>
                    </TableCell>
                    <TableCell>{port.description}</TableCell>
                    <TableCell>N/A</TableCell>
                    <TableCell>{port.tx_power !== null && port.tx_power !== undefined ? port.tx_power.toFixed(2) : 'N/A'}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Configure">
                          <IconButton size="small" color="primary">
                            <SettingsIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reboot ONUs">
                          <IconButton size="small" color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View ONTs">
                          <IconButton size="small" onClick={() => navigate(`/olts/${oltId}/slot/${slotNumber}/ponport/${port.id}/onts`)}>
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
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
    </Box>
  );
}

export default PONPort;
