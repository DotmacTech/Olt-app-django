import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Switch, Box, Pagination, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, Alert, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { getOnuTypes } from '../services/api';
import { deleteOnuType } from '../services/api';

const columns = [
  { id: 'pon_type', label: 'PON type' },
  { id: 'name', label: 'ONU type' },
  { id: 'ethernet_ports', label: 'Ethernet ports' },
  { id: 'wifi_ssids', label: 'WiFi' },
  { id: 'voip_ports', label: 'VoIP ports' },
  { id: 'catv', label: 'CATV' },
  { id: 'allow_custom_profiles', label: 'Allow custom profiles' },
  { id: 'capability', label: 'Capability' },
  // Add more columns if needed
];

function OnuTypeListPage() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarError, setSnackbarError] = useState(false);

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
    setSnackbarError(false);
  };


  const handleDelete = (row) => {
    setDeleteTarget(row);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    // Use only id or unique_id, never name
    const id = deleteTarget.id || deleteTarget.unique_id;
    if (!id) {
      setSnackbarError(true);
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      return;
    }
    try {
      await deleteOnuType(id);
      setOnuTypes((prev) => prev.filter((item) => (item.id || item.unique_id) !== id));
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarError(true);
    }
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  const [onuTypes, setOnuTypes] = useState([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10); // You can make this user-configurable if desired
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getOnuTypes(page, rowsPerPage)
      .then(data => {
        if (Array.isArray(data)) {
          setOnuTypes(data);
          setTotalCount(data.length);
        } else if (data && Array.isArray(data.results)) {
          setOnuTypes(data.results);
          setTotalCount(data.count || data.results.length);
        } else {
          setOnuTypes([]);
          setTotalCount(0);
        }
      })
      .catch(() => {
        setOnuTypes([]);
        setTotalCount(0);
      })
      .finally(() => setLoading(false));
  }, [page, rowsPerPage]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', mt: 3 }}>
      <Typography variant="h6" sx={{ m: 2 }}>
        ONU Types
      </Typography>
      <Box display="flex" justifyContent="center" mt={2} mb={2}>
        <Pagination
          count={Math.ceil(totalCount / rowsPerPage)}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map(col => (
                <TableCell key={col.id} sx={{ fontWeight: 'bold' }}>{col.label}</TableCell>
              ))}
              <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={columns.length + 1} align="center">Loading...</TableCell></TableRow>
            ) : onuTypes.length === 0 ? (
              <TableRow><TableCell colSpan={columns.length + 1} align="center">No ONU Types found.</TableCell></TableRow>
            ) : (
              onuTypes.map(row => (
                <TableRow key={row.unique_id || row.name}>
                  {columns.map(col => (
                    <TableCell key={col.id}>
                      {col.id === 'catv' || col.id === 'allow_custom_profiles' ? (
                        <Switch checked={!!row[col.id]} disabled />
                      ) : col.id === 'name' ? (
                        <Link 
                          component={RouterLink} 
                          to={`/onu-types/${row.id || row.unique_id}`}
                          underline="hover"
                          color="primary"
                        >
                          {row[col.id]}
                        </Link>
                      ) : (
                        row[col.id]
                      )}
                    </TableCell>
                  ))}
                  <TableCell>
                    {/* Action column - add edit/delete as needed */}
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => handleDelete(row)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box display="flex" justifyContent="center" mt={2} mb={2}>
        <Pagination
          count={Math.ceil(totalCount / rowsPerPage)}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this ONU Type?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>Delete</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          ONU Type deleted successfully.
        </Alert>
      </Snackbar>
      <Snackbar
        open={snackbarError}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
          Failed to delete ONU Type: Missing or invalid ID.
        </Alert>
      </Snackbar>
    </Paper>
  );
}

export default OnuTypeListPage;
