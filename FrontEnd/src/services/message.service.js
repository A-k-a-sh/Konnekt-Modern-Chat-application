// API service for message operations
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

/**
 * Fetch message history for a chat
 * @param {Object} params - Query parameters
 * @param {string} params.chatType - 'private' or 'group'
 * @param {number} params.userId - Current user ID
 * @param {number} params.otherUserId - Other user ID (for private chat)
 * @param {number} params.groupId - Group ID (for group chat)
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Messages per page (default: 50)
 * @param {string} params.token - JWT token (optional, for auth)
 * @returns {Promise<Object>} Messages and pagination info
 */
export const fetchMessageHistory = async ({ chatType, userId, otherUserId, groupId, page = 1, limit = 50, token }) => {
    try {
        let url = `${API_BASE_URL}/api/messages?chatType=${chatType}&page=${page}&limit=${limit}`;
        
        if (chatType === 'private') {
            url += `&userId=${userId}&otherUserId=${otherUserId}`;
        } else {
            url += `&groupId=${groupId}`;
        }

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
        console.error('[Fetch Message History] Error:', error);
        throw error;
    }
};

/**
 * Fetch conversations (recent chats) for a user
 * @param {number} userId - User ID
 * @param {string} token - JWT token (optional)
 * @returns {Promise<Object>} Private and group conversations
 */
export const fetchConversations = async (userId, token) => {
    try {
        const url = `${API_BASE_URL}/api/messages/conversations/${userId}`;
        
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
        console.error('[Fetch Conversations] Error:', error);
        throw error;
    }
};
