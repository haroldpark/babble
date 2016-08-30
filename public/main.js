$(function() {
  var TEXT_AREA_MAXLENGTH = 200;
  var MAXIMUM_MSGINPUT_HEIGHT = 36;
  var MAXIMUM_MSGINPUT_WIDTH = 106;


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

  function formatInlineStyle (x_coord, y_coord, dimensionsArray) {
    var inlinePositioning = preventInputOverflow(x_coord, y_coord, dimensionsArray);
    return 'position:absolute; ' + inlinePositioning;
  }

  function preventInputOverflow (x_coord, y_coord, dimensionsArray) {
    var chatAreaWidth = $chatArea.outerWidth();
    var chatAreaHeight = $chatArea.outerHeight();
    var elementWidth = dimensionsArray[0];
    var elementHeight = dimensionsArray[1];
    var widthOverflow = x_coord + elementWidth > chatAreaWidth;
    var heightOverflow = y_coord + elementHeight > chatAreaHeight;

    console.log('WIDTHOVERFLOW', widthOverflow);
    console.log('HEIGHTOVERFLOW', heightOverflow);


    if (widthOverflow && heightOverflow) {
      return 'bottom: 0px; right: 0px;';
    }
    if (widthOverflow) {
      return 'right: 0px; top: ' + y_coord + 'px';
    }
    if (heightOverflow) {
      return 'bottom: 0px; left: ' + x_coord + 'px';
    }

    return 'left:' + x_coord + 'px; top:' + y_coord + 'px';
  }


  function getElementDimensions (element) {
    var elementWidth = element.outerWidth();
    var elementHeight = element.outerHeight();
    console.log('WIDTH AND HEIGHT', elementWidth, elementHeight)
    return [elementWidth, elementHeight];
  }

  function addInputToChatArea (x_coord, y_coord) {
    //Checks if click coordinates are in the zone where overflow may happen
    var element = '<textarea id="newInput" maxlength="' + TEXT_AREA_MAXLENGTH + '"/>';
    var input = $(element).appendTo($chatArea).css('display', 'none');
    var dimensions = getElementDimensions(input);

    var style = formatInlineStyle(x_coord, y_coord, dimensions);

    input.css('display', 'inline').attr('style', style);

  }

  function addMessageToChatArea (x_coord, y_coord, value, username) {
    var element = '<div id="newMsg">' + username + ': ' + value + '</div>';
    var message = $(element).appendTo($chatArea).css('display', 'none');
    var dimensions = getElementDimensions(message);

    var style = formatInlineStyle(x_coord, y_coord, dimensions);

    //limits the seconds that the messages persists in to 6 seconds
    var msecondsPersist = Math.min(value.length * 400, 5000);
    message.css('display', 'inline').attr('style', style).delay(msecondsPersist).fadeOut(300, function () {
      $(this).remove();
    });
  }




  function formatYTUrl (path) {
      return '//www.youtube.com/embed/' + path + '?autoplay=1&controls=0&showinfo=0';
  }

  function ytUrlIdentification(url) {
    var p = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    return (url.match(p)) ? RegExp.$1 : false;
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
      // var changeLater = preventInputOverflow([x_coordinate, y_coordinate]);
      addInputToChatArea(x_coordinate, y_coordinate);

      $('#newInput').focus();
    });

    $('#sendYtUrl').click(function () {
      var validatedPath = ytUrlIdentification($('.ytUrlInput').val());
      if (validatedPath) {
        var formattedUrl = formatYTUrl(validatedPath);
        $('iframe').attr('src', formattedUrl);
        $('.ytUrlInput').val('');
      }
    });

    $('.usernameInput').focusin(function() {
      if(event.which === 13) {
        var value = $usernameInput.val();
        if (value.length > 0) {
          username = $usernameInput.val();
          socket.emit('user joined', username);
          $loginPage.fadeOut();
          userJoined = true;
        }
      }
    });


    $window.keydown(function (event) {
      if (!userJoined) {
        if(event.which === 13) {
          var value = $usernameInput.val();
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
              addMessageToChatArea(x_coordinate, y_coordinate, value, username);
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
