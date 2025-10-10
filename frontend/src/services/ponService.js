import { api } from './api';

/**
 * Service for managing PON Port operations
 */

/**
 * Get all PON ports
 * @returns {Promise<Array>} List of PON ports
 */
export const getPONPorts = async () => {
  try {
    const response = await api.get('/pon-ports/');
    return response.data;
  } catch (error) {
    console.error('Error fetching PON ports:', error);
    throw error;
  }
};

/**
 * Get PON Port details for a specific OLT slot
 * @param {string} oltId - ID of the OLT
 * @param {number} slotNumber - Slot number
 * @returns {Promise<Object>} PON Port details
 */
export const getPonPortDetailsForSlot = async (oltId, slotNumber) => {
  try {
    const response = await api.get(`/olts/${oltId}/slots/${slotNumber}/pon-ports/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching PON ports for OLT ${oltId} slot ${slotNumber}:`, error);
    throw error;
  }
};

/**
 * Trigger refresh of PON Port details for a specific OLT slot
 * @param {string} oltId - ID of the OLT
 * @param {number} slotNumber - Slot number
 * @returns {Promise<Object>} Refresh status
 */
export const triggerPonPortRefresh = async (oltId, slotNumber) => {
  try {
    const response = await api.post(`/olts/${oltId}/slots/${slotNumber}/pon-ports/refresh/`);
    return response.data;
  } catch (error) {
    console.error(`Error triggering PON port refresh for OLT ${oltId} slot ${slotNumber}:`, error);
    throw error;
  }
};

/**
 * Get ONTs for a specific PON Port
 * @param {string} ponPortId - ID of the PON Port
 * @returns {Promise<Array>} List of ONTs on the PON Port
 */
export const getOntsForPonPort = async (ponPortId) => {
  try {
    const response = await api.get(`/pon-ports/${ponPortId}/onts/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ONTs for PON port ${ponPortId}:`, error);
    throw error;
  }
};

/**
 * Trigger refresh of ONT details for a specific PON Port
 * @param {string} ponPortId - ID of the PON Port
 * @returns {Promise<Object>} Refresh status
 */
export const triggerOntsRefresh = async (ponPortId) => {
  try {
    const response = await api.post(`/pon-ports/${ponPortId}/refresh-onts/`);
    return response.data;
  } catch (error) {
    console.error(`Error triggering ONT refresh for PON port ${ponPortId}:`, error);
    throw error;
  }
};

/**
 * Get details of a specific ONT
 * @param {string} ponPortId - ID of the PON Port
 * @param {string} ontId - ID of the ONT
 * @returns {Promise<Object>} ONT details
 */
export const getONTDetails = async (ponPortId, ontId) => {
  try {
    const response = await api.get(`/pon-ports/${ponPortId}/onts/${ontId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching details for ONT ${ontId} on PON port ${ponPortId}:`, error);
    throw error;
  }
};

/**
 * Get OLT and PON Port information for ONT list/detail pages
 * @param {string} oltId - ID of the OLT
 * @param {number} slotNumber - Slot number
 * @param {string} ponPortId - ID of the PON Port
 * @returns {Promise<Object>} OLT and PON Port information
 */
export const getOltAndPonPortInfoForONTList = async (oltId, slotNumber, ponPortId) => {
  try {
    const response = await api.get(`/olts/${oltId}/slots/${slotNumber}/pon-ports/${ponPortId}/info/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching OLT and PON Port info:', error);
    throw error;
  }
};

/**
 * Configure a PON Port
 * @param {string} ponPortId - ID of the PON Port
 * @param {Object} config - Configuration data
 * @returns {Promise<Object>} Updated PON Port configuration
 */
export const configurePonPort = async (ponPortId, config) => {
  try {
    const response = await api.patch(`/pon-ports/${ponPortId}/`, config);
    return response.data;
  } catch (error) {
    console.error(`Error configuring PON port ${ponPortId}:`, error);
    throw error;
  }
};

/**
 * Get statistics for a PON Port
 * @param {string} ponPortId - ID of the PON Port
 * @param {string} timeFrame - Time frame for statistics (e.g., '24h', '7d', '30d')
 * @returns {Promise<Object>} PON Port statistics
 */
export const getPonPortStatistics = async (ponPortId, timeFrame = '24h') => {
  try {
    const response = await api.get(`/pon-ports/${ponPortId}/statistics/?time_frame=${timeFrame}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching statistics for PON port ${ponPortId}:`, error);
    throw error;
  }
};

export default {
  getPONPorts,
  getPonPortDetailsForSlot,
  triggerPonPortRefresh,
  getOntsForPonPort,
  triggerOntsRefresh,
  getONTDetails,
  getOltAndPonPortInfoForONTList,
  configurePonPort,
  getPonPortStatistics
};
