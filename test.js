var Five = require("johnny-five");

var dotenv = require("dotenv");
var board = new Five.Board();

dotenv.load();

board.on("ready", function() {
  var rightWheel, leftWheel, leftLimit, rightLimit;

  console.log(process.env.ARIELENV);
  var altStepper = new Five.Stepper({
    pins: {
      motor1: 44,
        motor2: 46,
        motor3: 48,
        motor4: 50,
        enableA: 42,
        enableB: 52
    },
    stepsPerRev: 24,
    rpm: 10,
    type: Five.Stepper.TYPE.FOUR_WIRE
  });

  var u = function(distance) {
    if (process.env.ARIELENV === "dev") { console.log("Look up " + distance); }
    altStepper.cw().step(distance, function() {});
    return true;
  };

  var d = function(distance) {
    if (process.env.ARIELENV === "dev") { console.log("Look up " + distance); }
    altStepper.ccw().step(distance, function() {});
    return true;
  };

  // // Tilt to a specified angle in degrees
  // tiltTo: function(degrees) {
    
  // }

  this.repl.inject({
    u: u,
    d: d
  })
})