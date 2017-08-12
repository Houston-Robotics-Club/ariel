var Five = require("johnny-five");
var bot = require("./lib/bot.js");
var dotenv = require("dotenv");
var Hapi = require('hapi');

// Here we are using a customized verion of the Johnny-Five Stepper class
// that adds enable pins
//Five.Stepper = require("./lib/stepper.js");

dotenv.load();

var boardOpts;

if (process.env.ARIELENV === "dev") {
  boardOpts = {};
  opts = {
    port: 8080
  };
} else {
  opts = {
    port: 80
  };
  boardOpts = {
    port: "COM5"
  };
}

// Create a server with a host and port
var server = new Hapi.Server();
server.connection({
  port: opts.port
});

// Add the route
server.route([
  {
    method: 'GET',
    path:'/',
    handler: {
      file: function (request) {
        return "public/html/user.html";
      }
    }
  },
  {
    method: 'GET',
    path:'/{filename}',
    handler: {
      file: function (request) {
        return "public/html/"+request.params.filename;
      }
    }
  },
  {
    method: 'GET',
    path:'/js/{filename}',
    handler: {
      file: function (request) {
        return "public/js/"+request.params.filename;
      }
    }
  },
  {
    method: 'GET',
    path:'/css/{filename}',
    handler: {
      file: function (request) {
        return "public/css/"+request.params.filename;
      }
    }
  }
]);

// Start the server
server.start();

var io = require('socket.io')(server.listener);
var activeUser = null;
var commands = {  // Note: can have invalid commands here
  bot: ['toggleLED', 'left', 'right', 'forward', 'reverse', 'stop', 'tilt', 'pan'],
  head:['tiltHeadBack', 
        'panHeadLeft', 'panHeadRight',
        'heightHeadUp', 'heightHeadDown',
        'pulseStop']
};

var board = new Five.Board(boardOpts);

board.on("ready", function() {
  var platform = bot.init(Five, board.io);
  this.repl.inject({
    bot:bot
  });
  //var neck = head.init(Five, board);
});

io.on('connection', function (socket) {
  var heartbeatTimer;

  // Generate handlers on the user's connection for each command
  commands.bot.forEach(function(command) {
    socket.on(command, function(value) {
      console.log("Command = " + command);//////////////////debug
      if (activeUser === socket) bot[command](value);
    });
  });

  socket.on('newUser', function () {
    console.log("Hi New User");
  });

  socket.on("heartbeat", function() {

    // Reset this user's heartbeat timer so the timeout is not called
    clearTimeout(heartbeatTimer);

    // Set the active user to this connection if there is no current active user
    if (activeUser === null) {
      activeUser = socket;
    }

    // Set this user's heartbeat timeout
    heartbeatTimer = setTimeout(function() {

      // Only do something if the active user timed out
      if (activeUser === socket) {

        // Stop the the robot's movement and clear the active user
        bot.stop();
        activeUser = null;
      }
    }, 2000);
  });
});


console.log("Server running on port " + opts.port);
