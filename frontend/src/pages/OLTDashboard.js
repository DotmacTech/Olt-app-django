import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  Box,
  Tabs,
  Tab,
  IconButton, // Keep IconButton if used elsewhere, or remove if not
  Typography,
  Paper,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Dashboard as DashboardIcon,
  Memory as MemoryIcon,
  Router as RouterIcon,
  SwapHoriz as SwapHorizIcon,
  AccountTree as AccountTreeIcon,
  SettingsEthernet as SettingsEthernetIcon,
  Security as SecurityIcon,
  Call as CallIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { getOLTDetails } from '../services/api';
import { useCallback } from 'react'; // Import useCallback
function OLTDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [oltData, setOltData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOLTData = useCallback(async () => {
    // Renamed to fetchOLTData to avoid confusion if passed directly
    if (!id) return;
      try {
        setLoading(true);
        const data = await getOLTDetails(id);
        setOltData(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch OLT details: ' + (err.response?.data?.detail || err.message));
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
  }, [id]); // id is a dependency for useCallback

  useEffect(() => {
    if (id) {
      fetchOLTData();
    }
  }, [id, fetchOLTData]); // fetchOLTData is now stable due to useCallback

  const tabs = [
    { label: 'Overview', path: '', icon: <DashboardIcon /> },
    { label: 'Cards', path: 'cards', icon: <MemoryIcon /> },
    { label: 'PON Ports', path: 'pon-ports', icon: <RouterIcon /> },
    { label: 'Uplink', path: 'uplink', icon: <SwapHorizIcon /> },
    { label: 'VLANs', path: 'vlans', icon: <AccountTreeIcon /> },
    { label: 'ONU Management', path: 'onu-management', icon: <SettingsEthernetIcon /> },
    { label: 'Remote ACLs', path: 'remote-acls', icon: <SecurityIcon /> },
    { label: 'VoIP Profiles', path: 'voip-profiles', icon: <CallIcon /> },
    { label: 'Advanced', path: 'advanced', icon: <SettingsIcon /> },
  ];

  const getCurrentTab = () => {
    const path = location.pathname.split('/').pop();
    const index = tabs.findIndex(tab => tab.path === path);
    return index === -1 ? 0 : index;
  };

  const handleTabChange = (event, newValue) => {
    const path = tabs[newValue].path;
    navigate(path ? `/olt/${id}/${path}` : `/olt/${id}`);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => navigate('/olt-list')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Breadcrumbs aria-label="breadcrumb">
              <Link
                component="button"
                variant="body1"
                onClick={() => navigate('/olt-list')}
                sx={{ textDecoration: 'none', cursor: 'pointer' }}
              >
                OLT List
              </Link>
              <Typography variant="body1" color="text.primary">
                {oltData?.name || `OLT ${id}`}
              </Typography>
            </Breadcrumbs>
            <Typography variant="h5" sx={{ mt: 1 }}>
              {oltData?.name || `OLT ${id}`}
            </Typography>
          </Box>
        </Box>

        {/* Tabs */}
        <Paper sx={{ borderRadius: '8px 8px 0 0' }}>
          <Tabs
            value={getCurrentTab()}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                label={tab.label}
                icon={tab.icon}
                iconPosition="start"
                sx={{
                  minHeight: 48,
                  textTransform: 'none',
                }}
              />
            ))}
          </Tabs>
        </Paper>
      </Box>

      {/* Content */}
      <Paper sx={{ p: 3, minHeight: 'calc(100vh - 250px)' }}>
    <Outlet context={{ oltData, loading, error, refreshOltData: fetchOLTData }} />
      </Paper>
    </Box>
  );
}

export default OLTDashboard;
