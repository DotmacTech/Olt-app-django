import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Box, Typography, CircularProgress, Snackbar, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, TextField, Button, MenuItem } from '@mui/material';
import { Link } from 'react-router-dom';
import { getAllOnts } from '../services/api';

function AllONTListPage() {
  const [onts, setOnts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filter, setFilter] = useState('');
  const [ponPortFilter, setPonPortFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const wsRef = useRef(null);
  const refreshInterval = useRef(null);

  // Extract unique pon ports and statuses from onts for filter dropdowns
  const ponPortOptions = Array.from(new Set(onts.map(ont => ont.pon_port))).filter(Boolean);
  const statusOptions = Array.from(new Set(onts.map(ont => ont.status))).filter(Boolean);

  const fetchAllOnts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllOnts();
      setOnts(Array.isArray(data.results) ? data.results : data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching ONTs:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch ONT list.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Manual refresh function
  const handleRefresh = () => {
    fetchAllOnts();
  };

  // Initial data fetch and setup
  useEffect(() => {
    fetchAllOnts();
    
    // Set up refresh interval (every 30 seconds)
    refreshInterval.current = setInterval(fetchAllOnts, 30000);
    
    // Set up WebSocket connection if available
    if (process.env.REACT_APP_WS_URL) {
      try {
        const ws = new WebSocket(process.env.REACT_APP_WS_URL);
        wsRef.current = ws;
        
        ws.onopen = () => console.log('WebSocket connected');
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            // Refresh data when we receive updates
            if (data.type === 'ont_updated' || data.type === 'ont_created' || data.type === 'ont_deleted') {
              fetchAllOnts();
            }
          } catch (error) {
            console.error('Error processing WebSocket message:', error);
          }
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };
        
        ws.onclose = () => {
          console.log('WebSocket disconnected');
        };
      } catch (error) {
        console.error('Error setting up WebSocket:', error);
      }
    }
    
    // Cleanup function
    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [fetchAllOnts]);

  // Filtering
  const filteredOnts = onts.filter(ont => {
    const serialMatch = filter === '' || (ont.serial_number && ont.serial_number.toLowerCase().includes(filter.toLowerCase()));
    const ponPortMatch = !ponPortFilter || String(ont.pon_port) === String(ponPortFilter);
    const statusMatch = !statusFilter || String(ont.status) === String(statusFilter);
    return serialMatch && ponPortMatch && statusMatch;
  });

  // Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedOnts = filteredOnts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);


  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') return;
    setNotification({ ...notification, open: false });
  };

  const formatPower = (power) => (power !== null && power !== undefined ? `${power} dBm` : 'N/A');
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleString() : 'N/A';

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 0, mr: 2 }}>All ONTs</Typography>
          <Button
            variant="outlined"
            onClick={handleRefresh}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
            sx={{ minWidth: 120 }}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
          {lastUpdated && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/add-ont"
          disabled={loading}
        >
          Add ONT
        </Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Filter by Serial Number"
          value={filter}
          onChange={e => { setFilter(e.target.value); setPage(0); }}
          size="small"
        />
        <TextField
          label="Filter by PON Port"
          select
          SelectProps={{
            MenuProps: { PaperProps: { style: { maxHeight: 250 } } },
            renderValue: selected => selected === '' ? 'All' : selected
          }}
          value={ponPortFilter}
          onChange={e => { setPonPortFilter(e.target.value); setPage(0); }}
          size="small"
          sx={{ width: 200 }}
        >
          <MenuItem value="">All</MenuItem>
          {ponPortOptions.map(port => (
            <MenuItem key={port} value={port}>{port}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="Filter by Status"
          select
          SelectProps={{
            renderValue: selected => selected === '' ? 'All' : selected
          }}
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
          size="small"
          sx={{ width: 200 }}
        >
          <MenuItem value="">All</MenuItem>
          {statusOptions.map(status => (
            <MenuItem key={status} value={status}>{status}</MenuItem>
          ))}
        </TextField>
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Paper>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Serial Number</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>ONT Type</TableCell>
                  <TableCell>RX Power</TableCell>
                  <TableCell>TX Power</TableCell>
                  <TableCell>Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedOnts.map((ont) => (
                  <TableRow key={ont.id}>
                    <TableCell>{ont.serial_number}</TableCell>
                    <TableCell>{ont.status}</TableCell>
                    <TableCell>{ont.onu_type_name}</TableCell>
                    <TableCell>{formatPower(ont.rx_power_at_ont)}</TableCell>
                    <TableCell>{formatPower(ont.tx_power_at_ont)}</TableCell>
                    <TableCell>{formatDate(ont.created_at)}</TableCell>
                  </TableRow>
                ))}
                {paginatedOnts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">No ONTs found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredOnts.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
          />
        </Paper>
      )}
      <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification}>
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AllONTListPage;
