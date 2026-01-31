const { Message } = require('../models');

module.exports = (io, socket, users, groupRooms) => {
    socket.on('delSelectedMsg', async ({ selectedMsg, curUserInfo, selectedUser, chatType, groupId }) => {
        try {
            // Update deletedFor field in database for all selected messages
            const msgIds = selectedMsg.map(m => m.msgId);
            
            await Message.updateMany(
                { msgId: { $in: msgIds } },
                { $addToSet: { deletedFor: curUserInfo.userId } }
            );
            
            console.log(`[Delete Selected] User ${curUserInfo.userId} deleted ${msgIds.length} messages`);

            // Broadcast to recipients
            if (chatType === 'group') {
                io.to(groupRooms[groupId]).emit('delSelectedMsg', selectedMsg);
            }
            else {
                io.to(users[selectedUser.userId]).emit('delSelectedMsg', selectedMsg);
            }
        } catch (error) {
            console.error('[Delete Selected] Error:', error);
        }
    });

    // Listen for "deleteMessage" event from a client
    socket.on("deleteMessage", async (msg) => {
        try {
            // Mark message as deleted for the user
            await Message.findOneAndUpdate(
                { msgId: msg.msgId },
                { $addToSet: { deletedFor: msg.deletedBy || msg.sender?.userId } }
            );
            
            console.log(`[Delete Message] msgId=${msg.msgId}`);
            
            // Broadcast to ALL clients (except sender)
            socket.broadcast.emit("messageDeleted", msg);
        } catch (error) {
            console.error('[Delete Message] Error:', error);
        }
    });

    socket.on("editMessage", async (msg) => {
        try {
            // Update message content in database
            await Message.findOneAndUpdate(
                { msgId: msg.msgId },
                { msg: msg.msg, time: new Date() }
            );
            
            console.log(`[Edit Message] msgId=${msg.msgId}`);
            
            // Broadcast to ALL clients (except sender)
            socket.broadcast.emit("messageEdited", msg);
        } catch (error) {
            console.error('[Edit Message] Error:', error);
        }
    });
}