var WebSocket = require('ws');
var ws = new WebSocket('http://192.168.1.2:1338');

var arDrone = require('ar-drone');
var drone  = arDrone.createClient({
  ip: '192.168.1.1'
});

var originX;
var originY;
var originZ;

var range = 10;

var toRads = Math.PI / 180;

var tookoff = false;

ws.on('message', function(data, flags) {

  var message;
  try {
    message = JSON.parse(data);
  } catch(e){
    console.log(data);
    return;
  }

  console.log(message);

  if(message.buttons.A && !tookoff){
    originX = message.orientation.roll;
    originZ = message.orientation.pitch;
    originY = message.orientation.azimuth;

    drone.takeoff();
    tookoff = true;
  }

  if(message.buttons.B && tookoff){
    tookoff = false;
    drone.land();
  }

  var z = message.orientation.pitch - originZ;
  var x = originX - message.orientation.roll;
  var radians = (message.orientation.azimuth * toRads) - (originY * toRads);
  var y = Math.atan2(Math.sin(radians), Math.cos(radians));

  var direction;
  if(z > range){
    drone.front(0.1);
  }

  if(z < -range){
    drone.back(0.1);
  }

  if(x > range){
    drone.right(0.1);
  }

  if(x < -range){
    drone.left(0.1);
  }

  if(z < range && z > -range && x < range && x > -range){
    drone.stop();
  }
});

ws.on('close', function(){
  drone.land();
  process.exit();
});
