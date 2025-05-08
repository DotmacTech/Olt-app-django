import React, { useState, useEffect } from 'react';
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
  Typography,
  IconButton,
  Tooltip
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';

function PONPorts() {
  const [ports, setPorts] = useState([]);

  useEffect(() => {
    // Example data - replace with actual API call
    setPorts([
      {
        id: 0,
        type: 'GPON',
        adminState: 'Enabled',
        status: 'Up/Autoind',
        onus: 'Online: 2',
        averageSignal: -28.11,
        description: 'CBD',
        range: '0-20000m',
        txPower: '5.54dBm',
      },
      {
        id: 1,
        type: 'GPON',
        adminState: 'Enabled',
        status: 'Up/Autoind',
        onus: 'Online: 4',
        averageSignal: -20.9,
        description: 'Mausallat',
        range: '0-20000m',
        txPower: '5.2dBm',
      },
      // Add more ports as needed
    ]);
  }, []);

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <Button variant="contained" color="primary">
          Refresh PON ports info
        </Button>
        <Button variant="contained" color="primary">
          Enable all PON ports
        </Button>
        <Button variant="contained" color="primary">
          Enable Autoind
        </Button>
        <Button variant="contained" color="error">
          Reboot all ONUs
        </Button>
      </Box>

      <Typography variant="h6" sx={{ mb: 2 }}>
        OLT slot 2, board type: H901-GPLF
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Port</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Admin state</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>ONUs</TableCell>
              <TableCell>Average signal</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Range</TableCell>
              <TableCell>TX Power</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ports.map((port) => (
              <TableRow key={port.id}>
                <TableCell>{port.id}</TableCell>
                <TableCell>{port.type}</TableCell>
                <TableCell>{port.adminState}</TableCell>
                <TableCell sx={{ color: port.status.includes('Up') ? 'green' : 'red' }}>
                  {port.status}
                </TableCell>
                <TableCell>{port.onus}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {port.averageSignal} dB
                    <SignalCellularAltIcon color="primary" />
                  </Box>
                </TableCell>
                <TableCell>{port.description}</TableCell>
                <TableCell>{port.range}</TableCell>
                <TableCell>{port.txPower}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Configure">
                      <IconButton size="small" color="primary">
                        <SettingsIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reboot ONUs">
                      <IconButton size="small" color="error">
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

export default PONPorts;
