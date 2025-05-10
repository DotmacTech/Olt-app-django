import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';
import OLTList from './pages/OLTList';
import OLTDashboard from './pages/OLTDashboard';
import OLTDetails from './pages/OLTDetails';
import OLTCards from './pages/OLTCards';
import PONPorts from './pages/PONPorts';
import Uplink from './pages/Uplink';
import VLANs from './pages/VLANs';
import ONUManagement from './pages/ONUManagement';
import RemoteACLs from './pages/RemoteACLs';
import VoIPProfiles from './pages/VoIPProfiles';
import Advanced from './pages/Advanced';
import AddOLT from './pages/AddOLT';
import PONPort from './pages/PONPort'; 
import ONTList from './pages/ONTList'; // Import the new ONTList page

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#006400', // Dark Green
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/olt-list" replace />} />
            <Route path="/olt-list" element={<OLTList />} />
            <Route path="/olt/:id/*" element={<OLTDashboard />}>
              <Route index element={<OLTDetails />} />
              <Route path="cards" element={<OLTCards />} />
              <Route path="pon-ports" element={<PONPorts />} />
              <Route path="uplink" element={<Uplink />} />
              <Route path="vlans" element={<VLANs />} />
              <Route path="onu-management" element={<ONUManagement />} />
              <Route path="remote-acls" element={<RemoteACLs />} />
              <Route path="voip-profiles" element={<VoIPProfiles />} />
              <Route path="advanced" element={<Advanced />} />
              <Route path="pon-port" element={<PONPort />} />
            </Route>
            
            <Route path="/olt/add" element={<AddOLT />} />
            {/* Route for specific PON Port details page */}
            <Route path="/olts/:oltId/slot/:slotNumber/ponports" element={<PONPort />} /> 
            {/* Route for listing ONTs on a specific PON Port */}
            <Route path="/olts/:oltId/slot/:slotNumber/ponport/:ponPortId/onts" element={<ONTList />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
