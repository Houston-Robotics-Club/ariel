var Five = require("johnny-five");
var m1, m2, led, boardOpts;

if (process.env.ARIELENV === "dev") {
  boardOpts = {};
} else {
  boardOpts = {
    port: "COM5"
  };
}

var board = new Five.Board(boardOpts);

board.on("ready", function() {

  m1 = new Five.Motor({
    pins: {
      dir: 3,
      pwm: 2
    }
  });

  m2 = new Five.Motor({
    pins: {
      dir: 5,
      pwm: 4
    }
  });

  led = new Five.Led(13);

});

module.exports = {

  forward: function(speed) {
    if (process.env.ARIELENV === "dev") { console.log("forward"); }
    speed = speed || 255;
    m1.forward(speed);
    m2.forward(speed);
  },

  stop: function() {
    if (process.env.ARIELENV === "dev") {console.log("stop"); }
    m1.stop();
    m2.stop();
  },

  reverse: function(speed) {
    if (process.env.ARIELENV === "dev") { console.log("reverse"); }
    speed = speed || 255;
    m1.reverse(speed);
    m2.reverse(speed);
  },

  left: function(speed) {
    if (process.env.ARIELENV === "dev") { console.log("left"); }
    speed = speed || 255;
    m1.forward(speed);
    m2.reverse(speed);
  },

  right: function(speed) {
    if (process.env.ARIELENV === "dev") { console.log("right"); }
    speed = speed || 255;
    m1.reverse(speed);
    m2.forward(speed);
  },

  toggle: function() {
    if (process.env.ARIELENV === "dev") { console.log("toggle"); }
    led.toggle();
  }

};
