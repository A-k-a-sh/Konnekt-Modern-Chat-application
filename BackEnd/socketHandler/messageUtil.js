
module.exports = (io, socket, users, groupRooms) => {
    socket.on('delSelectedMsg', ({ selectedMsg, curUserInfo, selectedUser, chatType, groupId
    }) => {


        //selectedMsg will be nedded in db
        if (chatType === 'group') {
            io.to(groupRooms[groupId]).emit('delSelectedMsg', selectedMsg);
        }
        else {
            io.to(users[selectedUser.userId]).emit('delSelectedMsg', selectedMsg);
        }
    })


    // Listen for "deleteMessage" event from a client
    socket.on("deleteMessage", (msg) => {

        console.log("Message deleted:");

        // Broadcast to ALL clients (except sender)
        socket.broadcast.emit("messageDeleted", msg);
    });

    socket.on("editMessage", (msg) => {
        console.log("Message edited:");
        // Broadcast to ALL clients (except sender)
        socket.broadcast.emit("messageEdited", msg);
    });
}