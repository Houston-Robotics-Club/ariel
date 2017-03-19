var Five = require("johnny-five");
var keypress = require('keypress');

var board = new Five.Board();

board.on("ready", function() {

  var stepper = new Five.Stepper({
    type: Five.Stepper.TYPE.FOUR_WIRE,
    stepsPerRev: 48,
    rpm: 60,
    pins: {
      motor1: 2, // in1 on motor controller
      motor2: 3, // in2 on motor controller
      motor3: 4, // in3 on motor controller
      motor4: 5, // in4 on motor controller
      enable: 6
    }
  });

  // make `process.stdin` begin emitting "keypress" events
  keypress(process.stdin);

  // listen for the "keypress" event
  process.stdin.on('keypress', function (ch, key) {
    if (key && key.name == 's') {
      console.log("Clockwise");
      stepper.cw().step(50, function() {
        console.log("move complete");
      });
    }
    if (key && key.name == 'a') {
      console.log("Counter Clockwise");
      stepper.ccw().step(50, function() {
        console.log("move complete");
      });
    }
  });
});

process.stdin.setRawMode(true);
process.stdin.resume();
