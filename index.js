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
    socket.emit('enter room', participantNum);
    socket.broadcast.emit('user joined', {username: username, participantNum: participantNum});
  })

  socket.on('disconnect', function (username) {
    if (userAdded) {
      --participantNum;
    }
  })
});
