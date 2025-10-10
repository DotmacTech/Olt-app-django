import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
console.log(process.env.REACT_APP_API_BASE_URL)
// Function to get CSRF token from cookies
const getCsrfToken = () => {
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];
  return cookieValue || '';
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-CSRFToken': getCsrfToken(),
  },
  withCredentials: true,
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
    console.log(API_BASE_URL)
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

/**
 * Triggers a background task to refresh a single ONT's data.
 * @param {number|string} ontId The ID of the ONT to refresh.
 * @returns {Promise<any>} A promise that resolves with the API response.
 */
export const triggerSingleOntRefresh = async (ontId) => {
  try {
    // Note: The backend URL needs to be created. Assuming a URL like /api/onts/{id}/refresh/
    const response = await api.post(`/onts/${ontId}/refresh/`);
    return response.data;
  } catch (error) {
    console.error(`Error triggering refresh for ONT ${ontId}:`, error.response || error);
    throw error.response?.data || error;
  }
};

// Add this function to your api.js
export const triggerOLTMetricsRefresh = async (oltId) => {
  const response = await api.post(`/olts/${oltId}/refresh-system-metrics/`);
  return response.data;
};

export const getONTDetails = async (ponPortId, ontId) => {
  const response = await api.get(`/pon-ports/${ponPortId}/onts/${ontId}/`);
  return response.data;
};

// Fetch OLT name and PON Port index for breadcrumbs/headers on ONT list/detail pages
export const getOltAndPonPortInfoForONTList = async (oltId, slotNumber, ponPortId) => {
  try {
    // This endpoint needs to be created on the backend.
    // It should return { olt_name: "...", pon_port: { port_index_on_card: "..." } }
    const response = await api.get(`/olts/${oltId}/slot/${slotNumber}/ponport/${ponPortId}/info-for-ont-list/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching OLT/PON Port info for OLT ${oltId}, Slot ${slotNumber}, PON Port ${ponPortId}:`, error.response || error.message);
    throw error;
  }
};

// --- Add ONT Support API Calls ---

// Fetch all ONTs in the database
export const getAllOnts = async () => {
  let allOnts = [];
  let nextPageUrl = '/onts/'; // Initial endpoint

  try {
    while (nextPageUrl) {
      const response = await api.get(nextPageUrl);
      const data = response.data;

      if (data && data.results && Array.isArray(data.results)) {
        // Handle paginated DRF response
        allOnts = allOnts.concat(data.results);
        nextPageUrl = data.next; // Get URL for the next page, or null if no more pages
      } else if (Array.isArray(data)) {
        // Handle non-paginated response (e.g., if backend sends full list)
        allOnts = allOnts.concat(data);
        nextPageUrl = null; // Stop looping
      } else {
        // Unexpected data format
        console.error('Unexpected data format from /onts/ endpoint:', data);
        nextPageUrl = null; // Stop looping to prevent infinite loops
        // If nothing has been fetched yet, and format is wrong, throw error
        if (allOnts.length === 0) {
          throw new Error('Failed to fetch ONTs or unexpected data format received.');
        }
      }
    }
    return allOnts; // Return a flat array of all ONTs
  } catch (error) {
    console.error('Error fetching all ONTs:', error.response || error.message);
    throw error;
  }
};

// Get Zones with pagination
export const getZones = async (page = 1, pageSize = 10) => {
  try {
    const response = await api.get('/zones/', {
      params: {
        page,
        page_size: pageSize
      }
    });
    return {
      zones: response.data.results || response.data, // Handle both paginated and non-paginated responses
      total: response.data.count || (response.data.length || 0),
      page: response.data.page || page,
      pageSize: response.data.page_size || pageSize
    };
  } catch (error) {
    console.error('Error fetching Zones:', error);
    throw error;
  }
};

// Get all ODBs (Splitters)
export const getOdbs = async () => {
  try {
    const response = await api.get('/odbs/');
    return response.data;
  } catch (error) {
    console.error('Error fetching ODBs:', error);
    throw error;
  }
};

// Get all ONU Types
export const getOnuTypes = async (page = 1, limit = 10) => {
  try {
    let url = `/onu-types/?limit=${limit}`;
    if (page > 1) {
      url += `&page=${page}`;
    }
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching ONU Types:', error);
    throw error;
  }
};

