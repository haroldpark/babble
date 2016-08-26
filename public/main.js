$(function() {

  // Initialize variables
  var $window = $(window);
  var $usernameInput = $('.usernameInput'); // Input for username
  var $messages = $('.messages'); // Messages area
  var $inputMessage = $('.inputMessage'); // Input message input box
  var $loginPage = $('.loginPage'); // The login page
  var $chatPage = $('.chatPage'); // The chatroom page
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
console.log('number', number)
    $('#numOfUsers').text(number);
  }


  socket.on('enter room', function (number) {
    console.log('HELLO')
    updateParticipantNum(number);

    $('.chatArea').click(function (e) {
      $('#newInput').empty().remove();
      var widthOfContainer = $(this).width();
      var x_coordinate = widthOfContainer - e.pageX;
      var style = 'position: absolute; right:' + x_coordinate + 'px; top:' + e.pageY + 'px;';
      var inputTag = '<div id="newInput" style="' +  style +'"><input type="text"/></div>';
      $('.chatArea').append(inputTag)
    })
  });

  socket.on('connected', function () {
    $window.keydown(function (event) {
      if(event.which === 13) {
        if ($currentInput.val().length > 0) {
          if (!userJoined) {
            var username = $usernameInput.val();
            // $chatPage.show();
            socket.emit('user joined', username);
            $loginPage.fadeOut();
            $currentInput = $inputMessage.focus();
          }

          if (userJoined) {

          }
        }


      }
    })
  });

  socket.on('user joined', function (data) {
    console.log('HERHIRE')
    var message = data.username + ' has joined!';
    console.log(message);
    updateParticipantNum(data.participantNum);
    $logs.append('<li>' + message + '</li>')

  });



});
