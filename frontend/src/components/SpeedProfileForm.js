import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Grid,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Typography,
  CircularProgress,
  Alert,
  Box
} from '@mui/material';

const DSCP_OPTIONS = [
  { value: 'AF11', label: 'AF11 (10) - Low Drop' },
  { value: 'AF12', label: 'AF12 (12)' },
  { value: 'AF13', label: 'AF13 (14)' },
  { value: 'AF21', label: 'AF21 (18) - Medium Drop' },
  { value: 'AF22', label: 'AF22 (20)' },
  { value: 'AF23', label: 'AF23 (22)' },
  { value: 'AF31', label: 'AF31 (26) - High Drop' },
  { value: 'AF32', label: 'AF32 (28)' },
  { value: 'AF33', label: 'AF33 (30)' },
  { value: 'AF41', label: 'AF41 (34) - Critical' },
  { value: 'AF42', label: 'AF42 (36)' },
  { value: 'AF43', label: 'AF43 (38)' },
  { value: 'EF', label: 'EF (46) - Expedited Forwarding' },
  { value: 'CS0', label: 'CS0 (0) - Best Effort' },
  { value: 'CS1', label: 'CS1 (8) - Scavenger' },
  { value: 'CS2', label: 'CS2 (16) - Network Control' },
  { value: 'CS3', label: 'CS3 (24) - Call Signaling' },
  { value: 'CS4', label: 'CS4 (32) - Real-time' },
  { value: 'CS5', label: 'CS5 (40) - Broadcast Video' },
  { value: 'CS6', label: 'CS6 (48) - Internetwork Control' },
  { value: 'CS7', label: 'CS7 (56) - Network Management' }
];

