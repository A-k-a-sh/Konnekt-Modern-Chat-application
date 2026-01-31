import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationContext } from '../../Context/NotificationContext';
import { useAllContext } from '../../Context/AllContext';
import { usePanelContext } from '../../Context/PanelContext';
import { markNotificationAsRead, deleteNotification as deleteNotificationAPI } from '../../services/notification.service';
import { socket } from '../../services/socket.service';

const NotificationItem = ({ notification }) => {
    const navigate = useNavigate();
    const { markAsRead, removeNotification } = useNotificationContext();
    const { userInfo, setSelectedGroup, allGroupsData } = useAllContext();
    const { openPanel } = usePanelContext();

    const handleMarkAsRead = async () => {
        if (notification.read) return;
        
        try {
            await markNotificationAsRead(notification.notificationId);
            markAsRead(notification.notificationId);
        } catch (error) {
            console.error('[Mark Read] Error:', error);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteNotificationAPI(notification.notificationId);
            removeNotification(notification.notificationId);
        } catch (error) {
            console.error('[Delete Notification] Error:', error);
        }
    };

    const handleApprove = () => {
        const { groupId, requesterId } = notification.actionData;
        socket.emit('approveJoinRequest', {
            groupId,
            userId: requesterId,
            adminId: userInfo.userId
        });
        handleDelete(); // Remove notification after action
    };

    const handleReject = () => {
        const { groupId, requesterId } = notification.actionData;
        socket.emit('rejectJoinRequest', {
            groupId,
            userId: requesterId,
            adminId: userInfo.userId
        });
        handleDelete(); // Remove notification after action
    };

    const handleAcceptInvitation = () => {
        const { groupId } = notification.actionData;
        socket.emit('acceptInvitation', {
            groupId,
            userId: userInfo.userId,
            notificationId: notification.notificationId
        });
        handleDelete(); // Remove invitation notification after accepting
    };

    const handleDeclineInvitation = async () => {
        const { groupId } = notification.actionData;
        socket.emit('declineInvitation', {
            groupId,
            userId: userInfo.userId,
            notificationId: notification.notificationId
        });
        // Notification will be updated via socket event
    };

    const handleViewGroup = () => {
        // Find the group and navigate to it
        if (notification.groupId) {
            const group = allGroupsData.find(g => g.groupId === notification.groupId);
            if (group) {
                setSelectedGroup(group);
                navigate('/group');
                openPanel();
                handleMarkAsRead();
            }
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    };

    const getIcon = () => {
        switch (notification.type) {
            case 'groupJoinRequest':
                return 'fa-user-plus text-blue-400';
            case 'groupInvitation':
                return 'fa-envelope text-green-400';
            case 'groupJoinApproved':
                return 'fa-check-circle text-green-400';
            case 'groupJoinRejected':
                return 'fa-times-circle text-red-400';
            case 'addedToGroup':
                return 'fa-user-group text-purple-400';
            case 'removedFromGroup':
                return 'fa-user-minus text-orange-400';
            case 'groupDeleted':
                return 'fa-trash text-red-400';
            default:
                return 'fa-bell text-gray-400';
        }
    };

    return (
        <div
            className={`
                p-3 mb-2 rounded-lg transition-all cursor-pointer
                ${notification.read 
                    ? 'bg-white/5 hover:bg-white/10' 
                    : 'bg-purple-900/20 border border-purple-500/30 hover:bg-purple-900/30'
                }
            `}
            onClick={handleMarkAsRead}
        >
            <div className="flex gap-3">
                {/* Icon & Avatar */}
                <div className="flex-shrink-0">
                    {notification.fromUser?.image ? (
                        <img
                            src={notification.fromUser.image}
                            alt={notification.fromUser.userName}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    ) : notification.groupImage ? (
                        <img
                            src={notification.groupImage}
                            alt={notification.groupName}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                            <i className={`fa-solid ${getIcon()} text-lg`}></i>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white mb-1">
                        {notification.title}
                    </p>
                    <p className="text-xs text-gray-400 mb-2">
                        {notification.message}
                    </p>

                    {/* Action Buttons */}
                    {notification.actionRequired && notification.actionType === 'approve-reject' && (
                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleApprove();
                                }}
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors flex items-center gap-1"
                            >
                                <i className="fa-solid fa-check"></i>
                                Approve
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleReject();
                                }}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors flex items-center gap-1"
                            >
                                <i className="fa-solid fa-times"></i>
                                Reject
                            </button>
                        </div>
                    )}

                    {notification.actionRequired && notification.actionType === 'accept-decline' && (
                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleAcceptInvitation();
                                }}
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors flex items-center gap-1"
                            >
                                <i className="fa-solid fa-check"></i>
                                Accept
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeclineInvitation();
                                }}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors flex items-center gap-1"
                            >
                                <i className="fa-solid fa-times"></i>
                                Decline
                            </button>
                        </div>
                    )}

                    {notification.actionType === 'view' && notification.linkTo && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleViewGroup();
                            }}
                            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg transition-colors mt-2"
                        >
                            View Group
                        </button>
                    )}

                    {/* Time & Delete */}
                    <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                            {formatTime(notification.timestamp)}
                        </span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete();
                            }}
                            className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                        >
                            <i className="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>

                {/* Unread Indicator */}
                {!notification.read && (
                    <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationItem;
