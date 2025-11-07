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


const privateRooms = {}; // New: Map user pairs to a private room name

io.on('connection', (socket) => {
    //Assign a username to a socket when user logs in or joins chat
    socket.on('register', (credintials) => {
        users[credintials.userId] = socket.id;

        const userInfo = AllUserInfo.find((user) => user.userId === credintials.userId);

        const connected_to = userInfo.connected_to.map((id) => {
            return AllUserInfo.find((user) => user.userId === id)
        });

        const joined_groupsInfo = userInfo.joined_groups.map((id) => allGroupsData.find((grp) => grp.groupId === id));

        userInfo.joined_groups.forEach((grpId) => {
            socket.join(grpId);
            groupRooms[grpId] = grpId;
        });

        console.log(`User ${userInfo.userName} registered with id: ${socket.id}`);

        io.to(users[credintials.userId]).emit('getLoggedInUserInfo', { userInfo, connected_to, joined_groupsInfo });

        io.emit('userStatus', { user: credintials, isOnline: true });
    });


    socket.on('message', ({ sender, receiver, msg, mediaLinks, reply, time, chatType, groupId }) => {
        console.log(`message from ${sender.userName} to ${receiver.userName} : ${msg}`);
        msgId = uuidv4();

        if (chatType === 'group') {
            io.to(groupRooms[groupId]).emit('receivedMessage', { msgId, sender, receiver, msg, mediaLinks, reply, time, chatType, groupId });
            return;
        }

        // For one-to-one: create or use private room
        const [id1, id2] = [sender.userId, receiver.userId].sort();
        const roomName = `private_${id1}_${id2}`;

        privateRooms[roomName] = roomName;
        socket.join(roomName);

        if (users[receiver.userId]) {
            io.to(users[receiver.userId]).socketsJoin(roomName); // Ensure receiver joins room too
        }

        io.to(roomName).emit('receivedMessage', { msgId, sender, receiver, msg, mediaLinks, reply, time, chatType, groupId });
    });


    socket.on('delSelectedMsg', ({ selectedMsg, curUserInfo, selectedUser, chatType, groupId }) => {
        if (chatType === 'group') {
            io.to(groupRooms[groupId]).emit('delSelectedMsg', selectedMsg);
        } else {
            io.to(users[selectedUser.userId]).emit('delSelectedMsg', selectedMsg);
        }
    });


    socket.on("deleteMessage", (msg) => {
        console.log("Message deleted:");
        socket.broadcast.emit("messageDeleted", msg);
    });

    socket.on("editMessage", (msg) => {
        console.log("Message edited:");
        socket.broadcast.emit("messageEdited", msg);
    });

    socket.on('isOnline', ({ selectedUser, userInfo }) => {
        if (users[selectedUser.userId]) {
            io.to(users[userInfo.userId]).emit('isOnline', true);
        } else {
            io.to(users[userInfo.userId]).emit('isOnline', false);
        }
    });

    socket.on('disconnect', () => {
        const disconnectedUser = Object.keys(users).find(key => users[key] === socket.id);

        if (disconnectedUser) {
            io.emit('userStatus', { user: { userId: Number(disconnectedUser) }, isOnline: false });
            console.log(`User ${disconnectedUser} disconnected`);
            delete users[disconnectedUser];
        }
    });
});


server.listen(port, () => {
    console.log('listening on port ' + port);
})