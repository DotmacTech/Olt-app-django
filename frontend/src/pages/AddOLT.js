import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Grid,
    CircularProgress,
    FormControl,
    FormControlLabel,
    Checkbox,
    InputLabel, Select, MenuItem, // Added for SNMP Version dropdown
    Alert,
    IconButton,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { addOLT } from '../services/api'; // Assuming you have this function in your api service

function AddOLT() {
    const navigate = useNavigate();
    const [oltData, setOltData] = useState({
        name: '',
        ip_address: '',
        location: '',
        model: '',
        hardware_version: '', // Added hardware_version
        software_version: '', // Added software_version
        firmware_version: '', // Added firmware_version
        // Add other fields from your OLT model as needed
        telnet_username: '', // Renamed from ssh_username to match model
        telnet_password: '', // Renamed from ssh_password to match model
        telnet_port: 23,     // Default Telnet port from model
        management_vlan: 20, // Added management_vlan
        snmp_ro_community: '', // Added snmp_ro_community
        snmp_rw_community: '', // Added snmp_rw_community from mode
        description: '',       // Added description
        serial_number: '',     // Added serial_number (optional)
        snmp_version: 'v2c',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleChange = (event) => {
        const { name, value } = event.target;
        const checked = event.target.checked; // Get checked state for checkboxes
        const type = event.target.type; // Get input type
        setOltData((prevData) => ({
            ...prevData,
            [name]: value,
            //Use checked for checkbox, otherwise use value
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            // Convert port and vlan to integer before sending
            const dataToSend = {
                ...oltData,
                telnet_port: parseInt(oltData.telnet_port, 10) || 23, // Ensure it's an int, fallback to default
                management_vlan: parseInt(oltData.management_vlan, 10), // Ensure it's an int
            };
            const response = await addOLT(dataToSend); // Call your API service function
            setSuccess(`OLT "${response.name}" added successfully!`);
            // Optionally reset form or navigate away after a delay
            setTimeout(() => {
                navigate('/olt-list'); // Navigate back to the list after success
            }, 1500);
        } catch (err) {
            console.error('Failed to add OLT:', err);
            setError(err.response?.data?.detail || err.message || 'Failed to add OLT. Please check the details and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton onClick={() => navigate('/olt-list')} sx={{ mr: 1 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5">Add New OLT</Typography>
            </Box>

            <Paper sx={{ p: 3 }}>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                label="OLT Name"
                                name="name"
                                value={oltData.name}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                label="IP Address"
                                name="ip_address"
                                value={oltData.ip_address}
                                onChange={handleChange}
                            />
                        </Grid>
                        {/* Add more fields similarly */}
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Location" name="location" value={oltData.location} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Model" name="model" value={oltData.model} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}> {/* Optional Field */}
                            <TextField fullWidth label="Hardware Version" name="hardware_version" value={oltData.hardware_version} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}> {/* Optional Field */}
                            <TextField fullWidth label="Software Version" name="software_version" value={oltData.software_version} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}> {/* Optional Field */}
                            <TextField fullWidth label="Firmware Version" name="firmware_version" value={oltData.firmware_version} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField required fullWidth label="Management VLAN" name="management_vlan" type="number" value={oltData.management_vlan} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField required fullWidth label="Telnet/SSH Username" name="telnet_username" value={oltData.telnet_username} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField required fullWidth label="Telnet/SSH Password" name="telnet_password" type="password" value={oltData.telnet_password} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField required fullWidth label="Telnet/SSH Port" name="telnet_port" type="number" value={oltData.telnet_port} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField required fullWidth label="SNMP Read-Only Community" name="snmp_ro_community" value={oltData.snmp_ro_community} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField required fullWidth label="SNMP Read-Write Community" name="snmp_rw_community" value={oltData.snmp_rw_community} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel id="snmp-version-label">SNMP Version</InputLabel>
                                <Select labelId="snmp-version-label" name="snmp_version" value={oltData.snmp_version} label="SNMP Version" onChange={handleChange}>
                                    <MenuItem value="v1">Version 1</MenuItem>
                                    <MenuItem value="v2c">Version 2c</MenuItem>
                                    <MenuItem value="v3">Version 3</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField required fullWidth label="SNMP UDP Port" name="snmp_udp_port" type="number" value={oltData.snmp_udp_port} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={<Checkbox checked={oltData.iptv_module} onChange={handleChange} name="iptv_module" />}
                                label="IPTV Module Enabled"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}> {/* Optional Field */}
                            <TextField fullWidth label="Serial Number" name="serial_number" value={oltData.serial_number} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12}> {/* Optional Field */}
                            <TextField fullWidth multiline rows={3} label="Description" name="description" value={oltData.description} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12}>
                            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={20} /> : null}
                            >
                                {loading ? 'Adding...' : 'Add OLT'}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Box>
    );
}

export default AddOLT;