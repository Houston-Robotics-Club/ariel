var Five = require("johnny-five");
var m1, m2, led, boardOpts;

if (process.env.ARIELENV === "dev") {
  boardOpts = {};
} else {
  boardOpts = {
    port: "COM4"
  };
}

var board = new Five.Board(boardOpts);

board.on("ready", function() {

  m1 = new Five.Motor({
    pins: {
      dir: 2,
      pwm: 3
    },
    invertPWM: true
  });

  m2 = new Five.Motor({
    pins: {
      dir: 4,
      pwm: 5
    },
    invertPWM: true
  });

  led = new Five.Led(13);

});

module.exports = {

  forward: function(speed) {
    speed = speed || 128;
    m1.forward(speed);
    m2.forward(speed);
  },

  stop: function() {
    m1.stop();
    m2.stop();
  },

  reverse: function(speed) {
    speed = speed || 128;
    m1.reverse(speed);
    m2.reverse(speed);
  },

  left: function(speed) {
    m1.reverse(speed);
    m2.forward(speed);
  },

  right: function(speed) {
    m1.forward(speed);
    m2.reverse(speed);
  },

  toggle: function() {
    led.toggle();
  }

};
