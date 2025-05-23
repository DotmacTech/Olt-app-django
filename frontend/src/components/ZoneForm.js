import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Box,
  CircularProgress,
  FormHelperText,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { getZone, createZone, updateZone } from '../services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ZoneForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      fetchZone();
    }
  }, [id, isEditMode]);

  const fetchZone = async () => {
    try {
      setLoading(true);
      const zone = await getZone(id);
      setFormData({
        name: zone.name,
        description: zone.description || '',
      });
    } catch (err) {
      console.error('Error fetching zone:', err);
      toast.error(err.response?.data?.detail || 'Failed to load zone data');
      navigate('/zones');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name must be 100 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      
      if (isEditMode) {
        await updateZone(id, formData);
        toast.success('Zone updated successfully');
      } else {
        await createZone(formData);
        toast.success('Zone created successfully');
      }
      
      // Navigate back to the zones list, forcing a refresh
      navigate('/zones', { replace: true, state: { refresh: true } });
    } catch (err) {
      console.error('Error saving zone:', err);
      
      if (err.response?.data) {
        // Handle server-side validation errors
        const serverErrors = {};
        Object.entries(err.response.data).forEach(([field, messages]) => {
          serverErrors[field] = Array.isArray(messages) ? messages[0] : messages;
        });
        setErrors(serverErrors);
      } else {
        toast.error(`Failed to ${isEditMode ? 'update' : 'create'} zone`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Box mb={3} display="flex" alignItems="center">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Edit Zone' : 'Add New Zone'}
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <Box mb={3}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={Boolean(errors.name)}
              helperText={errors.name}
              disabled={submitting}
              required
            />
          </Box>
          
          <Box mb={3}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              error={Boolean(errors.description)}
              helperText={errors.description}
              disabled={submitting}
            />
          </Box>

          <Box display="flex" justifyContent="flex-end" mt={4}>
            <Button
              type="button"
              variant="outlined"
              onClick={() => navigate('/zones')}
              disabled={submitting}
              sx={{ mr: 2 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              disabled={submitting}
            >
              {isEditMode ? 'Update' : 'Create'} Zone
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default ZoneForm;
