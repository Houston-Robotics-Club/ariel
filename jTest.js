var five = require("johnny-five");
var Tessel = require("tessel-io");
var board = new five.Board({
  io: new Tessel()
});

board.on("ready", () => {
  var sensor = new five.Sensor({pin: "b2", freq: 1000});
  var led = new five.Led({pin: "a5"});


  sensor.on("change", () => {
    led.brightness(sensor.value/4);
  });

});