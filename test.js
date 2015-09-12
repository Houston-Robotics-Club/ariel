var Five = require("johnny-five");
var keypress = require('keypress');

var board = new Five.Board();

var m1speed = 0, m2speed = 0;

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
    if (key && key.name == 'a') {
      m1speed = m1speed + 1;
      m1.forward(m1speed);
    }
    if (key && key.name == 'z') {
      m1speed = m1speed - 1;
      m1.forward(m1speed);
    }
    if (key && key.name == 's') {
      m2speed = m2speed + 1;
      m2.forward(m2speed);
    }
    if (key && key.name == 'x') {
      m2speed = m2speed - 1;
      m2.forward(m2speed);
    }
  });

  this.repl.inject( {
    m1: m1,
    m2: m2,
    forward: function(speed) {
      m1.forward(speed);
      m2.forward(speed);
    }
  });

});

process.stdin.setRawMode(true);
process.stdin.resume();
