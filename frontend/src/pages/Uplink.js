import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { getUplinkPorts, configureUplinkPort } from '../services/api';

function Uplink() {
  const [ports, setPorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const fetchPorts = async () => {
    try {
      setLoading(true);
      const data = await getUplinkPorts();
      setPorts(data.results || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch uplink ports');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPorts();
  }, []);

  const handleRefresh = () => {
    fetchPorts();
  };

  const handleConfigure = async (portId) => {
    try {
      // Example configuration - adjust based on your needs
      await configureUplinkPort(portId, {
        admin_state: 'Enabled',
        mtu: '2052',
      });
      setSnackbar({
        open: true,
        message: 'Port configured successfully',
        severity: 'success',
      });
      fetchPorts(); // Refresh the data
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to configure port',
        severity: 'error',
      });
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

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleRefresh}
        >
          Refresh uplink ports info
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Uplink port</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Admin state</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Negotiation</TableCell>
              <TableCell>MTU</TableCell>
              <TableCell>WaveL</TableCell>
              <TableCell>Temp</TableCell>
              <TableCell>PVID</TableCell>
              <TableCell>Mode/tagged VLANs</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ports.map((port) => (
              <TableRow key={port.id}>
                <TableCell>{port.port_number}</TableCell>
                <TableCell>{port.description || '-'}</TableCell>
                <TableCell>{port.type || 'Fiber'}</TableCell>
                <TableCell>{port.admin_state}</TableCell>
                <TableCell sx={{ color: port.status === 'up' ? 'green' : 'red' }}>
                  {port.status}
                </TableCell>
                <TableCell>{port.speed}</TableCell>
                <TableCell>{port.mtu || '2052'}</TableCell>
                <TableCell>{port.wavelength || '-'}</TableCell>
                <TableCell>{port.temperature || '-'}</TableCell>
                <TableCell>{port.pvid || '-'}</TableCell>
                <TableCell>{port.tagged_vlans || 'Trunk'}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => handleConfigure(port.id)}
                  >
                    Configure
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Uplink;
