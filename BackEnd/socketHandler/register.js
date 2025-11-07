const AllUserInfo = require("../AllUserInfo")
const allGroupsData = require('../AllGroupData')



module.exports = (io, socket, users, groupRooms) => {

    //Assign a username to a socket when user logs in or joins chat
    socket.on('register', (credintials) => {
        users[credintials.userId] = socket.id;

        //getting the user info from credintials
        const userInfo = AllUserInfo.find((user) => user.userId === credintials.userId);

        //finding the connected users
        const connected_to = userInfo.connected_to.map((id) => {
            return AllUserInfo.find((user) => user.userId === id)
        })



        //finding connected groups - here joined_groupsInfo is object
        const joined_groupsInfo = userInfo.joined_groups.map((id) => allGroupsData.find((grp) => grp.groupId === id))



        //joining all groups rooms

        userInfo.joined_groups.forEach((grpId) => {
            socket.join(grpId);
            groupRooms[grpId] = grpId;
        })

        // joined_groupsInfo.forEach((grp) => {
        //     socket.join(grp.groupId);
        //     groupRooms[grp.groupId] = grp.groupName;
        // })

        console.log(`User ${userInfo.userName} registered with id: ${socket.id}`);

        io.to(users[credintials.userId]).emit('getLoggedInUserInfo', { userInfo, connected_to, joined_groupsInfo });

        // Broadcast to all users that this user is online || need to fix
        io.emit('userStatus', { user: credintials, isOnline: true });
    });
}