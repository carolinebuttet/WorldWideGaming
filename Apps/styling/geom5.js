var prevTime = Date.now();
var absAlpha=0;
var alphaToUse=0;
var betaToUse=0;
var betaSent=0;
var volumeToUse=0;
var higherVolume=0;
var averageToUse=20;
var allForces;
var allOldForces;
var higherForce=0;
var clickCount=0;
var forceChoice=0;
var precisionForce=0;
var isConnected=false;
var isFlying=false;
var isButtonForcePressed=false;
var myLoop;
var forceMultiplyFactorVol=1.5;
var forceMultiplyFactorShake=4;
var forceMultiplyFactorTouch=1;
var publicGameCode;
var playerCount=0;
//SOCKET
var socket = io();
socket.on('welcome',function(data){
        console.log(data);
        console.log('emitting socket!'); 
    });
socket.on('connected',function(data){
        /*console.log('connected succesfully!!');
        console.log('code is : ' )
        console.log(publicGameCode);
        if(isConnected==false){
            playerCount++;
            socket.emit('connected',{connected:'connection!!!'});
            socket.emit('playerJoinGame', {gameId: publicGameCode, playerName:'caroline',playerUUID:publicGameCode+playerCount});
            document.getElementById('connect').style.display = "none";
            document.getElementById('isConnected').style.display="block";
            document.getElementById('sliderWrapper').style.display = "none";
            }
        isConnected=true;*/
    });
socket.on('fail', function(){
        console.log('connection failed because U SUCK');
        socket.emit('fail',{fail:'failed!!!!!'});
    });
socket.on('ball_has_arrived',function(data){
        console.log('the ball has arrived bitch!');
        isFlying=false;
        toggleFlyMode();
    });

function init() {
//quick démarrage
//document.getElementById('connect').style.display = "none";
//document.getElementById('isConnected').style.display="block";
//document.getElementById('sliderWrapper').style.display = "none";
////
var dataContainerOrientation = document.getElementById('dataContainerOrientation');
var dataContainerMotion = document.getElementById('dataContainerMotion');
var compass = document.getElementById('compass');
var elevation = document.getElementById('elevation');
var angle = document.getElementById('angle');
var force = document.getElementById('force');
if(window.DeviceOrientationEvent && isFlying===false) {
  window.addEventListener('deviceorientation', function(event) {
                var dir ='';
				var alpha;
				//check for ios property
				if(event.webkitCompassHeading) {
            	alpha = event.webkitCompassHeading*-1;
            	//Direction is reversed for iOS
            	//dir='-';
          		}
          		else alpha = event.alpha;
                var beta = event.beta;
                var gamma = event.gamma;
                alphaToUse = alpha;
				betaToUse=beta;
        var roundedBeta = Math.round(betaToUse);
        compass.style.Transform = 'rotate( ' + alpha + 'deg)';
        compass.style.WebkitTransform = 'rotate( '+ alpha + 'deg)';
        //Rotation is reversed for FF
        compass.style.MozTransform = 'rotate(' + alpha + 'deg)';

        elevation.style.WebkitTransform = 'rotateX(' + betaToUse +'deg)';
        elevation.style.Transform = 'rotateX(' + betaToUse +'deg)';
        elevation.style.MozTransform ='rotateX(' + betaToUse +'deg)';
        angle.innerHTML = roundedBeta;
        //-webkit-transform: rotateX(45deg); /* Chrome, Safari, Opera  */
        //transform: rotateX(45deg);

                if(alpha!=null || beta!=null || gamma!=null) 
                  dataContainerOrientation.innerHTML = '<strong>Orientation</strong><br />alpha: ' + alpha + '<br/>beta: ' + beta + '<br />gamma: ' + gamma;
              }, false);
  }

if(window.DeviceMotionEvent && isFlying===false) {
  window.addEventListener('devicemotion', function(event) {
   
                var x;
                var y;
                var z;
                if(event.accelerationIncludingGravity) {
                  //x = event.accelerationIncludingGravity.x;
                  //y = event.accelerationIncludingGravity.y;
                  //z = event.accelerationIncludingGravity.z;
                  x = event.acceleration.x;
                  y = event.acceleration.y;
                  z = event.acceleration.z;

                }
                else if(event.acceleration) {
                  x = event.acceleration.x;
                  y = event.acceleration.y;
                  z = event.acceleration.z;
                }
                var r = event.rotationRate;
                var html = '<strong>Acceleration</strong><br />';
                html += 'x: ' + x +'<br />y: ' + y + '<br/>z: ' + z+ '<br />';
                html += '<strong>Rotation rate</strong><br />';
                if(r!=null) html += 'alpha: ' + r.alpha +'<br />beta: ' + r.beta + '<br/>gamma: ' + r.gamma + '<br />';
				        absAlpha = r.alpha;

                if(customClick ==0){
                  //send nothing
                }else if(clickCount==1){
                  socket.emit('send_data_angle',{alpha:alphaToUse});

                }else if(clickCount==2 && betaToUse>=0 && betaToUse<=90){
                  socket.emit('send_data_elevation',{beta:betaToUse});
                  betaSent = betaToUse;
                }
                else if(clickCount==4 && forceChoice==1){
                    allForces = Math.abs(x) + Math.abs(y)+ Math.abs(z)*forceMultiplyFactorShake;
                    console.log(allForces);
                    var allForcesToUse = Math.round(allForces);
                    //force.innerHTML = allForcesToUse;
                    if(allForces>higherForce){higherForce=allForces};
                    var distanceInKm= getCurveCustom(higherForce,betaSent,0);
                    //console.log('distance in km with force = ' + distanceInKm);
                    force.innerHTML = Math.round(distanceInKm) + " km" ;
                    //socket.emit('throw',{});
                }
                dataContainerMotion.innerHTML = html;
                  
                });

  }
}
	  //----------------------------------------------------------------------

	  //AUDIO//
    
