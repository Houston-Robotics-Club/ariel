var Trier = require("trier");
//var board = new five.Board();  // Now implicitly importing from bot.js
var async = require("async");

var botMod = require("./bot.js");
var five = botMod.Five; // Only want one J5
var myBoard;

//////////////////////////////////////////////////
var bStopEventRecd = false; // May get away with one of these
var panStepper;
var panCtrPos = 0, panCurrPos = 0, panLimitPos = 0;
var panZeroPin = 7, panLimitPin = 8, panStepPin = 11, panDirPin = 13;
var panZeroPinState = 0, panLimitPinState = 0;
var bPanCentered = false, bPanZeroingFinished = false;
var bPanLimitingFinished = false;
//////////////////////////////////////////////////

// TODO, once this works:
//  Disable EasyDriver when not in use
//  Use both pulse count from zero and distance from limit to locate stepper
//  Condition that does above before moving stepper
//  Refactor

	function printFinalTotalMotorPulses(){
		console.log("panLimitPos = " + panLimitPos);
		console.log("panCurrPos = " + panCurrPos);
		console.log("panCtrPos = " + panCtrPos);
	}

	var findZeroPosition = function()
	{
		// Find zero position and make sure totalMotorPulses is set to 0
		Trier.attempt({
		until:function(){
			myBoard.digitalRead(panZeroPin, function(value){
			panZeroPinState = value;
			if (panZeroPinState === 1) {console.log("FIRST BUTTON PUSHED");
			panStepper.rpm(0).decel(5000);
			bPanZeroingFinished = true;}
			});//end function(value)
		console.log("panZeroPinState in until is (really bPanZeroingFinished) " + bPanZeroingFinished);
		//bPanZeroingFinished = true;
		return bPanZeroingFinished;
	},
	action: function(done) {
	panStepper.rpm(200).ccw().accel(5000).decel(10000).step(100, function(){
		panZeroPinState = myBoard.digitalRead(panZeroPin, function(value){
			console.log("Pin panZeroPin state in action =" + value);
			});//end function(value)
		done();
		}); // end anon fn
	}, // end action
	interval: .5,
	limit: -1
	}); // end Trier.attempt
	console.log("trier for zero spun off; returning");// returns immediately when findZeroPosition called
} // end findZeroPosition

var findLimitPosition = function()
{
	// Run motor until find limit position and set totalMotorPulses
	Trier.attempt({
		when: function(){if(bPanZeroingFinished === true)return bPanZeroingFinished;},
		until:function(){
			myBoard.digitalRead(panLimitPin, function(panLimitPinState){
				if (panLimitPinState === 1) {console.log("SECOND BUTTON PUSHED");
					panStepper.rpm(0).decel(5000);
					bPanLimitingFinished = true;
				}// end if
			});//end function(value)
			return bPanLimitingFinished;
		}, // end until
		action: function(done) {
			panStepper.rpm(200).cw().accel(5000).decel(10000).step(100, function(){
				panLimitPinState = myBoard.digitalRead(panLimitPin, function(value){
					//panLimitPos++;
					//console.log("Pulses = " + panLimitPos);
				});//end function(value)
				done();
				panLimitPos++;
				console.log("Pulses = " + panLimitPos);
			}); // end anon fn
			panCurrPos = panLimitPos;
			console.log("panCurrPos when finished finding limit is " + panCurrPos);
	}, // end action
	interval: .5,
	limit: -1
	}); // end Trier.attempt
	console.log("trier for limit spun off; returning"); // returns immediately when findLimitPosition called
} // end findLimitPosition

