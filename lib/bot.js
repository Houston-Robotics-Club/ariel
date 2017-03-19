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

    altPot = new Five.Sensor({
      pin: "A0",
      freq: 500
    });

    led = new Five.Led(13);

    altPot.on("change", function() {
      console.log(this.value);
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

  toggleLED: function() {
    if (process.env.ARIELENV === "dev") { console.log("toggleLED"); }
    led.toggle();
  }

};
