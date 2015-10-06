var Trier = require("trier");
var async = require("async");
var botMod = require("./bot.js");
var five = botMod.Five; // Only want one J5, which is created in bot.js
var myBoard;

var HIGH = 1;
var LOW = 0;

var bStopEventRecd = false;
var bStoppedByPosition = false;
var panStepper, tiltStepper, heightStepper;

var panVars = {ctrPos: 0, limitPos:0, currPos:0, bZeroingFinished:false,
						 	 bLimitingFinished:false, bStepperCentered:false};
var tiltVars = {ctrPos: 0, limitPos:0, currPos:0, bZeroingFinished:false,
						  	bLimitingFinished:false, bStepperCentered:false};
var heightVars = {ctrPos: 0, limitPos:0, currPos:0, bZeroingFinished:false,
									bLimitingFinished:false, bStepperCentered:false};

// For Mega, panPins 20-24, tiltPins 25-29, heightPins 30-34
var panDriverPins = {zeroPin:7, limitPin:8, stepPin:11,
									 	 dirPin:13, enablePin:4};
//////////////// NOTE: UNCOMMENT FOR ARDUINO MEGA /////////////////////
/* //Don't do tilt and height for Uno; not enough pins
var tiltDriverPins= {zeroPin:25, limitPin:26, stepPin:27,
									   dirPin:28, enablePin:29};
var heightDriverPins = {zeroPin:30, limitPin:31, stepPin:32,
											  dirPin:33, enablePin:34};
*/
///////////////////////////////////////////////////////////////////////
// TODO, once this works:
//  Disable EasyDriver when not in use
//  Use both pulse count from zero and distance from limit to locate stepper
//  Condition that does above before moving stepper
//  Refactor
var initStepper = function(five, board, driverPins) {
	myBoard = board;
	panStepper = new five.Stepper({
		type: five.Stepper.TYPE.DRIVER,
		stepsPerRev: 200,
		pins: {
			step: driverPins.stepPin,
			dir: driverPins.dirPin,
		}
	}); // end new five.Stepper fn

	myBoard.pinMode(driverPins.zeroPin, five.Pin.INPUT);
	myBoard.pinMode(driverPins.limitPin, five.Pin.INPUT);
	myBoard.pinMode(driverPins.enablePin, five.Pin.OUTPUT);
	disableDriver(driverPins.enablePin);
}

var disableDriver = function(enablePinNum){
	myBoard.digitalWrite(enablePinNum, HIGH);
}

var enableDriver = function(enablePinNum){
	myBoard.digitalWrite(enablePinNum, LOW);
}

var performAllCenteringFunctions = function(stepper, pins, vars) {
	// Reset all vars each time motor is centered.  Can center as often
	// as desired.
	vars.ctrPos = 0, vars.limitPos = 0, vars.currPos = 0,
	vars.bZeroingFinished = false, vars.bLimitingFinished = false,
	vars.bStepperCentered = false;

	async.series(
		[
			function(callback){
				findZeroPosition(stepper, pins, vars);
				callback(null, console.log);
			},
			function(callback){
				findLimitPosition(stepper, pins, vars);
				callback(null, console.log);
			},
			function(callback){
				centerStepperAndSetPosition(stepper, pins, vars);
				callback (null, console.log);
			}
		],
		function(err, result){
			if(!err){
				bPanCentered = true;
			}
			else{
				console.log("Async error " + err);
				console.log("Result: " + result); // result prob. unreadable
			}
		}
	);
	panVars.bStepperCentered = true;
}

var findZeroPosition = function(stepper, pins, vars)
{
	var zeroPinState = LOW;
	// Find zero position and make sure totalMotorPulses is set to 0
	Trier.attempt({
		until:function(){
			myBoard.digitalRead(pins.zeroPin, function(value){
				zeroPinState = value;
				if (zeroPinState === HIGH) {
					//console.log("FIRST BUTTON PUSHED");
					stepper.rpm(0).decel(5000);
					vars.bZeroingFinished = true;
				}
			});//end function(value)
			return vars.bZeroingFinished;
		},
		action: function(done) {
			enableDriver(pins.enablePin);
			stepper.rpm(200).ccw().accel(5000).decel(10000).step(100, function(){
				zeroPinState = myBoard.digitalRead(pins.zeroPin, function(value){
				});//end function(value)
				done();
				disableDriver(pins.enablePin);
			}); // end anon fn
		}, // end action
		interval: .5,
		limit: -1
	}); // end Trier.attempt
} // end findZeroPosition

