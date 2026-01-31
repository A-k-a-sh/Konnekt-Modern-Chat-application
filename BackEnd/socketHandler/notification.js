const { Notification } = require('../models');
const { createNotificationData } = require('../utils/notificationHelper');

module.exports = (io, socket, users, groupRooms) => {
    
    // Mark notification as read
    socket.on('markNotificationRead', async ({ notificationId, userId }) => {
        try {
            const notification = await Notification.findOneAndUpdate(
                { notificationId },
                { read: true },
                { new: true }
            );

            if (notification) {
                console.log(`[Notification] Marked as read: ${notificationId}`);
                io.to(users[userId]).emit('notificationUpdated', notification);
            }
        } catch (error) {
            console.error('[Mark Notification Read] Error:', error);
        }
    });

    // Delete notification
    socket.on('deleteNotification', async ({ notificationId, userId }) => {
        try {
            await Notification.findOneAndDelete({ notificationId });
            console.log(`[Notification] Deleted: ${notificationId}`);
            io.to(users[userId]).emit('notificationDeleted', { notificationId });
        } catch (error) {
            console.error('[Delete Notification] Error:', error);
        }
    });

    // Mark all as read
    socket.on('markAllNotificationsRead', async ({ userId }) => {
        try {
            await Notification.updateMany(
                { recipientId: userId, read: false },
                { read: true }
            );
            console.log(`[Notification] Marked all as read for user: ${userId}`);
            io.to(users[userId]).emit('allNotificationsRead');
        } catch (error) {
            console.error('[Mark All Read] Error:', error);
        }
    });

    // Clear all read notifications
    socket.on('clearAllReadNotifications', async ({ userId }) => {
        try {
            const result = await Notification.deleteMany({
                recipientId: userId,
                read: true
            });
            console.log(`[Notification] Cleared ${result.deletedCount} read notifications for user: ${userId}`);
            io.to(users[userId]).emit('readNotificationsCleared');
        } catch (error) {
            console.error('[Clear Read Notifications] Error:', error);
        }
    });
};

/**
 * Helper function to emit notification to user
 * Can be called from other socket handlers
 */
const emitNotification = async (io, users, notificationData) => {
    try {
        const notification = await Notification.create(notificationData);
        
        // Emit to recipient if online
        if (users[notificationData.recipientId]) {
            io.to(users[notificationData.recipientId]).emit('newNotification', notification);
            console.log(`[Notification] Sent to user ${notificationData.recipientId}: ${notification.type}`);
        }
        
        return notification;
    } catch (error) {
        console.error('[Emit Notification] Error:', error);
        return null;
    }
};

module.exports.emitNotification = emitNotification;
