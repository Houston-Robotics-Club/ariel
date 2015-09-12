var Five = require("johnny-five");
var keypress = require('keypress');

var board = new Five.Board();

var speed = 0, scalar = 1;

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

  // make `process.stdin` begin emitting "keypress" events
  keypress(process.stdin);

  // listen for the "keypress" event
  process.stdin.on('keypress', function (ch, key) {
    console.log('got "keypress"', key);
    if (key && key.name == 's') {
      scalar = scalar + 0.01;
    }
    if (key && key.name == 'a') {
      scalar = scalar - 0.01;
    }
  });

  this.repl.inject( {
    m1: m1,
    m2: m2,
    forward: function(speed) {
      m1.forward(speed * scalar);
      m2.forward(speed);
      console.log("m1: " + speed * scalar + ", m2: " + speed);
    }
  });

});

process.stdin.setRawMode(true);
process.stdin.resume();
