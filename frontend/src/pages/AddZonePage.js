import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Box,
  CircularProgress
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import api from '../utils/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddZonePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Zone name is required');
      return;
    }

    try {
      setLoading(true);
      await api.post('/zones/', formData);
      toast.success('Zone created successfully');
      navigate('/zones');
    } catch (err) {
      console.error('Error creating zone:', err);
      toast.error(err.response?.data?.detail || 'Failed to create zone');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/zones')}
          sx={{ mr: 2 }}
        >
          Back to Zones
        </Button>
        <Typography variant="h4" component="h1">
          Add New Zone
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Zone Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={4}
            disabled={loading}
          />
          <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
            <Button
              variant="outlined"
              onClick={() => navigate('/zones')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Zone'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default AddZonePage;
