var rightWheel, leftWheel, leftLimit, rightLimit;

module.exports = {

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
      stepsPerRev: 48,
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
      console.log(this.value, this.raw);
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
    altStepper.cw().step(distance, function() {
      console.log("Look up complete");
    });
  },

  tiltHeadFwd: function(distance) {
    if (process.env.ARIELENV === "dev") { console.log("Look up " + distance); }
    altStepper.ccw().step(distance, function() {
      console.log("Look up complete");
    });
  },

  toggleLED: function() {
    if (process.env.ARIELENV === "dev") { console.log("toggleLED"); }
    led.toggle();
  },

};
