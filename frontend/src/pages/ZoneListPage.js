import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
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
  TableFooter,
  TablePagination,
  CircularProgress,
  Box,
  IconButton,
  Tooltip,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  useTheme
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  KeyboardArrowLeft,
  KeyboardArrowRight
} from '@mui/icons-material';
import { createZone, updateZone, deleteZone, getZones } from '../services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import zonesData from '../data/zones.json';

// Pagination actions component
function TablePaginationActions(props) {
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2, display: 'flex' }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        <FirstPageIcon />
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        <KeyboardArrowLeft />
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        <KeyboardArrowRight />
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        <LastPageIcon />
      </IconButton>
    </Box>
  );
}

const ZoneListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newZone, setNewZone] = useState({ name: '', description: '' });
  const [editingZone, setEditingZone] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalZones, setTotalZones] = useState(0);
  const theme = useTheme();

  useEffect(() => {
    loadInitialZones();
  }, [page, rowsPerPage]);

  const loadInitialZones = async () => {
    try {
      setLoading(true);
      // First try to load from API
      try {
        const { zones: apiZones, total } = await getZones(page + 1, rowsPerPage);
        if (apiZones && apiZones.length > 0) {
          setZones(apiZones);
          setTotalZones(total);
          return;
        }
      } catch (err) {
        console.log('Using default zones from JSON');
      }
      
      // If API fails or returns no data, use the JSON data with client-side pagination
      const startIndex = page * rowsPerPage;
      const endIndex = startIndex + rowsPerPage;
      const defaultZones = zonesData.zones
        .slice(startIndex, endIndex)
        .map((name, index) => ({
          id: startIndex + index + 1,
          name,
          description: `Zone ${startIndex + index + 1} description`,
          created_at: new Date().toISOString()
        }));
      
      setZones(defaultZones);
      setTotalZones(zonesData.zones.length);
      setError(null);
    } catch (err) {
      console.error('Error loading zones:', err);
      setError('Failed to load zones. Using default data.');
      toast.error('Failed to load zones');
    } finally {
      setLoading(false);
    }
  };

  const handleAddZone = async () => {
    try {
      const zoneData = {
        name: newZone.name,
        description: newZone.description || ''
      };
      
      // Try to save to API first
      try {
        await createZone(zoneData);
        // Reload the current page to show the new zone
        loadInitialZones();
      } catch (err) {
        // If API fails, add locally
        console.log('Adding zone locally');
        const newZoneWithId = {
          ...zoneData,
          id: Date.now(), // Temporary ID
          created_at: new Date().toISOString()
        };
        // Add to the beginning of the list and ensure we don't exceed page size
        setZones(prev => [newZoneWithId, ...prev].slice(0, rowsPerPage));
        setTotalZones(prev => prev + 1);
      }
      
      setNewZone({ name: '', description: '' });
      setOpenAddDialog(false);
      toast.success('Zone added successfully');
    } catch (err) {
      console.error('Error adding zone:', err);
      toast.error(err.response?.data?.detail || 'Failed to add zone');
    }
  };

  const handleEditZone = (zone) => {
    setEditingZone(zone);
    setNewZone({ name: zone.name, description: zone.description || '' });
    setOpenAddDialog(true);
  };

  const handleUpdateZone = async () => {
    if (!editingZone) return;
    
    try {
      const updatedZone = {
        ...editingZone,
        name: newZone.name,
        description: newZone.description
      };
      
      // Try to update via API
      try {
        await updateZone(editingZone.id, updatedZone);
        setZones(prev => prev.map(z => z.id === editingZone.id ? updatedZone : z));
      } catch (err) {
        // If API fails, update locally
        console.log('Updating zone locally');
        setZones(prev => prev.map(z => z.id === editingZone.id ? updatedZone : z));
      }
      
      setOpenAddDialog(false);
      setEditingZone(null);
      setNewZone({ name: '', description: '' });
      toast.success('Zone updated successfully');
    } catch (err) {
      console.error('Error updating zone:', err);
      toast.error(err.response?.data?.detail || 'Failed to update zone');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this zone?')) {
      try {
        // Try to delete from API
        try {
          await deleteZone(id);
          // Reload zones to ensure we have a full page
          loadInitialZones();
        } catch (err) {
          console.log('Deleting zone locally');
          const updatedZones = zones.filter(zone => zone.id !== id);
          setZones(updatedZones);
          setTotalZones(prev => prev - 1);
          
          // If we deleted the last item on the page, go to previous page
          if (updatedZones.length === 0 && page > 0) {
            setPage(prev => prev - 1);
          }
        }
        
        toast.success('Zone deleted successfully');
      } catch (err) {
        console.error('Error deleting zone:', err);
        toast.error(err.response?.data?.detail || 'Failed to delete zone');
      }
    }
  };

  const handleDialogClose = () => {
    setOpenAddDialog(false);
    setEditingZone(null);
    setNewZone({ name: '', description: '' });
  };
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }


  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Zones
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenAddDialog(true)}
        >
          Add Zone
        </Button>
      </Box>

      {error && (
        <Box mb={3} color="error.main">
          {error}
        </Box>
      )}

      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {zones.length > 0 ? (
                zones.map((zone) => (
                  <TableRow key={zone.id}>
                    <TableCell>{zone.name}</TableCell>
                    <TableCell>{zone.description}</TableCell>
                    <TableCell>
                      {new Date(zone.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton
                          onClick={() => handleEditZone(zone)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(zone.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No zones found. Create your first zone!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  colSpan={4}
                  count={totalZones}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  SelectProps={{
                    inputProps: { 'aria-label': 'rows per page' },
                    native: true,
                  }}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  ActionsComponent={TablePaginationActions}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Zone Dialog */}
      <Dialog open={openAddDialog} onClose={handleDialogClose}>
        <DialogTitle>{editingZone ? 'Edit Zone' : 'Add New Zone'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Zone Name"
              fullWidth
              value={newZone.name}
              onChange={(e) => setNewZone({...newZone, name: e.target.value})}
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={newZone.description}
              onChange={(e) => setNewZone({...newZone, description: e.target.value})}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button 
            onClick={editingZone ? handleUpdateZone : handleAddZone}
            variant="contained"
            disabled={!newZone.name.trim()}
          >
            {editingZone ? 'Update' : 'Add'} Zone
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ZoneListPage;
