import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  FileDownload as ExportIcon,
} from '@mui/icons-material';
import { getOLTs, deleteOLT } from '../services/api'; // Import deleteOLT


function OLTList() {
  const navigate = useNavigate();
  const [olts, setOlts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOLTs = async () => {
      try {
        setLoading(true);
        const response = await getOLTs();
        setOlts(response.results || []);
        setError(null);
      } catch (err) {
        setError('Failed to fetch OLTs: ' + (err.response?.data?.detail || err.message));
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOLTs();
  }, []);

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export to file');
  };

  const handleAdd = () => {
    // TODO: Implement add OLT functionality
    console.log('Add new OLT');
    navigate('/olt/add');
  };

  // Function to handle OLT deletion
  const handleDelete = async (id, name) => {
    // Simple confirmation dialog
    if (window.confirm(`Are you sure you want to delete OLT "${name}" (ID: ${id})?`)) {
      try {
        setLoading(true); // Optional: show loading indicator during delete
        await deleteOLT(id);
        // Remove the deleted OLT from the state
        setOlts((prevOlts) => prevOlts.filter((olt) => olt.id !== id));
        setError(null); // Clear any previous errors
        // Optionally show a success message (e.g., using a Snackbar)
      } catch (err) {
        setError(`Failed to delete OLT ${id}: ${err.response?.data?.detail || err.message}`);
        console.error('Delete Error:', err);
      } finally {
        setLoading(false); // Hide loading indicator
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ExportIcon />}
          onClick={handleExport}
        >
          Export to file
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Add OLT
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>View</TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>OLT IP</TableCell>
              <TableCell>Telnet/SSH (LCT port)</TableCell>
              <TableCell>IPTV version</TableCell>
              <TableCell>OLT hardware version</TableCell>
              <TableCell>OLT SW version</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {olts.map((olt) => (
              <TableRow key={olt.id}>
                <TableCell>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => navigate(`/olt/${olt.id}`)}
                  >
                    View
                  </Button>
                </TableCell>
                <TableCell>{olt.id}</TableCell>
                <TableCell>{olt.name}</TableCell>
                <TableCell>{olt.ip_address}</TableCell>
                <TableCell>{olt.telnet_port || '23'}</TableCell>
                <TableCell>{olt.iptv_version || '10'}</TableCell>
                <TableCell>{olt.hardware_version}</TableCell>
                <TableCell>{olt.software_version}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/olt/${olt.id}`)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(olt.id, olt.name)} // Pass id and name to handler
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default OLTList;