var findLimitPosition = function(stepper, pins, vars)
{
	var limitPinState;
	// Run motor until find limit position and set totalMotorPulses
	Trier.attempt({
		when: function(){
			if(vars.bZeroingFinished === true)
				{return vars.bZeroingFinished;}},
		until:function(){
			myBoard.digitalRead(pins.limitPin, function(limitPinState){
				if (limitPinState === HIGH) {
					//console.log("SECOND BUTTON PUSHED");
					stepper.rpm(0).decel(5000);
					vars.bLimitingFinished = true;
				}// end if
			});//end function(value)
			return vars.bLimitingFinished;
		}, // end until
		action: function(done) {
			enableDriver(pins.enablePin);
			stepper.rpm(200).cw().accel(5000).decel(10000).step(100, function(){
					limitPinState = myBoard.digitalRead(pins.limitPin, function(value){
				});//end function(value)
				done();
				disableDriver(pins.enablePin);
				vars.limitPos++;
			}); // end anon fn
			vars.currPos = vars.limitPos;
		}, // end action
		interval: .5,
		limit: -1
	}); // end Trier.attempt
} // end findLimitPosition

// ToDo: Alter so that final centering movement is fast.
var centerStepperAndSetPosition = function(stepper, pins, vars)
{
	// ckw: Currently a second attempt to center fails.  Need to debug.
		Trier.attempt({
			when: function(){
				return vars.bLimitingFinished;},
			until: function() {
				if(vars.currPos <= (vars.limitPos/2)) {
					return true;
				}
			},
			action: function(done) {
				enableDriver(pins.enablePin);
				stepper.rpm(200).ccw().accel(5000).decel(10000).step(100, function(){
					vars.currPos--;
					done();
					disableDriver(pins.enablePin);
				});
				vars.ctrPos = vars.currPos;
				vars.bStepperCentered = true;
			}, // end action
			interval: .5,
			limit: -1
		}); // end Trier.attempt
}

var moveStepperMotor = function(stepper, pins, vars, direction){
	// Only allow movement if stepper has been centered.
	if(vars.bStepperCentered){
		Trier.attempt({
			until:function(){
					//console.log("IN moveStepper UNTIL section");
					if (((direction == "ccw") && (vars.currPos < 1)) ||
							((direction == "cw") && (vars.currPos > (vars.limitPos - 1)))){
						bStoppedByPosition = true;
						bStopEventRecd = false; // reset
						return true;
					}
					else if(bStopEventRecd) {
						bStopEventRecd = false; // reset
						if(bStoppedByPosition){
							bStoppedByPosition = false; //reset
							return false;
						}
						else {
							return true;
						}
					}
					else {
						return false;  // No stop event, position okay.  Keep going.
					}
			},
			action: function(done) {
				enableDriver(pins.enablePin);
				if((direction == "ccw") && (vars.currPos > 0)){
					stepper.rpm(200).ccw().accel(5000).decel(10000).step(100, function(){
						vars.currPos--;
						disableDriver(pins.enablePin);
						done();
						}); // end anon function
					}
					else if((direction == "cw") && (vars.currPos < vars.limitPos)){
						stepper.rpm(200).cw().accel(5000).decel(10000).step(100, function(){
							vars.currPos++;
							disableDriver(pins.enablePin);
							done();
							}); // end anon function
					}
					else {
						;//console.log(direction +" movement not allowed in this position");
					}
			}, // end action
			interval: .5,
			limit: -1
		}); // end Trier.attempt
	} // end if(vars.bStepperCentered)
} // end moveStepperMotor

module.exports = {
	pulseStop: function(){
		bStopEventRecd = true;
	},

  init: function(five, board) {
		initStepper(five, board, panDriverPins);
		// Don't do init for tilt and height with Uno; not enough pins
		//////////////// NOTE: UNCOMMENT FOR ARDUINO MEGA /////////////////////
		//initStepper(five, board, tiltDriverPins):
		//initStepper(five, board, heightDriverPins);
		///////////////////////////////////////////////////////////////////////
	},

	panHeadCenter: function(){
			performAllCenteringFunctions(panStepper, panDriverPins, panVars);
	},

	panHeadLeft: function(){
		moveStepperMotor(panStepper, panDriverPins, panVars, "ccw");
	},

	panHeadRight: function(){
		moveStepperMotor(panStepper, panDriverPins, panVars, "cw");
	},

	tiltHeadCenter: function(){
		performAllCenteringFunctions(tiltStepper, tiltDriverPins, tiltVars);
	},

	tiltHeadBack: function(){
		moveStepperMotor(tiltStepper, tiltDriverPins, tiltVars, "ccw");
	},

	tiltHeadFwd: function(){
		moveStepperMotor(tiltStepper, tiltDriverPins, tiltVars, "cw");
	},

	heightHeadCenter: function(){
		performAllCenteringFunctions(heightStepper, heightDriverPins, heightVars);
	},

	heightHeadUp: function(){
		moveStepperMotor(heightStepper, heightDriverPins, heightVars, "ccw");
	},

	heightHeadDown: function(){
		moveStepperMotor(heightStepper, heightDriverPins, heightVars, "cw");
	}
}; //end module.exports
