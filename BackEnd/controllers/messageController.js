const { Message } = require('../models');

// @desc    Get messages for a specific chat (private or group)
// @route   GET /api/messages?chatType=private&userId=1&otherUserId=2&page=1&limit=50
// @route   GET /api/messages?chatType=group&groupId=1&page=1&limit=50
// @access  Private
const getMessages = async (req, res) => {
    try {
        const { chatType, userId, otherUserId, groupId, page = 1, limit = 50 } = req.query;

        // Validation
        if (!chatType || !['private', 'group'].includes(chatType)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid chatType. Must be "private" or "group"' 
            });
        }

        let query = { chatType, isDeleted: false };

        // Build query based on chat type
        if (chatType === 'private') {
            if (!userId || !otherUserId) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'userId and otherUserId required for private chat' 
                });
            }

            // Get messages between two users (bidirectional)
            query.$or = [
                { senderId: Number(userId), receiverId: Number(otherUserId) },
                { senderId: Number(otherUserId), receiverId: Number(userId) }
            ];
        } else {
            // Group chat
            if (!groupId) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'groupId required for group chat' 
                });
            }
            query.groupId = Number(groupId);
        }

        // Calculate pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Get messages with pagination (newest first)
        const messages = await Message.find(query)
            .sort({ time: -1 })  // Newest first
            .skip(skip)
            .limit(limitNum)
            .lean();

        // Get total count for pagination info
        const totalMessages = await Message.countDocuments(query);
        const totalPages = Math.ceil(totalMessages / limitNum);
        const hasMore = pageNum < totalPages;

        res.status(200).json({
            success: true,
            data: {
                messages: messages.reverse(), // Reverse to show oldest first in UI
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalMessages,
                    limit: limitNum,
                    hasMore
                }
            }
        });

    } catch (error) {
        console.error('[Get Messages] Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error fetching messages' 
        });
    }
};

// @desc    Get recent conversations for a user
// @route   GET /api/messages/conversations/:userId
// @access  Private
const getConversations = async (req, res) => {
    try {
        const { userId } = req.params;

        // Get all unique conversations (private + group)
        const privateMessages = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { senderId: Number(userId) },
                        { receiverId: Number(userId) }
                    ],
                    chatType: 'private'
                }
            },
            {
                $sort: { time: -1 }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ['$senderId', Number(userId)] },
                            '$receiverId',
                            '$senderId'
                        ]
                    },
                    lastMessage: { $first: '$$ROOT' },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                { $and: [
                                    { $ne: ['$senderId', Number(userId)] },
                                    { $eq: ['$isRead', false] }
                                ]},
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        const groupMessages = await Message.aggregate([
            {
                $match: {
                    chatType: 'group',
                    groupId: { $exists: true }
                }
            },
            {
                $sort: { time: -1 }
            },
            {
                $group: {
                    _id: '$groupId',
                    lastMessage: { $first: '$$ROOT' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                privateChats: privateMessages,
                groupChats: groupMessages
            }
        });

    } catch (error) {
        console.error('[Get Conversations] Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error fetching conversations' 
        });
    }
};

// @desc    Get unread message counts per chat
// @route   GET /api/messages/unread/:userId
// @access  Private
const getUnreadCounts = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'userId is required'
            });
        }

        const userIdNum = Number(userId);

        // Get unread counts per private chat
        const privateUnread = await Message.aggregate([
            {
                $match: {
                    chatType: 'private',
                    $or: [
                        { receiverId: userIdNum },
                        { senderId: userIdNum }
                    ],
                    readBy: { $ne: userIdNum },
                    isDeleted: false
                }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ['$senderId', userIdNum] },
                            '$receiverId',
                            '$senderId'
                        ]
                    },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get unread counts per group
        const groupUnread = await Message.aggregate([
            {
                $match: {
                    chatType: 'group',
                    readBy: { $ne: userIdNum },
                    senderId: { $ne: userIdNum }, // Don't count own messages as unread
                    isDeleted: false
                }
            },
            {
                $group: {
                    _id: '$groupId',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Format results
        const unreadCounts = {
            private: {},
            group: {},
            total: 0
        };

        privateUnread.forEach(item => {
            unreadCounts.private[`user-${item._id}`] = item.count;
            unreadCounts.total += item.count;
        });

        groupUnread.forEach(item => {
            unreadCounts.group[`group-${item._id}`] = item.count;
            unreadCounts.total += item.count;
        });

        res.status(200).json({
            success: true,
            data: unreadCounts
        });

    } catch (error) {
        console.error('[Get Unread Counts] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching unread counts'
        });
    }
};

module.exports = {
    getMessages,
    getConversations,
    getUnreadCounts
};
