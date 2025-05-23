import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, TextField, Button, Select, MenuItem, FormControl, InputLabel, Checkbox, FormControlLabel, Snackbar, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Pagination, Switch
} from '@mui/material';

const initialForm = {
  name: '',
  pon_type: '',
  ethernet_ports: 0,
  wifi_ssids: 0,
  voip_ports: 0,
  catv: false,
  allow_custom_profiles: false,
  default_custom_profile: '',
  capability: 'Bridging/Routing',
  onu_type_image: null,
  ethernet_ports_prefix: 'eth_0/',
  wifi_ssids_prefix: 'wifi_0/',
  voip_ports_prefix: 'pots_0/',
};

function OnuTypePage() {
  const [form, setForm] = useState(initialForm);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [submitting, setSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileChange = (e) => {
    setForm(prev => ({ ...prev, onu_type_image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Basic client-side validation
    if (!form.name || !form.pon_type) {
      setNotification({ open: true, message: 'PON type and ONU type name are required.', severity: 'error' });
      return;
    }
    // Disable submit button while submitting
    setSubmitting(true);
    try {
      const formData = new FormData();
      for (const key in form) {
        if (form[key] !== null && form[key] !== undefined) {
          // For file input
          if (key === 'onu_type_image' && form[key]) {
            formData.append(key, form[key]);
          } else {
            formData.append(key, form[key]);
          }
        }
      }
      // Import and call createOnuType
      const { createOnuType } = await import('../services/api');
      await createOnuType(formData);
      setNotification({ open: true, message: 'ONU Type created successfully!', severity: 'success' });
      setForm(initialForm); // Reset form
    } catch (error) {
      let msg = 'Failed to create ONU Type.';
      if (error.response && error.response.data) {
        msg += ' ' + (typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data));
      }
      setNotification({ open: true, message: msg, severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>ONU Type</Typography>
        <form onSubmit={handleSubmit}>
          <FormControl fullWidth margin="normal">
            <InputLabel>PON type</InputLabel>
            <Select name="pon_type" value={form.pon_type} label="PON type" onChange={handleChange} required>
              <MenuItem value="GPON">GPON</MenuItem>
              <MenuItem value="EPON">EPON</MenuItem>
            </Select>
          </FormControl>
          <TextField label="ONU type" name="name" value={form.name} onChange={handleChange} fullWidth margin="normal" required />
          <TextField label="Ethernet ports" name="ethernet_ports" type="number" value={form.ethernet_ports} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="WiFi SSIDs" name="wifi_ssids" type="number" value={form.wifi_ssids} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="VoIP ports" name="voip_ports" type="number" value={form.voip_ports} onChange={handleChange} fullWidth margin="normal" />
          <FormControlLabel control={<Checkbox name="catv" checked={form.catv} onChange={handleChange} />} label="CATV" />
          <FormControlLabel control={<Checkbox name="allow_custom_profiles" checked={form.allow_custom_profiles} onChange={handleChange} />} label="Allow custom profiles" />
          <TextField label="Default custom profile" name="default_custom_profile" value={form.default_custom_profile} onChange={handleChange} fullWidth margin="normal" />
          <FormControl fullWidth margin="normal">
            <InputLabel>Capability</InputLabel>
            <Select name="capability" value={form.capability} label="Capability" onChange={handleChange} required>
              <MenuItem value="Bridging">Bridging</MenuItem>
              <MenuItem value="Bridging/Routing">Bridging/Routing</MenuItem>
            </Select>
          </FormControl>
          {/* Advanced Section Toggle */}
          <Box mt={2} mb={1}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => setShowAdvanced((prev) => !prev)}
              sx={{ textTransform: 'none', mb: 1 }}
            >
              {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
            </Button>
            {showAdvanced && (
              <Box>
                <Typography variant="body2" gutterBottom>ONU type image</Typography>
                <Button variant="contained" component="label">
                  Choose File
                  <input type="file" accept="image/*" hidden onChange={handleFileChange} />
                </Button>
                {form.onu_type_image && <Typography variant="caption" ml={2}>{form.onu_type_image.name}</Typography>}
                <Typography variant="caption" display="block">Maximum image size is 400 × 90 px</Typography>
                <TextField label="Ethernet ports prefix" name="ethernet_ports_prefix" value={form.ethernet_ports_prefix} onChange={handleChange} fullWidth margin="normal" />
                <TextField label="WiFi SSIDs prefix" name="wifi_ssids_prefix" value={form.wifi_ssids_prefix} onChange={handleChange} fullWidth margin="normal" />
                <TextField label="VoIP ports prefix" name="voip_ports_prefix" value={form.voip_ports_prefix} onChange={handleChange} fullWidth margin="normal" />
              </Box>
            )}
          </Box>
          <Box mt={2} display="flex" justifyContent="flex-end">
            <Button type="submit" variant="contained" color="primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save'}
            </Button>
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

export default OnuTypePage;