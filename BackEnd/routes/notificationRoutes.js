const express = require('express');
const router = express.Router();
const {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllRead,
    createNotification
} = require('../controllers/notificationController');

// Get all notifications for a user
router.get('/:userId', getNotifications);

// Get unread count
router.get('/:userId/unread-count', getUnreadCount);

// Mark notification as read
router.put('/:notificationId/read', markAsRead);

// Mark all as read
router.put('/:userId/mark-all-read', markAllAsRead);

// Delete single notification
router.delete('/:notificationId', deleteNotification);

// Clear all read notifications
router.delete('/:userId/clear-read', clearAllRead);

// Create notification (for testing or internal use)
router.post('/create', createNotification);

module.exports = router;
