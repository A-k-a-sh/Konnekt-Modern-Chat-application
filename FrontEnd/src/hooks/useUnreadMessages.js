import { useEffect, useState } from 'react';
import { socket } from '../services/socket.service';

/**
 * Hook to manage unread message counts
 * Fetches initial counts and listens for real-time updates
 */
export const useUnreadMessages = (userInfo) => {
    const [unreadCounts, setUnreadCounts] = useState({ private: {}, group: {}, total: 0 });
    const [loading, setLoading] = useState(true);

    // Fetch initial unread counts
    useEffect(() => {
        if (!userInfo?.userId) return;

        const fetchUnreadCounts = async () => {
            try {
                const response = await fetch(`/api/messages/unread/${userInfo.userId}`);
                const data = await response.json();
                
                if (data.success) {
                    setUnreadCounts(data.data);
                }
            } catch (error) {
                console.error('[Unread Counts] Error fetching:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUnreadCounts();
    }, [userInfo?.userId]);

    // Listen for real-time unread count updates
    useEffect(() => {
        const handleUnreadCountUpdate = ({ unreadCount }) => {
            setUnreadCounts(prev => ({
                ...prev,
                total: unreadCount
            }));
        };

        const handleNewMessage = (messageData) => {
            // Increment unread count for the sender/group
            if (messageData.sender?.userId !== userInfo?.userId) {
                const key = messageData.chatType === 'private' 
                    ? `user-${messageData.sender?.userId}`
                    : `group-${messageData.groupId}`;
                
                const category = messageData.chatType === 'private' ? 'private' : 'group';
                
                setUnreadCounts(prev => ({
                    private: category === 'private' ? {
                        ...prev.private,
                        [key]: (prev.private[key] || 0) + 1
                    } : prev.private,
                    group: category === 'group' ? {
                        ...prev.group,
                        [key]: (prev.group[key] || 0) + 1
                    } : prev.group,
                    total: prev.total + 1
                }));
            }
        };

        socket.on('unreadCountUpdate', handleUnreadCountUpdate);
        socket.on('receivedMessage', handleNewMessage);

        return () => {
            socket.off('unreadCountUpdate', handleUnreadCountUpdate);
            socket.off('receivedMessage', handleNewMessage);
        };
    }, [userInfo?.userId]);

    // Mark messages as read
    const markAsRead = (chatType, otherUserId, groupId) => {
        if (!userInfo?.userId) return;

        socket.emit('markAsRead', {
            userId: userInfo.userId,
            otherUserId,
            groupId,
            chatType
        });

        // Clear local unread count immediately
        const key = chatType === 'private' 
            ? `user-${otherUserId}`
            : `group-${groupId}`;
        
        const category = chatType === 'private' ? 'private' : 'group';
        
        setUnreadCounts(prev => {
            const countToRemove = prev[category][key] || 0;
            const newCounts = { ...prev[category] };
            delete newCounts[key];
            
            return {
                ...prev,
                [category]: newCounts,
                total: Math.max(0, prev.total - countToRemove)
            };
        });
    };

    return { unreadCounts, loading, markAsRead };
};
