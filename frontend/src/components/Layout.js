import React from 'react';
import { Box, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'OLT Details', path: '/' },
  // { label: 'OLT Cards', path: '/cards' },
  // { label: 'PON Ports', path: '/pon-ports' },
  // { label: 'Uplink', path: '/uplink' },
  // { label: 'VLANs', path: '/vlans' },
  // { label: 'ONU Mgmt Ps', path: '/onu-management' },
  // { label: 'Remote ACLs', path: '/remote-acls' },
  // { label: 'VoIP Profiles', path: '/voip-profiles' },
  // { label: 'Advanced', path: '/advanced' }
];

function Layout({ children }) {
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Dotmac Network Management
          </Typography>
          <Button color="inherit">User Training</Button>
          <Button color="inherit">Configure</Button>
          <Button color="inherit">Scripts</Button>
          <Button color="inherit">Diagnostics</Button>
          <Button color="inherit">Reports</Button>
          <Button color="inherit">Save Config</Button>
          <Button color="inherit">Settings</Button>
          <Button color="inherit">Logout</Button>
        </Toolbar>
      </AppBar>
      
      <Box sx={{ bgcolor: '#f5f5f5', p: 2 }}>
        <Button variant="contained" component={Link} to="/olt-list">
          Back to OLTs list
        </Button>
      </Box>

      <Box sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        {navItems.map((item) => (
          <Button
            key={item.path}
            component={Link}
            to={item.path}
            sx={{
              px: 2,
              py: 1,
              color: 'text.primary',
              borderBottom: location.pathname === item.path ? 2 : 0,
              borderColor: 'primary.main',
            }}
          >
            {item.label}
          </Button>
        ))}
      </Box>

      <Box sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  );
}

export default Layout;
