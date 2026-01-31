const { Group, User } = require('../models');

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private
const createGroup = async (req, res) => {
    try {
        const { groupName, groupImage, description, adminId } = req.body;

        // Validation
        if (!groupName || !adminId) {
            return res.status(400).json({ 
                success: false, 
                message: 'groupName and adminId are required' 
            });
        }

        // Get admin user info
        const admin = await User.findOne({ userId: adminId }).select('-passwordHash');
        
        if (!admin) {
            return res.status(404).json({ 
                success: false, 
                message: 'Admin user not found' 
            });
        }

        // Get next groupId (auto-increment)
        const lastGroup = await Group.findOne().sort({ groupId: -1 });
        const nextGroupId = lastGroup ? lastGroup.groupId + 1 : 1;

        // Create group with admin as first member
        const newGroup = await Group.create({
            groupId: nextGroupId,
            groupName,
            groupImage: groupImage || '',
            description: description || '',
            adminId,
            groupMembers: [{
                userId: admin.userId,
                userName: admin.userName,
                email: admin.email,
                image: admin.image,
                bio: admin.bio || ''
            }],
            groupJoinRequests: []
        });

        // Add group to admin's joined groups
        await User.findOneAndUpdate(
            { userId: adminId },
            { $addToSet: { joinedGroups: nextGroupId } }
        );

        console.log(`[Create Group] Group "${groupName}" created by user ${adminId} with groupId ${nextGroupId}`);

        res.status(201).json({
            success: true,
            message: 'Group created successfully',
            data: newGroup.toObject()
        });

    } catch (error) {
        console.error('[Create Group] Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error creating group' 
        });
    }
};

// @desc    Get group by ID
// @route   GET /api/groups/:groupId
// @access  Private
const getGroupById = async (req, res) => {
    try {
        const { groupId } = req.params;

        const group = await Group.findOne({ groupId: Number(groupId) });

        if (!group) {
            return res.status(404).json({ 
                success: false, 
                message: 'Group not found' 
            });
        }

        res.status(200).json({
            success: true,
            data: group.toObject()
        });

    } catch (error) {
        console.error('[Get Group] Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error fetching group' 
        });
    }
};

// @desc    Update group details
// @route   PUT /api/groups/:groupId
// @access  Private (admin only)
const updateGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { groupName, groupImage, description, adminId } = req.body;

        const group = await Group.findOne({ groupId: Number(groupId) });

        if (!group) {
            return res.status(404).json({ 
                success: false, 
                message: 'Group not found' 
            });
        }

        // Check if user is admin
        if (group.adminId !== adminId) {
            return res.status(403).json({ 
                success: false, 
                message: 'Only admin can update group details' 
            });
        }

        // Update fields
        if (groupName) group.groupName = groupName;
        if (groupImage !== undefined) group.groupImage = groupImage;
        if (description !== undefined) group.description = description;

        await group.save();

        console.log(`[Update Group] Group ${groupId} updated by admin ${adminId}`);

        res.status(200).json({
            success: true,
            message: 'Group updated successfully',
            data: group.toObject()
        });

    } catch (error) {
        console.error('[Update Group] Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error updating group' 
        });
    }
};

// @desc    Delete group
// @route   DELETE /api/groups/:groupId
// @access  Private (admin only)
const deleteGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { adminId } = req.body;

        const group = await Group.findOne({ groupId: Number(groupId) });

        if (!group) {
            return res.status(404).json({ 
                success: false, 
                message: 'Group not found' 
            });
        }

        // Check if user is admin
        if (group.adminId !== adminId) {
            return res.status(403).json({ 
                success: false, 
                message: 'Only admin can delete group' 
            });
        }

        // Get all member IDs for notification
        const memberIds = group.groupMembers.map(m => m.userId);
        const groupName = group.groupName;
        const groupImage = group.groupImage;

        // Remove group from all members' joinedGroups
        await User.updateMany(
            { joinedGroups: Number(groupId) },
            { $pull: { joinedGroups: Number(groupId) } }
        );

        // Delete the group
        await Group.deleteOne({ groupId: Number(groupId) });

        console.log(`[Delete Group] Group ${groupId} deleted by admin ${adminId}`);

        res.status(200).json({
            success: true,
            message: 'Group deleted successfully',
            groupId: Number(groupId),
            groupName,
            groupImage,
            memberIds // For sending notifications
        });

    } catch (error) {
        console.error('[Delete Group] Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error deleting group' 
        });
    }
};

module.exports = {
    createGroup,
    getGroupById,
    updateGroup,
    deleteGroup
};
