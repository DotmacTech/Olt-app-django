import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Alert,
  Snackbar,
  IconButton,
  CircularProgress
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { getUnconfiguredONTs, authorizeONT } from '../services/api';

function UnconfiguredONTs() {
  const [onts, setOnts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getUnconfiguredONTs();
      setOnts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Set up polling every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAuthorize = async (ont) => {
    try {
      await authorizeONT(ont.olt_id, ont.serial_number);
      setNotification({
        open: true,
        message: `Successfully authorized ONT ${ont.serial_number}`,
        severity: 'success'
      });
      fetchData(); // Refresh the list
    } catch (err) {
      setNotification({
        open: true,
        message: `Failed to authorize ONT: ${err.message}`,
        severity: 'error'
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Unconfigured ONTs</Typography>
        <IconButton onClick={fetchData} color="primary">
          <RefreshIcon />
        </IconButton>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Serial Number</TableCell>
              <TableCell>OLT</TableCell>
              <TableCell>Frame</TableCell>
              <TableCell>Slot</TableCell>
              <TableCell>Port</TableCell>
              <TableCell>Vendor ID</TableCell>
              <TableCell>Discovered At</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {onts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No unconfigured ONTs found
                </TableCell>
              </TableRow>
            ) : (
              onts.map((ont) => (
                <TableRow key={ont.serial_number}>
                  <TableCell>{ont.serial_number}</TableCell>
                  <TableCell>{ont.olt_name}</TableCell>
                  <TableCell>{ont.frame}</TableCell>
                  <TableCell>{ont.slot}</TableCell>
                  <TableCell>{ont.port}</TableCell>
                  <TableCell>{ont.vendor_id}</TableCell>
                  <TableCell>
                    {new Date(ont.discovered_at).toLocaleString()}
                  </TableCell>
                  <TableCell>{ont.status}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      disabled={ont.status !== 'discovered'}
                      onClick={() => handleAuthorize(ont)}
                    >
                      Authorize
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default UnconfiguredONTs;
