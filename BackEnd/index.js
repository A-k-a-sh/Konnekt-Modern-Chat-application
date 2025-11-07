const express = require('express');
const ogs = require('open-graph-scraper');
const app = express();
const cors = require('cors');




app.use(cors({
    origin: ['http://localhost:5173', 'http://192.168.0.104:5173', 'http://1ec0-114-130-121-22.ngrok-free.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}))


app.use((req, res, next) => {
    if (Notification.permission === "granted") {
        new Notification("Hello, world!");
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(function (permission) {
            if (permission === "granted") {
                new Notification("Hello, world!");
            }
        });
    }
})

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


const register = require('./socketHandler/register')
const message = require('./socketHandler/message')
const messageUtil = require('./socketHandler/messageUtil')
const isOnline = require('./socketHandler/isOnline')

io.on('connection', (socket) => {
    //console.log('a user connected with id: ' + socket.id)



    register(io, socket, users, groupRooms);
    message(io, socket, users, groupRooms);
    messageUtil(io, socket, users, groupRooms);
    isOnline(io, socket, users, groupRooms);









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