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
var heartbeatTimer;

io.on('connection', function (socket) {
  socket.on('newUser', function () {
    console.log("Hi New User");
  });
  socket.on("toggleLED", function() {
    bot.toggle();
  });
  socket.on("left", function() {
    bot.left();
  });
  socket.on("right", function() {
    bot.right();
  });
  socket.on("forward", function() {
    bot.forward();
  });
  socket.on("reverse", function() {
    bot.reverse();
  });
  socket.on("stop", function() {
    bot.stop();
  });
  socket.on("heartbeat", function() {
    clearTimeout(heartbeatTimer);

    heartbeatTimer = setTimeout(function() {
      bot.stop();
    }, 2000);
  });
});


console.log("Server running on port " + opts.port);
