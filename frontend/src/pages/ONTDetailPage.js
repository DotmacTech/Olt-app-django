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
        <Typography color="text.primary">ONT: {ontData.serial_number}</Typography>
      </Breadcrumbs>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => navigate(breadcrumbPath)} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1">
            ONT Details: {ontData.serial_number}
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }}/>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}><Typography><strong>Serial Number:</strong> {ontData.serial_number}</Typography></Grid>
          <Grid item xs={12} sm={6}><Typography><strong>Status:</strong> {getStatusChip(ontData.status)}</Typography></Grid>
          <Grid item xs={12} sm={6}><Typography><strong>ONT Index on Port:</strong> {ontData.ont_index_on_port}</Typography></Grid>
          <Grid item xs={12} sm={6}><Typography><strong>ONU Type:</strong> {ontData.onu_type_name || 'N/A'}</Typography></Grid>
          
          <Grid item xs={12}><Divider sx={{ my:1 }}>Optical Power</Divider></Grid>
          <Grid item xs={12} sm={4}><Typography><strong>RX Power at ONT:</strong> {formatPower(ontData.rx_power_at_ont)}</Typography></Grid>
          <Grid item xs={12} sm={4}><Typography><strong>TX Power at ONT:</strong> {formatPower(ontData.tx_power_at_ont)}</Typography></Grid>
          <Grid item xs={12} sm={4}><Typography><strong>RX Power at OLT:</strong> {formatPower(ontData.rx_power_at_olt)}</Typography></Grid>

          <Grid item xs={12}><Divider sx={{ my:1 }}>Last Event</Divider></Grid>
          <Grid item xs={12} sm={6}><Typography><strong>Last Down Time:</strong> {formatDate(ontData.last_down_time)}</Typography></Grid>
          <Grid item xs={12} sm={6}><Typography><strong>Last Down Cause:</strong> {ontData.last_down_cause || 'N/A'}</Typography></Grid>

          <Grid item xs={12}><Divider sx={{ my:1 }}>Timestamps</Divider></Grid>
          <Grid item xs={12} sm={6}><Typography><strong>Last SNMP Update:</strong> {formatDate(ontData.last_snmp_update)}</Typography></Grid>
          <Grid item xs={12} sm={6}><Typography><strong>Created At:</strong> {formatDate(ontData.created_at)}</Typography></Grid>
        </Grid>
      </Paper>
    </Box>
  );
}

export default ONTDetailPage;