$(function() {


  // Initialize variables
  var $window = $(window);
  var $usernameInput = $('.usernameInput'); // Input for username
  var $messages = $('.messages'); // Messages area
  var $inputMessage = $('.inputMessage'); // Input message input box

  var $loginPage = $('.login.page'); // The login page
  var $chatPage = $('.chat.page'); // The chatroom page

  // Prompt for setting a username
  var username;
  var connected = false;
  var typing = false;
  var lastTypingTime;
  var $currentInput = $usernameInput.focus();

  var socket = io();

  $( document ).ready(function () {
    $chatPage.hide();
  })

  socket.on('connected', function () {

    $window.keydown(function (event) {
      if(event.which === 13) {
        var username = $usernameInput.val();
        $loginPage.fadeOut();
        $chatPage.show();
        $currentInput = $inputMessage.focus();
        socket.emit('user joined', username);
      }
    })
  })



});