// Get single ONU Type by ID
export const getOnuTypeById = async (id) => {
  try {
    const response = await api.get(`/onu-types/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ONU Type with ID ${id}:`, error);
    throw error;
  }
};

// Delete an ONU Type
export const deleteOnuType = async (onuTypeId) => {
  try {
    await api.delete(`/onu-types/${onuTypeId}/`);
  } catch (error) {
    console.error('Error deleting ONU Type:', error);
    throw error;
  }
};

// Update an existing ONU Type (multipart/form-data)
export const updateOnuType = async (id, formData) => {
  try {
    const response = await api.put(
      `/onu-types/${id}/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating ONU Type:', error);
    throw error;
  }
};

// Create a new ONU Type (multipart/form-data)
export const createOnuType = async (formData) => {
  try {
    const response = await api.post(
      '/onu-types/',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating ONU Type:', error);
    throw error;
  }
};

// Create a new ONU
export const createOnu = async (data) => {
  try {
    if (!data.pon_port) throw new Error('pon_port is required');
    const response = await api.post(`/api/pon-ports/${data.pon_port}/onts/`, data);
    return response.data;
  } catch (error) {
    console.error('Error creating ONU:', error);
    throw error;
  }
};

// --- Zone Management ---

export const getZone = async (id) => {
  try {
    const response = await api.get(`/zones/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching zone:', error);
    throw error;
  }
};

export const createZone = async (data) => {
  try {
    console.log('Creating zone with data:', data);
    const response = await api.post('/zones/', data);
    console.log('Zone created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating zone:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    throw error;
  }
};

export const updateZone = async (id, data) => {
  try {
    const response = await api.patch(`/zones/${id}/`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating zone:', error);
    throw error;
  }
};

export const deleteZone = async (id) => {
  try {
    await api.delete(`/zones/${id}/`);
  } catch (error) {
    console.error('Error deleting zone:', error);
    throw error;
  }
};

// --- Speed Profile API Calls ---

// Import multiple speed profiles
export const importSpeedProfiles = async (profiles) => {
  try {
    const response = await api.post('/speed-profiles/import/', { profiles });
    return response.data;
  } catch (error) {
    console.error('Error importing speed profiles:', error);
    throw error;
  }
};

// Get all speed profiles with pagination
export const getSpeedProfiles = async (page = 1, pageSize = 10) => {
  try {
    const response = await api.get('/speed-profiles/', {
      params: { page, page_size: pageSize }
    });
    return {
      profiles: response.data.results || response.data,
      total: response.data.count || (response.data.length || 0)
    };
  } catch (error) {
    console.error('Error fetching speed profiles:', error);
    throw error;
  }
};

// Get single speed profile by ID
export const getSpeedProfile = async (id) => {
  try {
    const response = await api.get(`/speed-profiles/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching speed profile ${id}:`, error);
    throw error;
  }
};

// Create a new speed profile
export const createSpeedProfile = async (profileData) => {
  try {
    const response = await api.post('/speed-profiles/', profileData);
    return response.data;
  } catch (error) {
    console.error('Error creating speed profile:', error);
    throw error;
  }
};

// Update an existing speed profile
export const updateSpeedProfile = async (id, profileData) => {
  try {
    const response = await api.put(`/speed-profiles/${id}/`, profileData);
    return response.data;
  } catch (error) {
    console.error(`Error updating speed profile ${id}:`, error);
    throw error;
  }
};

// Delete a speed profile
export const deleteSpeedProfile = async (id) => {
  try {
    await api.delete(`/speed-profiles/${id}/`);
  } catch (error) {
    console.error(`Error deleting speed profile ${id}:`, error);
    throw error;
  }
};

// --- Network Status API Calls ---

export const getNetworkStatus = async (timeFrame = '24h') => {
  try {
    // Ensure timeFrame is a valid string, default if not provided or invalid
    const validTimeFrame = typeof timeFrame === 'string' && timeFrame.length > 0 ? timeFrame : '24h';
    const response = await api.get(`/network-status/?time_frame=${encodeURIComponent(validTimeFrame)}`);
    return response.data;
  } catch (error) {
    // Log the full error response if available
    console.error('Error fetching network status:', error);
    throw error;
  }
};

export const getNetworkStatusSummary = async () => {
  try {
    const response = await api.get('/network-status/summary/');
    return response.data;
  } catch (error) {
    console.error('Error fetching network status summary:', error);
    throw error;
  }
};

// --- Dashboard API Calls ---

export const getDashboardSummary = async () => {
  /**
   * Fetches summary statistics for the dashboard.
   */
  const response = await api.get('/dashboard/summary/');
  return response.data;
};

export const getPONOutageList = async () => {
  /**
   * Fetches the list of PON outage events.
   */
  const response = await api.get('/dashboard/pon-outages/');
  return response.data;
};

/**
 * Triggers a refresh of all ONTs across all PON ports
 * @returns {Promise<Object>} Response data with status and task ID
 */
export const refreshAllOnts = async () => {
  try {
    const response = await api.get('/onts/refresh/');
    return response.data;
  } catch (error) {
    console.error('Error refreshing all ONTs:', error.response || error.message);
    
    // Provide more detailed error message
    if (error.response) {
      if (error.response.status === 403) {
        throw new Error('You do not have permission to refresh ONTs. Please contact your administrator.');
      } else if (error.response.data?.detail) {
        throw new Error(error.response.data.detail);
      } else if (error.response.data?.message) {
        throw new Error(error.response.data.message);
      }
    }
    
    throw new Error(error.message || 'Failed to refresh ONTs. Please try again.');
  }
};

/**
 * Triggers a full refresh of all OLTs including reachability, metrics, and inventory
 * @returns {Promise<Object>} Response data with status and task ID
 */
export const refreshAllOlts = async () => {
  try {
    const response = await api.post('/olts/refresh/');
    return response.data;
  } catch (error) {
    console.error('Error refreshing all OLTs:', error.response || error.message);
    
    // Provide more detailed error message
    if (error.response) {
      if (error.response.status === 403) {
        throw new Error('You do not have permission to refresh OLTs. Please contact your administrator.');
      } else if (error.response.data?.detail) {
        throw new Error(error.response.data.detail);
      } else if (error.response.data?.message) {
        throw new Error(error.response.data.message);
      }
    }
    
    throw new Error(error.message || 'Failed to refresh OLTs. Please try again.');
  }
};

/**
 * Triggers a refresh of all PON Ports
 * @returns {Promise<Object>} Response data with status and task ID
 */
export const refreshPonPorts = async () => {
  try {
    const response = await api.post('/pon-ports/refresh/');
    return response.data;
  } catch (error) {
    console.error('Error refreshing PON Ports:', error.response || error.message);
    
    // Provide more detailed error message
    if (error.response) {
      if (error.response.status === 403) {
        throw new Error('You do not have permission to refresh PON Ports. Please contact your administrator.');
      } else if (error.response.data?.detail) {
        throw new Error(error.response.data.detail);
      } else if (error.response.data?.message) {
        throw new Error(error.response.data.message);
      }
    }
    
    throw new Error(error.message || 'Failed to refresh PON Ports. Please try again.');
  }
};
// This function should be added to /home/devserver/Olt-app-django/frontend/src/services/api.js

/**
 * Triggers a background task to discover/refresh hardware cards for a specific OLT.
 * @param {string} oltId The ID of the OLT to refresh.
 * @returns {Promise<object>} The response data from the API.
 */
export const triggerOLTCardsRefresh = async (oltId) => {
  try {
    // This assumes you have a configured 'api' instance (e.g., from axios)
    const response = await api.post(`/olts/${oltId}/refresh-cards/`);
    return response.data;
  } catch (error) {
    console.error(`Error triggering OLT cards refresh for OLT ID ${oltId}:`, error);
    throw error;
  }
};

// New API calls for unconfigured ONTs

export const getUnconfiguredONTs = async () => {
  const response = await axios.get(`${API_BASE_URL}unconfigured-onts/`);
  return response.data;
};

export const authorizeONT = async (oltId, serialNumber) => {
  const response = await axios.post(
    `${API_BASE_URL}/olts/${oltId}/unconfigured-onts/${serialNumber}/authorize/`
  );
  return response.data;
};