function getAverageVolume(array) {
    var values = 0; 
    // get all the frequency amplitudes
    for (var i = 0; i < array.length; i++) {
        values += array[i];
    }
    return values / (array.length);
}
function onSuccess(stream) {
    var context = new AudioContext();
    var mediaStreamSource = context.createMediaStreamSource(stream);
	var analyser = context.createAnalyser();
	analyser.smoothingTimeConstant = 0.3;
    analyser.fftSize = 1024;
	var javascriptNode = context.createScriptProcessor(2048, 1, 1);
	javascriptNode.onaudioprocess = function(e) {
		//var sample = e.inputBuffer.getChannelData(0);
		// get the average, bincount is fftsize / 2
        var oldAverage = volumeToUse;
        var array =  new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);  
		// calculate average
		var average = getAverageVolume(array)*forceMultiplyFactorVol;
		averageToUse=average;
		// print value out
		//console.log(average);
        volumeToUse=average;
        var roundedVol = Math.round(average);
        if(clickCount===4 && forceChoice===2){
            if(higherVolume<average){
                higherVolume=average;
            }
            //force.innerHTML = roundedVol;
            var distanceInKm= getCurveCustom(higherVolume,betaSent,0);
            //console.log('distance in km with force = ' + distanceInKm);
            force.innerHTML = Math.round(distanceInKm) + " km" ;
            console.log('volume heeeeeere!!!');
            document.getElementById('step00').style.display = "none";
            document.getElementById('step01').style.display = "none";
            document.getElementById('step02').style.display = "none";
            document.getElementById('step03').style.display = "none";
            document.getElementById('step04').style.display = "block";
            document.getElementById('dataContainerOrientation').style.display = "none";
            document.getElementById('dataContainerMotion').style.display = "none";
            document.getElementById('sliderWrapper').style.display = "none";
        }
	};
	// stream -> mediaSource -> analyser -> javascriptNode -> destination
	mediaStreamSource.connect(analyser);
	analyser.connect(javascriptNode);
	javascriptNode.connect(context.destination);
}

function onError() {
	alert('Error');
}


