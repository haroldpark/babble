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
  var username;
  var userJoined = false;
  var $currentInput = $usernameInput.focus();

  var socket = io();

  // $( document ).ready(function () {
  //   $chatPage.hide();
  // })

  function updateParticipantNum (number) {
    $('#numOfUsers').text(number);
  }

  function addMessageToScreen (data) {

  }
  function removeNewInputElement () {
    $('#newInput').closest('div').remove()
    $('#newInput').remove();
  }
  //main functionalities of user in chatroom
  socket.on('entered room', function (number) {
    updateParticipantNum(number);
    var x_coordinate;
    var y_coordinate;

    $('.chatArea').click(function (e) {
      removeNewInputElement();
      x_coordinate = e.pageX;
      y_coordinate = e.pageY;
      var style = 'position: absolute; left:' + x_coordinate + 'px; top:' + y_coordinate + 'px;';
      var inputTag = '<div style="' +  style +'"><input id="newInput" type="text"/></div>';
      $('.chatArea').append(inputTag);

      $('#newInput').focus();
    });

      $window.keydown(function (event) {
        if(event.which === 13) {
          var value = $('#newInput').val();
          if (value.length > 0) {
            if (userJoined) {
              var style = 'position:absolute; left:' + x_coordinate + 'px; top:' + y_coordinate + 'px;">'
              var inputTag = '<p style="' + style + value + '</p>';
              console.log(inputTag);
              $chatArea.append(inputTag);
              removeNewInputElement();
              socket.emit('message sent', messageProps);
            }
          }
        }
      })
  });


  socket.on('connected', function () {
    $window.keydown(function (event) {
      if(event.which === 13) {
        var value = $usernameInput.val();
        if (value.length > 0) {
          if (!userJoined) {
            var username = $usernameInput.val();
            socket.emit('user joined', username);
            $loginPage.fadeOut();
            $currentInput = $newInput.focus();
            userJoined = true;
          }


        }


      }
    })
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
  })



});
