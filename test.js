var Five = require("johnny-five");
var keypress = require('keypress');

var board = new Five.Board();

var gspeed = 255, scalar = 1;

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
      m1.forward(gspeed * scalar);
      m2.forward(gspeed);
      console.log("m1: " + gspeed * scalar + ", m2: " + gspeed);
    }
    if (key && key.name == 'a') {
      scalar = scalar - 0.01;
      m1.forward(gspeed * scalar);
      m2.forward(gspeed);
      console.log("m1: " + gspeed * scalar + ", m2: " + gspeed);
    }
    if (key && key.name == 'w') {
      m1.forward(gspeed * scalar);
      m2.forward(gspeed);
      console.log("m1: " + gspeed * scalar + ", m2: " + gspeed);
    }
    if (key && key.name == 'z') {
      m1.stop();
      m2.stop();
console.log("m1: " + gspeed * scalar + ", m2: " + gspeed);
    }
  });

  this.repl.inject( {
    m1: m1,
    m2: m2,
    forward: function(speed) {
      gspeed = speed || gspeed;
      m1.forward(gspeed * scalar);
      m2.forward(gspeed);
      console.log("m1: " + gspeed * scalar + ", m2: " + gspeed);
    },
    stop: function() {
      m1.stop();
      m2.stop();
    }
  });

});

process.stdin.setRawMode(true);
process.stdin.resume();
