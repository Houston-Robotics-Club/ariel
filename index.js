var bot = require("./lib/bot.js");
var Hapi = require('hapi');


if (process.env.ARIELENV === "dev") {
  opts = {
    port: 8080
  };
} else {
  opts = {
    port: 80
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
var commands = [
  'toggleLED',
  'left',
  'right',
  'forward',
  'reverse',
  'stop'
];

io.on('connection', function (socket) {
  var heartbeatTimer;

  // Generate handlers on the user's connection for each command
  commands.forEach(function(command) {

    // Handler for this command
    socket.on(command, function() {

      // Only run command if this user is the active one
      if (activeUser === socket) {

        // Run the command on the robot
        bot[command]();
      }
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
