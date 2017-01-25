var tilt, pan, lift;

module.exports = {

  init: function(Five) {

		tilt = new Five.Stepper({
	    type: Five.Stepper.TYPE.FOUR_WIRE,
	    stepsPerRev: 48,
	    rpm: 60,
	    pins: {
	      motor1: 2, // in1 on motor controller
	      motor2: 3, // in2 on motor controller
	      motor3: 4, // in3 on motor controller
	      motor4: 5, // in4 on motor controller
	      enable: 6
	    }
	  });

		pan = new Five.Stepper({
	    type: Five.Stepper.TYPE.FOUR_WIRE,
	    stepsPerRev: 48,
	    rpm: 60,
	    pins: {
	      motor1: 7, // in1 on motor controller
	      motor2: 8, // in2 on motor controller
	      motor3: 9, // in3 on motor controller
	      motor4: 10, // in4 on motor controller
	      enable: 11
	    }
	  });

		lift = new Five.Stepper({
	    type: Five.Stepper.TYPE.FOUR_WIRE,
	    stepsPerRev: 48,
	    rpm: 60,
	    pins: {
	      motor1: 12, // in1 on motor controller
	      motor2: 13, // in2 on motor controller
	      motor3: 14, // in3 on motor controller
	      motor4: 15, // in4 on motor controller
	      enable: 16
	    }
	  });
  },

	head:['panHeadCenter', '', '',
        'tiltHeadCenter', '', '',
        'heightHeadCenter', '', '',
        'pulseStop']

  panHeadLeft: function(distance) {
    if (process.env.ARIELENV === "dev") { console.log("pan left"); }
    distance = distance || 20;
		pan.cw().step(distance, function() {
			if (process.env.ARIELENV === "dev") { console.log("pan left complete"); }
		});
  },

	panHeadRight: function(distance) {
    if (process.env.ARIELENV === "dev") { console.log("pan left"); }
    distance = distance || 20;
		pan.ccw().step(distance, function() {
			if (process.env.ARIELENV === "dev") { console.log("pan right complete"); }
		});
  },

	tiltHeadFwd: function(distance) {
    if (process.env.ARIELENV === "dev") { console.log("tilt up"); }
    distance = distance || 20;
		tilt.cw().step(distance, function() {
			if (process.env.ARIELENV === "dev") { console.log("tilt up complete"); }
		});
  },

	tiltHeadBack: function(distance) {
    if (process.env.ARIELENV === "dev") { console.log("tilt down"); }
    distance = distance || 20;
		tilt.ccw().step(distance, function() {
			if (process.env.ARIELENV === "dev") { console.log("tilt down complete"); }
		});
  },

	heightHeadUp: function(distance) {
    if (process.env.ARIELENV === "dev") { console.log("raise"); }
    distance = distance || 20;
		lift.cw().step(distance, function() {
			if (process.env.ARIELENV === "dev") { console.log("raise complete"); }
		});
  },

	heightHeadDown: function(distance) {
    if (process.env.ARIELENV === "dev") { console.log("lower"); }
    distance = distance || 20;
		lift.ccw().step(distance, function() {
			if (process.env.ARIELENV === "dev") { console.log("lower complete"); }
		});
  }

};
