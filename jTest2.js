var tessel = require('tessel'); // Import tessel
var pin = tessel.port.B.pin[2];
var led = tessel.port.A.pin[5];

tessel.pwmFrequency(2000);
led.pwmDutyCycle(1.0);

const foo = function() {
    pin.analogRead((error, number) => {
        if (error) {
            throw error;
        }

        led.pwmDutyCycle(number); // The number is a value between 0 and 1
    });

    setTimeout( function() { foo(); }, 10);

}

foo();