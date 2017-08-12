# ariel
Avatar Robot for Imaging and Electronic Liaison

## Dependencies

### [socket.io](http://socket.io)
Handles real time communication between the client and robot, or client <-> cloud server <-> robot

### [talky.io](https://talky.io)
RTC helpers to for peer to peer video and chat

### [hapi.js](http://hapijs.com/)
Server framework. Currently we are just using it for [routing](http://hapijs.com/tutorials/routing) http requests

### [johnny-five](http://johnny-five.io/)
The Javascript-Robotics programming framework

### [keypress.js](http://dmauro.github.io/Keypress/)
Handles keypress events on the client

### [virtualjoystick.js](https://github.com/jeromeetienne/virtualjoystick.js)
Virtual joystick for user page

## Learning Resources

### Fundamentals

* [nodeschool.io](http://nodeschool.io/#workshopper-list) is a pretty amazing (and fun!) way to learn about many of these topics. These are "choose-your-own-adventure" style workshops that let you build and check solutions to common problems.
* [JavaScript for Cats](http://jsforcats.com/) is a fun introduction to programming with JavaScript as a first language.
* [nodeschool.io](http://nodeschool.io/#workshopper-list) is a pretty amazing (and fun!) way to learn about node.js. These are "choose-your-own-adventure" style workshops that let you build and check solutions for common tasks.

## Miscellaneous How-To's

### Launching the Bot Control Program
* Power up the tablet and log in
  * User: Donovan
  * Password: ariel
* Open the ```Git Shell``` application (there is an icon on the desktop)
* Navigate to ```C:\Users\donovan\Documents\ariel```
* run ```node index```
* Hide Git Shell but be sure to leave it and node running in the background
* Launch chrome (there is an icon on the desktop)



### Updating The Code on the Tablet
We are using a [code repository on github](https://github.com/houston-robotics-club/ariel) to manage contributions and changes and we have the git client installed on the tablet. This makes updates super easy. One note: Be patient, this tablet is super slow so opening apps takes a long time.
* Open the ```Git Shell``` application (there is an icon on the desktop) 
* Navigate to ```C:\Users\donovan\Documents\ariel```
* run ```git pull```


### Tips for the client side code

