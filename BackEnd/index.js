const express = require('express');
const ogs = require('open-graph-scraper');
const allUserInfo = require('./AllUserInfo');
const allGroupsData = require('./AllGroupData');
const app = express();
const cors = require('cors');
require('dotenv').config();

const corsOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:5173'];

app.use(cors({
    origin: corsOrigins,
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


app.get('/api/users', (req, res) => res.json(allUserInfo));
app.get('/api/groups', (req, res) => res.json(allGroupsData));

const port = process.env.PORT || 4000;

const { Server } = require('socket.io');

const { createServer } = require('http');


const server = createServer(app);

const socketOrigins = process.env.SOCKET_ORIGINS ? process.env.SOCKET_ORIGINS.split(',') : ['http://localhost:5173'];

const io = new Server(server, {
    cors: {
        origin: socketOrigins,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    }
})

const users = {};
const groupRooms = {};


const register = require('./socketHandler/register')
const message = require('./socketHandler/message')
const messageUtil = require('./socketHandler/messageUtil')
const isOnline = require('./socketHandler/isOnline')
const groupOperations = require('./socketHandler/groupOperations')

io.on('connection', (socket) => {
    register(io, socket, users, groupRooms);
    message(io, socket, users, groupRooms);
    messageUtil(io, socket, users, groupRooms);
    isOnline(io, socket, users, groupRooms);
    groupOperations(io, socket, users, groupRooms);










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