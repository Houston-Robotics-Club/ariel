var Five = require("johnny-five");

var board = new Five.Board();

board.on("ready", function() {

  var m1 = new Five.Motor({
    pins: {
      dir: 2,
      pwm: 3
    },
    invertPWM: true
  });

  var m2 = new Five.Motor({
    pins: {
      dir: 4,
      pwm: 5
    },
    invertPWM: true
  });



  var robot = {};

  robot.forward = function(speed) {
    speed = speed || 128;
    m1.forward(speed);
    m2.forward(speed);
  };

  robot.stop = function() {
    m1.stop();
    m2.stop();
  };

  robot.reverse = function(speed) {
    speed = speed || 128;
    m1.reverse(speed);
    m2.reverse(speed);
  };

  robot.left = function(speed) {
    m1.reverse(speed);
    m2.forward(speed);
  };

  robot.right = function(speed) {
    m1.forward(speed);
    m2.reverse(speed);
  };

  board.repl.inject({
    m1: m1,
    m2: m2,
    r: robot
  });
});
