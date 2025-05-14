import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom'; // Import RouterLink
import { Box, Typography, Paper, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, IconButton } from '@mui/material';
import { getOLTCards } from '../services/api';
import VisibilityIcon from '@mui/icons-material/Visibility'; // For a "View" icon

function OLTCards() { // Remove oltId from props
  const { id } = useParams(); // Get the ID from URL parameters
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('OLTCards rendering with id from useParams:', id); // Log the id from params

  useEffect(() => {
    if (!id) { // Check the id from params
      console.log('OLTCards: No id found in URL params, skipping fetch.');
      setLoading(false); // Stop loading if no ID
      return;
    }
    console.log(`OLTCards: Fetching cards for id: ${id}`); // Log fetch start using id from params
    setLoading(true);
    setError(null);
    getOLTCards(id) // Use the id from params for the API call
      .then((data) => {
        console.log('OLTCards: API response data:', data); // Log the received data
        setCards(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('OLTCards: API fetch error:', err); // Log the specific error
        setError('Failed to fetch OLT cards');
        setLoading(false);
      });
  }, [id]); // Add id from params to the dependency array

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>OLT Cards</Typography>
      <Paper sx={{ p: 3 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : cards.length === 0 ? (
          <Alert severity="info">No cards found for this OLT.</Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Slot Number</TableCell>
                  <TableCell>Card Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Ports</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cards.map((card) => (
                  <TableRow key={card.id}>
                    <TableCell>{card.slot_number}</TableCell>
                    <TableCell>{card.card_type}</TableCell>
                    <TableCell>{card.status}</TableCell>
                    <TableCell>{card.port_count}</TableCell>
                    <TableCell>{new Date(card.created_at).toLocaleString()}</TableCell>
                    <TableCell align="center">
                      {/* Show button if card has any ports */}
                      {card.port_count > 0 && (
                        <IconButton
                          component={RouterLink}
                          to={`/olts/${id}/slot/${card.slot_number}/ponports`}
                          color="primary"
                          aria-label="view pon ports"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}

export default OLTCards;
