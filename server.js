const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Forward WebRTC signaling
  socket.on('signal', (data) => {
    io.to(data.to).emit('signal', { from: socket.id, ...data });
  });

  // Notify others on disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    io.emit('user-disconnected', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
