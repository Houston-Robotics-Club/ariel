var rightWheel, leftWheel, leftLimitVal = 0, rightLimitVal = 0;
var board;

// The ratio of altimeter steps to altPot values
var altStepRatio = 255 / (830 - 200);

var fmap = function(value, fromLow, fromHigh, toLow, toHigh) {
  return (value - fromLow) * (toHigh - toLow) /
    (fromHigh - fromLow) + toLow;
};

var constrain = function(value, lower, upper) {
  return Math.min(upper, Math.max(lower, value));
};

var bot = {

  init: function(Five, io) {

    board = io;

    // rightWheel = right drive wheel
    rightWheel = new Five.Motor({
      pins: {
        dir: 7,
        pwm: 6
      }
    });

    // leftWheel = left drive wheel
    leftWheel = new Five.Motor({
      pins: {
        dir: 5,
        pwm: 4
      }
    });

    rightLimit = new Five.Button({
      pin: 28,
      isPullup: true
    });

    leftLimit = new Five.Button({
      pin: 29,
      isPullup: true
    });

    // alt stepper
    board.accelStepperConfig({
      deviceNum: 0,
      type: board.STEPPER.TYPE.FOUR_WIRE,
      motorPin1: 32,
      motorPin2: 34,
      motorPin3: 36,
      motorPin4: 38,
      enablePin: 30,
      stepType: board.STEPPER.STEPTYPE.HALF
    });

    // 2nd enable pin
    board.digitalWrite(40,1);

    board.accelStepperSpeed(0, 200);
    board.accelStepperAcceleration(0, 100);

    // az stepper
    board.accelStepperConfig({
      deviceNum: 1,
      type: board.STEPPER.TYPE.FOUR_WIRE,
      motorPin1: 46,
      motorPin2: 44,
      motorPin3: 50,
      motorPin4: 48,
      enablePin: 42,
      stepType: board.STEPPER.STEPTYPE.HALF
    });

    // 2nd enable pin
    board.digitalWrite(52,1);

    board.accelStepperSpeed(1, 12);
    board.accelStepperAcceleration(1, 10);
    
    // neck stepper
    board.accelStepperConfig({
      deviceNum: 2,
      type: board.STEPPER.TYPE.FOUR_WIRE,
      motorPin1: 45,
      motorPin2: 47,
      motorPin3: 49,
      motorPin4: 51,
      enablePin: 43,
      stepType: board.STEPPER.STEPTYPE.HALF
    });
    
    board.accelStepperSpeed(2, 400);
    board.accelStepperAcceleration(2, 100);
    
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
    // Down = 240 on pot
    // Straight = 507
    // Up = 878 on pot
    // Steps from up to down = about 100

    altPot = new Five.Sensor({
      pin: "A0",
      freq: 100
    });

    led = new Five.Led(13);

    altPot.on("change", function() {
      if (this.value > 1000) {
        console.log("Shield is not seated properly", this.value);
      }
      // console.log(this.value, this.raw);
    });

    rightLimit.on("press", function() {
      console.log("s1 press");
    });

    rightLimit.on("release", function() {
      console.log("s1 release");
    });

    leftLimit.on("press", function() {
      console.log("s2 press");
    });

    leftLimit.on("release", function() {
      console.log("s2 release");
    });
  },

  forward: function(speed) {
    if (process.env.ARIELENV === "dev") { console.log("forward"); }
    speed = speed || 255;
    rightWheel.forward(speed);
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
    rightWheel.reverse(speed);
    leftWheel.reverse(speed);
    // setTimeout(function() {
    //   leftWheel.forward(speed);
    // }, 1000);
  },

  left: function(speed) {
    if (process.env.ARIELENV === "dev") { console.log("left"); }
    speed = speed || 255;
    rightWheel.forward(speed);
    leftWheel.reverse(speed);
  },

  right: function(speed) {
    if (process.env.ARIELENV === "dev") { console.log("right"); }
    speed = speed || 255;
    rightWheel.reverse(speed);
    leftWheel.forward(speed);
  },

  pan: function(distance) {
    if (process.env.ARIELENV === "dev") { console.log("Pan " + distance); }
    board.accelStepperStep(1, distance, function(position) {
      console.log(position);
    });
  },

  liftHead: function(distance) {
    if (process.env.ARIELENV === "dev") { console.log("Lift head " + distance); }
    neckStepper.cw().step(distance, function() {});
  },

  lowerHead: function(distance) {
    if (process.env.ARIELENV === "dev") { console.log("Lower head " + distance); }
    neckStepper.ccw().step(distance, function() {});
  },

  where: function() {
    console.log(altPot.value);
  },

  tilt: function(distance) {
    if (process.env.ARIELENV === "dev") { console.log("Tilt " + distance); }
    board.accelStepperStep(0, distance, function(position) {
      console.log(altPot.value, position);
    });
  },
  
  // Tilt to a specified angle in degrees
  // Down = 199 on pot
  // Up = 834 on pot
  // Steps from up to down = about 255
  // Minimum atep size = 1
  // Steps per second = 60
  // We are currentky constrained to a minimum angle of 80 degrees because there are wires in the way
  tiltTo: function(degrees) {
    
    degrees = constrain(degrees, 0, 180);
    
    var target = fmap(degrees, 0, 180, 199, 834) | 0;
    var current = altPot.value;
    var stepsToTarget = (target - current) * altStepRatio;

    if (Math.abs(stepsToTarget) >=1) {
      board.accelStepperStep(0, stepsToTarget, function(position) {
        bot.tiltTo(degrees);
      });
    }
  },

  panToLeftLimit: function() {
    bot.panHeadLeft(4);
    setTimeout( function() { 
      if (!leftLimit.isDown) {
        bot.panToLeftLimit(); 
      } else {
        rightLimitVal = 0;
        bot.panToRightLimit();
      }
    }, 2000 );
  },

  panToRightLimit: function() {
    bot.panHeadRight(4);
    rightLimitVal += 4;
    setTimeout( function() { 
      console.log(rightLimit.isDown);
      if (!rightLimit.isDown) {
        bot.panToRightLimit(); 
      } else {
        console.log(rightLimitVal);
      }
    }, 2000 );
  },
  
  toggleLED: function() {
    if (process.env.ARIELENV === "dev") { console.log("toggleLED"); }
    led.toggle();
  }

};

module.exports = bot;