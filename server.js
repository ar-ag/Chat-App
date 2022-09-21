const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server); 

const PORT = 3000 || process.env.PORT; 


const staticPath = path.join(__dirname, '/public');

app.use(express.static(staticPath));

const botName = 'AdminBot';

io.on('connection', (socket) => {
        
    socket.on('joinRoom',({username, room}) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);

        socket.emit('message', formatMessage(botName,'Welcome to the world of chatting!')); //emits only to user who has joined the chat

    // broadcasts when new user connects to everypne except user
        socket.broadcast.to(user.room).emit('message', formatMessage(botName,`${user.username} has joined the chat`));

        // send users info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    //listening for chat message

    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message',formatMessage(user.username, msg));
    })
    

    // when client disconnects 
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if(user) {
            io.to(user.room).emit('message',formatMessage(botName,`${user.username} disconnected`));
            // send users info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
        }
    });

    
})

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));