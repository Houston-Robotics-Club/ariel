var Five = require("johnny-five");

var board = new Five.Board();

board.on("ready", function() {
  var rightWheel, leftWheel, leftLimit, rightLimit;

  var altStepper = new Five.Stepper({
    pins: {
      motor1: 32,
      motor2: 34,
      motor3: 36,
      motor4: 38,
      enableA: 30,
      enableB: 40
    },
    stepsPerRev: 48,
    rpm: 2,
    type: Five.Stepper.TYPE.FOUR_WIRE
  });

  var u = function(distance) {
    if (process.env.ARIELENV === "dev") { console.log("Look up " + distance); }
    altStepper.cw().step(distance, function() {});
  };

  var d = function(distance) {
    if (process.env.ARIELENV === "dev") { console.log("Look up " + distance); }
    altStepper.ccw().step(distance, function() {});
  };

  // // Tilt to a specified angle in degrees
  // tiltTo: function(degrees) {
    
  // }

  this.repl.inject({
    u: u,
    d: d
  })
})