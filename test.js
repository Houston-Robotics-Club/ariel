var Five = require("johnny-five");

var board = new Five.Board();

board.on("ready", function() {

  m1 = new Five.Motor({
    pins: {
      dir: 3,
      pwm: 2
    }
  });

  m2 = new Five.Motor({
    pins: {
      dir: 5,
      pwm: 4
    }
  });

  led = new Five.Led(13);

  this.repl.inject( {
    m1: m1,
    m2: m2
  });

});
