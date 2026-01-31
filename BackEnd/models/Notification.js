const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    notificationId: {
        type: String,
        required: true,
        unique: true
    },
    recipientId: {
        type: Number,
        required: true,
        index: true // For fast queries by recipient
    },
    type: {
        type: String,
        required: true,
        enum: [
            'groupJoinRequest',
            'groupInvitation',
            'groupJoinApproved', 
            'groupJoinRejected',
            'addedToGroup',
            'removedFromGroup',
            'groupDeleted',
            'connectionRequest',
            'connectionAccepted',
            'mention',
            'systemAnnouncement'
        ]
    },
    
    // Source user info
    fromUser: {
        userId: Number,
        userName: String,
        image: String
    },
    
    // Related entities
    groupId: Number,
    groupName: String,
    groupImage: String,
    
    // Content
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    
    // Metadata
    read: {
        type: Boolean,
        default: false,
        index: true
    },
    actionRequired: {
        type: Boolean,
        default: false
    },
    actionType: {
        type: String,
        enum: ['approve-reject', 'accept-decline', 'view', 'none'],
        default: 'none'
    },
    actionData: {
        type: mongoose.Schema.Types.Mixed, // Flexible object for action data
        default: {}
    },
    
    // Navigation
    linkTo: String,
    
    timestamp: {
        type: Date,
        default: Date.now,
        index: true // For sorting
    },
    expiresAt: Date // Optional auto-delete
}, {
    timestamps: true
});

// Index for efficient queries
notificationSchema.index({ recipientId: 1, read: 1, timestamp: -1 });
notificationSchema.index({ recipientId: 1, actionRequired: 1 });

// Auto-delete expired notifications
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
