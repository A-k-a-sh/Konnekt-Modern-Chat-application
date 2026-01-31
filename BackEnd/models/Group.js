const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    groupId: {
        type: Number,
        required: true,
        unique: true,
        index: true
    },
    groupName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    groupImage: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    
    // Administration
    adminId: {
        type: Number,
        required: true,
        index: true
    },
    
    // Members (denormalized for quick access)
    groupMembers: [{
        userId: {
            type: Number,
            required: true
        },
        userName: String,
        email: String,
        image: String,
        bio: String
    }],
    
    // Join Requests
    groupJoinRequests: [{
        userId: {
            type: Number,
            required: true
        },
        userName: String,
        email: String,
        image: String,
        requestedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Text index for search
groupSchema.index({ groupName: 'text', description: 'text' });

// Index for finding groups by member
groupSchema.index({ 'groupMembers.userId': 1 });

// Method to get group with hydrated members
groupSchema.methods.toClientJSON = function() {
    return {
        groupId: this.groupId,
        groupName: this.groupName,
        groupImage: this.groupImage,
        description: this.description,
        adminId: this.adminId,
        groupMembers: this.groupMembers,
        groupJoinRequests: this.groupJoinRequests,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
};

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
