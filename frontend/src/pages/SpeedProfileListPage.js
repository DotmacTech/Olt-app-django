import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  Box,
  CircularProgress,
  Chip,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import { 
  getSpeedProfiles, 
  createSpeedProfile, 
  updateSpeedProfile, 
  deleteSpeedProfile,
  importSpeedProfiles
} from '../services/api';
import speedProfilesData from '../data/speed_profiles.json';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SpeedProfileForm from '../components/SpeedProfileForm';

const SpeedProfileListPage = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [openForm, setOpenForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Load profiles from API or use default data
  const loadProfiles = async () => {
    try {
      setLoading(true);
      try {
        const data = await getSpeedProfiles(page + 1, rowsPerPage);
        setProfiles(data.profiles || []);
        setTotal(data.total || 0);
      } catch (error) {
        console.warn('Using default speed profiles due to API error:', error);
        // If API fails, use the default JSON data
        setProfiles(speedProfilesData);
        setTotal(speedProfilesData.length);
      }
    } catch (error) {
      console.error('Error loading speed profiles:', error);
      toast.error('Failed to load speed profiles');
    } finally {
      setLoading(false);
    }
  };

  // Load profiles on component mount and when pagination changes
  useEffect(() => {
    loadProfiles();
    
    // If no profiles are loaded after a delay, try using the default data
    const timer = setTimeout(() => {
      if (profiles.length === 0 && !loading) {
        setProfiles(speedProfilesData);
        setTotal(speedProfilesData.length);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [page, rowsPerPage]);

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // CRUD operations
  const handleAddProfile = () => {
    setEditingProfile(null);
    setOpenForm(true);
  };

  const handleEditProfile = (profile) => {
    setEditingProfile(profile);
    setOpenForm(true);
  };

  const handleDeleteProfile = async (id) => {
    if (window.confirm('Are you sure you want to delete this speed profile?')) {
      try {
        await deleteSpeedProfile(id);
        toast.success('Speed profile deleted successfully');
        loadProfiles();
      } catch (error) {
        console.error('Error deleting speed profile:', error);
        toast.error('Failed to delete speed profile');
      }
    }
  };

  const handleSubmitProfile = async (profileData) => {
    try {
      setFormLoading(true);
      
      if (editingProfile) {
        await updateSpeedProfile(editingProfile.id, profileData);
        toast.success('Speed profile updated successfully');
      } else {
        await createSpeedProfile(profileData);
        toast.success('Speed profile created successfully');
      }
      
      setOpenForm(false);
      loadProfiles();
    } catch (error) {
      console.error('Error saving speed profile:', error);
      toast.error(`Failed to ${editingProfile ? 'update' : 'create'} speed profile`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Format speed for display
  const formatSpeed = (kbps) => {
    if (kbps >= 1000000) {
      return `${(kbps / 1000000).toFixed(1)} Gbps`;
    } else if (kbps >= 1000) {
      return `${(kbps / 1000).toFixed(0)} Mbps`;
    }
    return `${kbps} Kbps`;
  };

  // Get color based on profile type
  const getTypeColor = (type) => {
    switch (type) {
      case 'INTERNET':
        return 'primary';
      case 'VOIP':
        return 'success';
      case 'IPTV':
        return 'error';
      case 'TR069':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SpeedIcon fontSize="large" color="primary" />
          <Typography variant="h4" component="h1">
            Speed Profiles
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddProfile}
            disabled={loading}
          >
            Add Profile
          </Button>
        </Box>
      </Box>

      <Paper elevation={3} sx={{ mb: 4 }}>
        <TableContainer>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : profiles.length === 0 ? (
            <Alert severity="info" sx={{ m: 2 }}>
              No speed profiles found. Click 'Add Profile' to create one.
            </Alert>
          ) : (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Download/Upload</TableCell>
                    <TableCell>VLAN</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>DSCP</TableCell>
                    <TableCell>Policer (CIR/CBS)</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {profiles.map((profile) => (
                    <TableRow key={profile.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <SpeedIcon color={getTypeColor(profile.type)} />
                          <Typography variant="body1">
                            {profile.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={profile.type} 
                          color={getTypeColor(profile.type)} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Box>↓ {formatSpeed(profile.download_speed)}</Box>
                          <Box>↑ {formatSpeed(profile.upload_speed)}</Box>
                        </Box>
                      </TableCell>
                      <TableCell>{profile.vlan}</TableCell>
                      <TableCell>
                        <Chip 
                          label={profile.priority} 
                          color={profile.priority <= 1 ? 'error' : profile.priority <= 3 ? 'warning' : 'default'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={profile.dscp} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Box>CIR: {formatSpeed(profile.policer_cir)}</Box>
                          <Box>CBS: {profile.policer_cbs} bytes</Box>
                          {profile.policer_eir && (
                            <Box>EIR: {formatSpeed(profile.policer_eir)}</Box>
                          )}
                          {profile.policer_ebs && (
                            <Box>EBS: {profile.policer_ebs} bytes</Box>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton 
                            onClick={() => handleEditProfile(profile)}
                            color="primary"
                            size="small"
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            onClick={() => handleDeleteProfile(profile.id)}
                            color="error"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={total}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{ borderTop: '1px solid rgba(224, 224, 224, 1)' }}
              />
            </>
          )}
        </TableContainer>
      </Paper>



      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Speed Profile Form Dialog */}
      <SpeedProfileForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        profile={editingProfile}
        onSubmit={handleSubmitProfile}
        loading={formLoading}
      />
    </Container>
  );
};

export default SpeedProfileListPage;
