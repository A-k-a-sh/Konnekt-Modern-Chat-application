const express = require('express');
const ogs = require('open-graph-scraper');
const app = express();
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');
const groupRoutes = require('./routes/groupRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { User, Group } = require('./models');

const corsOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:5173'];

app.use(cors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}))

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/notifications', notificationRoutes);

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


// Get all users with connected users hydrated
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find().select('-passwordHash');
        
        // Hydrate connected_to with full user objects (matching frontend expectations)
        const hydratedUsers = await Promise.all(users.map(async (user) => {
            const userObj = user.toObject();
            
            // Hydrate connected_to
            if (userObj.connected_to && userObj.connected_to.length > 0) {
                const connectedUsers = await User.find({ 
                    userId: { $in: userObj.connected_to } 
                }).select('userId userName image');
                
                userObj.connected_to = connectedUsers.map(u => ({
                    userId: u.userId,
                    userName: u.userName,
                    image: u.image
                }));
            }
            
            return userObj;
        }));
        
        res.json(hydratedUsers);
    } catch (error) {
        console.error('[API] Get Users Error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});
// Get all groups (already hydrated in schema)
app.get('/api/groups', async (req, res) => {
    try {
        const groups = await Group.find();
        res.json(groups);
    } catch (error) {
        console.error('[API] Get Groups Error:', error);
        res.status(500).json({ error: 'Failed to fetch groups' });
    }
});

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
const notificationHandler = require('./socketHandler/notification')

io.on('connection', (socket) => {
    register(io, socket, users, groupRooms);
    message(io, socket, users, groupRooms);
    messageUtil(io, socket, users, groupRooms);
    isOnline(io, socket, users, groupRooms);
    groupOperations(io, socket, users, groupRooms);
    notificationHandler(io, socket, users, groupRooms);










    // //get logged in user info
    // socket.on('getLoggedInUserInfo' , (credintials) => {

    //     const userInfo = AllUserInfo.find((user) => user.userId === credintials.userId);
    //     io.to(users[credintials.userId]).emit('getLoggedInUserInfo' , userInfo);
    // })


    // Remove user from mapping when they disconnect
    socket.on('disconnect', async () => {
        try {
            const disconnectedUser = Object.keys(users).find(key => users[key] === socket.id);

            if (disconnectedUser) {
                // Update user status in database
                await User.findOneAndUpdate(
                    { userId: Number(disconnectedUser) },
                    { 
                        status: 'offline', 
                        lastSeen: new Date(),
                        socketId: null 
                    }
                );

                io.emit('userStatus', { user: { userId: Number(disconnectedUser) }, isOnline: false });
                console.log(`User ${disconnectedUser} disconnected`);
                delete users[disconnectedUser];
            }
        } catch (error) {
            console.error('[Disconnect] Error:', error);
        }
    });

})

// Connect to MongoDB before starting server
connectDB().then(() => {
    server.listen(port, () => {
        console.log('listening on port ' + port);
    });
}).catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
})