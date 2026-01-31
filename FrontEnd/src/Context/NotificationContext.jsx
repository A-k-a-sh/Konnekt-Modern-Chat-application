import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAllContext } from './AllContext';
import { fetchNotifications, fetchUnreadCount } from '../services/notification.service';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const { userInfo } = useAllContext();

    // Load notifications when user logs in
    useEffect(() => {
        if (userInfo?.userId) {
            loadNotifications();
            loadUnreadCount();
        }
    }, [userInfo?.userId]);

    const loadNotifications = async () => {
        if (!userInfo?.userId) return;
        
        setLoading(true);
        try {
            const response = await fetchNotifications(userInfo.userId);
            if (response.success) {
                setNotifications(response.data);
            }
        } catch (error) {
            console.error('[Load Notifications] Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadUnreadCount = async () => {
        if (!userInfo?.userId) return;
        
        try {
            const response = await fetchUnreadCount(userInfo.userId);
            if (response.success) {
                setUnreadCount(response.count);
            }
        } catch (error) {
            console.error('[Load Unread Count] Error:', error);
        }
    };

    const addNotification = (notification) => {
        setNotifications(prev => [notification, ...prev]);
        if (!notification.read) {
            setUnreadCount(prev => prev + 1);
        }
    };

    const markAsRead = (notificationId) => {
        setNotifications(prev =>
            prev.map(n =>
                n.notificationId === notificationId
                    ? { ...n, read: true }
                    : n
            )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const updateNotification = (notificationId, updates) => {
        setNotifications(prev =>
            prev.map(n =>
                n.notificationId === notificationId
                    ? { ...n, ...updates }
                    : n
            )
        );
        // Update unread count if read status changed
        if (updates.read !== undefined) {
            const notification = notifications.find(n => n.notificationId === notificationId);
            if (notification && !notification.read && updates.read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        }
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(n => ({ ...n, read: true }))
        );
        setUnreadCount(0);
    };

    const removeNotification = (notificationId) => {
        setNotifications(prev => {
            const notification = prev.find(n => n.notificationId === notificationId);
            if (notification && !notification.read) {
                setUnreadCount(c => Math.max(0, c - 1));
            }
            return prev.filter(n => n.notificationId !== notificationId);
        });
    };

    const clearAllRead = () => {
        setNotifications(prev => prev.filter(n => !n.read));
    };

    const value = {
        notifications,
        unreadCount,
        loading,
        addNotification,
        markAsRead,
        updateNotification,
        markAllAsRead,
        removeNotification,
        clearAllRead,
        refreshNotifications: loadNotifications
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotificationContext = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotificationContext must be used within NotificationProvider');
    }
    return context;
};
