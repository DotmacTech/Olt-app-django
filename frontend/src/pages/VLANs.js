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
  Typography,
  Checkbox,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { getVLANs, createVLAN, deleteVLAN, deleteMultipleVLANs } from '../services/api';

function VLANs() {
  const [vlans, setVlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVlans, setSelectedVlans] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [addDialog, setAddDialog] = useState(false);
  const [newVlan, setNewVlan] = useState({
    vlan_id: '',
    description: '',
  });

  const fetchVlans = async () => {
    try {
      setLoading(true);
      const data = await getVLANs();
      setVlans(data.results || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch VLANs');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVlans();
  }, []);

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedVlans(vlans.map(vlan => vlan.id));
    } else {
      setSelectedVlans([]);
    }
  };

  const handleSelectVlan = (id) => {
    setSelectedVlans(prev => {
      if (prev.includes(id)) {
        return prev.filter(vlanId => vlanId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleAddVlan = async () => {
    try {
      await createVLAN({
        vlan_id: parseInt(newVlan.vlan_id),
        description: newVlan.description,
        used_for_iptv: false,
        used_for_mgmt_voip: false,
        dhcp_snooping: false,
        lan_to_lan: false,
      });
      setSnackbar({
        open: true,
        message: 'VLAN added successfully',
        severity: 'success',
      });
      setAddDialog(false);
      setNewVlan({ vlan_id: '', description: '' });
      fetchVlans();
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to add VLAN: ' + (err.response?.data?.detail || err.message),
        severity: 'error',
      });
    }
  };

  const handleDeleteVlan = async (id) => {
    try {
      if (Array.isArray(id)) {
        await deleteMultipleVLANs(id);
        setSelectedVlans([]);
      } else {
        await deleteVLAN(id);
      }
      setSnackbar({
        open: true,
        message: 'VLAN(s) deleted successfully',
        severity: 'success',
      });
      fetchVlans();
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to delete VLAN(s): ' + (err.response?.data?.detail || err.message),
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
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        VLANs added here will not be applied to the Uplink ports automatically. Go to Uplink and tag the VLANs on the interfaces you want.
      </Typography>

      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setAddDialog(true)}
        >
          Add VLAN
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={selectedVlans.length === 0}
        >
          Add multiple VLANs
        </Button>
        <Button
          variant="contained"
          color="error"
          disabled={selectedVlans.length === 0}
          onClick={() => handleDeleteVlan(selectedVlans)}
        >
          Delete multiple VLANs
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedVlans.length > 0 && selectedVlans.length < vlans.length}
                  checked={selectedVlans.length === vlans.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>VLAN-ID</TableCell>
              <TableCell>Default for</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="center">Used for IPTV</TableCell>
              <TableCell align="center">Used for Mgmt/VoIP</TableCell>
              <TableCell align="center">DHCP Snooping</TableCell>
              <TableCell align="center">LAN to LAN</TableCell>
              <TableCell>ONUs</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vlans.map((vlan) => (
              <TableRow key={vlan.id}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedVlans.includes(vlan.id)}
                    onChange={() => handleSelectVlan(vlan.id)}
                  />
                </TableCell>
                <TableCell>{vlan.vlan_id}</TableCell>
                <TableCell>{vlan.default_for || '-'}</TableCell>
                <TableCell>{vlan.description}</TableCell>
                <TableCell align="center">
                  <Checkbox checked={vlan.used_for_iptv} disabled />
                </TableCell>
                <TableCell align="center">
                  <Checkbox checked={vlan.used_for_mgmt_voip} disabled />
                </TableCell>
                <TableCell align="center">
                  <Checkbox checked={vlan.dhcp_snooping} disabled />
                </TableCell>
                <TableCell align="center">
                  <Checkbox checked={vlan.lan_to_lan} disabled />
                </TableCell>
                <TableCell>{vlan.onu_count || '0'}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => handleDeleteVlan(vlan.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={addDialog} onClose={() => setAddDialog(false)}>
        <DialogTitle>Add New VLAN</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="VLAN ID"
            type="number"
            fullWidth
            value={newVlan.vlan_id}
            onChange={(e) => setNewVlan({ ...newVlan, vlan_id: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            value={newVlan.description}
            onChange={(e) => setNewVlan({ ...newVlan, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialog(false)}>Cancel</Button>
          <Button onClick={handleAddVlan} variant="contained" color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>

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

export default VLANs;
