// API service for group operations
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

/**
 * Create a new group
 * @param {Object} groupData - Group creation data
 * @param {string} groupData.groupName - Name of the group
 * @param {string} groupData.groupImage - Image URL (optional)
 * @param {string} groupData.description - Group description (optional)
 * @param {number} groupData.adminId - Admin user ID
 * @param {string} token - JWT token (optional)
 * @returns {Promise<Object>} Created group data
 */
export const createGroup = async (groupData, token) => {
    try {
        const url = `${API_BASE_URL}/api/groups`;
        
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(groupData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('[Create Group] Error:', error);
        throw error;
    }
};

/**
 * Get group by ID
 * @param {number} groupId - Group ID
 * @param {string} token - JWT token (optional)
 * @returns {Promise<Object>} Group data
 */
export const getGroupById = async (groupId, token) => {
    try {
        const url = `${API_BASE_URL}/api/groups/${groupId}`;
        
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, { headers });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('[Get Group] Error:', error);
        throw error;
    }
};

/**
 * Update group details (admin only)
 * @param {number} groupId - Group ID
 * @param {Object} updateData - Data to update
 * @param {string} token - JWT token (optional)
 * @returns {Promise<Object>} Updated group data
 */
export const updateGroup = async (groupId, updateData, token) => {
    try {
        const url = `${API_BASE_URL}/api/groups/${groupId}`;
        
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            method: 'PUT',
            headers,
            body: JSON.stringify(updateData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('[Update Group] Error:', error);
        throw error;
    }
};

/**
 * Delete group (admin only)
 * @param {number} groupId - Group ID
 * @param {number} adminId - Admin user ID
 * @param {string} token - JWT token (optional)
 * @returns {Promise<Object>} Success message
 */
export const deleteGroup = async (groupId, adminId, token) => {
    try {
        const url = `${API_BASE_URL}/api/groups/${groupId}`;
        
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            method: 'DELETE',
            headers,
            body: JSON.stringify({ adminId })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('[Delete Group] Error:', error);
        throw error;
    }
};