function customClick() {
  clickCount++;
  console.log('click!!!!');
  console.log(clickCount);
    if(clickCount==0){
    forceChoice=0;
    document.getElementById('step00').style.display = "block";
    document.getElementById('step01').style.display = "none";
    document.getElementById('step02').style.display = "none";
    document.getElementById('step03').style.display = "none";
    document.getElementById('step04').style.display = "none";
    document.getElementById('dataContainerOrientation').style.display = "none";
    document.getElementById('dataContainerMotion').style.display = "none";
    document.getElementById('sliderWrapper').style.display = "none";
    }
    if(clickCount==1){
    forceChoice=0;
    document.getElementById('step00').style.display = "none";
    document.getElementById('step01').style.display = "block";
    document.getElementById('step02').style.display = "none";
    document.getElementById('step03').style.display = "none";
    document.getElementById('dataContainerOrientation').style.display = "none";
    document.getElementById('dataContainerMotion').style.display = "none";
    document.getElementById('sliderWrapper').style.display = "none";
    }
    else if(clickCount==2){
    forceChoice=0;
    document.getElementById('step00').style.display = "none";
    document.getElementById('step01').style.display = "none";
    document.getElementById('step02').style.display = "block";
    document.getElementById('step03').style.display = "none";
    document.getElementById('dataContainerOrientation').style.display = "none";
    document.getElementById('dataContainerMotion').style.display = "none";
    document.getElementById('sliderWrapper').style.display = "none";
    }
    else if(clickCount==3){
    forceChoice=0;
    document.getElementById('step00').style.display = "none";
    document.getElementById('step01').style.display = "none";
    document.getElementById('step02').style.display = "none";
    document.getElementById('step03').style.display = "block";
    document.getElementById('dataContainerOrientation').style.display = "none";
    document.getElementById('dataContainerMotion').style.display = "none";
    document.getElementById('sliderWrapper').style.display = "none";
    }
    else if(clickCount==4){
    //throw 
    //socket.emit('throw',{});
    console.log('we are here bitch!');
    document.getElementById('step00').style.display = "none";
    document.getElementById('step01').style.display = "none";
    document.getElementById('step02').style.display = "none";
    document.getElementById('step03').style.display = "none";
    document.getElementById('step04').style.display = "block";
    document.getElementById('dataContainerOrientation').style.display = "none";
    document.getElementById('dataContainerMotion').style.display = "none";
    document.getElementById('sliderWrapper').style.display = "none";
    }
    else if(clickCount==5){
    forceChoice=0;
    //clickCount=0;
    document.getElementById('step00').style.display = "block";
    document.getElementById('step01').style.display = "none";
    document.getElementById('step02').style.display = "none";
    document.getElementById('step03').style.display = "none";
    document.getElementById('step04').style.display = "none";
    document.getElementById('dataContainerOrientation').style.display = "none";
    document.getElementById('dataContainerMotion').style.display = "none";
    document.getElementById('sliderWrapper').style.display = "none";
    }

  }
  function displayShake(){
    console.log('shake');
    forceChoice=1;
    customClick();
  }
  function displaySound(){
    console.log('sound');
    forceChoice=2;
    customClick();
  }
  function displayPrecision(){
    console.log('precision');
    forceChoice=3;
    console.log('forcechoice = ' +forceChoice);
    customClick();
  }

   function precisionForceCount() {
    precisionForce+=1*forceMultiplyFactorTouch;
    console.log('precision Force = ' + precisionForce);
    var distanceInKm= getCurveCustom(precisionForce,betaSent,0);
    //console.log('distance in km with force = ' + distanceInKm);
    force.innerHTML = Math.round(distanceInKm) + " km" ;
    }

  function changeBackground(){
    isButtonForcePressed=true;
    document.body.style.background = "red";
    console.log('change background!!!!');
    console.log('you have clicked');
    precisionForce=0;
    if(forceChoice===3){myLoop=setInterval(function () {precisionForceCount()}, 50);console.log('SET INTERVAL SET INTERVAL SET INTERVAL!!!!!!!');}
  }
  function goThrow(){
    isButtonForcePressed=false;    
    document.body.style.backgroundImage = "url('textures/background.jpg')";
    document.body.style.backgroundSize ="cover";
    document.body.style.backgroundRepeat ="no-repeat";
    console.log('throoooooow!');
    isFlying=true;
    toggleFlyMode();
   if(forceChoice==1){
    socket.emit('send_data_force',{force: higherForce});
    socket.emit('throw',{});
    forceChoice=0;
    }
    else if(forceChoice==2){
    socket.emit('send_data_force',{force: higherVolume});
    socket.emit('throw',{}); 
    forceChoice=0; 
    }
    else if(forceChoice===3){
    clearInterval(myLoop);
    clearTimeout(myLoop);
    console.log('KILL INTERVALLLLLLL KILL INTERVALLLLLLL KITLLLLL INTERVALLLLLLLLLL');
    socket.emit('send_data_force',{force: precisionForce});
    socket.emit('throw',{});
    }
    higherForce=0;
    higherVolume=0;
    precisionForce=0;
    force.innerHTML = "0";
  }

