var rightWheel, leftWheel, leftLimit, rightLimit;

// The ratio of altimeter steps to altPot values
var altStepRatio = 130 / (830 - 200);

var fmap = function(value, fromLow, fromHigh, toLow, toHigh) {
  return (value - fromLow) * (toHigh - toLow) /
    (fromHigh - fromLow) + toLow;
};

var constrain = function(value, lower, upper) {
  return Math.min(upper, Math.max(lower, value));
};

var bot = {

  init: function(Five) {

    // rightWheel = right drive wheel
    rightWheel = new Five.Motor({
      pins: {
        dir: 7,
        pwm: 6
      },
      invert: true
    });

    // leftWheel = left drive wheel
    leftWheel = new Five.Motor({
      pins: {
        dir: 5,
        pwm: 4
      }
    });

    leftLimit = new Five.Button({
      pin: 28,
      isPullup: true
    });

    rightLimit = new Five.Button({
      pin: 29,
      isPullup: true
    });

    altStepper = new Five.Stepper({
      pins: {
        motor1: 32,
        motor2: 34,
        motor3: 36,
        motor4: 38,
        enableA: 30,
        enableB: 40
      },
      stepsPerRev: 60,
      rpm: 60,
      type: Five.Stepper.TYPE.FOUR_WIRE
    });

    azStepper = new Five.Stepper({
      pins: {
        motor1: 44,
        motor2: 46,
        motor3: 48,
        motor4: 50,
        enableA: 42,
        enableB: 52
      },
      stepsPerRev: 60,
      rpm: 60,
      type: Five.Stepper.TYPE.FOUR_WIRE
    });
    
    neckStepper = new Five.Stepper({
      pins: {
        motor1: 45,
        motor2: 47,
        motor3: 49,
        motor4: 51,
        enableA: 43,
        enableB: 53
      },
      stepsPerRev: 60,
      rpm: 60,
      type: Five.Stepper.TYPE.FOUR_WIRE
    });
    
    spareStepper = new Five.Stepper({
      pins: {
        motor1: 33,
        motor2: 35,
        motor3: 37,
        motor4: 39,
        enableA: 31,
        enableB: 41
      },
      stepsPerRev: 60,
      rpm: 60,
      type: Five.Stepper.TYPE.FOUR_WIRE
    });
     
    /* --------- Pin and wire info -----------
    /  When looking at the pot from the left side of the head of the robot
    /  There are three wires: green, yellow and red (left to right)
    /  Green goes into the neck and comes out red (seriously?)
    /    It is connected to pin 5 on the 6 pin plug closest to the barrel power connector
    /    It is connected to 5v
    /  Red goes into the neck and comes out light green (OMG y'all!)
    /    It is connected to pin 6 on the 6 pin plug closest to the barrel power connecter
    /    It is connected to the common ground
    /  Yellow goes into the neck and comes out yellow (yay!)
    /    It is connected to pin 4 on the 6 pin plug closest to the barrel power connector
    /    It is connected to A0
    / ---------------------------------------*/
    // Down = 338 on pot
    // Straight = 519
    // Up = 829 on pot
    // Steps from up to down = about 100

    altPot = new Five.Sensor({
      pin: "A0",
      freq: 500
    });

    led = new Five.Led(13);

    altPot.on("change", function() {
      // console.log(this.value, this.raw);
    });

    rightLimit.on("press", function() {
      // console.log("s1 press");
    });

    rightLimit.on("release", function() {
      // console.log("s1 release");
    });

    leftLimit.on("press", function() {
      // console.log("s2 press");
    });

    leftLimit.on("release", function() {
      // console.log("s2 release");
    });


  },

  forward: function(speed) {
    if (process.env.ARIELENV === "dev") { console.log("forward"); }
    speed = speed || 255;
    rightWheel.reverse(speed);
    leftWheel.forward(speed);
  },

  stop: function() {
    if (process.env.ARIELENV === "dev") {console.log("stop"); }
    rightWheel.stop();
    leftWheel.stop();
  },

  reverse: function(speed) {
    if (process.env.ARIELENV === "dev") { console.log("reverse"); }
    speed = speed || 255;
    rightWheel.forward(speed);
    leftWheel.reverse(speed);
    // setTimeout(function() {
    //   leftWheel.forward(speed);
    // }, 1000);
  },

  left: function(speed) {
    if (process.env.ARIELENV === "dev") { console.log("left"); }
    speed = speed || 255;
    rightWheel.reverse(speed);
    leftWheel.reverse(speed);
  },

  right: function(speed) {
    if (process.env.ARIELENV === "dev") { console.log("right"); }
    speed = speed || 255;
    rightWheel.forward(speed);
    leftWheel.forward(speed);
  },

  tiltHeadBack: function(distance) {
    if (process.env.ARIELENV === "dev") { console.log("Look up " + distance); }
    altStepper.cw().step(distance, function() {});
  },

  tiltHeadFwd: function(distance) {
    if (process.env.ARIELENV === "dev") { console.log("Look down " + distance); }
    altStepper.ccw().step(distance, function() {});
  },

  panHeadLeft: function(distance) {
    if (process.env.ARIELENV === "dev") { console.log("Look left " + distance); }
    azStepper.cw().step(distance, function() {});
  },

  panHeadRight: function(distance) {
    if (process.env.ARIELENV === "dev") { console.log("Look right " + distance); }
    azStepper.ccw().step(distance, function() {});
  },

  liftHead: function(distance) {
    if (process.env.ARIELENV === "dev") { console.log("Lift head " + distance); }
    neckStepper.cw().step(distance, function() {});
  },

  lowerHead: function(distance) {
    if (process.env.ARIELENV === "dev") { console.log("Lower head " + distance); }
    neckStepper.ccw().step(distance, function() {});
  },

  // Tilt to a specified angle in degrees
  // Down = 147 on pot
  // Straight = 520
  // Up = 797 on pot
  // Steps from up to down = about 130
  // Minimum atep size = 5
  // Steps per second = 60
  // We are currentky constrained to a minimum angle of 80 degrees because there are wires in the way
  tiltTo: function(degrees) {
    
    degrees = constrain(degrees, 80, 180);
    
    var target = fmap(degrees, 0, 180, 158, 788) | 0;
    var current = altPot.value;
    
    var stepsToTarget = (current - target) * altStepRatio;
    
    if (Math.abs(stepsToTarget) > 4) {
      if (stepsToTarget > 0) {
        altStepper.ccw().step(stepsToTarget, function() {
          setTimeout( function() { bot.tiltTo(degrees); }, (stepsToTarget/60)/1000 + 100 );
        });
      } else {
        altStepper.cw().step(Math.abs(stepsToTarget), function() {
          setTimeout( function() { bot.tiltTo(degrees); }, (stepsToTarget/60)/1000 + 100 );
        });
      }
    }
  },

  toggleLED: function() {
    if (process.env.ARIELENV === "dev") { console.log("toggleLED"); }
    led.toggle();
  },

};

module.exports = bot;