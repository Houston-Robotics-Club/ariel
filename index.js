var Five = require("johnny-five");
var bot = require("./lib/bot.js");
//var head = require("./lib/stepper.js");
var Hapi = require('hapi');

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
var commands = {
  bot: ['toggleLED', 'left', 'right', 'forward', 'reverse', 'stop'],
  head:[]
};

var board = new Five.Board(boardOpts);

board.on("ready", function() {
  var platform = bot.init(Five);
  //var neck = head.init(Five);
});

io.on('connection', function (socket) {
  var heartbeatTimer;

  // Generate handlers on the user's connection for each command
  commands.bot.forEach(function(command) {
    socket.on(command, function() {
      if (activeUser === socket) bot[command]();
    });
  });

  /*commands.head.forEach(function(command) {
    socket.on(command, function() {
      if (activeUser === socket) head[command]();
    });
  });*/

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
