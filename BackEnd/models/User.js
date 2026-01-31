const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: {
        type: Number,
        required: true,
        unique: true,
        index: true
    },
    userName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    
    // Status & Presence
    status: {
        type: String,
        enum: ['online', 'offline'],
        default: 'offline'
    },
    lastSeen: {
        type: Date,
        default: Date.now,
        index: true
    },
    socketId: {
        type: String,
        default: null
    },
    
    // Relationships
    connected_to: [{
        type: Number
    }],
    joinedGroups: [{
        type: Number
    }]
}, {
    timestamps: true
});

// Text index for search
userSchema.index({ userName: 'text', email: 'text' });

// Virtual for public user data (exclude sensitive fields)
userSchema.methods.toPublicJSON = function() {
    return {
        userId: this.userId,
        userName: this.userName,
        email: this.email,
        bio: this.bio,
        image: this.image,
        status: this.status,
        lastSeen: this.lastSeen,
        connected_to: this.connected_to,
        joined_groups: this.joinedGroups
    };
};

const User = mongoose.model('User', userSchema);

module.exports = User;
