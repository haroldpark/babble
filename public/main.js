$(function() {

  // Initialize variables
  var $window = $(window);
  var $usernameInput = $('.usernameInput'); // Input for username
  var $messages = $('.messages'); // Messages area
  var $newInput = $('#newInput'); // Input box that appears on screen on click
  var $loginPage = $('.loginPage'); // The login page
  var $chatArea = $('.chatArea'); // The chatroom page
  var $logs = $('.logs');

  // Prompt for setting a username
  var userJoined = false;
  var $currentInput = $usernameInput.focus();
  var socket = io();

  function updateParticipantNum (number) {
    $('#numOfUsers').text(number);
  }

  function removeNewInputElement () {
    $('#newInput').remove();
  }

  function formatInlineStyle (x_coord, y_coord) {
    return '"position:absolute; left:' + x_coord + 'px; top:' + y_coord + 'px;"';
  }
  function addInputToChatArea (style) {
    console.log('WERE AREAR EATHE CHATPINGON')

    var element = '<input id="newInput" style=' + style + '/>';
    $(element).appendTo($chatArea);
  }
  function addMessageToChatArea (style, value, username) {
    var element = '<p style=' + style + '>' + username + ': ' + value + '</p>';
    //limits the seconds that the messages persists in to 6 seconds
    var msecondsPersist = Math.min(value.length * 300, 6000);
    $(element).appendTo($chatArea).delay(msecondsPersist).fadeOut();
  }

  //main functionalities of user in chatroom
  socket.on('entered room', function (number) {
    updateParticipantNum(number);
  });


  socket.on('connected', function () {
    var x_coordinate;
    var y_coordinate;
    var username;

    $('.chatArea').click(function (e) {
      removeNewInputElement();
      x_coordinate = e.pageX;
      y_coordinate = e.pageY;

      addInputToChatArea(formatInlineStyle(x_coordinate, y_coordinate));
      $('#newInput').focus();
    });

    $window.keydown(function (event) {
      if (!userJoined) {
        if(event.which === 13) {
          var value = $usernameInput.val();
          console.log('THIS SHOUDLNT BE RUNNING HERE')
          if (value.length > 0) {
            username = $usernameInput.val();
            socket.emit('user joined', username);
            $loginPage.fadeOut();
            // $currentInput = $newInput.focus();
            userJoined = true;
          }
        }
      } else {
        if(event.which === 13) {
          var value = $('#newInput').val();
          if (value.length > 0) {
            if (userJoined) {
              addMessageToChatArea(formatInlineStyle(x_coordinate, y_coordinate), value, username);
              removeNewInputElement();
              socket.emit('message sent', {
                x_coordinate: x_coordinate,
                y_coordinate: y_coordinate,
                value: value,
                username: username
              });
            }
          }
        }
      }
    })
  });

  socket.on('message received', function (data) {
    addMessageToChatArea(data.x_coordinate, data.y_coordinate, data.value, data.username)
  });

  socket.on('user joined', function (data) {
    var message = data.username + ' has joined!';
    updateParticipantNum(data.participantNum);
    $logs.append('<li>' + message + '</li>');
  });

  socket.on('user left', function (data) {
    var message = data.username + ' has left!';
    updateParticipantNum(data.participantNum);
    $logs.append('<li>' + message + '</li>');
  });

});
