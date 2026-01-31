import { useEffect } from 'react';
import { socket } from '../services/socket.service';
import { useNotificationContext } from '../Context/NotificationContext';

export const useNotificationSocket = () => {
    const { addNotification, markAsRead, updateNotification, removeNotification, markAllAsRead, clearAllRead } = useNotificationContext();

    useEffect(() => {
        // New notification received
        const handleNewNotification = (notification) => {
            console.log('[Notification] Received new notification:', notification);
            addNotification(notification);
            
            // Show browser notification if permission granted
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(notification.title, {
                    body: notification.message,
                    icon: notification.fromUser?.image || notification.groupImage || '/logo.png',
                    badge: '/logo.png',
                    tag: notification.notificationId
                });
            }
        };

        // Notification updated (marked as read or content changed)
        const handleNotificationUpdated = (data) => {
            console.log('[Notification] Updated:', data);
            if (data.notificationId) {
                updateNotification(data.notificationId, data);
            }
        };

        // Notification deleted
        const handleNotificationDeleted = ({ notificationId }) => {
            console.log('[Notification] Deleted:', notificationId);
            removeNotification(notificationId);
        };

        // All notifications marked as read
        const handleAllNotificationsRead = () => {
            console.log('[Notification] All marked as read');
            markAllAsRead();
        };

        // Read notifications cleared
        const handleReadNotificationsCleared = () => {
            console.log('[Notification] Read notifications cleared');
            clearAllRead();
        };

        // Register event listeners
        socket.on('newNotification', handleNewNotification);
        socket.on('notificationUpdated', handleNotificationUpdated);
        socket.on('notificationDeleted', handleNotificationDeleted);
        socket.on('allNotificationsRead', handleAllNotificationsRead);
        socket.on('readNotificationsCleared', handleReadNotificationsCleared);

        // Cleanup
        return () => {
            socket.off('newNotification', handleNewNotification);
            socket.off('notificationUpdated', handleNotificationUpdated);
            socket.off('notificationDeleted', handleNotificationDeleted);
            socket.off('allNotificationsRead', handleAllNotificationsRead);
            socket.off('readNotificationsCleared', handleReadNotificationsCleared);
        };
    }, [addNotification, markAsRead, removeNotification, markAllAsRead, clearAllRead]);
};
