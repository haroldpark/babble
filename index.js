var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(port, function () {
  console.log('Server listening at port', port);
});

app.use(express.static(__dirname + '/public'));

var participantNum = 0;
var userAdded = false;

io.on('connection', function (socket) {
  socket.emit('connected');


  socket.on('user joined', function (username) {
    ++participantNum;
    userAdded = true;
    socket.username = username;
    socket.emit('entered room', participantNum);
    socket.broadcast.emit('user joined', {username: username, participantNum: participantNum});
  })

  socket.on('message sent', function (messageProps) {
    socket.broadcast.emit('message received', messageProps);
  })

  socket.on('disconnect', function () {
    if (userAdded) {
      --participantNum;
    }
    userAdded = false;
    socket.broadcast.emit('user left', {username: socket.username, participantNum: participantNum});
  })
});
