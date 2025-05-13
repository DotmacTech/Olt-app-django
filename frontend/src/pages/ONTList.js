import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Breadcrumbs, Link, Chip, Button, Snackbar, IconButton
} from '@mui/material';
import { Home as HomeIcon, Router as RouterIcon, SettingsInputSvideo as SlotIcon, Refresh as RefreshIcon, ArrowBack as ArrowBackIcon, Cable as CableIcon } from '@mui/icons-material';
import { getOntsForPonPort, triggerOntsRefresh, getPonPortDetailsForSlot, getOLTDetails } from '../services/api'; // Assuming getPonPortDetailsForSlot gives individual PON port info if needed for breadcrumbs

function ONTList() {
  const { oltId, slotNumber, ponPortId } = useParams();
  const [onts, setOnts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [oltName, setOltName] = useState('');
  const [ponPortInfo, setPonPortInfo] = useState(null);
  console.log(`ONTList: Page rendering. oltId=${oltId}, slotNumber=${slotNumber}, ponPortId=${ponPortId}`);


  const showNotification = (message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  const fetchOltAndPonPortData = useCallback(async () => {
    try {
      const oltDetails = await getOLTDetails(oltId);
      setOltName(oltDetails.name || `OLT ${oltId}`);

      // Fetch all PON ports for the slot to find the specific one for breadcrumb info
      const ponPortsData = await getPonPortDetailsForSlot(oltId, slotNumber);
      const currentPonPort = ponPortsData.find(p => p.id.toString() === ponPortId);
      setPonPortInfo(currentPonPort);

    } catch (err) {
      console.error("Error fetching OLT/PON Port details for breadcrumbs:", err);
      // Not critical for main functionality, so don't set main error
    }
  }, [oltId, slotNumber, ponPortId]);

  const fetchData = useCallback(async (isManualRefresh = false) => {
    console.log(`ONTList: fetchData called. ponPortId=${ponPortId}, isManualRefresh=${isManualRefresh}`);
    if (!ponPortId) {
      console.error('ONTList: fetchData - PON Port ID not provided in URL params.');
      setError('PON Port ID not provided in URL params.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getOntsForPonPort(ponPortId); // API call to /api/pon-ports/<ponPortId>/onts/
      console.log(`ONTList: fetchData - Received data for ponPortId ${ponPortId}:`, JSON.stringify(data, null, 2));
      // Check if data and data.results exist and data.results is an array
      if (data && Array.isArray(data.results)) {
        setOnts(data.results);
      } else {
        setOnts([]); // Default to empty array if data.results is not as expected
      }
      
      if (isManualRefresh && data && Array.isArray(data.results) && data.results.length > 0) {
        showNotification('ONT data refreshed successfully!', 'success');
      } else if (isManualRefresh && data && Array.isArray(data.results) && data.results.length === 0) {
        showNotification('ONT data refreshed, but no ONTs found for this port.', 'info');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch ONT details.';
      console.error(`ONTList: fetchData - Error for ponPortId ${ponPortId}:`, errorMessage, err);

      setError(errorMessage);
      if (isManualRefresh) {
        showNotification(`Error fetching ONT data: ${errorMessage}`, 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [ponPortId]);

  useEffect(() => {
    fetchOltAndPonPortData();
    fetchData();
  }, [oltId, slotNumber, ponPortId]); // More stable dependencies

  const handleRefresh = async () => {
    if (!ponPortId) return;
    setIsRefreshing(true);
    showNotification('Initiating ONT data refresh...', 'info');
    try {
      await triggerOntsRefresh(ponPortId);
      console.log(`ONTList: handleRefresh - Backend refresh triggered. Waiting for 3 seconds before re-fetching data.`);
      // Add a delay to give the Celery task time to process.
      // This is a pragmatic approach; more advanced solutions include polling or WebSockets.
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3-second delay

      console.log(`ONTList: handleRefresh - Re-fetching data now after delay.`);
      await fetchData(true); 
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to initiate ONT refresh.';
      console.error('ONTList: handleRefresh - Error:', errorMessage, err);
      showNotification(`Error initiating ONT refresh: ${errorMessage}`, 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusChip = (status) => {
    if (status?.toLowerCase() === "online") {
      return <Chip label="Online" color="success" size="small" />;
    } else if (status?.toLowerCase() === "offline") {
      return <Chip label="Offline" color="error" size="small" />;
    } else if (status?.toLowerCase() === "los") {
      return <Chip label="LOS" color="warning" size="small" />;
    }
    return <Chip label={status || "Unknown"} color="default" size="small" />;
  };

  const handleRowClick = (ont) => {
    navigate(`/olts/${oltId}/slot/${slotNumber}/ponport/${ponPortId}/ont/${ont.id}`);
  };

  const formatPower = (power) => (power !== null && power !== undefined ? `${power.toFixed(2)} dBm` : 'N/A');
  const formatDate = (dateString) => (dateString ? new Date(dateString).toLocaleString() : 'N/A');

  console.log('ONTList: Current onts state before rendering table:', JSON.stringify(onts, null, 2));


  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={() => navigate(`/olts/${oltId}/slot/${slotNumber}/ponports`)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Breadcrumbs aria-label="breadcrumb">
          <Link component={RouterLink} to="/olt-list" sx={{ display: 'flex', alignItems: 'center' }} color="inherit">
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" /> OLT List
          </Link>
          <Link component={RouterLink} to={`/olt/${oltId}`} sx={{ display: 'flex', alignItems: 'center' }} color="inherit">
            <RouterIcon sx={{ mr: 0.5 }} fontSize="inherit" /> {oltName || `OLT ${oltId}`}
          </Link>
          <Link component={RouterLink} to={`/olts/${oltId}/slot/${slotNumber}/ponports`} sx={{ display: 'flex', alignItems: 'center' }} color="inherit">
            <SlotIcon sx={{ mr: 0.5 }} fontSize="inherit" /> Slot {slotNumber} Ports
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <CableIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            PON Port {ponPortInfo ? ponPortInfo.port_index_on_card : ponPortId} ONTs
          </Typography>
        </Breadcrumbs>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          ONTs on PON Port {ponPortInfo ? ponPortInfo.port_index_on_card : ponPortId}
        </Typography>
        <Button
          variant="contained"
          onClick={handleRefresh}
          disabled={isRefreshing || loading}
          startIcon={isRefreshing ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh ONTs'}
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}><CircularProgress /></Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : onts.length === 0 ? (
          <Alert severity="info">No ONTs found for this PON port or data is being fetched.</Alert>
        ) : (
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>ONT Index</TableCell>
                  <TableCell>Serial Number</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Tx Power (ONT)</TableCell>
                  <TableCell>Rx Power (ONT)</TableCell>
                  <TableCell>Rx Power (OLT)</TableCell>
                  <TableCell>Last Down Time</TableCell>
                  <TableCell>Last Down Cause</TableCell>
                  <TableCell>Last Update</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {onts.map((ont) => (
                  <TableRow 
                  key={ont.id} 
                  hover 
                  onClick={() => handleRowClick(ont)}
                  sx={{ cursor: 'pointer' }}
                >
                    <TableCell>{ont.ont_index_on_port}</TableCell>
                    <TableCell>{ont.serial_number}</TableCell>
                    <TableCell>{getStatusChip(ont.status)}</TableCell>
                    <TableCell>{formatPower(ont.tx_power_at_ont)}</TableCell>
                    <TableCell>{formatPower(ont.rx_power_at_ont)}</TableCell>
                    <TableCell>{formatPower(ont.rx_power_at_olt)}</TableCell>
                    <TableCell>{formatDate(ont.last_down_time)}</TableCell>
                    <TableCell>{ont.last_down_cause || 'N/A'}</TableCell>
                    <TableCell>{formatDate(ont.last_snmp_update)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>{notification.message}</Alert>
      </Snackbar>
    </Box>
  );
}

export default ONTList;