var five = require("johnny-five");

var board = new five.Board({
  port: "COM3"
});

board.on("ready", function() {
  var led = new five.Led(13);
  led.blink(1000);
});
