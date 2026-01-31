const { User } = require('../models');

module.exports = (io, socket, users, groupRooms) => {
    // Check if user is online
    socket.on('isOnline', async ({ selectedUser, userInfo }) => {
        // userInfo - who logged in || full obj
        // selectedUser - to whom user is chatting || full obj

        // Add null checks to prevent crash
        if (selectedUser && userInfo && selectedUser.userId && userInfo.userId) {
            try {
                // Check in-memory first (faster)
                const isOnlineInMemory = !!users[selectedUser.userId];
                
                // Double-check with database for accuracy
                const userInDb = await User.findOne({ userId: selectedUser.userId }).select('status socketId');
                const isOnline = isOnlineInMemory && userInDb?.status === 'online';
                
                io.to(users[userInfo.userId]).emit('isOnline', isOnline);
            } catch (error) {
                console.error('[IsOnline] Error:', error);
                // Fallback to in-memory check
                io.to(users[userInfo.userId]).emit('isOnline', !!users[selectedUser.userId]);
            }
        }
    });
}