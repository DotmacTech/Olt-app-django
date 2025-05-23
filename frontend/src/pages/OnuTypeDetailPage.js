import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { getOnuTypeById } from '../services/api';

function OnuTypeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [onuType, setOnuType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOnuType = async () => {
      try {
        setLoading(true);
        const data = await getOnuTypeById(id);
        setOnuType(data);
      } catch (err) {
        console.error('Error fetching ONU Type:', err);
        setError('Failed to load ONU Type details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOnuType();
  }, [id]);

  const renderDetailItem = (label, value, isBoolean = false) => (
    <Grid item xs={12} sm={6} md={4}>
      <Typography variant="subtitle2" color="textSecondary">
        {label}
      </Typography>
      {isBoolean ? (
        <Chip 
          label={value ? 'Yes' : 'No'} 
          color={value ? 'primary' : 'default'}
          size="small"
        />
      ) : (
        <Typography variant="body1">
          {value || 'N/A'}
        </Typography>
      )}
      <Divider sx={{ my: 1 }} />
    </Grid>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/onu-types')}
          sx={{ mt: 2 }}
        >
          Back to ONU Types
        </Button>
      </Box>
    );
  }

  if (!onuType) {
    return (
      <Box p={3}>
        <Alert severity="warning">ONU Type not found</Alert>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/onu-types')}
          sx={{ mt: 2 }}
        >
          Back to ONU Types
        </Button>
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
        <Typography color="text.primary">{onuType.name || 'ONU Type Details'}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {onuType.name || 'ONU Type Details'}
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => navigate(`/onu-types/edit/${id}`)}
          sx={{ minWidth: 120 }}
        >
          Edit ONU Type
        </Button>
      </Box>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Basic Information Card */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Basic Information</Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                {renderDetailItem('PON Type', onuType.pon_type)}
                {renderDetailItem('Model', onuType.name)}
                {renderDetailItem('Vendor', onuType.vendor || 'N/A')}
                {renderDetailItem('Description', onuType.description || 'N/A')}
                {renderDetailItem('Status', onuType.is_active ? 'Active' : 'Inactive', false, onuType.is_active)}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Hardware Specifications Card */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Hardware Specifications</Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                {renderDetailItem('Ethernet Ports', onuType.ethernet_ports || 'N/A')}
                {renderDetailItem('WiFi SSIDs', onuType.wifi_ssids || 'N/A')}
                {renderDetailItem('VoIP Ports', onuType.voip_ports || 'N/A')}
                {renderDetailItem('CATV', onuType.catv ? 'Yes' : 'No')}
                {renderDetailItem('Allow Custom Profiles', onuType.allow_custom_profiles ? 'Yes' : 'No')}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Additional Information Card */}
        {(onuType.capability || onuType.notes) && (
          <Grid item xs={12}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Additional Information</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  {onuType.capability && renderDetailItem('Capability', onuType.capability)}
                  {onuType.notes && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Notes
                      </Typography>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                        {onuType.notes}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button 
          variant="outlined" 
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => navigate(`/onu-types/edit/${id}`)}
        >
          Edit ONU Type
        </Button>
      </Box>
    </Box>
  );
}

export default OnuTypeDetailPage;
