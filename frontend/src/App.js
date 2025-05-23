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
import AllONTListPage from './pages/AllONTListPage'; // Import the All ONT List page
import AddOntPage from './pages/AddOntPage'; // Import the Add ONT page
import ONTDetailPage from './pages/ONTDetailPage'; // Import the new ONT Detail page
import DashboardPage from './pages/DashboardPage'; // Import the new page
import OnuTypePage from './pages/OnuTypePage'; // Import the ONU Type page
import OnuTypeListPage from './pages/OnuTypeListPage'; // Import the ONU Type List page
import OnuTypeDetailPage from './pages/OnuTypeDetailPage'; // Import the ONU Type Detail page
import EditOnuTypePage from './pages/EditOnuTypePage'; // Import the Edit ONU Type page
import ZoneListPage from './pages/ZoneListPage';
import ZoneForm from './components/ZoneForm';

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
            {/* Change the root path to navigate to the dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/all-onts" element={<AllONTListPage />} />
            <Route path="/add-ont" element={<AddOntPage />} />
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
            <Route path="/olt-list" element={<OLTList />} /> {/* Keep OLTList route */}
            
            <Route path="/olt/add" element={<AddOLT />} />
            {/* Route for specific PON Port details page */}
            <Route path="/olts/:oltId/slot/:slotNumber/ponports" element={<PONPort />} /> 
            {/* Route for listing ONTs on a specific PON Port */}
            <Route path="/olts/:oltId/slot/:slotNumber/ponport/:ponPortId/onts" element={<ONTList />} />
            {/* Route for specific ONT details */}
            <Route path="/olts/:oltId/slot/:slotNumber/ponport/:ponPortId/ont/:ontId" element={<ONTDetailPage />} />
            {/* Route for ONU Type List page */}
            <Route path="/onu-types" element={<OnuTypeListPage />} />
            {/* Route for ONU Type creation page */}
            <Route path="/onu-types/add" element={<OnuTypePage />} />
            {/* ONU Type routes */}
            <Route path="/onu-types/:id" element={<OnuTypeDetailPage />} />
            <Route path="/onu-types/edit/:id" element={<EditOnuTypePage />} />
            <Route path="/onu-types/add" element={<EditOnuTypePage />} />
            {/* Keep the old add route for backward compatibility */}
            <Route path="/onu-types/add-old" element={<OnuTypePage />} />
            
            {/* Zone Management Routes */}
            <Route path="/zones" element={<ZoneListPage />} />
            <Route path="/zones/add" element={<ZoneForm />} />
            <Route path="/zones/:id/edit" element={<ZoneForm />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
