const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Get all notifications for a user
export const fetchNotifications = async (userId, unreadOnly = false) => {
    try {
        const url = `${API_BASE_URL}/api/notifications/${userId}${unreadOnly ? '?unreadOnly=true' : ''}`;
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('[Fetch Notifications] Error:', error);
        return { success: false, error: error.message };
    }
};

// Get unread count
export const fetchUnreadCount = async (userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/notifications/${userId}/unread-count`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('[Fetch Unread Count] Error:', error);
        return { success: false, error: error.message };
    }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
            method: 'PUT'
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('[Mark As Read] Error:', error);
        return { success: false, error: error.message };
    }
};

// Mark all as read
export const markAllAsRead = async (userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/notifications/${userId}/mark-all-read`, {
            method: 'PUT'
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('[Mark All As Read] Error:', error);
        return { success: false, error: error.message };
    }
};

// Delete notification
export const deleteNotification = async (notificationId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('[Delete Notification] Error:', error);
        return { success: false, error: error.message };
    }
};

// Clear all read notifications
export const clearAllReadNotifications = async (userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/notifications/${userId}/clear-read`, {
            method: 'DELETE'
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('[Clear Read] Error:', error);
        return { success: false, error: error.message };
    }
};
