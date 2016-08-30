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
var youtubeURL;
var counter = 0;

io.on('connection', function (socket) {
  socket.emit('connected');


  socket.on('user joined', function (username) {
    ++participantNum;
    userAdded = true;
    socket.username = username;
    socket.emit('entered room', participantNum);
    if (youtubeURL) {
      var newYoutubeURL = youtubeURL + '&start=' + counter;
      console.log(newYoutubeURL);
      socket.emit('url received', newYoutubeURL);
    }
    socket.broadcast.emit('user joined', {username: username, participantNum: participantNum});
  })

  socket.on('message sent', function (messageProps) {
    socket.broadcast.emit('message received', messageProps);
  })
  socket.on('url sent', function (url) {
    counter = 0;
    youtubeURL = url;
    io.sockets.emit('url received', url);
    setInterval(function() {
      counter++
    }, 1000);
  })


  socket.on('disconnect', function () {
    if (userAdded) {
      --participantNum;
    }
    userAdded = false;
    socket.broadcast.emit('user left', {username: socket.username, participantNum: participantNum});
  })
});
