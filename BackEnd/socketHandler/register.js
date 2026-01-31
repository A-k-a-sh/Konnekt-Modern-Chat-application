const { User, Group } = require('../models');

module.exports = (io, socket, users, groupRooms) => {

    //Assign a username to a socket when user logs in or joins chat
    socket.on('register', async (credintials) => {
        try {
            console.log(`\n[Register] User ${credintials.userId} connecting with socket ${socket.id}`);
            users[credintials.userId] = socket.id;

            // Update user status and socketId in database
            await User.findOneAndUpdate(
                { userId: credintials.userId },
                { 
                    status: 'online', 
                    socketId: socket.id,
                    lastSeen: new Date()
                }
            );

            // Get user info from database
            const userInfo = await User.findOne({ userId: credintials.userId }).select('-passwordHash');
            
            if (!userInfo) {
                console.error(`[Register] User ${credintials.userId} not found in database`);
                return;
            }

            // Get connected users (hydrated with full user objects)
            const connected_to = await User.find({ 
                userId: { $in: userInfo.connected_to } 
            }).select('userId userName email bio image');

            // Get joined groups (already hydrated in Group model)
            const joined_groupsInfo = await Group.find({ 
                groupId: { $in: userInfo.joinedGroups } 
            });

            // Join all group rooms
            userInfo.joinedGroups.forEach((grpId) => {
                socket.join(String(grpId));
                groupRooms[grpId] = String(grpId);
                console.log(`[Register] User ${credintials.userId} joined group room ${grpId}`);
            });

            console.log(`[Register] User ${credintials.userId} is in rooms:`, Array.from(socket.rooms));

            // Send user info to client (convert Mongoose doc to plain object)
            const userInfoObj = userInfo.toObject();
            const connectedUsersObj = connected_to.map(u => u.toObject());
            const joinedGroupsObj = joined_groupsInfo.map(g => g.toObject());

            io.to(users[credintials.userId]).emit('getLoggedInUserInfo', { 
                userInfo: userInfoObj, 
                connected_to: connectedUsersObj, 
                joined_groupsInfo: joinedGroupsObj 
            });

            // Broadcast to all users that this user is online
            io.emit('userStatus', { user: credintials, isOnline: true });
            
        } catch (error) {
            console.error('[Register] Error:', error);
        }
    });
}