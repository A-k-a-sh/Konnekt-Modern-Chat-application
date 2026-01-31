const { User, Group, Notification } = require('../models');
const { createNotificationData } = require('../utils/notificationHelper');
const { emitNotification } = require('./notification');

module.exports = (io, socket, users, groupRooms) => {

    // Send join request to group
    socket.on('groupJoinRequest', async ({ groupId, userId }) => {
        try {
            console.log(`[Join Request] User ${userId} requesting to join Group ${groupId}`);
            const group = await Group.findOne({ groupId });
            const user = await User.findOne({ userId }).select('-passwordHash');

            if (group && user) {
                // Check if already in join requests
                const alreadyRequested = group.groupJoinRequests.find(req => req.userId === userId);

                if (!alreadyRequested) {
                    // Add to join requests
                    group.groupJoinRequests.push({
                        userId: userId,
                        userName: user.userName,
                        email: user.email,
                        image: user.image,
                        bio: user.bio
                    });

                    await group.save();

                    // Create notification for admin
                    const notificationData = createNotificationData('groupJoinRequest', {
                        recipientId: group.adminId,
                        fromUser: {
                            userId: user.userId,
                            userName: user.userName,
                            image: user.image
                        },
                        groupId: group.groupId,
                        groupName: group.groupName,
                        groupImage: group.groupImage
                    });

                    await emitNotification(io, users, notificationData);

                    // Notify all group members (especially admin)
                    console.log(`[Join Request] Broadcasting to group ${groupId}. Requests count: ${group.groupJoinRequests.length}`);
                    io.to(String(groupId)).emit('groupJoinRequestUpdate', {
                        groupId,
                        joinRequests: group.groupJoinRequests
                    });

                    // Confirm to requester
                    io.to(users[userId]).emit('joinRequestSent', { groupId, status: 'pending' });
                }
            }
        } catch (error) {
            console.error('[Join Request] Error:', error);
        }
    });

    // Cancel join request
    socket.on('cancelJoinRequest', async ({ groupId, userId }) => {
        try {
            console.log(`[Cancel Request] User ${userId} canceling request for Group ${groupId}`);
            const group = await Group.findOne({ groupId });

            if (group) {
                group.groupJoinRequests = group.groupJoinRequests.filter(req => req.userId !== userId);
                await group.save();

                // Notify group members
                console.log(`[Cancel Request] Broadcasting to group ${groupId}. Remaining requests: ${group.groupJoinRequests.length}`);
                io.to(String(groupId)).emit('groupJoinRequestUpdate', {
                    groupId,
                    joinRequests: group.groupJoinRequests
                });

                // Confirm to requester
                io.to(users[userId]).emit('joinRequestCanceled', { groupId });
            }
        } catch (error) {
            console.error('[Cancel Request] Error:', error);
        }
    });

    // Approve join request (admin only)
    socket.on('approveJoinRequest', async ({ groupId, userId, adminId }) => {
        try {
            console.log(`[Approve Request] GroupId: ${groupId}, UserId: ${userId}, AdminId: ${adminId}`);
            const group = await Group.findOne({ groupId });
            const user = await User.findOne({ userId }).select('-passwordHash');

            if (group && user && group.adminId === adminId) {
                console.log(`[Approve Request] Validated. Group admin: ${group.adminId}`);
                
                // Remove from join requests
                group.groupJoinRequests = group.groupJoinRequests.filter(req => req.userId !== userId);

                // Add to group members (check for duplicates first)
                const memberExists = group.groupMembers.some(m => m.userId === userId);
                if (!memberExists) {
                    group.groupMembers.push({
                        userId: userId,
                        userName: user.userName,
                        email: user.email,
                        image: user.image,
                        bio: user.bio
                    });
                    console.log(`[Approve Request] Added user ${userId} to group members`);
                } else {
                    console.log(`[Approve Request] User ${userId} already in group members, skipping`);
                }

                await group.save();

                // Add group to user's joined groups
                if (!user.joinedGroups.includes(groupId)) {
                    user.joinedGroups.push(groupId);
                    await user.save();
                }

                // Join the user's socket to the group room
                if (users[userId]) {
                    io.sockets.sockets.get(users[userId])?.join(String(groupId));
                }

                // Create notification for approved user
                const approvalNotificationData = createNotificationData('groupJoinApproved', {
                    recipientId: userId,
                    fromUser: {
                        userId: adminId,
                        userName: 'Admin',
                        image: ''
                    },
                    groupId: group.groupId,
                    groupName: group.groupName,
                    groupImage: group.groupImage
                });

                await emitNotification(io, users, approvalNotificationData);

                // Notify all group members
                io.to(String(groupId)).emit('groupMemberUpdate', {
                    groupId,
                    members: group.groupMembers,
                    joinRequests: group.groupJoinRequests
                });

                // Notify the approved user
                io.to(users[userId]).emit('joinRequestApproved', {
                    groupId,
                    groupInfo: group.toObject()
                });
            }
        } catch (error) {
            console.error('[Approve Request] Error:', error);
        }
    });

    // Reject join request (admin only)
    socket.on('rejectJoinRequest', async ({ groupId, userId, adminId }) => {
        try {
            console.log(`[Reject Request] GroupId: ${groupId}, UserId: ${userId}, AdminId: ${adminId}`);
            const group = await Group.findOne({ groupId });

            if (group && group.adminId === adminId) {
                console.log(`[Reject Request] Validated. Removing user from requests.`);
                
                // Remove from join requests
                group.groupJoinRequests = group.groupJoinRequests.filter(req => req.userId !== userId);
                await group.save();

                // Create notification for rejected user
                const rejectionNotificationData = createNotificationData('groupJoinRejected', {
                    recipientId: userId,
                    fromUser: {
                        userId: adminId,
                        userName: 'Admin',
                        image: ''
                    },
                    groupId: group.groupId,
                    groupName: group.groupName,
                    groupImage: group.groupImage
                });

                await emitNotification(io, users, rejectionNotificationData);

                // Notify group members
                io.to(String(groupId)).emit('groupJoinRequestUpdate', {
                    groupId,
                    joinRequests: group.groupJoinRequests
                });

                // Notify the rejected user
                io.to(users[userId]).emit('joinRequestRejected', { groupId });
            }
        } catch (error) {
            console.error('[Reject Request] Error:', error);
        }
    });

    // Get all public groups
    socket.on('getAllGroups', async (callback) => {
        try {
            const groups = await Group.find();
            callback(groups);
        } catch (error) {
            console.error('[Get All Groups] Error:', error);
            callback([]);
        }
    });

    // Get all users
    socket.on('getAllUsers', async (callback) => {
        try {
            const users = await User.find().select('-passwordHash');
            const usersWithoutPassword = users.map(user => ({
                userId: user.userId,
                userName: user.userName,
                email: user.email,
                image: user.image,
                bio: user.bio
            }));
            callback(usersWithoutPassword);
        } catch (error) {
            console.error('[Get All Users] Error:', error);
            callback([]);
        }
    });

    // Leave group (user voluntarily leaves)
    socket.on('leaveGroup', async ({ groupId, userId }) => {
        try {
            console.log(`[Leave Group] ========== EVENT RECEIVED ==========`);
            console.log(`[Leave Group] User ${userId} leaving Group ${groupId}`);
            console.log(`[Leave Group] Socket ID: ${socket.id}`);
            console.log(`[Leave Group] User socket mapping: ${users[userId]}`);
            
            const group = await Group.findOne({ groupId });
            const user = await User.findOne({ userId });

            if (!group) {
                console.log(`[Leave Group] ERROR: Group ${groupId} not found`);
                return;
            }
            if (!user) {
                console.log(`[Leave Group] ERROR: User ${userId} not found`);
                return;
            }

            console.log(`[Leave Group] Found group: ${group.groupName}, current members: ${group.groupMembers.length}`);
            console.log(`[Leave Group] Found user: ${user.userName}`);

            // Notify the user who is leaving BEFORE removing from room
            console.log(`[Leave Group] Notifying user ${userId} via socket ${users[userId]}`);
            io.to(users[userId]).emit('leftGroup', {
                groupId,
                groupName: group.groupName
            });

            // Remove from group members
            const beforeCount = group.groupMembers.length;
            group.groupMembers = group.groupMembers.filter(m => m.userId !== userId);
            const afterCount = group.groupMembers.length;
            console.log(`[Leave Group] Members count: ${beforeCount} → ${afterCount}`);

            await group.save();

            // Remove from user's joined groups
            user.joinedGroups = user.joinedGroups.filter(gId => gId !== groupId);
            await user.save();

            // Notify remaining group members (while leaving user still in room)
            console.log(`[Leave Group] Broadcasting member update to group ${groupId}`);
            io.to(String(groupId)).emit('groupMemberUpdate', {
                groupId,
                members: group.groupMembers,
                joinRequests: group.groupJoinRequests
            });

            // Leave the socket room LAST
            if (users[userId]) {
                io.sockets.sockets.get(users[userId])?.leave(String(groupId));
                console.log(`[Leave Group] User ${userId} left room ${groupId}`);
            }

            console.log(`[Leave Group] ========== COMPLETED SUCCESSFULLY ==========`);
        } catch (error) {
            console.error('[Leave Group] Error:', error);
        }
    });

    // Remove member from group (admin only)
    socket.on('removeMember', async ({ groupId, userId, adminId }) => {
        try {
            console.log(`[Remove Member] ========== EVENT RECEIVED ==========`);
            console.log(`[Remove Member] Admin ${adminId} removing User ${userId} from Group ${groupId}`);
            console.log(`[Remove Member] Socket ID: ${socket.id}`);
            
            const group = await Group.findOne({ groupId });
            const user = await User.findOne({ userId });

            if (!group) {
                console.log(`[Remove Member] ERROR: Group ${groupId} not found`);
                return;
            }
            if (!user) {
                console.log(`[Remove Member] ERROR: User ${userId} not found`);
                return;
            }
            if (group.adminId !== adminId) {
                console.log(`[Remove Member] ERROR: User ${adminId} is not admin of Group ${groupId}. Admin is: ${group.adminId}`);
                return;
            }

            console.log(`[Remove Member] Validated. Group: ${group.groupName}, Admin: ${group.adminId}`);

            // Don't allow admin to remove themselves
            if (userId === adminId) {
                console.log(`[Remove Member] ERROR: Admin cannot remove themselves`);
                return;
            }

            // Notify the removed user BEFORE removing from room
            console.log(`[Remove Member] Notifying removed user ${userId} via socket ${users[userId]}`);
            io.to(users[userId]).emit('removedFromGroup', {
                groupId,
                groupName: group.groupName,
                removedBy: adminId
            });

            // Remove from group members
            const beforeCount = group.groupMembers.length;
            group.groupMembers = group.groupMembers.filter(m => m.userId !== userId);
            const afterCount = group.groupMembers.length;
            console.log(`[Remove Member] Members count: ${beforeCount} → ${afterCount}`);

            await group.save();

            // Remove from user's joined groups
            user.joinedGroups = user.joinedGroups.filter(gId => gId !== groupId);
            await user.save();

            // Notify remaining group members (while removed user still in room)
            console.log(`[Remove Member] Broadcasting member update to group ${groupId}`);
            io.to(String(groupId)).emit('groupMemberUpdate', {
                groupId,
                members: group.groupMembers,
                joinRequests: group.groupJoinRequests
            });

            // Leave the socket room LAST
            if (users[userId]) {
                io.sockets.sockets.get(users[userId])?.leave(String(groupId));
                console.log(`[Remove Member] User ${userId} removed from room ${groupId}`);
            }

            console.log(`[Remove Member] ========== COMPLETED SUCCESSFULLY ==========`);
        } catch (error) {
            console.error('[Remove Member] Error:', error);
        }
    });

    // Accept group invitation
    socket.on('acceptInvitation', async ({ groupId, userId, notificationId }) => {
        try {
            console.log(`[Accept Invitation] User ${userId} accepting invitation to Group ${groupId}`);
            const group = await Group.findOne({ groupId });
            const user = await User.findOne({ userId }).select('-passwordHash');

            if (group && user) {
                // Remove from join requests
                group.groupJoinRequests = group.groupJoinRequests.filter(req => req.userId !== userId);

                // Add to group members (check for duplicates)
                const memberExists = group.groupMembers.some(m => m.userId === userId);
                if (!memberExists) {
                    group.groupMembers.push({
                        userId: userId,
                        userName: user.userName,
                        email: user.email,
                        image: user.image,
                        bio: user.bio
                    });
                }

                await group.save();

                // Add group to user's joined groups
                if (!user.joinedGroups.includes(groupId)) {
                    user.joinedGroups.push(groupId);
                    await user.save();
                }

                // Join the user's socket to the group room
                if (users[userId]) {
                    io.sockets.sockets.get(users[userId])?.join(String(groupId));
                }

                // Create "added to group" notification
                const addedNotificationData = createNotificationData('addedToGroup', {
                    recipientId: userId,
                    fromUser: {
                        userId: group.adminId,
                        userName: 'Admin',
                        image: ''
                    },
                    groupId: group.groupId,
                    groupName: group.groupName,
                    groupImage: group.groupImage
                });

                await emitNotification(io, users, addedNotificationData);

                // Notify all group members
                io.to(String(groupId)).emit('groupMemberUpdate', {
                    groupId,
                    members: group.groupMembers,
                    joinRequests: group.groupJoinRequests
                });

                // Notify the user they joined
                io.to(users[userId]).emit('joinRequestApproved', {
                    groupId,
                    groupInfo: group.toObject()
                });

                console.log(`[Accept Invitation] User ${userId} successfully joined Group ${groupId}`);
            }
        } catch (error) {
            console.error('[Accept Invitation] Error:', error);
        }
    });

    // Decline group invitation
    socket.on('declineInvitation', async ({ groupId, userId, notificationId }) => {
        try {
            console.log(`[Decline Invitation] User ${userId} declining invitation to Group ${groupId}`);
            const group = await Group.findOne({ groupId });

            if (group) {
                // Remove from join requests
                group.groupJoinRequests = group.groupJoinRequests.filter(req => req.userId !== userId);
                await group.save();

                // Update the notification to reflect declined status
                if (notificationId) {
                    const Notification = require('../models').Notification;
                    await Notification.findOneAndUpdate(
                        { notificationId },
                        {
                            title: 'Invitation Declined',
                            message: `You declined the invitation to join ${group.groupName}`,
                            actionRequired: false,
                            actionType: 'none',
                            read: true
                        }
                    );

                    // Emit notification update to user
                    if (users[userId]) {
                        io.to(users[userId]).emit('notificationUpdated', {
                            notificationId,
                            title: 'Invitation Declined',
                            message: `You declined the invitation to join ${group.groupName}`,
                            actionRequired: false,
                            actionType: 'none',
                            read: true
                        });
                    }
                }

                // Notify group members (especially admin)
                io.to(String(groupId)).emit('groupJoinRequestUpdate', {
                    groupId,
                    joinRequests: group.groupJoinRequests
                });

                console.log(`[Decline Invitation] User ${userId} declined invitation to Group ${groupId}`);
            }
        } catch (error) {
            console.error('[Decline Invitation] Error:', error);
        }
    });

    // Send group invitation (admin adds members)
    socket.on('sendGroupInvitation', async ({ groupId, groupName, groupImage, userId, invitedBy, invitedByName }) => {
        try {
            console.log(`[Group Invitation] Admin ${invitedBy} inviting User ${userId} to Group ${groupId}`);
            const group = await Group.findOne({ groupId });
            const user = await User.findOne({ userId }).select('-passwordHash');

            if (group && user) {
                // Check if user is already a member
                const alreadyMember = group.groupMembers.some(m => m.userId === userId);
                if (alreadyMember) {
                    console.log(`[Group Invitation] User ${userId} is already a member`);
                    return;
                }

                // Check if already has pending request
                const alreadyRequested = group.groupJoinRequests.find(req => req.userId === userId);
                if (alreadyRequested) {
                    console.log(`[Group Invitation] User ${userId} already has pending request`);
                    return;
                }

                // Add to join requests
                group.groupJoinRequests.push({
                    userId: userId,
                    userName: user.userName,
                    email: user.email,
                    image: user.image,
                    bio: user.bio
                });

                await group.save();

                // Create notification for invited user
                const notificationData = createNotificationData('groupInvitation', {
                    recipientId: userId,
                    fromUser: {
                        userId: invitedBy,
                        userName: invitedByName,
                        image: ''
                    },
                    groupId: group.groupId,
                    groupName: group.groupName,
                    groupImage: group.groupImage
                });

                await emitNotification(io, users, notificationData);

                console.log(`[Group Invitation] User ${userId} invited to Group ${groupId}`);
            }
        } catch (error) {
            console.error('[Group Invitation] Error:', error);
        }
    });

    // Update group (admin only)
    socket.on('updateGroup', async ({ groupId, adminId, updates }) => {
        try {
            console.log(`[Update Group] Admin ${adminId} updating Group ${groupId}`, updates);
            const group = await Group.findOne({ groupId });

            if (group && group.adminId === adminId) {
                // Update allowed fields
                if (updates.groupName) group.groupName = updates.groupName;
                if (updates.description !== undefined) group.description = updates.description;
                if (updates.groupImage !== undefined) group.groupImage = updates.groupImage;

                await group.save();

                // Notify all group members about the update
                io.to(String(groupId)).emit('groupUpdated', {
                    groupId,
                    updates: {
                        groupName: group.groupName,
                        description: group.description,
                        groupImage: group.groupImage
                    }
                });

                console.log(`[Update Group] Group ${groupId} updated successfully`);
            }
        } catch (error) {
            console.error('[Update Group] Error:', error);
        }
    });

    // Delete group (admin only)
    socket.on('deleteGroup', async ({ groupId, adminId }) => {
        try {
            console.log(`[Delete Group] Admin ${adminId} deleting Group ${groupId}`);
            const group = await Group.findOne({ groupId });

            if (group && group.adminId === adminId) {
                const groupName = group.groupName;
                const groupImage = group.groupImage;
                const memberIds = group.groupMembers.map(m => m.userId);

                // Create notifications for all members (except admin)
                const notificationPromises = memberIds
                    .filter(memberId => memberId !== adminId)
                    .map(memberId => {
                        const notificationData = createNotificationData('groupDeleted', {
                            recipientId: memberId,
                            fromUser: {
                                userId: adminId,
                                userName: 'Admin',
                                image: ''
                            },
                            groupId: group.groupId,
                            groupName: groupName,
                            groupImage: groupImage
                        });
                        return emitNotification(io, users, notificationData);
                    });

                await Promise.all(notificationPromises);

                // Remove group from all users
                await User.updateMany(
                    { userId: { $in: memberIds } },
                    { $pull: { joinedGroups: groupId } }
                );

                // Delete the group
                await Group.deleteOne({ groupId });

                // Notify all members that group was deleted
                io.to(String(groupId)).emit('groupDeleted', { groupId, groupName });

                console.log(`[Delete Group] Group ${groupId} deleted successfully`);
            }
        } catch (error) {
            console.error('[Delete Group] Error:', error);
        }
    });
}
