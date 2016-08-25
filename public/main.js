$(function() {

  // Initialize variables
  var $window = $(window);
  var $usernameInput = $('.usernameInput'); // Input for username
  var $messages = $('.messages'); // Messages area
  var $inputMessage = $('.inputMessage'); // Input message input box
  var $loginPage = $('.login.page'); // The login page
  var $chatPage = $('.chat.page'); // The chatroom page
  var $logs = $('.logs');
  // Prompt for setting a username
  var username;
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
    console.log('HLOOLEOL')
    updateParticipantNum(number);
  });

  socket.on('connected', function () {

    $window.keydown(function (event) {
      if(event.which === 13) {
        var username = $usernameInput.val();
        $loginPage.fadeOut();
        // $chatPage.show();
        $currentInput = $inputMessage.focus();
        socket.emit('user joined', username);
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
