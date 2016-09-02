$(function() {
  var MAXIMUM_MSGINPUT_HEIGHT = 36;
  var MAXIMUM_MSGINPUT_WIDTH = 106;
  var USERNAME_COLORS = ['#FFFFFF', '#800000', '#FF0000', '#808000', '#FFFF00', '#008000', '#00FF00', '#008080', '#00FFFF', '#000080', '#0000FF', '#800080', '#FF00FF'];
  var MS_BY_MESSAGELENGTH_PERSIST = 400;
  var MAXIMUM_MS_MSG_PERSIST = 6000;
  var MINIMUM_MS_MSG_PERSIST = 3000;
  var MAXIMUM_USERNAME_LENGTH = 14;
  var MAXIMUM_CHATMESSAGE_LENGTH = 200;

  // Initialize variables
  var $window = $(window);
  var $usernameInput = $('.usernameInput'); // Input for username
  var $messages = $('.messages'); // Messages area
  var $newMsgInput = $('#newMsgInput'); // Input box that appears on screen on click
  var $loginPage = $('.loginPage'); // The login page
  var $chatArea = $('.chatArea'); // The chatroom page
  var $logs = $('.logs');

  // Prompt for setting a username
  var usernameColor;
  var $currentInput = $usernameInput.focus();
  var socket = io();


  //refactor this
  $(window).resize(function() {
    determineChatAreaProportions();
    removeExistingInputElement();
  });
  function determineChatAreaProportions () {

      var iframeheight = $('.iframe-full-height').height();
      var windowHeight = $(window).height();
      console.log(iframeheight, windowHeight);
      if (iframeheight !== windowHeight) {
        $('.chatArea').css('top', '50%').css('transform', 'translateY(-50%)');
      }
      else {
        $('.chatArea').css('top', '').css('transform', '');
      }
  }

  $('.iframe-full-height').on('load', determineChatAreaProportions);

  function updateParticipantNum (number) {
    $('#numOfUsers').text(number);
  }

  //Login page methods
  function initializeLoginPage () {
    $('.usernameInput').focus();
  }

  function getRandomUsernameColor() {
    return USERNAME_COLORS[Math.floor(Math.random() * USERNAME_COLORS.length)];
  }

  //ChatArea methods
  function removeExistingInputElement () {
    $('#newMsgInput').remove();
  }

  function addInputToChatArea (x_coord, y_coord) {
    //Checks if click coordinates are in the zone where overflow may happen
    var element = '<textarea id="newMsgInput" maxlength="' + MAXIMUM_CHATMESSAGE_LENGTH + '"/>';
    var input = $(element).appendTo($chatArea).css('display', 'none');
    var dimensions = getElementDimensions(input);
    y_coord = considerChatAreaOffsetY(y_coord);
    var style = formatInlineStyle(x_coord, y_coord, dimensions);
    input.css('display', 'inline').attr('style', style);
  }

  function addMessageToChatArea (percentages, value, username, color) {
    var element = '<div id="newMsg"><b>' + username + ':</b> ' + value + '</div>';
    var message = $(element).appendTo($chatArea).css('display', 'none');
    var dimensions = getElementDimensions(message);
    var style = formatInlineStyle2(dimensions, percentages, color);

    //limits the seconds that the messages persists in to 6 seconds
    var msecondsPersist = getMessagePersistByMilliseconds(value.length);
    message.css('display', 'inline').attr('style', style).delay(msecondsPersist).fadeOut(300, function () {
      $(this).remove();
    });
  }

  function getMessagePersistByMilliseconds (msgLength) {
    return Math.max(Math.min(msgLength * MS_BY_MESSAGELENGTH_PERSIST, MAXIMUM_MS_MSG_PERSIST), MINIMUM_MS_MSG_PERSIST);
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


  function formatInlineStyle2 (dimensionsArray, percentagesArray, color) {
    var extra = ', -1px -1px 0 #000, 1px -1px 0 #000,-1px  1px 0 #000, 1px  1px 0 #000; font-family:Arial; '
    var inlinePositioning = preventInputOverflow2(dimensionsArray, percentagesArray);
    var messageColor = color || usernameColor;
    return 'font-size:18px; text-shadow:0px 0px 50px #fff' + extra + 'font-family:Verdana, Geneva, sans-serif; color:' + messageColor + '; position:absolute; ' + inlinePositioning;
  }

  function preventInputOverflow2 (elementDimensionsArray, percentagesArray) {
    var chatAreaWidth = $chatArea.outerWidth();
    var chatAreaHeight = $chatArea.outerHeight();
    var elementWidth = elementDimensionsArray[0];
    var elementHeight = elementDimensionsArray[1];
    var clientXCoordinate = percentagesArray[0] / 100 * chatAreaWidth;
    var clientYCoordinate = percentagesArray[1] / 100 * chatAreaHeight;
    var widthOverflow = clientXCoordinate + elementWidth > chatAreaWidth;
    var heightOverflow = clientYCoordinate + elementHeight > chatAreaHeight;
    if (widthOverflow && heightOverflow) {
      return 'bottom: 0px; right: 0px;';
    }
    if (widthOverflow) {
      return 'right: 0px; top: ' + percentagesArray[1] + '%';
    }
    if (heightOverflow) {
      return 'bottom: 0px; left: ' + percentagesArray[0] + '%';
    }

    return 'left:' + percentagesArray[0] + '%; top:' + percentagesArray[1] + '%';
  }

  function getElementDimensions (element) {
    var elementWidth = element.outerWidth();
    var elementHeight = element.outerHeight();
    return [elementWidth, elementHeight];
  }


  function getCoordinatesByPercentage (x_coord, y_coord) {
    //To account for different viewports of clients, we get the coordinates in percentages relative to the container dimensions
    y_coord = considerChatAreaOffsetY(y_coord);
    var x_percentage = x_coord/$chatArea.outerWidth() * 100;
    var y_percentage = y_coord/$chatArea.outerHeight() * 100;
    return [x_percentage, y_percentage];
  }


  function considerChatAreaOffsetY (y_coord) {
      return y_coord - $chatArea.offset().top;
  }




  //Video url methods
  function resetVideoUrlInput () {
    $('.videoUrlInput').val('');
  }

  function formatVideoUrl (path) {
      return '//www.youtube.com/embed/' + path + '?rel=0&autoplay=1&controls=0';
  }

  function videoUrlIdentification(url) {
    var p = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    return (url.match(p)) ? RegExp.$1 : false;
  }


  function processVideoUrl() {
    var userInputUrl = $('.videoUrlInput').val();
    var validatedPath = videoUrlIdentification(userInputUrl);
    if (validatedPath) {
      var formattedUrl = formatVideoUrl(validatedPath);
      socket.emit('url sent', formattedUrl);
      resetVideoUrlInput();
    }
    else {
      //ALERT USER
      createAlert('Invalid Youtube URL', 'top', 'center');
    }
  }

  function notifyMessageExists() {
    return !!$('.alert').length;
  }

  function createAlert (message, fr, align) {
    var options = {
      icon: 'glyphicon glyphicon-warning-sign',
      message: message
    }
    var settings = {
      type: "warning",
      placement: {
        //top or bottom
        from: fr,
        //left, center, or right
        align: align
      },
      icon_type: 'class',
      delay: 100000000
    };
    if (!notifyMessageExists()) {
      $.notify(options, settings);
    }
    $('.alert').removeClass('col-xs-11').removeClass('col-sm-4').css('width', '30%');
  }


  //main functionalities of user in chatroom
  socket.on('entered room', function (number) {
    updateParticipantNum(number);
  });

  socket.on('connected', function () {
    var x_coordinate;
    var y_coordinate;
    var username;

    initializeLoginPage();

    //functionalities for login page
    if($('.loginPage')) {
      $('.usernameInput').on('input', function() {
        if ($(this).val().length == MAXIMUM_USERNAME_LENGTH) {
          createAlert('Username is too long!', 'bottom', 'center');
        }
      })

      $('.loginPage').keydown(function (event) {
          if(event.which === 13) {
            username = $usernameInput.val();
            if (username.length > 0) {
              usernameColor = getRandomUsernameColor();
              socket.emit('user joined', {
                username: username,
                color: usernameColor
              });
              $loginPage.fadeOut();
            }
          }
      });
    }

    $('.chatArea').click(function (e) {
      removeExistingInputElement();
      x_coordinate = e.pageX;
      y_coordinate = e.pageY;
      addInputToChatArea(x_coordinate, y_coordinate);
      $('#newMsgInput').focus();
    });

    $('.chatArea').on('focus', '#newMsgInput', function () {
      $(this).keydown(function (event) {
        if(event.which === 13) {
          var message = $('#newMsgInput').val();
          if (message.length > 0) {
              var percentagesArray = getCoordinatesByPercentage(x_coordinate, y_coordinate);
              addMessageToChatArea(percentagesArray, message, username);
              removeExistingInputElement();
              socket.emit('message sent', {
                percentages: percentagesArray,
                value: message,
                username: username,
                color: usernameColor
              });
          }
        }
        else {
          var message = $('#newMsgInput').val();
          if (message.length == MAXIMUM_CHATMESSAGE_LENGTH) {
            createAlert('Your message is too long!', 'top', 'center');
          }
        }
      });
    });

    $('#sendYtUrl').on('click', processVideoUrl);

    $('.videoUrlInput').on('focus', function () {
      $(this).keydown(function (event) {
        if(event.which === 13) {
          processVideoUrl();
        }
      });
    });

  });

  socket.on('message received', function (data) {
    addMessageToChatArea(data.percentages, data.value, data.username, data.color);
  });

  socket.on('user joined', function (data) {
    var message = '<b style="color:' + data.color + ';">' + data.username + '</b> has joined!';
    updateParticipantNum(data.participantNum);

    $logs.append('<li>' + message + '</li>');
  });

  socket.on('url received', function (vidUrl) {
    $('iframe').attr('src', vidUrl);
  })

  socket.on('user left', function (data) {
    var message = data.username + ' has left!';
    updateParticipantNum(data.participantNum);
    $logs.append('<li>' + message + '</li>');
  });

});
