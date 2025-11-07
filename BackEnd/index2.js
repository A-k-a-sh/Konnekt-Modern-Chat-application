const express = require('express');
const ogs = require('open-graph-scraper');
const app = express();
const cors = require('cors');


app.use(cors({
    origin: ['http://localhost:5173', 'http://192.168.0.104:5173', 'http://1ec0-114-130-121-22.ngrok-free.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}))

app.get('/link-preview', async (req, res) => {
    try {
        const { url } = req.query;
        console.log('url for preview: ', url);
        const { error, result } = await ogs({ url });
        if (error) return res.status(500).json({ error: 'Failed to fetch preview' });
        res.json(result);
    } catch (err) {
        console.error('Link Preview Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/home', async (req, res) => {
    res.json({
        res1: {
            message: 'hello world',
            status: 200,
            data: '-dtc-server',
        },
        res2: {
            message: 'hello world',
            status: 200,
            data: '-dtc-server',
        }

    })

})




// app.get('/link-preview', async (req, res) => {
//     try {
//         const { url } = req.query;
//         console.log('url for preview:', url);

//         const options = { 
//             url,
//             headers: {
//                 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
//             }
//         };

//         const { error, result } = await ogs(options);

//         if (error) {
//             console.error('OpenGraph Scrape Error:', result.error);
//             return res.status(500).json({ error: 'Failed to fetch preview' });
//         }

//         res.json(result);
//     } catch (err) {
//         console.error('Link Preview Error:', err);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });




const { v4: uuidv4 } = require('uuid');



const AllUserInfo = require('./AllUserInfo');

const allGroupsData = require('./AllGroupData')

const port = 4000;

const { Server } = require('socket.io');

const { createServer } = require('http');

const server = createServer(app);



const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'http://192.168.0.104:5173', 'http://1ec0-114-130-121-22.ngrok-free.app'],
        // origin : 'all' ,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        //credentials: true,
    }
})

const users = {};
const groupRooms = {};



io.on('connection', (socket) => {
    //console.log('a user connected with id: ' + socket.id)


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




    socket.on('message', ({ sender, receiver, msg, mediaLinks, reply, time, chatType, groupId }) => {

        //sender - who logged in || full obj (see allUserInfo)
        //receiver - to whom user is chatting || full obj

        console.log(`message from ${sender.userName} to ${receiver.userName} : ${msg}`);
        msgId = uuidv4();


        if (chatType === 'group') {
            io.to(groupRooms[groupId]).emit('receivedMessage', { msgId, sender, receiver, msg, mediaLinks, reply, time, chatType, groupId });
            return;
        }

        if (users[receiver.userId]) {

            //sending message ≈ to receiver so that he can see the message || appear on right

            io.to(users[receiver.userId]).emit('receivedMessage', { msgId, sender, receiver, msg, mediaLinks, reply, time, chatType, groupId });

            //sending message to sender so that he can see the message || appear on left
            if (sender.userId !== receiver.userId)
                io.to(users[sender.userId]).emit('receivedMessage', { msgId, sender, receiver, msg, mediaLinks, reply, time, chatType, groupId });

        }
        else {
            io.to(users[sender.userId]).emit('receivedMessage', { msgId, sender, receiver, msg, mediaLinks, reply, time, chatType, groupId });
            console.log(`User ${receiver} not online`);
        }
    })

    socket.on('delSelectedMsg', ({selectedMsg,curUserInfo,selectedUser,chatType ,groupId
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


    // //get logged in user info
    // socket.on('getLoggedInUserInfo' , (credintials) => {

    //     const userInfo = AllUserInfo.find((user) => user.userId === credintials.userId);
    //     io.to(users[credintials.userId]).emit('getLoggedInUserInfo' , userInfo);
    // })



    // Remove user from mapping when they disconnect
    socket.on('disconnect', () => {


        const disconnectedUser = Object.keys(users).find(key => users[key] === socket.id);

        if (disconnectedUser) {
            io.emit('userStatus', { user: { userId: Number(disconnectedUser) }, isOnline: false })
            console.log(`User ${disconnectedUser} disconnected`);
            delete users[disconnectedUser];
        }

        // Broadcast to all users that this user is offline

    });

})

server.listen(port, () => {
    console.log('listening on port ' + port);
})