import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// System Metrics
// Returns: { uptime, temperature, rx_power, tx_power, ... }
export const getSystemMetrics = async (oltId, board = null) => {
  try {
    let url = `/system-metrics/?olt_id=${oltId}`;
    if (board) {
      url += `&board=${encodeURIComponent(board)}`;
    }
    const response = await api.get(url);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching system metrics:', error);
    throw error;
  }
};

// OLT Cards
export const getOLTCards = async (oltId) => {
  try {
    const response = await api.get(`/olts/${oltId}/cards/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching OLT cards:', error);
    throw error;
  }
};

// OLT
export const getOLTs = async () => {
  try {
    const response = await api.get('/olts/');
    return response.data;
  } catch (error) {
    console.error('Error fetching OLTs:', error);
    throw error;
  }
};

export const getOLTDetails = async (oltId) => {
  try {
    const response = await api.get(`/olts/${oltId}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching OLT details:', error);
    throw error;
  }
};

// Uplink Ports
export const getUplinkPorts = async () => {
  try {
    const response = await api.get('/uplink-ports/');
    return response.data;
  } catch (error) {
    console.error('Error fetching uplink ports:', error);
    throw error;
  }
};

export const configureUplinkPort = async (portId, data) => {
  try {
    const response = await api.patch(`/uplink-ports/${portId}/`, data);
    return response.data;
  } catch (error) {
    console.error('Error configuring uplink port:', error);
    throw error;
  }
};

// PON Ports
export const getPONPorts = async () => {
  try {
    const response = await api.get('/pon-ports/');
    return response.data;
  } catch (error) {
    console.error('Error fetching PON ports:', error);
    throw error;
  }
};

// VLANs
export const getVLANs = async () => {
  try {
    const response = await api.get('/vlans/');
    return response.data;
  } catch (error) {
    console.error('Error fetching VLANs:', error);
    throw error;
  }
};

export const createVLAN = async (data) => {
  try {
    const response = await api.post('/vlans/', data);
    return response.data;
  } catch (error) {
    console.error('Error creating VLAN:', error);
    throw error;
  }
};

export const updateVLAN = async (vlanId, data) => {
  try {
    const response = await api.patch(`/vlans/${vlanId}/`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating VLAN:', error);
    throw error;
  }
};

export const deleteVLAN = async (vlanId) => {
  try {
    await api.delete(`/vlans/${vlanId}/`);
  } catch (error) {
    console.error('Error deleting VLAN:', error);
    throw error;
  }
};

export const deleteMultipleVLANs = async (vlanIds) => {
  try {
    await Promise.all(vlanIds.map(id => deleteVLAN(id)));
  } catch (error) {
    console.error('Error deleting multiple VLANs:', error);
    throw error;
  }
};

// Add a new OLT
export const addOLT = async (oltData) => {
  try {
    const response = await api.post('/olts/', oltData); // POST request to the list endpoint
    return response.data; // Return the newly created OLT data from the response
  } catch (error) {
    console.error('Error adding OLT:', error.response || error.message);
    throw error; // Re-throw the error to be caught by the component
  }
};

// Delete an OLT
export const deleteOLT = async (oltId) => {
  try {
    const response = await api.delete(`/olts/${oltId}/`); // DELETE request to the detail endpoint
    return response.data; // Often returns empty on success (204 No Content)
  } catch (error) {
    console.error(`Error deleting OLT ${oltId}:`, error.response || error.message);
    throw error; // Re-throw the error
  }
};

// Get PON Port details for a specific OLT slot
export const getPonPortDetailsForSlot = async (oltId, slotNumber) => {
  try {
    const response = await api.get(`/olts/${oltId}/slot/${slotNumber}/pon-port-details/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching PON port details for OLT ${oltId}, Slot ${slotNumber}:`, error.response || error.message);
    throw error;
  }
};

// Trigger PON Port details refresh for a specific OLT slot
export const triggerPonPortRefresh = async (oltId, slotNumber) => {
  try {
    const response = await api.post(`/olts/${oltId}/slot/${slotNumber}/refresh-pon-details/`);
    return response.data; // Should contain a message like "Refresh initiated..."
  } catch (error) {
    console.error(`Error triggering PON port refresh for OLT ${oltId}, Slot ${slotNumber}:`, error.response || error.message);
    throw error;
  }
}

// Fetch ONTs for a specific PON Port
export const getOntsForPonPort = async (ponPortId) => {
  try {
    const response = await api.get(`/pon-ports/${ponPortId}/onts/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ONTs for PON Port ${ponPortId}:`, error.response || error.message);
    throw error;
  }
};

// Trigger ONT details refresh for a specific PON Port
export const triggerOntsRefresh = async (ponPortId) => {
  try {
    const response = await api.post(`/pon-ports/${ponPortId}/onts/refresh-ont-details/`);
    return response.data; // Should contain a message like "Refresh initiated..."
  } catch (error) {
    console.error(`Error triggering ONT refresh for PON Port ${ponPortId}:`, error.response || error.message);
    throw error;
  }
};