function documentReady() {
	if(navigator.getUserMedia) {
        navigator.getUserMedia({video: false, audio: true}, onSuccess, onError);
	} else if(navigator.webkitGetUserMedia) {
        navigator.webkitGetUserMedia({video: false, audio: true}, onSuccess, onError);
	}
}

function toggleFlyMode(){
    console.log('yay, bitch');
    if(isFlying===true){
        console.log('flight in progress');
        document.body.style.background = "red";
        document.getElementById('step00').style.display = "none";
        document.getElementById('step01').style.display = "none";
        document.getElementById('step02').style.display = "none";
        document.getElementById('step03').style.display = "none";
        document.getElementById('step04').style.display = "none";
        document.getElementById('sliderWrapper').style.display = "block";
    } else if(isFlying===false){
        console.log('not flying');
        document.getElementById('sliderWrapper').style.display = "none";
        document.body.style.backgroundImage = "url('textures/background.jpg')";
        document.body.style.backgroundSize ="cover";
        document.body.style.backgroundRepeat ="no-repeat";
        clickCount=-1;
        customClick();
    }
}

function checkCode(){
    console.log('check code!!!');
    var gameCode = document.getElementById("code").value;
    var name= document.getElementById("name").value;
    console.log('your name is ' + name);
    publicGameCode = gameCode;
    console.log('sending gamecode... ' + gameCode);
    socket.emit('device',{'type':'controller', 'gameCode':gameCode, 'name':name});
}
function sendDebug(){
    console.log('send debug');
    var debugAlpha=10;
    var debugBeta=30;
    var debugForce = 20;
    isFlying=true;
    toggleFlyMode();
    socket.emit('send_data_angle',{alpha:debugAlpha});
    socket.emit('send_data_elevation',{beta:debugBeta});
    socket.emit('send_data_force',{force: debugForce});
    socket.emit('throw',{});
}

//CAMERA CONTROL W/ SLIDER-------------------------
function zoomOut(){
    console.log('zoomout');
    socket.emit('zoomOut',{zoom:'zoomOut'});
}
function stopZoomOut(){
    console.log('stop zoom out');
    socket.emit('stopZoomOut',{});
}
function zoomIn(){
    console.log('zoomIn');
    socket.emit('zoomIn',{zoom:'zoomIn'});
}
function stopZoomIn(){
    console.log('stop zoom in');
    socket.emit('stopZoomIn',{});
}
/////----------------------------------------------
//var distanceInKm= getCurveCustom(force,betaSent,0);
//console.log(distanceInKm);

var getCurveCustom = function (Vo, th, Yo){
      th = (Math.PI/180.0)*th;              // convert to radians
        var Ge = parseFloat(9.81);            // acceleration of gravity -- meters/sec/sec
        var Vx = Vo*Math.cos(th);             // init horizontal velocity
        var Vy = Vo*Math.sin(th);             // init vertical velocity
        var hgt = Yo + Vy*Vy/(2*Ge);          // max height
        if (hgt < 0.0) return;
        var upt = Vy/Ge;                      // time to max height
        var dnt = Math.sqrt(2*hgt/Ge);        // time from max height to impact
        var rng = Vx*(upt + dnt);             // horizontal range at impact
        // flight time to impact, speed at impact
        var imp = upt + dnt;
        var spd = Math.sqrt((Ge*dnt)*(Ge*dnt) + Vx*Vx);
        return rng;
    };


