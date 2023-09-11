const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);

// Define an object to store users
const users = {};

server.listen(process.env.PORT || 3001, function () {
  console.log('Server running in port 3001');
});

app.use(express.static(__dirname + '/public'));

io.sockets.on('connection', (client) => {
  const broadcast = (event, data) => {
    client.emit(event, data);
    client.broadcast.emit(event, data);
  };

  // Broadcast the initial 'user' event with the current list of users
  broadcast('user', users);

  client.on('message', (message) => {
    if (users[client.id] !== message.name) {
      users[client.id] = message.name;
      broadcast('user', users);
    }
    broadcast('message', message);
  });

  client.on('disconnect', () => {
    delete users[client.id];
    client.broadcast.emit('user', users);
  });
});
