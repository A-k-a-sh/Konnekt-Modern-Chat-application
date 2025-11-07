const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    // origin: "http://localhost:5173", // React Frontend
    methods: ["GET", "POST"]
  }
});

const users = {}; // Store users in rooms

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("joinRoom", ({ username, room }) => {
    socket.join(room);
    users[socket.id] = { username, room };
    io.to(room).emit("message", { user: "Admin", text: `${username} has joined the chat.` });

    // Send updated user list
    const roomUsers = Object.values(users).filter(user => user.room === room);
    io.to(room).emit("roomUsers", roomUsers);
  });

  socket.on("sendMessage", (message) => {
    const user = users[socket.id];
    if (user) io.to(user.room).emit("message", { user: user.username, text: message });
  });

  socket.on("disconnect", () => {
    const user = users[socket.id];
    if (user) {
      io.to(user.room).emit("message", { user: "Admin", text: `${user.username} left the chat.` });
      delete users[socket.id];

      // Send updated user list
      const roomUsers = Object.values(users).filter(u => u.room === user.room);
      io.to(user.room).emit("roomUsers", roomUsers);
    }
  });
});

server.listen(4000, () => console.log("Server running on http://localhost:4000"));
