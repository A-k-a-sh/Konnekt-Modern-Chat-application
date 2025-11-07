const { v4: uuidv4 } = require('uuid');

module.exports = (io, socket, users, groupRooms) => {
    socket.on('message', ({ sender, receiver, msg, mediaLinks, reply, time, chatType, groupId ,forwardFrom }) => {

        //sender - who logged in || full obj (see allUserInfo)
        //receiver - to whom user is chatting || full obj

        console.log(`message from ${sender.userName} to ${receiver.userName} : ${msg}`);
        msgId = uuidv4();


        if (chatType === 'group') {
            io.to(groupRooms[groupId]).emit('receivedMessage', { msgId, sender, receiver, msg, mediaLinks, reply, time, chatType, groupId ,forwardFrom });
            return;
        }

        if (users[receiver.userId]) {

            //sending message ≈ to receiver so that he can see the message || appear on right

            io.to(users[receiver.userId]).emit('receivedMessage', { msgId, sender, receiver, msg, mediaLinks, reply, time, chatType, groupId,forwardFrom });

            //sending message to sender so that he can see the message || appear on left
            if (sender.userId !== receiver.userId)
                io.to(users[sender.userId]).emit('receivedMessage', { msgId, sender, receiver, msg, mediaLinks, reply, time, chatType, groupId ,forwardFrom});

        }
        else {
            io.to(users[sender.userId]).emit('receivedMessage', { msgId, sender, receiver, msg, mediaLinks, reply, time, chatType, groupId,forwardFrom });
            console.log(`User ${receiver} not online`);
        }
    })
}