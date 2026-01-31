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
    // Mark messages as read
    socket.on('markAsRead', async ({ userId, otherUserId, groupId, chatType }) => {
        try {
            const query = { readBy: { $ne: userId } };
            
            if (chatType === 'private') {
                query.$or = [
                    { senderId: otherUserId, receiverId: userId },
                    { senderId: userId, receiverId: otherUserId }
                ];
            } else if (chatType === 'group') {
                query.groupId = groupId;
            }

            const result = await Message.updateMany(
                query,
                { $addToSet: { readBy: userId } }
            );

            console.log(`[Mark As Read] User ${userId} marked ${result.modifiedCount} messages as read`);

            // Emit updated unread count to user
            const unreadCount = await Message.countDocuments({
                $or: [
                    { receiverId: userId, readBy: { $ne: userId } },
                    { groupId: { $in: await Message.distinct('groupId', { groupId: { $ne: null } }) }, readBy: { $ne: userId } }
                ]
            });

            if (users[userId]) {
                io.to(users[userId]).emit('unreadCountUpdate', { unreadCount });
            }
        } catch (error) {
            console.error('[Mark As Read] Error:', error);
        }
    });}