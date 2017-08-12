var listener = new window.keypress.Listener();

var socket = io();
socket.emit('newUser');

var webrtc = new SimpleWebRTC({
  localVideoEl: 'localVideo',
  remoteVideosEl: 'remotesVideos',
  autoRequestMedia: true
});

webrtc.on('readyToCall', function () {
  webrtc.joinRoom('Houston Robotics Club: Ariel');
});

// Note: CANNOT have invalid commands here.
var commands = [
  {"com": "toggleLED", "key": "l" },
  {"com": "forward", "key": "up" },
  {"com": "left", "key": "left" },
  {"com": "right", "key": "right" },
  {"com": "reverse", "key": "down" },
  {"com": "stop", "key": "space" },
  {"com": "heightHeadUp"},
  {"com": "heightHeadDown"}
];

// Loop through our commands
commands.forEach( function(command) {

  // Grab the DOM element
  command.el = document.getElementById(command.com);

  // Listen for clicks on the element
  command.el.addEventListener("mousedown", function() {
    socket.emit(command.com);
  });

  // Listen for keypress events
  listener.register_combo({
    "keys"              : command.key,
    "on_keydown"        : function() { socket.emit(command.com); },
    "on_release"        : function() { socket.emit("stop"); },
    "prevent_default"   : true,
    "prevent_repeat"    : true
  });
});

// Commands with params
var tiltBackEl = document.getElementById("tiltHeadBack");
tiltBackEl.addEventListener("mousedown", function() {
  socket.emit("tilt", 20);
});

var tiltFwdEl = document.getElementById("tiltHeadFwd");
tiltFwdEl.addEventListener("mousedown", function() {
  socket.emit("tilt", -20);
});

var panLeftEl = document.getElementById("panHeadLeft");
panLeftEl.addEventListener("mousedown", function() {
  socket.emit("pan", -20);
});

var panRightEl = document.getElementById("panHeadRight");
panRightEl.addEventListener("mousedown", function() {
  socket.emit("pan", 20);
});

// Bind event to window so the event works even when the mouse is outside browser
document.addEventListener("mouseup", function() {
    socket.emit("stop");
});

var RightStick = new VirtualJoystick({
    mouseSupport: false,
    container: document.body,
    strokeStyle: 'blue',
  //  stationaryBase: true,
  //  baseX: window.innerWidth-100,
  //  baseY: window.innerHeight-100,
    limitStickTravel: true,
    stickRadius: 50
});

RightStick.addEventListener('touchStartValidation', function(event){
  var touch	= event.changedTouches[0];
  console.log(touch.pageX, touch.pageY);
  if( touch.pageX >= window.innerWidth/2 &&  touch.pageY > window.innerHeight/2)	return true;
  return false
});


  var LeftStick = new VirtualJoystick({
    mouseSupport: false,
    container: document.body,
    strokeStyle: 'red',
//    stationaryBase: true,
//    baseX: 100,
  //  baseY: window.innerHeight-100,
    limitStickTravel: true,
    stickRadius: 50
});

LeftStick.addEventListener('touchStartValidation', function(event){
  var touch	= event.changedTouches[0];
  if( touch.pageX < window.innerWidth/2 &&  touch.pageY > window.innerHeight/2)	return true;
  return false
});


var videoEl = document.getElementById("remotesVideos");
videoEl.addEventListener('click', function (event) {
  var x = event.clientX;
  var y = event.clientY;
  var w = event.srcElement.clientWidth;
  var h = event.srcElement.clientHeight;

  var xOff = (w/2 - x) * -1;
  var yOff = (h/2 - y) * -1;
  console.log(xOff, yOff);
});

setInterval(function() {
  socket.emit("heartbeat");
}, 1000);
