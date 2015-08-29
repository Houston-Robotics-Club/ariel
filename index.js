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

io.on('connection', function (socket) {
  socket.on('newUser', function () {
    console.log("Hi New User");
  });
  socket.on("toggleLED", function() {
    bot.toggle();
    console.log("Toggle LED");
  });
  socket.on("left", function() {
    bot.left();
    setTimeout(function() { bot.stop(); }, 1000);
  });
  socket.on("right", function() {
    bot.right();
    setTimeout(function() { bot.stop(); }, 1000);
  });
  socket.on("forward", function() {
    bot.toggle();
    forward(function() { bot.stop(); }, 1000);
  });
  socket.on("stop", function() {
    bot.stop();
  });
});


console.log("Server running on port " + opts.port);
