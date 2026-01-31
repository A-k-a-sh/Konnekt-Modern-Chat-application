const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    msgId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    
    // Participants
    senderId: {
        type: Number,
        required: true,
        index: true
    },
    receiverId: {
        type: Number,
        index: true,
        default: null
    },
    groupId: {
        type: Number,
        index: true,
        default: null
    },
    
    // Message Type
    chatType: {
        type: String,
        enum: ['private', 'group'],
        required: true,
        index: true
    },
    
    // Content
    msg: {
        type: String,
        default: ''
    },
    mediaLinks: [{
        url: String,
        public_id: String,
        resource_type: {
            type: String,
            enum: ['image', 'video', 'raw']
        }
    }],
    
    // Features
    reply: {
        msgId: String,
        content: String
    },
    
    forwardFrom: {
        msgId: String,
        senderId: Number
    },
    
    // Status
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedFor: [{
        type: Number
    }],
    
    // Metadata
    time: {
        type: Date,
        required: true,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

// Compound indexes for efficient queries
messageSchema.index({ senderId: 1, receiverId: 1, time: -1 });
messageSchema.index({ groupId: 1, time: -1 });
messageSchema.index({ chatType: 1, time: -1 });

// Method to convert to frontend format
messageSchema.methods.toClientJSON = function() {
    return {
        msgId: this.msgId,
        sender: { userId: this.senderId },
        receiver: this.receiverId ? { userId: this.receiverId } : null,
        groupId: this.groupId,
        msg: this.msg,
        mediaLinks: this.mediaLinks,
        reply: this.reply,
        forwardFrom: this.forwardFrom,
        chatType: this.chatType,
        time: this.time,
        createdAt: this.createdAt,
        isDeleted: this.isDeleted
    };
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