// I was going to make the centering part rotate quickly, but then I wasn't
// sure I could trust the ending position.  Not that I'm sure I can now...
var centerStepperAndSetPosition = function()
{
	Trier.attempt({
	when: function(){return bPanLimitingFinished;},
	action: function(done) {// 'done doesn't make sense to me yet
		// Number of steps is empirical wag; math doesn't seem to work
		panStepper.rpm(200).ccw().accel(5000).decel(10000).step(100, function(){
			panCurrPos--;
			console.log("panCurrPos in centerStepper action = " + panCurrPos);
			done();
		});
		panCtrPos = panCurrPos;
		console.log("Centered Position might be" + panCtrPos);
		bPanCentered = true;
		//printFinalTotalMotorPulses();
		}, // end action
	interval: .5,
	limit: -1,
	until: function() {
		if(panCurrPos <= panLimitPos/2)
		{
			return true;
		}
		//return true;
	},
	fail: function(){console.log("Never got a true value.  bPanLimitingFinished = " + bPanLimitingFinished);}
	}); // end Trier.attempt
	console.log("trier for total pulses spun off; returning"); // returns immediately when returnTotalPulses called
}
var bStoppedByPosition = false;

// Not using this.  Will try to rewrite CCW and CW into one fn again later.
var moveStepperMotor = function(direction){
	//bStopStepperNow = false;  //another try to fix that didn't work
	console.log("DIRECTION = " + direction);
	console.log("bPanCentered = " + bPanCentered);
	if(bPanCentered == true){
		Trier.attempt({
			when: function(){
				if((direction == "ccw") && (panCurrPos < 1)){
					return false;
				}
				else if((direction == "cw") && (panCurrPos > panLimitPos - 1)){
					return false;
				}
				else {
					return true;
				}
			},
			until:function(){
					console.log("IN UNTIL   bStopStepperNow = " + bStopStepperNow);
					if(bStopStepperNow == true){
						bStopStepperNow = false;
						bStopEventRecd = false;  // I don't see a problem doing this w/o condition
						return true;
					}
					// If I put return true here, I only ever get one step
			},
			action: function(done) {
				if(direction == "ccw"){
					panStepper.rpm(200).ccw().accel(5000).decel(10000).step(100, function(){
					panCurrPos--;
					if((bStopEventRecd == true) || (panCurrPos < 1)){
						bStopStepperNow = true;
					}
					console.log("Moving stepper counterclockwise; currPos = " + panCurrPos + " panLimitPos " + panLimitPos);
					done();
					});
			}
				else if(direction == "cw"){
					panStepper.rpm(200).cw().accel(5000).decel(10000).step(100, function(){
					panCurrPos++;
					if((bStopEventRecd == true) || (panCurrPos >= panLimitPos -1)){
						bStopStepperNow = true;
					}
					console.log("Moving stepper clockwise; currPos = " + panCurrPos + " panLimitPos " + panLimitPos);
					done();
				}); // end anon fn
			}
		}, // end action
			interval: .5,
			limit: -1
		}); // end Trier.attempt
	}
} // end moveStepperMotor

var moveStepperMotorCCW = function(){
	console.log("bPanCentered = " + bPanCentered);
	if(bPanCentered){
		Trier.attempt({
			until:function(){
					console.log("IN CCW UNTIL");
					if (panCurrPos < 1) {
						bStoppedByPosition = true;  //try this.  WORKED!
						console.log("CCW position < 1.  Return true (stop motor)");
						// I appear to be doing the following too late
						bStopEventRecd = false; // reset this; it will have been generated
						return true;
					}
					else if(bStopEventRecd) {
						bStopEventRecd = false; //reset
						console.log("CCW bStopEventRecd was true.  Reset and return true (stop motor)");
						if(bStoppedByPosition){// try this
							bStoppedByPosition = false;
							return false;
						}
						else {
						return true;
						}
					}
					else {
						console.log("CCW No stop event, position okay.  Return false (keep going)");
						return false;
					}
			},
			action: function(done) {
				if(panCurrPos > 0){  // Don't let it move if not above 0
					panStepper.rpm(200).ccw().accel(5000).decel(10000).step(100, function(){
						panCurrPos--;
						console.log("Moving stepper counterclockwise; currPos = " + panCurrPos + " panLimitPos " + panLimitPos);
						done();
					}); // end anon function
					}
					else {
						console.log("CCW movement not allowed in this position");
					}
			}, // end action
			interval: .5,
			limit: -1
		}); // end Trier.attempt
	} // end if(bPanCentered)
} // end moveStepperMotorCCW

