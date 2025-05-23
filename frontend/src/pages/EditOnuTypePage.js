import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  FormControlLabel,
  Switch,
  Divider,
  Breadcrumbs,
  Link as MuiLink,
  Snackbar,
  Alert,
  CircularProgress,
  MenuItem,
  InputLabel,
  FormControl,
  Select,
  FormHelperText,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { getOnuTypeById, updateOnuType, createOnuType } from '../services/api';

const PON_TYPES = [
  'GPON',
  'EPON',
  'XG-PON',
  'XGS-PON',
  'NG-PON2',
  'Other'
];

function EditOnuTypePage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    pon_type: 'GPON',
    description: '',
    ethernet_ports: 4,
    wifi_ssids: 2,
    voip_ports: 2,
    catv: false,
    allow_custom_profiles: false,
    capability: '',
    notes: '',
    is_active: true,
    vendor: '',
  });

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Load ONU type data if in edit mode
  useEffect(() => {
    if (!isEditMode) return;

    const fetchOnuType = async () => {
      try {
        const data = await getOnuTypeById(id);
        setFormData({
          name: data.name || '',
          pon_type: data.pon_type || 'GPON',
          description: data.description || '',
          ethernet_ports: data.ethernet_ports || 4,
          wifi_ssids: data.wifi_ssids || 2,
          voip_ports: data.voip_ports || 2,
          catv: data.catv || false,
          allow_custom_profiles: data.allow_custom_profiles || false,
          capability: data.capability || '',
          notes: data.notes || '',
          is_active: data.is_active !== false,
          vendor: data.vendor || '',
        });
      } catch (err) {
        console.error('Error fetching ONU Type:', err);
        setError('Failed to load ONU Type. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOnuType();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    if (!formData.pon_type) {
      errors.pon_type = 'PON Type is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const formDataToSend = new FormData();
      
      // Append all form fields to FormData
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formDataToSend.append(key, value);
        }
      });

      if (isEditMode) {
        await updateOnuType(id, formDataToSend);
        setSuccess('ONU Type updated successfully!');
      } else {
        await createOnuType(formDataToSend);
        setSuccess('ONU Type created successfully!');
        // Reset form after successful creation
        setFormData({
          name: '',
          pon_type: 'GPON',
          description: '',
          ethernet_ports: 4,
          wifi_ssids: 2,
          voip_ports: 2,
          catv: false,
          allow_custom_profiles: false,
          capability: '',
          notes: '',
          is_active: true,
          vendor: '',
        });
      }
      
      // Navigate back to list after a short delay
      setTimeout(() => {
        if (isEditMode) {
          navigate(`/onu-types/${id}`);
        } else {
          navigate('/onu-types');
        }
      }, 1500);
    } catch (err) {
      console.error('Error saving ONU Type:', err);
      setError(err.response?.data?.message || 'Failed to save ONU Type. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumb Navigation */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <MuiLink component={Link} to="/" color="inherit">
          Home
        </MuiLink>
        <MuiLink component={Link} to="/onu-types" color="inherit">
          ONU Types
        </MuiLink>
        <Typography color="text.primary">
          {isEditMode ? 'Edit ONU Type' : 'Create New ONU Type'}
        </Typography>
      </Breadcrumbs>

      <Typography variant="h4" component="h1" gutterBottom>
        {isEditMode ? 'Edit ONU Type' : 'Create New ONU Type'}
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Basic Information</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Name *"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
                margin="normal"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal" error={!!formErrors.pon_type}>
                <InputLabel>PON Type *</InputLabel>
                <Select
                  name="pon_type"
                  value={formData.pon_type}
                  onChange={handleChange}
                  label="PON Type *"
                >
                  {PON_TYPES.map(type => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.pon_type && (
                  <FormHelperText>{formErrors.pon_type}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Vendor"
                name="vendor"
                value={formData.vendor}
                onChange={handleChange}
                margin="normal"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                margin="normal"
              />
            </Grid>

            {/* Hardware Specifications */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>Hardware Specifications</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Ethernet Ports"
                name="ethernet_ports"
                value={formData.ethernet_ports}
                onChange={handleChange}
                margin="normal"
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                type="number"
                label="WiFi SSIDs"
                name="wifi_ssids"
                value={formData.wifi_ssids}
                onChange={handleChange}
                margin="normal"
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                type="number"
                label="VoIP Ports"
                name="voip_ports"
                value={formData.voip_ports}
                onChange={handleChange}
                margin="normal"
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.catv}
                    onChange={handleChange}
                    name="catv"
                    color="primary"
                  />
                }
                label="CATV Support"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.allow_custom_profiles}
                    onChange={handleChange}
                    name="allow_custom_profiles"
                    color="primary"
                  />
                }
                label="Allow Custom Profiles"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={handleChange}
                    name="is_active"
                    color="primary"
                  />
                }
                label="Active"
              />
            </Grid>

            {/* Additional Information */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>Additional Information</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Capability"
                name="capability"
                value={formData.capability}
                onChange={handleChange}
                margin="normal"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                margin="normal"
              />
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12} sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                onClick={() => navigate(-1)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} /> : null}
              >
                {saving ? 'Saving...' : 'Save ONU Type'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Snackbar for success/error messages */}
      <Snackbar
        open={!!success || !!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={success ? 'success' : 'error'}
          sx={{ width: '100%' }}
        >
          {success || error}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default EditOnuTypePage;
