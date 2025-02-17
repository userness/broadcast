const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let users = new Set();

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  users.add(socket.id);
  io.emit('existing-users', Array.from(users));

  socket.on('ready', () => {
    console.log(`User ready: ${socket.id}`);
    // Broadcast to everyone except the sender
    socket.broadcast.emit('signal', {
      from: socket.id,
      signal: 'ready'
    });
  });

  socket.on('signal', (data) => {
    console.log(`Signal received: ${socket.id} -> ${data.to}`);
    io.to(data.to).emit('signal', { from: socket.id, signal: data.signal });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    users.delete(socket.id);
    io.emit('user-disconnected', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
