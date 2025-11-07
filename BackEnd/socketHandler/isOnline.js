

module.exports = (io, socket, users, groupRooms) => {
    //check if user is online
    socket.on('isOnline', ({ selectedUser, userInfo }) => {

        //userInfo - who logged in || full obj
        //selectedUser - to whom user is chatting || full obj

        if (users[selectedUser.userId]) {
            io.to(users[userInfo.userId]).emit('isOnline', true);
        }
        else {
            io.to(users[userInfo.userId]).emit('isOnline', false);
        }
    })
}