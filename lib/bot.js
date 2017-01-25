var m1, m2;

module.exports = {

  init: function(Five) {

    m1 = new Five.Motor({
      pins: {
        dir: 2,
        pwm: 3
      }
    });

    m2 = new Five.Motor({
      pins: {
        dir: 4,
        pwm: 5
      }
    });

    led = new Five.Led(13);
  },

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
    // setTimeout(function() {
    //   m2.forward(speed);
    // }, 1000);
  },

  left: function(speed) {
    if (process.env.ARIELENV === "dev") { console.log("left"); }
    speed = speed || 255;
    m1.reverse(speed);
    m2.forward(speed);
  },

  right: function(speed) {
    if (process.env.ARIELENV === "dev") { console.log("right"); }
    speed = speed || 255;
    m1.forward(speed);
    m2.reverse(speed);
  },

  toggleLED: function() {
    if (process.env.ARIELENV === "dev") { console.log("toggleLED"); }
    led.toggle();
  }

};
