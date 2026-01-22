const AllUserInfo = require("../AllUserInfo")
const allGroupsData = require('../AllGroupData')

module.exports = (io, socket, users, groupRooms) => {

    // Send join request to group
    socket.on('groupJoinRequest', ({ groupId, userId }) => {
        console.log(`User ${userId} requesting to join group ${groupId}`);

        const group = allGroupsData.find(g => g.groupId === groupId);
        const user = AllUserInfo.find(u => u.userId === userId);

        if (group && user) {
            // Check if already in join requests
            const alreadyRequested = group.groupJoinRequests.find(req => req.userId === userId);

            if (!alreadyRequested) {
                // Add to join requests
                group.groupJoinRequests.push({
                    userId: userId,
                    userName: user.userName,
                    profilePhoto: user.profilePhoto,
                    image: user.profilePhoto
                });

                // Notify all group members (especially admin)
                io.to(groupId).emit('groupJoinRequestUpdate', {
                    groupId,
                    joinRequests: group.groupJoinRequests
                });

                // Confirm to requester
                io.to(users[userId]).emit('joinRequestSent', { groupId, status: 'pending' });
            }
        }
    });

    // Cancel join request
    socket.on('cancelJoinRequest', ({ groupId, userId }) => {
        console.log(`User ${userId} canceling join request for group ${groupId}`);

        const group = allGroupsData.find(g => g.groupId === groupId);

        if (group) {
            group.groupJoinRequests = group.groupJoinRequests.filter(req => req.userId !== userId);

            // Notify group members
            io.to(groupId).emit('groupJoinRequestUpdate', {
                groupId,
                joinRequests: group.groupJoinRequests
            });

            // Confirm to requester
            io.to(users[userId]).emit('joinRequestCanceled', { groupId });
        }
    });

    // Approve join request (admin only)
    socket.on('approveJoinRequest', ({ groupId, userId, adminId }) => {
        console.log(`Admin ${adminId} approving user ${userId} for group ${groupId}`);

        const group = allGroupsData.find(g => g.groupId === groupId);
        const user = AllUserInfo.find(u => u.userId === userId);

        if (group && user && group.adminId === adminId) {
            // Remove from join requests
            group.groupJoinRequests = group.groupJoinRequests.filter(req => req.userId !== userId);

            // Add to group members
            group.groupMembers.push({
                userId: userId,
                userName: user.userName,
                profilePhoto: user.profilePhoto,
                image: user.profilePhoto
            });

            // Add group to user's joined groups
            if (!user.joined_groups.includes(groupId)) {
                user.joined_groups.push(groupId);
            }

            // Join the user's socket to the group room
            if (users[userId]) {
                io.sockets.sockets.get(users[userId])?.join(groupId);
            }

            // Notify all group members
            io.to(groupId).emit('groupMemberUpdate', {
                groupId,
                members: group.groupMembers,
                joinRequests: group.groupJoinRequests
            });

            // Notify the approved user
            io.to(users[userId]).emit('joinRequestApproved', {
                groupId,
                groupInfo: group
            });
        }
    });

    // Reject join request (admin only)
    socket.on('rejectJoinRequest', ({ groupId, userId, adminId }) => {
        console.log(`Admin ${adminId} rejecting user ${userId} for group ${groupId}`);

        const group = allGroupsData.find(g => g.groupId === groupId);

        if (group && group.adminId === adminId) {
            // Remove from join requests
            group.groupJoinRequests = group.groupJoinRequests.filter(req => req.userId !== userId);

            // Notify group members
            io.to(groupId).emit('groupJoinRequestUpdate', {
                groupId,
                joinRequests: group.groupJoinRequests
            });

            // Notify the rejected user
            io.to(users[userId]).emit('joinRequestRejected', { groupId });
        }
    });

    // Get all public groups
    socket.on('getAllGroups', (callback) => {
        callback(allGroupsData);
    });

    // Get all users
    socket.on('getAllUsers', (callback) => {
        const usersWithoutPassword = AllUserInfo.map(user => ({
            userId: user.userId,
            userName: user.userName,
            email: user.email,
            profilePhoto: user.profilePhoto,
            bio: user.bio
        }));
        callback(usersWithoutPassword);
    });
}
