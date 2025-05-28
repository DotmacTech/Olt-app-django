import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, TextField, Button, Select, MenuItem, FormControl, InputLabel, Checkbox, FormControlLabel, Snackbar, Alert, Autocomplete
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getZones, getOdbs, getOnuTypes, createOnu } from '../services/api';
import { getOLTs } from '../services/api';

const initialForm = {
  pon_port: '', // NEW
  olt: '',
  pon_type: '',
  board: '',
  port: '',
  serial_number: '',
  onu_type: '',
  use_custom_profile: false,
  onu_mode: 'Routing',
  user_vlan_id: '',
  zone: '',
  odb: '',
  odb_port: '',
  download_speed: '',
  upload_speed: '',
  name: '',
  address_or_comment: '',
  onu_external_id: '',
  use_gps: false,
};

function AddOntPage() {
  const [form, setForm] = useState(initialForm);
  const [zones, setZones] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [odbs, setOdbs] = useState([]);
  const [onuTypes, setOnuTypes] = useState([]);
  const [ponPorts, setPonPorts] = useState([]); // NEW
  const [olts, setOlts] = useState([]); // OLT list
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllZones = async () => {
      setLoading(true);
      let allZones = [];
      let currentPage = 1;
      const pageSize = 100; // Adjust based on your API's max page size
      let hasMore = true;

      try {
        // Fetch all pages of zones
        while (hasMore) {
          const response = await getZones(currentPage, pageSize);
          
          // Extract zones from the response
          const pageZones = response.zones || [];
          allZones = [...allZones, ...pageZones];
          
          // Check if there are more pages
          const totalItems = response.total || 0;
          hasMore = allZones.length < totalItems && pageZones.length === pageSize;
          currentPage++;
        }
        
        setZones(allZones);
        
        if (allZones.length === 0) {
          console.warn('No zones found in the system');
        }
        
      } catch (error) {
        console.error('Error fetching zones:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        setZones([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllZones();
    getOdbs().then(data => setOdbs(Array.isArray(data.results) ? data.results : data));
    getOnuTypes().then(data => setOnuTypes(Array.isArray(data.results) ? data.results : data));
    // Fetch OLTs
    getOLTs().then(data => setOlts(Array.isArray(data.results) ? data.results : data));
    // Fetch PON Ports
    import('../services/api').then(({ getPONPorts }) => {
      getPONPorts().then(data => setPonPorts(Array.isArray(data.results) ? data.results : data));
    });
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createOnu(form);
      setNotification({ open: true, message: 'ONT added successfully!', severity: 'success' });
      setTimeout(() => navigate(-1), 1000);
    } catch (err) {
      setNotification({ open: true, message: err?.response?.data?.error || err.message || 'Failed to add ONT.', severity: 'error' });
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 4 }}>                        
        <Typography variant="h5" gutterBottom>Add ONT</Typography>
        <form onSubmit={handleSubmit}>
          <Autocomplete
            options={olts}
            getOptionLabel={option => option.name || ''}
            value={olts.find(o => o.id === form.olt) || null}
            onChange={(e, value) => setForm(prev => ({ ...prev, olt: value ? value.id : '' }))}
            renderInput={params => (
              <TextField {...params} label="OLT" margin="normal" required fullWidth />
            )}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            fullWidth
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>PON type</InputLabel>
            <Select name="pon_type" value={form.pon_type} label="PON type" onChange={handleChange} required>
              <MenuItem value="GPON">GPON</MenuItem>
              <MenuItem value="EPON">EPON</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal" required>
            <InputLabel>PON Port</InputLabel>
            <Select name="pon_port" value={form.pon_port} label="PON Port" onChange={handleChange} required>
              <MenuItem value="">Select PON Port</MenuItem>
              {ponPorts.map(port => (
                <MenuItem key={port.id} value={port.id}>
                  {port.name || `PON Port ${port.id}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Board (optional)" name="board" value={form.board} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Port (optional)" name="port" value={form.port} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="SN" name="serial_number" value={form.serial_number} onChange={handleChange} fullWidth margin="normal" required />
          <FormControl fullWidth margin="normal">
            <InputLabel>ONU type</InputLabel>
            <Select name="onu_type" value={form.onu_type} label="ONU type" onChange={handleChange} required>
              {onuTypes.map(type => <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControlLabel
            control={<Checkbox name="use_custom_profile" checked={form.use_custom_profile} onChange={handleChange} />}
            label="Use custom profile (For better compatibility with generic ONUs)"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>ONU mode</InputLabel>
            <Select name="onu_mode" value={form.onu_mode} label="ONU mode" onChange={handleChange} required>
              <MenuItem value="Routing">Routing</MenuItem>
              <MenuItem value="Bridging">Bridging</MenuItem>
            </Select>
          </FormControl>
          <TextField label="User VLAN-ID" name="user_vlan_id" value={form.user_vlan_id} onChange={handleChange} fullWidth margin="normal" />
          <FormControl fullWidth margin="normal">
            <InputLabel>Zone</InputLabel>
            <Select 
              name="zone" 
              value={form.zone} 
              label="Zone" 
              onChange={handleChange} 
              required
              disabled={loading}
            >
              {loading ? (
                <MenuItem disabled>Loading zones...</MenuItem>
              ) : zones.length > 0 ? (
                zones.map(zone => (
                  <MenuItem key={zone.id} value={zone.id}>
                    {zone.name || `Zone ${zone.id}`}
                  </MenuItem>
                ))
              ) : (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    No zones available
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/zones');
                    }}
                    sx={{ mt: 1 }}
                  >
                    Create Zones
                  </Button>
                </Box>
              )}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>ODB (Splitter)</InputLabel>
            <Select name="odb" value={form.odb} label="ODB (Splitter)" onChange={handleChange}>
              <MenuItem value="">None</MenuItem>
              {odbs.map(o => <MenuItem key={o.id} value={o.id}>{o.name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="ODB port" name="odb_port" value={form.odb_port} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Download speed" name="download_speed" value={form.download_speed} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Upload speed" name="upload_speed" value={form.upload_speed} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Name" name="name" value={form.name} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Address or comment" name="address_or_comment" value={form.address_or_comment} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="ONU external ID" name="onu_external_id" value={form.onu_external_id} onChange={handleChange} fullWidth margin="normal" />
          <FormControlLabel
            control={<Checkbox name="use_gps" checked={form.use_gps} onChange={handleChange} />}
            label="Use GPS"
          />
          <Box mt={2} display="flex" justifyContent="flex-end">
            <Button type="submit" variant="contained" color="primary">Save</Button>
            <Button variant="text" color="secondary" sx={{ ml: 2 }} onClick={() => navigate(-1)}>Cancel</Button>
          </Box>
        </form>
        <Snackbar open={notification.open} autoHideDuration={6000} onClose={() => setNotification({ ...notification, open: false })}>
          <Alert onClose={() => setNotification({ ...notification, open: false })} severity={notification.severity} sx={{ width: '100%' }}>
            {notification.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
}

export default AddOntPage;
