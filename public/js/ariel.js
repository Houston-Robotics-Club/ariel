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

var commands = [
  {"com": "toggleLED", "key": "l" },
  {"com": "forward", "key": "up" },
  {"com": "left", "key": "left" },
  {"com": "right", "key": "right" },
  {"com": "reverse", "key": "down" },
  {"com": "stop", "key": "space" }
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

// Bind event to window so the event works even when the mouse is outside browser
window.addEventListener("mouseup", function() {
  socket.emit("stop");
});

setInterval(function() {
  socket.emit("heartbeat");
}, 1000);
