const { v4: uuidv4 } = require('uuid');

/**
 * Helper function to create notification objects with proper templates
 */
const createNotificationData = (type, data) => {
    const templates = {
        groupJoinRequest: {
            title: 'New Join Request',
            message: `${data.fromUser.userName} wants to join ${data.groupName}`,
            actionRequired: true,
            actionType: 'approve-reject',
            actionData: {
                groupId: data.groupId,
                requesterId: data.fromUser.userId
            }
        },
        groupInvitation: {
            title: 'Group Invitation',
            message: `${data.fromUser.userName} invited you to join ${data.groupName}`,
            actionRequired: true,
            actionType: 'accept-decline',
            actionData: {
                groupId: data.groupId,
                invitedBy: data.fromUser.userId
            }
        },
        groupJoinApproved: {
            title: 'Request Approved! 🎉',
            message: `Your request to join "${data.groupName}" was approved`,
            actionRequired: false,
            actionType: 'view',
            linkTo: `/group/${data.groupId}`
        },
        groupJoinRejected: {
            title: 'Request Declined',
            message: `Your request to join "${data.groupName}" was declined`,
            actionRequired: false,
            actionType: 'none'
        },
        addedToGroup: {
            title: 'Added to Group',
            message: `${data.fromUser.userName} added you to "${data.groupName}"`,
            actionRequired: false,
            actionType: 'view',
            linkTo: `/group/${data.groupId}`
        },
        removedFromGroup: {
            title: 'Removed from Group',
            message: `You were removed from "${data.groupName}"`,
            actionRequired: false,
            actionType: 'none'
        },
        groupDeleted: {
            title: 'Group Deleted',
            message: `"${data.groupName}" was deleted by the admin`,
            actionRequired: false,
            actionType: 'none'
        },
        connectionRequest: {
            title: 'New Connection Request',
            message: `${data.fromUser.userName} wants to connect with you`,
            actionRequired: true,
            actionType: 'approve-reject',
            actionData: {
                requesterId: data.fromUser.userId
            }
        },
        connectionAccepted: {
            title: 'Connection Accepted',
            message: `${data.fromUser.userName} accepted your connection request`,
            actionRequired: false,
            actionType: 'view',
            linkTo: `/chat/${data.fromUser.userId}`
        }
    };

    const template = templates[type] || {
        title: 'Notification',
        message: data.message || 'You have a new notification',
        actionRequired: false,
        actionType: 'none'
    };

    return {
        notificationId: uuidv4(),
        recipientId: data.recipientId,
        type,
        fromUser: data.fromUser || null,
        groupId: data.groupId || null,
        groupName: data.groupName || null,
        groupImage: data.groupImage || null,
        title: template.title,
        message: template.message,
        actionRequired: template.actionRequired,
        actionType: template.actionType,
        actionData: template.actionData || {},
        linkTo: template.linkTo || null,
        timestamp: new Date(),
        read: false
    };
};

module.exports = { createNotificationData };