var moveStepperMotorCW = function(){
	console.log("bPanCentered = " + bPanCentered);
	if(bPanCentered){
		Trier.attempt({
			until:function(){
				console.log("IN CW UNTIL");
				if (panCurrPos > (panLimitPos - 1)) {
					bStoppedByPosition = true;  //try this WORKED!
					console.log("CW position > panLimitPos - 1.  Return true (stop motor)");
					bStopEventRecd = false; // reset this; it will have been generated
					return true;
				}
				else if(bStopEventRecd) {
					bStopEventRecd = false; //reset
					console.log("CW bStopEventRecd was true.  Reset and return true (stop motor)");
					if(bStoppedByPosition){// try this
						bStoppedByPosition = false;
						return false;
					}
					else {
					return true;
					}
				}
				else {
					console.log("CW No stop event, position okay.  Return false (keep going)");
					return false;
				}
			},
			action: function(done) {
					if(panCurrPos < panLimitPos){  // Don't let it move if about at upper limit
						panStepper.rpm(200).cw().accel(5000).decel(10000).step(100, function(){
						panCurrPos++;
						console.log("Moving stepper clockwise; currPos = " + panCurrPos + " panLimitPos " + panLimitPos);
						done();
						}); // end anon fn
					}
					else {
						console.log("CW movement not allowed in this position");
					}
				}, // end action
			interval: .5,
			limit: -1
		}); // end Trier.attempt
	} // end if(bPanCentered)
} // end moveStepperMotorCW

module.exports = {
	pulseStop: function(){
		console.log("Got pulseStop event");
		bStopEventRecd = true;
	},

  init: function(five, board) {
		myBoard = board;
		panStepper = new five.Stepper({
			type: five.Stepper.TYPE.DRIVER,
			stepsPerRev: 200,
			pins: {
			  step: panStepPin,
			  dir: panDirPin
			}
  	}); // end new five.Stepper fn

   myBoard.pinMode(panZeroPin, five.Pin.INPUT);
   panZeroPinState = myBoard.digitalRead(panZeroPin, function(value){
	  console.log("Pin panZeroPin state at beginning = " + value);
	  }); // end anon fn
   myBoard.pinMode(panLimitPin, five.Pin.INPUT);
   panLimitPinState = myBoard.digitalRead(panLimitPin, function(value){
	  console.log("Pin panLimitPin state at beginning = " + value);
      }); // end anon fn
  },

	// Currently not accessing from browser, but may later
  zeroStepper: function()  //findZeroPosition
  {
		console.log("got zero event");
		findZeroPosition();
	}, // end until

	// Currently not accessing from browser, but may later
  findStepperLimit: function() // findLimitPosition
  {
		console.log("got limit event");
		findLimitPosition();
  }, //end findLimitPosition

	// Currently not accessing from browser, but may later
  centerStepper: function() // returnTotalPulsesAndCenterIt
  {
		console.log("got center event");
		centerStepperAndSetPosition();
  }, //end returnTotalPulses

  panHeadCenter: function(){
	if(!bPanCentered) {
	  async.series(
	  [
		function(callback){
			findZeroPosition();
			callback(null, console.log);
		},
	  	function(callback){
			findLimitPosition();
			callback(null, console.log);
		},
		function(callback){
			centerStepperAndSetPosition();
			callback (null, "I don't know wtf");
		}
	  ],
	    function(err, result){
				if(!err){
					bPanCentered = true;
				}
				else{
		    console.log("Async error " + err);
	 		  console.log("Result: " + result);
			  }
		 }
	 );}
 },

 	panHeadLeft: function(){
		console.log("Got panHeadLeft event");
		moveStepperMotorCCW();
	},

 	panHeadRight: function(){
		console.log("Got panHeadRight event");
		moveStepperMotorCW();
	}
}; //end module.exports









// more possible stuff to use (though pretty useless for my purposes so far)

	/*panStepper.step({
		steps: 2000,
		direction: five.Stepper.DIRECTION.CCW},
		function(){
		console.log("Step loop 1 ");
	});*/
