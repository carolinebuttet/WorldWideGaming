//LOAD CUSTOM FUNCTIONS----------------------------------
function loadScript(url, callback)
{
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onreadystatechange = callback;
    script.onload = callback;
    head.appendChild(script);
}
loadScript('customFunctions.js', init);

/////CODE GOES HERE!!------------------------------------
function init(){
	var viewer = new Cesium.Viewer('cesiumContainer');
	var scene = viewer.scene;
	var clock = viewer.clock;
	var longitudeString;
	var latitudeString;
	var score=0;
	var toleranceKM=600;
	var angle =0;
	var elevation=0;
	var force=0;
	var renensLat =46.54;
	var renensLng = 6.59;
	var renens1 = Cesium.Cartesian3.fromDegrees(renensLng, renensLat);
	var renens2 = Cesium.Cartesian3.fromDegrees(renensLng, renensLat-.2);
	var berlin = new Cesium.Cartesian3.fromDegrees(13.455292,52.493805);
	var compassLine ;
	var centerLat =0;
	var centerLng =0;
	var center = new Cesium.Cartesian3.fromDegrees(centerLng, centerLat, 0);
	var renens = new Cesium.Cartesian3.fromDegrees(renensLng, renensLat, 0);
	var allRenens =[renens, renensLng, renensLat];
	var forceLine;
	var angleLine;
	var canvas = viewer.canvas;
	canvas.setAttribute('tabindex', '0'); // needed to put focus on the canvas
	canvas.onclick = function() {
	    canvas.focus();
	};
	var ellipsoid = scene.globe.ellipsoid;
	
	///TIME
	var handler = new Cesium.ScreenSpaceEventHandler(canvas);
	var start = Cesium.JulianDate.now();
	var stop = Cesium.JulianDate.addHours(start, 1, new Cesium.JulianDate); 
	//var start = Cesium.JulianDate.fromDate(new Date(2015, 2, 25, 16));
	//var stop = Cesium.JulianDate.addSeconds(start, 360, new Cesium.JulianDate());
	//Make sure viewer is at the desired time.
	viewer.clock.startTime = start.clone();
	viewer.clock.stopTime = stop.clone();
	viewer.clock.currentTime = start.clone();
	viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //Loop at the end
	viewer.clock.multiplier = 1;
	//Set timeline to simulation bounds
	viewer.timeline.zoomTo(start, stop);
	// disable the default event handlers
	//scene.screenSpaceCameraController.enableRotate = false;
	//scene.screenSpaceCameraController.enableTranslate = false;
	//scene.screenSpaceCameraControler.enableZoom = false;
	//scene.screenSpaceCameraController.enableTilt = false;
	//scene.screenSpaceCameraController.enableLook = false;
	
	//KEYBOARD
	var flags = {
	    looking : false,
	    moveForward : false,
	    moveBackward : false,
	    moveUp : false,
	    moveDown : false,
	    moveLeft : false,
	    moveRight : false
	};

	document.addEventListener('keydown', function(e) {
	    var flagName = getFlagForKeyCode(e.keyCode);
	    if (typeof flagName !== 'undefined') {
	        flags[flagName] = true;
	    }
	}, false);

	document.addEventListener('keyup', function(e) {
	    var flagName = getFlagForKeyCode(e.keyCode);
	    if (typeof flagName !== 'undefined') {
	        if(flags.elevation){
	        //elevation=0;
	        }
	        if(flags.force){
	        //force=0;
	        }
	        flags[flagName] = false; 
	    }
	}, false);

	setLines(renens1, renens2);
	setReferenceFrame(renensLat, renensLng);
	makeOriginPoint(renens);
	makeOriginPoint(berlin);
	//makePoint(lng,lat);

	//-----------MARKER STUFF-----------------------------------------------------------------------------//
	makePoint(renensLng, renensLat, 'renens');

	var cities =[
        ['Berlin','52.493805', '13.455292'],
        ['London', '51.36', '-00.05'],
        ['Paris','48.50','02.20'],
        ['Budapest','47.29','19.05'],
        ['Vienna','48.12','16.22'],
        ['Prague','50.05','14.22'],
        ['Copenhagen','55.41','12.34'],
        ['Dublin','53.21','-06.15'],
        ['Rome','41.54','12.29'],
        ['Vaduz','47.08','09.31'],
        ['Luxembourg','49.37','06.09' ],
        ['Amsterdam','52.23','04.54'],
        ['Oslo','59.55','10.45'],
        ['Bratislava','48.10','17.07' ],
        ['Ljubljana','46.04','14.33' ],
        ['Madrid','40.25','-03.45' ],
        ['Belgrade','44.50','20.37'],
    ];


	 for (var i = 0; i <cities.length; i++) { 
    	console.log('city');
    	var lngForMarker = cities[i][2];
    	var latForMarker = cities[i][1];
    	var cityNameForMarker = cities[i][0];
    	makePoint(lngForMarker,latForMarker,cityNameForMarker);
	}













	//-----------END OF	MARKER STUFF-----------------------------------------------------------------------------//

	///FUNCTION CREATE POINT---------------------------
	function createPoint(posInit){
	    viewer.entities.add({
	                position : posInit,
	                point : {
	                    pixelSize : 8,
	                    color : Cesium.Color.TRANSPARENT,
	                    outlineColor : Cesium.Color.RED,
	                    outlineWidth : 3
	                }
	            });
	}
	/////----------------------------------------------

	///FUNCTION INTERPOLATE PATH-----------------------
	function interpolatePath( posInit, lat, lng, speed, angleVol, angleSol ){
	    var computedPositions = rotatePoint(posInit,lat,lng, speed, angleVol, angleSol);
	    var entity = viewer.entities.add({
	       
	        //Set the entity availability to the same interval as the simulation time.
	        availability : new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
	            start : start,
	            stop : stop
	        })]),
	        //Use our computed positions
	        position : computedPositions,
	        //Automatically compute orientation based on position movement.
	        orientation : new Cesium.VelocityOrientationProperty(computedPositions),
	        //Load the Cesium plane model to represent the entity
	        model : {
	            uri : 'test.gltf',
	            minimumPixelSize : 24,
	            size:.8
	        },
	        //Show the path as a yellow line sampled in 1 second increments.
	        path : {
	            resolution : 1,
	            material : new Cesium.PolylineGlowMaterialProperty({
	                glowPower : 0.1,
	                color : Cesium.Color.YELLOW
	            }),
	            width : 10
	        }
	    });
	    entity.position.setInterpolationOptions({
	            interpolationDegree : 2,
	            interpolationAlgorithm : Cesium.HermitePolynomialApproximation
	        });
	}
	/////----------------------------------------------
	
	///FUNCTION SET REFERENCE FRAME--------------------
	function setReferenceFrame(lat, lng) {
	    var center = Cesium.Cartesian3.fromDegrees(lng, lat);
	    var transform = Cesium.Transforms.eastNorthUpToFixedFrame(center);
	    // View in east-north-up frame
	    var camera = viewer.camera;
	    //camera.constrainedAxis = Cesium.Cartesian3.UNIT_Z;
	    //camera.lookAtTransform(transform, new Cesium.Cartesian3(120000.0, 120000.0, 60000.0));
	    camera.lookAtTransform(transform, new Cesium.HeadingPitchRange(Cesium.Math.toRadians(0), Cesium.Math.toRadians(-15), 120000));
	    // Show reference frame.  Not required.
	    scene.primitives.add(new Cesium.DebugModelMatrixPrimitive({
	        modelMatrix : transform,
	        length : 100000.0
	    }));
	}
	/////----------------------------------------------

	///FUNCTION SET LINES------------------------------
	function setLines(posInit1, posInit2){
	    compassLine = viewer.entities.add({
	    name : 'Compas Line',
	    polyline : {
	        positions : [posInit1,posInit2],
	        width : 10,
	        material : new Cesium.PolylineGlowMaterialProperty({
	            glowPower : 0.2,
	            color : Cesium.Color.BLUE
	        })
	    }
	    });
	    forceLine = viewer.entities.add({
	    name : 'Force Line',
	    polyline : {
	        positions : [posInit1,posInit2],
	        width : 12,
	        material : new Cesium.PolylineGlowMaterialProperty({
	            glowPower : 0.1,
	            color : Cesium.Color.YELLOW
	        })
	    }
	    });
	    angleLine = viewer.entities.add({
	    name : 'angle de jet Line',
	    polyline : {
	        positions : [posInit1,posInit2],
	        width : 25,
	        material : new Cesium.PolylineGlowMaterialProperty({
	            glowPower : 0.1,
	            color : Cesium.Color.WHITE
	        })
	    }
	    });
	}
	/////----------------------------------------------

	///FUNCTION ROTATE LINES---------------------------
	function rotateLines(polylineCustom, posInit1, posInit2, angleSol, forward){
	    var pointToRotate = polylineCustom.polyline.positions.getValue(viewer.clock.currentTime);
	    var q = pointToRotate[1];
	    if(forward){var rotationQuaternion = Cesium.Quaternion.fromAxisAngle(posInit1, Cesium.Math.toRadians(1));}
	    else{var rotationQuaternion = Cesium.Quaternion.fromAxisAngle(posInit1, Cesium.Math.toRadians(-1));}
	    var matrixRotation = Cesium.Matrix3.fromQuaternion(rotationQuaternion);
	    var rotated = Cesium.Matrix3.multiplyByVector(matrixRotation, q, new Cesium.Cartesian3());
	    polylineCustom.polyline.positions = [posInit1, rotated];
	    return rotated;
	}
	/////----------------------------------------------

	///FUNCTION GET KEYCODE----------------------------
	function getFlagForKeyCode(keyCode) {
	    switch (keyCode) {
	    case 'D'.charCodeAt(0):
	        return 'rotateRight';
	    case 'A'.charCodeAt(0):
	        return 'rotateLeft';
	    case 'W'.charCodeAt(0):
	        return 'elevation';
	    case 'Q'.charCodeAt(0):
	        return 'force';
	    case 'Y'.charCodeAt(0):
	        return 'throw';
	    case 'B'.charCodeAt(0):
	    	return 'bxl';
	    case 'L'.charCodeAt(0):
	    	return 'lsn';
	    default:
	        return undefined;
	    }
	}
	/////----------------------------------------------

	///FUNCTION KEYBOARD MOVEMENTS----------------------
	viewer.clock.onTick.addEventListener(function(clock) {
	    var camera = viewer.camera;
	    updateValues();
	    if (flags.looking) {
	        var width = canvas.clientWidth;
	        var height = canvas.clientHeight;
	        var lookFactor = 0.05;
	    }

	    // Change movement speed based on the distance of the camera to the surface of the ellipsoid.
	    var cameraHeight = ellipsoid.cartesianToCartographic(camera.position).height;

	    if (flags.rotateLeft) {
	        camera.rotateLeft(Cesium.Math.toRadians(1));
	        angle--;
	        if(angle ==0){angle =360;}
	        console.log("angle = " + angle);
	        //rotateLines(forceLine,renens1, renens2, angle, false);
	        rotateLines(compassLine,renens1, renens2, angle, false);
	        rotateLines(angleLine,renens1, renens2, angle, false);


	    }
	    if (flags.rotateRight) {
	        camera.rotateRight(Cesium.Math.toRadians(1));
	        angle++;
	        if(angle ==360){angle =0;}
	        rotateLines(forceLine,renens1, renens2, angle, true);
	        //rotateLines(compassLine,renens1, renens2, angle, true);

	        //rotateLines(forceLine,renens1, renens2, angle, true);
	        rotateLines(compassLine,renens1, renens2, angle, true);
	        rotateLines(angleLine,renens1, renens2, angle, true);
	        console.log("angle = " + angle);

	    }
	    if(flags.elevation){
	        if(elevation<89){
	            elevation ++;
	        }
	        updateElevation(angleLine);
	        console.log('elevation= ' + elevation);
	    }
	    if(flags.force){
	        if(force<300){
	            force++;
	        }
	        //updateForce(forceLine);
	        console.log('force = ' + force);
	    }
	    if(flags.throw){
	        throwBullet();
	    }
	    if(flags.bxl){
	    	console.log('BXLLLL');
	    	setReferenceFrame(50,4);
	    }
	    if(flags.lsn){
	    	console.log('LOOOZZZZZ');
	    	setReferenceFrame(renensLat, renensLng);
	    }
	});
	/////----------------------------------------------

	///FUNCTION UPDATE ELEVATION-----------------------
	function updateElevation(polylineCustom){
	    console.log('update elelvation!');
	    var coordinates = polylineCustom.polyline.positions.getValue(viewer.clock.currentTime);
	    var pointToRotate = coordinates[1];
	    var elevated = new Cesium.Cartesian3(pointToRotate.x, pointToRotate.y, pointToRotate.z+100);
	    polylineCustom.polyline.positions = [renens1, elevated];
	}
	/////----------------------------------------------

	///FUNCTION UPDATE FORCE-----------------------
	function updateForce (polylineCustom){
	    //update force!
	    console.log('update force');
	    var distances = turnDistancesIntoLatLng(0,force*5, renensLat, renensLng);
	    //var distances = calculatePoints( force*5,angle);
	    var newLat = distances[0];
	    var newLng = distances[1];
	    var newPoint = Cesium.Cartesian3.fromDegrees(newLng, newLat);
	    forceLine.polyline.positions = [renens1, newPoint];
	    //console.log ('new force line position = ' + forceLine.polyline.positions);

	}
	/////----------------------------------------------

	////////////UPDATE VALUES--------------------------
	function updateValues(){
	    document.getElementById("force").innerHTML = force;
	    document.getElementById("angle").innerHTML = angle;
	    document.getElementById("elevation").innerHTML = elevation;
	}
	/////----------------------------------------------

	///FUNCTION THROW BULLET---------------------------
	function throwBullet(){
	    if(force>0 && elevation>0){interpolatePath(renens, renensLat, renensLng, force*4, elevation,angle+180); console.log('THROW!!!!!!!!');}
	    force=0;
	    elevation=0;
	}
	/////----------------------------------------------

	///FUNCTION MAKE POINT---------------------------
	function makePoint(lng,lat, cityName){
	    var pointPosition = new Cesium.Cartesian3.fromDegrees(lng,lat) ;
	    var centralPoint = viewer.entities.add({
	      name : cityName,
	      position : pointPosition,
	      billboard :{
                image : 'data/marker.png',
                verticalOrigin : Cesium.VerticalOrigin.BOTTOM
          }
	    });
	}
	/////----------------------------------------------

	///FUNCTION MAKE ORINIG POINT----------------------
	function makeOriginPoint(location){
	     var centralPoint = viewer.entities.add({
	      name : 'Central Point',
	      position : location,
	      point : {
	        pixelSize : 15,
	        color : Cesium.Color.RED,
	        outlineColor : Cesium.Color.WHITE,
	        outlineWidth : 2
	      }
	    });  
	}
	/////----------------------------------------------

	///FUNCTION COMPUTE DISTANCE-----------------------
	function computeDistance(location1, location2){
	    var distanceKM = Cesium.Cartesian3.distance(location1, location2)/1000;
	    var redLine = viewer.entities.add({
	    name : 'distanceLine',
	    polyline : {
	        positions : [location1, location2],
	        width : 1,
	        material : Cesium.Color.AQUA
	    }
	});
	}
	/////----------------------------------------------

	///COMPUTE DISTANCE TO TARGET----------------------
	function computeDistanceToTarget(location1, location2){
	    var distanceKM = Cesium.Cartesian3.distance(location1, location2)/1000;
	    if(distanceKM <toleranceKM){
	    var scoreToAdd= Math.round(mapValue(distanceKM,0,toleranceKM,100,0));
	    }else{scoreToAdd=0;}
	    score+=scoreToAdd;
	    console.log('distance in km to target= ' + distanceKM);
	    console.log('you scored : ' + scoreToAdd);
	    console.log('total score : ' + score);
	    document.getElementById("score").innerHTML = score;
	    var redLine = viewer.entities.add({
	    name : 'distanceLine',
	    polyline : {
	        positions : [location1, location2],
	        width : 1,
	        material : Cesium.Color.WHITE
	    	}
		});
	}
	/////----------------------------------------------

	///CUSTOM FUNCTION TO CALCULATE--------------------
    var getCurve = function (Vo, th, Yo){
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

        //console.log("horizontal distance = " + rng);
        //console.log("max height = " + hgt);
        //console.log("time = " +imp);
        //console.log("speed at impact = " + spd);
        return[rng, hgt, imp,spd];
    }
    /////----------------------------------------------

    //FUNCTION GET ARRIVAL POINT-----------------------
    function getArrivalPoint(posInit,lat, lng, speed, angle){
    var curveResults= getCurve(speed,angle,0);
    var height = curveResults[1];
    var horizontalDistance = curveResults[0];
    console.log("height = "+height);
    console.log("horizontal distance =" + horizontalDistance);
    var computedDistances = turnDistancesIntoLatLng(horizontalDistance,0,lat,lng);
    var customLat = computedDistances[0];
    var customLng = computedDistances[1];

    var arrival = new Cesium.Cartesian3.fromDegrees(customLng, customLat, 0);
    console.log('arrival = ' + arrival);
    return arrival;
    }
    /////----------------------------------------------
    
    //FUNCTION GET MIDWAY POINT------------------------
    function getMidWayPoint(posInit,lat, lng, speed, angle){
        var curveResults= getCurve(speed,angle,0);
        var height = curveResults[1];
        var midHorizontalDistance = curveResults[0]/2;
        console.log("height = "+height);
        console.log("midHorizontalDistance =" + midHorizontalDistance);
        var computedDistances = turnDistancesIntoLatLng(midHorizontalDistance,0,lat,lng);
        var customLat = computedDistances[0];
        var customLng = computedDistances[1];
        var midWay = new Cesium.Cartesian3.fromDegrees(customLng, customLat, height*1000);
        return midWay;
    }
    /////----------------------------------------------

    /////FUNCTION CALCULATE POINT----------------------
    var calculatePoints = function ( radius, orientation){
      var latLng;
      var x;
      var y;
        
      if(orientation>=0 && orientation<=90){
        // first quarter
        x = Math.cos(Cesium.Math.toRadians(90-orientation))*radius;
        y = Math.sin(Cesium.Math.toRadians(90-orientation))*radius;
      }
      else if(orientation>90 && orientation <=180){
        //second quarter
        x = Math.cos(Cesium.Math.toRadians(orientation-90))*radius;
        y = - Math.sin(Cesium.Math.toRadians(orientation-90))*radius;
      }
      else if(orientation >180 && orientation <=270){
        //third quarter
        x = -Math.sin(Cesium.Math.toRadians(orientation-180))*radius;
        y = -Math.cos(Cesium.Math.toRadians(orientation-180))*radius;
      }
      else if(orientation >270 && orientation <=360){
        //fourth quarter
        x = -Math.sin(Cesium.Math.toRadians(360-orientation))*radius;
        y = Math.cos(Cesium.Math.toRadians(360-orientation))*radius;
      }
      var  computedLng = mapValue(x,-20037,20037, -180,180);
        //normalement computedLat = map entre -90 et 90
      var computedLat = mapValue(y, -20037,20037,-180,180);
      var latLng = new Cesium.Cartesian3.fromDegrees(computedLng,computedLat);
      console.log("LAT = " + computedLat);
      console.log("LONG = " + computedLng);
      return  [latLng, computedLng, computedLat] ;
      
    }
    /////----------------------------------------------

    //////TURN DISTANCES INTO LATLNG WITH ANGLE---------------------
    var calculatePoints = function ( radius, orientation){
      var latLng;
      var x;
      var y;
        
      if(orientation>=0 && orientation<=90){
        // first quarter
        x = Math.cos(Cesium.Math.toRadians(90-orientation))*radius;
        y = Math.sin(Cesium.Math.toRadians(90-orientation))*radius;
      }
      else if(orientation>90 && orientation <=180){
        //second quarter
        x = Math.cos(Cesium.Math.toRadians(orientation-90))*radius;
        y = - Math.sin(Cesium.Math.toRadians(orientation-90))*radius;
      }
      else if(orientation >180 && orientation <=270){
        //third quarter
        x = -Math.sin(Cesium.Math.toRadians(orientation-180))*radius;
        y = -Math.cos(Cesium.Math.toRadians(orientation-180))*radius;
      }
      else if(orientation >270 && orientation <=360){
        //fourth quarter
        x = -Math.sin(Cesium.Math.toRadians(360-orientation))*radius;
        y = Math.cos(Cesium.Math.toRadians(360-orientation))*radius;
      }
      var  computedLng = mapValue(x,-20037,20037, -180,180);
        //normalement computedLat = map entre -90 et 90
      var computedLat = mapValue(y, -20037,20037,-180,180);
      var latLng = new Cesium.Cartesian3.fromDegrees(computedLng,computedLat);
      console.log("LAT = " + computedLat);
      console.log("LONG = " + computedLng);
      return  [latLng, computedLng, computedLat] ;
      
    }
	/////----------------------------------------------

	////////TURN DISTANCES INTO LATLNG------------------------------
    var turnDistancesIntoLatLng = function (distX, distY,lat,lng){
        var distX = mapValue(distX,-20037,20037, -180,180)+lat;
        var distY = mapValue(distY, -20037,20037,-90,90)+lng;
        //console.log("dist X = " + distX+" dist Y = " + distY);
        //console.log('lng de base = ' + lng + 'lat de base = '+ lat);
        return [distX, distY];
    }
	/////----------------------------------------------

	////////MAP VALUE-----------------------------------------------
    function mapValue(value, low1, high1, low2, high2) {
      //example : map_range(-1, 0, 1, 0, 100) returns -100.
        return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
    }
	/////----------------------------------------------

	////FUNCTION CHECK THROW---------------------------
	function checkThrow(posInit, lat, lng){
	    createPoint(posInit);
	    getMidWayPoint(posInit,lat, lng, 100 ,45);
	    getArrivalPoint(posInit,lat, lng, 100,45);
	    getMidWayPoint(posInit, lat, lng,100 ,25);
	    getArrivalPoint(posInit,lat, lng, 100,25);
	    getMidWayPoint(posInit,lat, lng, 100 ,65);
	    getArrivalPoint(posInit,lat, lng, 100,65);
	}
	/////----------------------------------------------

	//FUNCTION ROTATEPOINT-----------------------------
	function rotatePoint(posInit,lat,lng, speed, angleElev, angleSol){
	    var p = getMidWayPoint(posInit,lat,lng, speed,angleElev);
	    var q = getArrivalPoint(posInit,lat,lng, speed,angleElev);
	    //rotate around custom axis
	    var rotationQuaternion = Cesium.Quaternion.fromAxisAngle(posInit, Cesium.Math.toRadians(angleSol));
	    var matrixRotation = Cesium.Matrix3.fromQuaternion(rotationQuaternion);
	    //var rotated = Cesium.Matrix3.multiplyByVector(m, p, new Cesium.Cartesian3());
	    var rotated = Cesium.Matrix3.multiplyByVector(matrixRotation, p, new Cesium.Cartesian3());
	    var arrivalRotated = Cesium.Matrix3.multiplyByVector(matrixRotation, q, new Cesium.Cartesian3());
	    //property stuff
	    var curveResults= getCurve(speed,angleElev,0);
	    var timeArrival =curveResults[2];
	    var timeHalfway = timeArrival/2
	    var property = new Cesium.SampledPositionProperty();
	    var departureTime = Cesium.JulianDate.addSeconds(viewer.clock.currentTime, 0, new Cesium.JulianDate());
	    var departurePosition = posInit;
	    property.addSample(departureTime, departurePosition);
	    var halfWayTime = Cesium.JulianDate.addSeconds(viewer.clock.currentTime, timeHalfway, new Cesium.JulianDate());
	    var halfWayPosition = rotated;
	    property.addSample(halfWayTime, halfWayPosition);
	    var arrivalTime = Cesium.JulianDate.addSeconds(viewer.clock.currentTime, timeArrival, new Cesium.JulianDate());
	    var arrivalPosition = arrivalRotated;
	    ///GET THE STATIC MAP
	    var cartographic = ellipsoid.cartesianToCartographic(arrivalPosition);
	    var longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(2);
        var latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(2);
        console.log(longitudeString + ' ' + latitudeString);
        var url = 'http://dev.virtualearth.net/REST/v1/Imagery/Map/Aerial/'+latitudeString+','+longitudeString+'/15?mapSize=300,200&key=AvRFjXkotEcTdjuZLdPtg2JqWv3yKtMLkBeQnQvQ7nERmEWpdpxqP9itXTf55Yb9';
	    console.log(url);
	    document.getElementById("staticImg").src=url;
	    property.addSample(arrivalTime, arrivalPosition);
	    computeDistance(renens, arrivalPosition);
	    computeDistanceToTarget(berlin, arrivalPosition);
	    return property;
	}
	/////----------------------------------------------


}

