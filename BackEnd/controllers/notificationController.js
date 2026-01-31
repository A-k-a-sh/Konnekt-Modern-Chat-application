const Notification = require('../models/Notification');
const { createNotificationData } = require('../utils/notificationHelper');

// Get all notifications for a user
const getNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        const { unreadOnly } = req.query;

        const query = { recipientId: Number(userId) };
        if (unreadOnly === 'true') {
            query.read = false;
        }

        const notifications = await Notification.find(query)
            .sort({ timestamp: -1 })
            .limit(100); // Limit to 100 most recent

        res.json({
            success: true,
            data: notifications,
            count: notifications.length
        });
    } catch (error) {
        console.error('[Get Notifications] Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch notifications'
        });
    }
};

// Get unread count
const getUnreadCount = async (req, res) => {
    try {
        const { userId } = req.params;

        const count = await Notification.countDocuments({
            recipientId: Number(userId),
            read: false
        });

        res.json({
            success: true,
            count
        });
    } catch (error) {
        console.error('[Unread Count] Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get unread count'
        });
    }
};

// Mark notification as read
const markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await Notification.findOneAndUpdate(
            { notificationId },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                error: 'Notification not found'
            });
        }

        res.json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error('[Mark Read] Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to mark as read'
        });
    }
};

// Mark all as read
const markAllAsRead = async (req, res) => {
    try {
        const { userId } = req.params;

        await Notification.updateMany(
            { recipientId: Number(userId), read: false },
            { read: true }
        );

        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('[Mark All Read] Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to mark all as read'
        });
    }
};

// Delete notification
const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await Notification.findOneAndDelete({ notificationId });

        if (!notification) {
            return res.status(404).json({
                success: false,
                error: 'Notification not found'
            });
        }

        res.json({
            success: true,
            message: 'Notification deleted'
        });
    } catch (error) {
        console.error('[Delete Notification] Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete notification'
        });
    }
};

// Clear all read notifications
const clearAllRead = async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await Notification.deleteMany({
            recipientId: Number(userId),
            read: true
        });

        res.json({
            success: true,
            message: 'All read notifications cleared',
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('[Clear All Read] Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to clear notifications'
        });
    }
};

// Create notification (used internally and by API)
const createNotification = async (req, res) => {
    try {
        const { type, data } = req.body;

        const notificationData = createNotificationData(type, data);
        const notification = await Notification.create(notificationData);

        res.json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error('[Create Notification] Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create notification'
        });
    }
};

module.exports = {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllRead,
    createNotification
};