const SpeedProfileForm = ({ open, onClose, profile, onSubmit, loading: propLoading }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const loading = isSubmitting || propLoading;
  const [formData, setFormData] = useState({
    name: '',
    type: 'INTERNET',
    download_speed: 100,
    upload_speed: 50,
    vlan: 1,
    priority: 0,
    dscp: 'AF41',
    policer_cir: 100000,
    policer_cbs: 2000,
    policer_eir: '',
    policer_ebs: ''
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        type: profile.type || 'INTERNET',
        download_speed: profile.download_speed || 100,
        upload_speed: profile.upload_speed || 50,
        vlan: profile.vlan || 1,
        priority: profile.priority || 0,
        dscp: profile.dscp || 'AF41',
        policer_cir: profile.policer_cir || 100000,
        policer_cbs: profile.policer_cbs || 2000,
        policer_eir: profile.policer_eir || '',
        policer_ebs: profile.policer_ebs || ''
      });
    } else {
      setFormData({
        name: '',
        type: 'INTERNET',
        download_speed: 100,
        upload_speed: 50,
        vlan: 1,
        priority: 0,
        dscp: 'AF41',
        policer_cir: 100000,
        policer_cbs: 2000,
        policer_eir: '',
        policer_ebs: ''
      });
    }
    setErrors({});
  }, [profile, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Clear previous API errors
    setApiError(null);
    
    // Client-side validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name cannot exceed 100 characters';
    }
    
    if (!formData.download_speed || formData.download_speed <= 0) {
      newErrors.download_speed = 'Download speed must be greater than 0';
    }
    
    if (!formData.upload_speed || formData.upload_speed <= 0) {
      newErrors.upload_speed = 'Upload speed must be greater than 0';
    }
    
    if (!formData.vlan || formData.vlan < 1 || formData.vlan > 4095) {
      newErrors.vlan = 'VLAN ID must be between 1 and 4095';
    }
    
    if (formData.priority === undefined || formData.priority < 0 || formData.priority > 7) {
      newErrors.priority = 'Priority must be between 0 (highest) and 7 (lowest)';
    }
    
    if (!formData.policer_cir || formData.policer_cir <= 0) {
      newErrors.policer_cir = 'CIR must be greater than 0';
    }
    
    if (!formData.policer_cbs || formData.policer_cbs <= 0) {
      newErrors.policer_cbs = 'CBS must be greater than 0';
    }
    
    // If EIR is provided, EBS must also be provided and vice versa
    if ((formData.policer_eir && !formData.policer_ebs) || (!formData.policer_eir && formData.policer_ebs)) {
      newErrors.policer_eir = 'Both EIR and EBS must be provided together';
      newErrors.policer_ebs = 'Both EIR and EBS must be provided together';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setApiError(null);
    
    try {
      // Prepare data for submission
      const submitData = {
        name: formData.name.trim(),
        type: formData.type,
        download_speed: Number(formData.download_speed),
        upload_speed: Number(formData.upload_speed),
        vlan: Number(formData.vlan),
        priority: Number(formData.priority),
        dscp: formData.dscp,
        policer_cir: Number(formData.policer_cir),
        policer_cbs: Number(formData.policer_cbs),
        policer_eir: formData.policer_eir ? Number(formData.policer_eir) : null,
        policer_ebs: formData.policer_ebs ? Number(formData.policer_ebs) : null
      };
      
      await onSubmit(submitData);
      // If onSubmit doesn't throw, we can close the form
      onClose();
    } catch (error) {
      console.error('Error submitting speed profile:', error);
      
      // Handle API validation errors
      if (error.response && error.response.data) {
        const { data } = error.response;
        
        if (typeof data === 'object' && data !== null) {
          // Handle field-specific validation errors
          const apiErrors = {};
          Object.entries(data).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              apiErrors[field] = messages.join(' ');
            } else {
              apiErrors[field] = messages;
            }
          });
          setErrors(apiErrors);
        } else if (typeof data === 'string') {
          // Handle generic error message
          setApiError(data);
        }
      } else {
        setApiError(error.message || 'Failed to save speed profile. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      aria-labelledby="speed-profile-dialog-title"
    >
      <DialogTitle id="speed-profile-dialog-title">
        {profile ? 'Edit Speed Profile' : 'Create New Speed Profile'}
      </DialogTitle>
      <form onSubmit={handleSubmit} noValidate>
        <DialogContent>
          {apiError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {apiError}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                margin="normal"
                label="Profile Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
              
              <FormControl fullWidth margin="normal" error={!!errors.type}>
                <InputLabel>Service Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  label="Service Type"
                  required
                >
                  <MenuItem value="INTERNET">Internet</MenuItem>
                  <MenuItem value="VOIP">VoIP</MenuItem>
                  <MenuItem value="IPTV">IPTV</MenuItem>
                  <MenuItem value="TR069">TR-069</MenuItem>
                </Select>
                {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
              </FormControl>
              
              <TextField
                fullWidth
                margin="normal"
                label="VLAN ID"
                name="vlan"
                type="number"
                value={formData.vlan}
                onChange={handleChange}
                error={!!errors.vlan}
                helperText={errors.vlan || '1-4095'}
                required
                inputProps={{ min: 1, max: 4095, step: 1 }}
              />
              
              <FormControl fullWidth margin="normal" error={!!errors.priority}>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  label="Priority"
                  required
                >
                  <MenuItem value={0}>0 (Highest)</MenuItem>
                  <MenuItem value={1}>1</MenuItem>
                  <MenuItem value={2}>2</MenuItem>
                  <MenuItem value={3}>3</MenuItem>
                  <MenuItem value={4}>4 (Default)</MenuItem>
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={6}>6</MenuItem>
                  <MenuItem value={7}>7 (Lowest)</MenuItem>
                </Select>
                {errors.priority && <FormHelperText>{errors.priority}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                margin="normal"
                label="Download Speed (Mbps)"
                name="download_speed"
                type="number"
                value={formData.download_speed}
                onChange={handleChange}
                error={!!errors.download_speed}
                helperText={errors.download_speed}
                required
                inputProps={{ min: 1, step: 1 }}
              />
              
              <TextField
                fullWidth
                margin="normal"
                label="Upload Speed (Mbps)"
                name="upload_speed"
                type="number"
                value={formData.upload_speed}
                onChange={handleChange}
                error={!!errors.upload_speed}
                helperText={errors.upload_speed}
                required
                inputProps={{ min: 1, step: 1 }}
              />
              
              <FormControl fullWidth margin="normal">
                <InputLabel>DSCP Marking</InputLabel>
                <Select
                  name="dscp"
                  value={formData.dscp}
                  onChange={handleChange}
                  label="DSCP Marking"
                >
                  {DSCP_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'medium' }}>
                QoS Policer Settings
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                margin="normal"
                label="Committed Information Rate (CIR) - kbps"
                name="policer_cir"
                type="number"
                value={formData.policer_cir}
                onChange={handleChange}
                error={!!errors.policer_cir}
                helperText={errors.policer_cir || 'Guaranteed bandwidth'}
                required
                inputProps={{ min: 1, step: 1 }}
              />
              
              <TextField
                fullWidth
                margin="normal"
                label="Excess Information Rate (EIR) - kbps"
                name="policer_eir"
                type="number"
                value={formData.policer_eir}
                onChange={handleChange}
                helperText="Maximum burstable bandwidth (optional)"
                inputProps={{ min: 0, step: 1 }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                margin="normal"
                label="Committed Burst Size (CBS) - bytes"
                name="policer_cbs"
                type="number"
                value={formData.policer_cbs}
                onChange={handleChange}
                error={!!errors.policer_cbs}
                helperText={errors.policer_cbs || 'Burst size for CIR'}
                required
                inputProps={{ min: 1, step: 1 }}
              />
              
              <TextField
                fullWidth
                margin="normal"
                label="Excess Burst Size (EBS) - bytes"
                name="policer_ebs"
                type="number"
                value={formData.policer_ebs}
                onChange={handleChange}
                helperText="Burst size for EIR (optional)"
                inputProps={{ min: 0, step: 1 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={onClose} 
            color="secondary"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            color="primary" 
            variant="contained"
            disabled={loading}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting ? 'Saving...' : (profile ? 'Update' : 'Create')} Profile
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SpeedProfileForm;
