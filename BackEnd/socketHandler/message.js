const { v4: uuidv4 } = require('uuid');
const { Message, User } = require('../models');

module.exports = (io, socket, users, groupRooms) => {
    socket.on('message', async ({ sender, receiver, msg, mediaLinks, reply, time, chatType, groupId, forwardFrom }) => {
        try {
            msgId = uuidv4();

            // Save message to database
            const messageData = {
                msgId,
                senderId: sender.userId,
                receiverId: receiver?.userId || null,
                groupId: groupId || null,
                chatType,
                msg,
                mediaLinks: mediaLinks || [],
                reply: reply || null,
                forwardFrom: forwardFrom || null,
                time: time || new Date(),
                isDeleted: false,
                deletedFor: []
            };

            await Message.create(messageData);
            console.log(`[Message] Saved to DB: msgId=${msgId}, chatType=${chatType}`);

            // Auto-connect users for private chats
            if (chatType === 'private' && receiver?.userId) {
                const senderUser = await User.findOne({ userId: sender.userId });
                const receiverUser = await User.findOne({ userId: receiver.userId });

                if (senderUser && receiverUser) {
                    let updated = false;

                    // Add receiver to sender's connected_to if not already connected
                    if (!senderUser.connected_to.includes(receiver.userId)) {
                        senderUser.connected_to.push(receiver.userId);
                        await senderUser.save();
                        updated = true;

                        // Emit to sender with full receiver user info
                        if (users[sender.userId]) {
                            io.to(users[sender.userId]).emit('userConnected', {
                                userId: receiverUser.userId,
                                userName: receiverUser.userName,
                                email: receiverUser.email,
                                bio: receiverUser.bio,
                                image: receiverUser.image
                            });
                        }
                        console.log(`[Auto-Connect] ${sender.userId} connected to ${receiver.userId}`);
                    }

                    // Add sender to receiver's connected_to if not already connected
                    if (!receiverUser.connected_to.includes(sender.userId)) {
                        receiverUser.connected_to.push(sender.userId);
                        await receiverUser.save();
                        updated = true;

                        // Emit to receiver with full sender user info
                        if (users[receiver.userId]) {
                            io.to(users[receiver.userId]).emit('userConnected', {
                                userId: senderUser.userId,
                                userName: senderUser.userName,
                                email: senderUser.email,
                                bio: senderUser.bio,
                                image: senderUser.image
                            });
                        }
                        console.log(`[Auto-Connect] ${receiver.userId} connected to ${sender.userId}`);
                    }
                }
            }

            // Emit message to recipients
            if (chatType === 'group') {
                io.to(groupRooms[groupId]).emit('receivedMessage', { msgId, sender, receiver, msg, mediaLinks, reply, time, chatType, groupId, forwardFrom });
                return;
            }

            if (users[receiver.userId]) {
                // Send to receiver
                io.to(users[receiver.userId]).emit('receivedMessage', { msgId, sender, receiver, msg, mediaLinks, reply, time, chatType, groupId, forwardFrom });

                // Send to sender (if different user)
                if (sender.userId !== receiver.userId)
                    io.to(users[sender.userId]).emit('receivedMessage', { msgId, sender, receiver, msg, mediaLinks, reply, time, chatType, groupId, forwardFrom });
            }
            else {
                // Receiver offline - send to sender only
                io.to(users[sender.userId]).emit('receivedMessage', { msgId, sender, receiver, msg, mediaLinks, reply, time, chatType, groupId, forwardFrom });
            }
        } catch (error) {
            console.error('[Message] Error saving message:', error);
        }
    });
}