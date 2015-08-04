var bot = require("./lib/bot.js");
var Hapi = require('hapi');

if (process.env.ARIELENV === "dev") {
  opts = {
    port: 8000
  };
} else {
  opts = {
    port: 80
  };
}

// Create a server with a host and port
var server = new Hapi.Server();
server.connection({
  host: 'localhost',
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

console.log("Server running on port " + opts.port);
