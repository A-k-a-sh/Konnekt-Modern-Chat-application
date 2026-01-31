import React, { useState } from 'react';
import { useNotificationContext } from '../../Context/NotificationContext';
import NotificationItem from './NotificationItem';
import { markAllAsRead as markAllAsReadAPI, clearAllReadNotifications } from '../../services/notification.service';
import { useAllContext } from '../../Context/AllContext';

const NotificationDropdown = ({ onClose }) => {
    const { notifications, unreadCount, markAllAsRead, clearAllRead, loading } = useNotificationContext();
    const { userInfo } = useAllContext();
    const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'action'

    const handleMarkAllAsRead = async () => {
        if (!userInfo?.userId) return;
        
        try {
            await markAllAsReadAPI(userInfo.userId);
            markAllAsRead();
        } catch (error) {
            console.error('[Mark All Read] Error:', error);
        }
    };

    const handleClearAllRead = async () => {
        if (!userInfo?.userId) return;
        
        try {
            await clearAllReadNotifications(userInfo.userId);
            clearAllRead();
        } catch (error) {
            console.error('[Clear Read] Error:', error);
        }
    };

    // Filter notifications
    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'unread') return !notification.read;
        if (filter === 'action') return notification.actionRequired;
        return true;
    });

    // Group by action required
    const actionRequiredNotifications = filteredNotifications.filter(n => n.actionRequired && !n.read);
    const otherNotifications = filteredNotifications.filter(n => !n.actionRequired || n.read);

    return (
        <div className="fixed right-0 top-0 h-screen w-[450px] bg-[#1a1a2e] border-l border-purple-500/30 shadow-2xl z-50 flex flex-col overflow-hidden animate-slideInRight">
            {/* Header */}
            <div className="p-4 border-b border-gray-700/50 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <i className="fa-solid fa-bell text-purple-400"></i>
                        Notifications
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                            filter === 'all'
                                ? 'bg-purple-600 text-white'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                    >
                        All ({notifications.length})
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                            filter === 'unread'
                                ? 'bg-purple-600 text-white'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                    >
                        Unread ({unreadCount})
                    </button>
                    <button
                        onClick={() => setFilter('action')}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                            filter === 'action'
                                ? 'bg-purple-600 text-white'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                    >
                        Action ({actionRequiredNotifications.length})
                    </button>
                </div>

                {/* Actions */}
                {notifications.length > 0 && (
                    <div className="flex gap-2 mt-3">
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                            >
                                <i className="fa-solid fa-check-double mr-1"></i>
                                Mark all read
                            </button>
                        )}
                        {notifications.some(n => n.read) && (
                            <button
                                onClick={handleClearAllRead}
                                className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
                            >
                                <i className="fa-solid fa-trash mr-1"></i>
                                Clear read
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <i className="fa-solid fa-spinner fa-spin text-2xl text-purple-400"></i>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                        <i className="fa-solid fa-bell-slash text-4xl mb-2"></i>
                        <p className="text-sm">
                            {filter === 'unread' ? 'No unread notifications' :
                             filter === 'action' ? 'No action required' :
                             'No notifications yet'}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Action Required Section */}
                        {actionRequiredNotifications.length > 0 && (
                            <div className="p-2">
                                <div className="text-xs font-semibold text-purple-400 px-2 py-1 flex items-center gap-2">
                                    <i className="fa-solid fa-exclamation-circle"></i>
                                    ACTION REQUIRED ({actionRequiredNotifications.length})
                                </div>
                                {actionRequiredNotifications.map(notification => (
                                    <NotificationItem
                                        key={notification.notificationId}
                                        notification={notification}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Other Notifications */}
                        {otherNotifications.length > 0 && (
                            <div className="p-2">
                                {actionRequiredNotifications.length > 0 && (
                                    <div className="text-xs font-semibold text-gray-500 px-2 py-1 flex items-center gap-2">
                                        <i className="fa-solid fa-inbox"></i>
                                        RECENT UPDATES
                                    </div>
                                )}
                                {otherNotifications.map(notification => (
                                    <NotificationItem
                                        key={notification.notificationId}
                                        notification={notification}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default NotificationDropdown;
