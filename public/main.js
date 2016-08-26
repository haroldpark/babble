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

  function addElementToChatArea (tagName, x_coord, y_coord, value) {
    var extraFields = ' ';
    var endingTag = '';
    var value = value || '';
    if (tagName == 'input') {
      extraFields = ' id="newInput" type="text"'
    }
    if (tagName == 'p') {
      endingTag = '</' + tagName + '>';
    }
    var style = 'position:absolute; left:' + x_coord + 'px; top:' + y_coord + 'px;">';
    var element = '<' + tagName + extraFields + ' style="' + style + value + endingTag;
    console.log('element', element)
    $chatArea.append(element);
    return element;
  }

  //main functionalities of user in chatroom
  socket.on('entered room', function (number) {
    updateParticipantNum(number);
  });


  socket.on('connected', function () {
    var x_coordinate;
    var y_coordinate;

    $('.chatArea').click(function (e) {
      removeNewInputElement();
      x_coordinate = e.pageX;
      y_coordinate = e.pageY;
      addElementToChatArea('input', x_coordinate, y_coordinate);
      $('#newInput').focus();
    });

    $window.keydown(function (event) {
      if (!userJoined) {
        if(event.which === 13) {
          var value = $usernameInput.val();
          console.log('THIS SHOUDLNT BE RUNNING HERE')
          if (value.length > 0) {
            var username = $usernameInput.val();
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
              var pElement = addElementToChatArea('p', x_coordinate, y_coordinate, value);
              removeNewInputElement();
              socket.emit('message sent', pElement);
            }
          }
        }
      }
    })
  });

  socket.on('message received', function (element) {
    $chatArea.append(element);
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
