jQuery(function($){    
    'use strict';

var IO = {
        init: function() {
        	IO.socket = io.connect();
            IO.bindEvents();
            console.log('io.init!');
        },
        bindEvents : function() {
            IO.socket.on('connected', IO.onConnected );
            IO.socket.on('newGameCreated', IO.onNewGameCreated );
            IO.socket.on('playerJoinedRoom', IO.playerJoinedRoom );
            IO.socket.on('browserJoinedRoom',IO.browserJoinedRoom);
            IO.socket.on('beginNewGame', IO.beginNewGame );
            IO.socket.on('gameIsOver', IO.gameOver);
            IO.socket.on('error', IO.error );
            IO.socket.on('hostGetDataForce',IO.onDataForce);
            IO.socket.on('hostGetDataAngle', IO.onDataAngle);
            IO.socket.on('hostGetDataElev', IO.onDataElevation);
            IO.socket.on('hostGetThrow',IO.onThrow);
            IO.socket.on('ball_has_arrived',IO.onBallHasArrived);
            IO.socket.on('hostZoomIn',IO.onZoomIn);
            IO.socket.on('hostZoomOut',IO.onZoomOut);
            IO.socket.on('hostStopZoomIn',IO.onStopZoomIn);
            IO.socket.on('hostStopZoomOut',IO.onStopZoomOut);
            IO.socket.on('pickedCities',IO.onPickedCities);
            IO.socket.on('playersLocations',IO.onPlayerLocations);
            IO.socket.on('changeTurn',IO.onChangeTurn);
            IO.socket.on('updateScore', IO.onUpdateScore);
        },
        onConnected : function() {
            console.log('new connection, socket is');
            console.log(IO.socket);
            App.mySocketId = IO.socket.id;
            console.log('my socket id is = ' + App.mySocketId);
        },
        onNewGameCreated : function(data) {
            console.log('new game is created');
            console.log('data is:');
            console.log(data);
            App.Host.gameInit(data);
        },
        playerJoinedRoom : function(data) {
            console.log('a player joined!!!');
            App[App.myRole].updateWaitingScreen(data);
        },
        onPlayerLocations : function(data) {
            console.log('got the locations here!!');
            console.log(data);
            App.Host.playersWithPositions.push(data);
            console.log('players with positions is now');
            console.log(App.Host.playersWithPositions);
            if(App.Host.playersWithPositions.length===2){
                console.log('geolocation complete. we can init the cesium with the players positions.');
                if(App.myRole==='Host'){
                    console.log('I am a host and I will start cesium');
                    console.log(App.Host.playersWithPositions);
                    App.Host.playerLng = App.Host.playersWithPositions[0].playerLng;
                    App.Host.playerLat = App.Host.playersWithPositions[0].playerLat;
                    console.log(App.Host.playerLng);
                    console.log(App.Host.playerLat);
                    App.Host.cesiumInit();
                }
            }else{
                console.log('waiting for other player position');
            }
        },
        onChangeTurn : function(data){
        	console.log('change turns!!!');
        	console.log(data);
        	if(App.myRole==='Player'&& data.mySocketId ===App.mySocketId){
        		console.log('IT IS MY TURN');
        		document.getElementById('myTurn').style.display = "block";
        	}else if(App.myRole==='Player' && data.mySocketId != App.mySocketId){
        		console.log('ITS NOT MY TURN!!!');
        		document.getElementById('myTurn').style.display = "none";
        	}
        },
        onUpdateScore:function(data){
        	console.log('update score!');
        	if(App.myRole==='Player' && data.mySocketId===App.mySocketId){
        		console.log('I should update my socre!');
        		App.Player.updateScore(data);
        	}
        },
        browserJoinedRoom : function(data) {
            console.log('a browser joined!!!');
            console.log('I am actually a ' + App.myRole);
            //App[App.myRole].updateWaitingScreen(data);
            if(App.myRole ==='Host'){
                App.Host.addNewHost();
            }
        },
        beginNewGame : function(data) {
            App[App.myRole].gameStart();
            App[App.myRole].customInit();
        },
        gameOver : function(data) {
            App[App.myRole].endGame(data);

        },
        error : function(data) {
            alert(data.message);
        },
        onDataForce:function(data){
            if(App.myRole==='Host' && data.mySocketId === App.whosPlayerTurn){
                //console.log('I listen to you');
                App.Host.rotateCamera=false;
                App.HostupdateElev=false;
                App.Host.force = data.force;
            }else{
            }
        },
        onDataElevation:function(data){
            if(App.myRole==='Host' && data.mySocketId === App.whosPlayerTurn){
                console.log('I listen to you');
                App.Host.rotateCamera=false;
                App.Host.updateElev=true;
                App.Host.oldMobileBeta= App.Host.mobileBeta;
                App.Host.mobileBeta= data.beta;
                App.Host.elevation=App.Host.mobileBeta;
            }else{
            } 
        },
        onDataAngle:function(data){
           if(App.myRole==='Host' && data.mySocketId === App.whosPlayerTurn){
                App.Host.rotateCamera=true;
                App.Host.updateElev=true;
                App.Host.oldMobileAlpha=App.Host.mobileAlpha;
                App.Host.mobileAlpha = data.alpha;
                App.Host.angle = App.Host.mobileAlpha;
            }else{
            }
        },
        onThrow:function(data){
            if(App.myRole==='Host' && data.mySocketId === App.whosPlayerTurn){
                console.log('I listen to you');
                App.Host.throwGo=true;
            }else{
            }
        },
        onZoomIn:function(data){
            if(App.myRole==='Host' && data.mySocketId === App.whosPlayerTurn){
                console.log('I listen to you');
                App.Host.isForward=true;
            }else{
            }
        },
        onZoomOut:function(data){
            if(App.myRole==='Host' && data.mySocketId === App.whosPlayerTurn){
                console.log('I listen to you');
                App.Host.isBackward=true;
            }else{
            }
        },
        onStopZoomIn:function(data){
            if(App.myRole==='Host' && data.mySocketId === App.whosPlayerTurn){
                console.log('I listen to you');
                App.Host.isForward=false;
            }else{
            }
        },
        onStopZoomOut:function(data){
            if(App.myRole==='Host' && data.mySocketId === App.whosPlayerTurn){
                console.log('I listen to you');
                App.Host.isBackward=false;
            }else{
            }
        },
        onBallHasArrived:function(data){
            if(App.myRole==='Player' && data.mySocketId == App.mySocketId ){
            console.log('ball has arrived for me ! Update mbile phone!');
            App.Player.isFlying=false;
            App.Player.toggleFlyMode();
            }
        },
        onPickedCities:function(data){
            console.log('got the picked cities');
            console.log(data);
            App.Host.cities=data;
            console.log(App.Host.cities);
        }
};

var App={
        gameId: 0,
        myRole: '',
        mySocketId: '',
        currentRound: 0,
        playerTurn: 0,
        whosPlayerTurn:[],

        /* *************************************
         *                Setup                *
         * *********************************** */
        init: function () {
            console.log('app.init!');
            App.cacheElements();
            App.showInitScreen();
            App.bindEvents();
        },

         //Create references to on-screen elements used throughout the game.
        cacheElements: function () {
            App.$doc = $(document);
            // Templates
            App.$gameArea = $('#gameArea');
            App.$templateIntroScreen = $('#intro-screen-template').html();
            App.$templateNewGame = $('#create-game-template').html();
            App.$templateJoinGame = $('#join-game-template').html();
            App.$hostGame = $('#host-game-template').html();
            App.$playerGame = $('#player-game-template').html();
            App.$templateJoinGameAsBrowser= $('#join-game-as-browser-template').html();
        },

        bindEvents: function () {
            // Host
            App.$doc.on('click', '#btnCreateGame', App.Host.onCreateClick);
            // Player
            App.$doc.on('click', '#btnJoinGameController', App.Player.onJoinClick);
            App.$doc.on('click', '#btnJoinGameBrowser', App.Host.onJoinClick);
            App.$doc.on('click', '#btnStart',App.Player.onPlayerStartClick);
            App.$doc.on('click', '#btnStartAsBrowser',App.Host.onHostStartClick);
            App.$doc.on('click', '#btnPlayerRestart', App.Player.onPlayerRestart);
            App.$doc.on('click', '#step00, #step01, #step02', App.Player.customClick);
            App.$doc.on('mousedown touchstart','#step04', App.Player.changeBackground);
            App.$doc.on('mouseup touchend', '#step04', App.Player.goThrow);
            //App.$doc.on('click', '#shake', App.Player.displayShake);
            //App.$doc.on('click', '#sound', App.Player.displaySound);
            App.$doc.on('click', '#precision', App.Player.displayPrecision);
            App.$doc.on('mousedown touchstart','#plus', App.Player.zoomIn);
            App.$doc.on('mouseup touchend','#plus', App.Player.stopZoomIn);
            App.$doc.on('mousedown touchstart','#minus', App.Player.zoomOut);
            App.$doc.on('click','#escapeZoom', App.Player.escapeZoom);
            App.$doc.on('mouseup touchend','#minus', App.Player.stopZoomOut);
            App.$doc.on('click','#debug', App.Player.sendDebug);

        },


        /* *************************************
         *             Game Logic              *
         * *********************************** */

        showInitScreen: function() {
            App.$gameArea.html(App.$templateIntroScreen);
        },

        /* *******************************
           *     HOST CODE  (CESIUM)     *
           ******************************* */
        Host : {
            players : [],
            playersWithPositions:[],
            isNewGame : false,
            numPlayersInRoom: 0,
            numBrowsersInRoom:0,
            shootCount:0,
            targetCount:0,
			//all other vars
            angle:0,
            elevation:0,
            force:0,
            mobileAlpha:0,
            mobileBeta:0,
            mobileAbsAlpha:0,
            oldMobileAbsAlpha:0,
            oldMobileAlpha:0,
            oldMobileBeta:0,
            camRange:0,
            rotateCamera:false,
            updateElev:false,
            throwGo:false,
            playerLng:0,
            playerLat:0,
            isGeolocated:false,
            isForward:false,
            isBackward:false,
            zoomCount:0,
            cities:[],
            //////////////////
            onCreateClick: function () {
                console.log('create new game and room!!!!');
                IO.socket.emit('hostCreateNewGame');
                App.Host.numBrowsersInRoom++;
            },
            onJoinClick: function () {
                console.log('Join game!!!');
                App.$gameArea.html(App.$templateJoinGameAsBrowser);
            },
            gameInit: function (data) {
                App.gameId = data.gameId.toString();
                console.log('app game id is : ' + App.gameId);
                App.mySocketId = data.mySocketId;
                App.myRole = 'Host';
                App.Host.numPlayersInRoom = 0;
                App.Host.displayNewGameScreen();
                console.log("Game started with ID: " + App.gameId + ' by host: ' + App.mySocketId);
            },
            onHostStartClick: function() {
                var data = {
                    gameId : +($('#inputGameId').val()),
                };
                IO.socket.emit('browserJoinGame', data);
                App.myRole = 'Host';
            },
            displayNewGameScreen : function() {
            	console.log('displaynewgame!!!');
                App.$gameArea.html(App.$templateNewGame);
                $('#gameURL').text(window.location.href);
                $('#spanNewGameCode').text(App.gameId);
            },
            updateWaitingScreen: function(data) {
                // If this is a restarted game, show the screen.
                console.log('update waiting screen!');
                if ( App.Host.isNewGame ) {
                    App.Host.displayNewGameScreen();
                }
                $('#playersWaiting')
                    .append('<p/>')
                    .text('Player ' + data.playerName + ' joined the game.');
                //geolocation here!

                App.Host.players.push(data);
                App.Host.numPlayersInRoom += 1;
                if (App.Host.numPlayersInRoom === 2 && App.Host.numBrowsersInRoom===2) {
                    console.log('Room is full. Almost ready!');
                    IO.socket.emit('hostRoomFull',App.gameId);
                    console.log('it is the turn of ' + App.Host.players[App.playerTurn].mySocketId);
                    //set the turn
                    console.log('players are...');
                    console.log(App.Host.players);
                    App.whosPlayerTurn = App.Host.players[App.playerTurn].mySocketId;
                }
            },
            addNewHost:function(){
                console.log('add new host!');
                 $('#playersWaiting')
                    .append('<p/>')
                    .text('an other browser joined the game');
                App.Host.numBrowsersInRoom += 1;
                if (App.Host.numPlayersInRoom === 2 && App.Host.numBrowsersInRoom===2) {
                    console.log('Room is full. Almost ready!');
                    IO.socket.emit('hostRoomFull',App.gameId);
                    console.log('it is the turn of ' + App.Host.players[App.playerTurn].mySocketId);
                    //set the turn
                    console.log('players are...');
                    console.log(App.Host.players);
                    App.whosPlayerTurn = App.Host.players[App.playerTurn].mySocketId;
                }
            },

            gameStart: function(){
                console.log('start game as host!!');
                App.$gameArea.html(App.$hostGame);
                ///SCORE STUFFZ
                $('#player1Score')
                    .find('.playerName')
                    .html(App.Host.players[0].playerName);
                $('#player2Score')
                    .find('.playerName')
                    .html(App.Host.players[1].playerName);
                $('#player1Score').find('.score').attr('id',App.Host.players[0].mySocketId);
                $('#player2Score').find('.score').attr('id',App.Host.players[1].mySocketId);
                //--------------
                console.log('got the scores right!');
            },

            endGame : function(data) {
               console.log('Game is over for HOST');
                var $p1 = $('#player1Score');
                var p1Score = +$p1.find('.score').text();
                var p1Name = $p1.find('.playerName').text();
                var $p2 = $('#player2Score');
                var p2Score = +$p2.find('.score').text();
                var p2Name = $p2.find('.playerName').text();
                var winner = (p1Score < p2Score) ? p2Name : p1Name;
                var tie = (p1Score === p2Score);
                if(tie){
                    $('#hostWord').text("It's a Tie!");
                } else {
                    $('#hostWord').text( winner + ' Wins!!' );
                }
                App.Host.numPlayersInRoom = 0;
                App.Host.isNewGame = true;
            },
            restartGame : function() {
                App.$gameArea.html(App.$templateNewGame);
                $('#spanNewGameCode').text(App.gameId);
            },
            //CESIUM-CODE-----------------------------------------------------------------------
            customInit: function(){
                console.log('setting the turns for all hosts...');
                App.whosPlayerTurn = App.Host.players[App.playerTurn].mySocketId;
                console.log('players are...');
                console.log(App.Host.players);
                console.log('waiting for the geolocation of players to begin...');
            },
            cesiumInit:function(){
                ///-----------------------------------------------------------------------------
                var viewer = new Cesium.Viewer('cesiumContainer');
                var scene = viewer.scene;
                var clock = viewer.clock;
                var entities = viewer.entities;
                var camera = viewer.camera;
                var countCam=0;
                var cameraPosInit;
                var transform;
                //SCORE & TARGETS----------
                var score=0;
                var numberOfShoots=3;
                var numberOfTargets=3;
                //-------------------------
                var toleranceKM=600;
                var playerPosition = new Cesium.Cartesian3.fromDegrees(App.Host.playerLng,App.Host.playerLat,0);
                var test = [[0],[1]];
                var targetCollection = [['Berlin','52.493805', '13.455292'],['London', '51.36', '00.05'],['Paris','48.50','02.20'],['Reykjavik','64.10','-21.57'],['Budapest','47.29','19.05']];
                var targetName='';
                var targetLat=0;
                var targetLng=0;
                var targetPosition=0;
                var shootCount=0;
                var targetCount=-1;
                var isFlying=false;
                var canvas = viewer.canvas;
                canvas.setAttribute('tabindex', '0'); // needed to put focus on the canvas
                var ellipsoid = viewer.scene.globe.ellipsoid;
                //NEW POLYLINES--------
                var primitives = scene.primitives;
                var polylines = new Cesium.PolylineCollection();
                primitives.add(polylines);
                var polylineElevation;
                var positionElevation1;
                var positionElevation2;
                var positionElevationCartesian1;
                var positionElevationCartesian2;
                var positionsElevation;
                var polylineOrientation;
                var polylineLength;
                var polylineLengthOrientation;
                var positionOrientation1;
                var positionOrientation2;
                var positionOrientationCartesian1;
                var positionOrientationCartesian2;
                var positionsOrientation;
                //--------------------
                //COLOR TESTS---------
                var player1Color = Cesium.Color.RED;
                var player2Color = Cesium.Color.BLUE;
                var targetColor = Cesium.Color.YELLOW;
                //--------------------
                ///TIME
                var start = Cesium.JulianDate.now();
                var stop = Cesium.JulianDate.addHours(start, 1, new Cesium.JulianDate()); 
                var publicArrivalTime = new Cesium.JulianDate();
                var waitingSecondsOnTarget=2;
                //Make sure viewer is at the desired time.
                viewer.clock.startTime = start.clone();
                viewer.clock.stopTime = stop.clone();
                viewer.clock.currentTime = start.clone();
                viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //Loop at the end
                viewer.clock.multiplier = 1;
                //Set timeline to simulation bounds
                viewer.timeline.zoomTo(start, stop);
                // disable the default event handlers
                scene.screenSpaceCameraController.enableRotate = false;
                scene.screenSpaceCameraController.enableTranslate = false;
                //scene.screenSpaceCameraControler.enableZoom = false;
                scene.screenSpaceCameraController.enableTilt = false;
                scene.screenSpaceCameraController.enableLook = false;
                console.log('readytoplay');
                switchPlayers();
                setLines(App.Host.playerLat, App.Host.playerLng);
                setReferenceFrame(App.Host.playerLat, App.Host.playerLng);
                makeOriginPoint(playerPosition, player1Color);
				//make point for otherplayers as well
				//App.Host.playerLat = App.Host.playersWithPositions[App.playerTurn].playerLat;
		        //App.Host.playerLng = App.Host.playersWithPositions[App.playerTurn].playerLng;
				//playerPosition = new Cesium.Cartesian3.fromDegrees(App.Host.playerLng,App.Host.playerLat,0);
				//playerPosition = new Cesium.Cartesian3.fromDegrees(App.Host.playersWithPositions[App.playerTurn].playerLng, App.Host.playersWithPositions[App.playerTurn].playerLat,0);
                makeOriginPoint((Cesium.Cartesian3.fromDegrees(App.Host.playersWithPositions[1-App.playerTurn].playerLng, App.Host.playersWithPositions[1-App.playerTurn].playerLat,0)),player2Color);
                changeTarget();   
                makeOriginPoint(targetPosition, targetColor);

                ///FUNCTION INTERPOLATE PATH-----------------------
                function interpolatePath( posInit, lat, lng, speed, angleVol, angleSol ){
                    console.log('interpolate path...');
                    var computedPositions = rotatePoint(posInit,lat,lng, speed, angleVol, angleSol);
                    var entity = entities.add({
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
                            size:0.8,
                        },
                        //Show the path as a yellow line sampled in .2 second increments.
                        path : {
                            resolution : 0.2,
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
                    //follow the entity and disable any other action
                    //var entityView = new Cesium.EntityView(entity, scene, ellipsoid, new Cesium.BoundingSphere({radius:100000000}));
                    viewer.trackedEntity = entity;
                }

                ////FUNCTION CHOOSE RANDOM TARGET------------------
                function changeTarget(){
                    if(App.Host.targetCount===numberOfTargets){
                        console.log('game is over!');
                        document.getElementById('gameOver').style.display = "block";
                        App.Host.targetCount=0;
                        IO.socket.emit('gameIsOver', {gameId:App.gameId});
                    }else{
                    console.log('CHOOOOSE TARGET!!!!');
                    var targetName = App.Host.cities[App.Host.targetCount][0];
                    var targetLat = App.Host.cities[App.Host.targetCount][1];
                    var targetLng = App.Host.cities[App.Host.targetCount][2];
                    console.log('targetName');
                    console.log(targetName);
                    console.log('targetLat');
                    console.log(targetLat);
                    console.log('targetLng');
                    console.log(targetLng);
                    targetPosition= new Cesium.Cartesian3.fromDegrees(targetLng,targetLat,0);
                    console.log('targetposition is :');
                    console.log(targetPosition);
                    console.log('chosen city is' + targetName +' '+targetLat +' '+ targetLng);
                    document.getElementById("target").innerHTML = targetName;
                    }
                    App.Host.targetCount++;
                }
                /////----------------------------------------------
                
                ///FUNCTION SET REFERENCE FRAME--------------------
                function setReferenceFrame(lat, lng) {
                    var center = Cesium.Cartesian3.fromDegrees(lng, lat);
                    transform = Cesium.Transforms.eastNorthUpToFixedFrame(center);
                    camera.lookAtTransform(transform, new Cesium.HeadingPitchRange(Cesium.Math.toRadians(0), Cesium.Math.toRadians(-15), 120000));
                }
                /////----------------------------------------------

                ///FUNCTION SET LINES------------------------------
                function setLines(lat, lng){
                    positionElevation1 = Cesium.Cartographic.fromDegrees(lng, lat);
                    positionElevation2 = Cesium.Cartographic.fromDegrees(lng, lat+.2);

                    positionElevationCartesian1 = ellipsoid.cartographicToCartesian(positionElevation1);
                    positionElevationCartesian2 = ellipsoid.cartographicToCartesian(positionElevation2);

                    polylineLength = Cesium.Cartesian3.distance(positionElevationCartesian1, positionElevationCartesian2)/1000;
                    positionsElevation = [positionElevation1, positionElevation2];
                    polylineElevation = polylines.add({
                    positions : ellipsoid.cartographicArrayToCartesianArray(positionsElevation),
                    material : Cesium.Material.fromType('Color', {
                        color : new Cesium.Color(1.0, 1.0, 1.0, 1.0)
                        })
                    });

                    positionOrientation1 = Cesium.Cartographic.fromDegrees(lng, lat);
                    positionOrientation2 = Cesium.Cartographic.fromDegrees(lng, lat+.2);

                    positionOrientationCartesian1 = ellipsoid.cartographicToCartesian(positionOrientation1);
                    positionOrientationCartesian2 = ellipsoid.cartographicToCartesian(positionOrientation2);
                    
                    polylineLengthOrientation = Cesium.Cartesian3.distance(positionOrientationCartesian1, positionOrientationCartesian2)/1000;
                    positionsOrientation = [positionOrientation1, positionOrientation2];
                    polylineOrientation = polylines.add({
                    positions : ellipsoid.cartographicArrayToCartesianArray(positionsOrientation),
                    material : Cesium.Material.fromType('Color', {
                        color : new Cesium.Color(0, 0, 1.0, 1.0)
                        })
                    });
                }
                /////----------------------------------------------
                
                ///FUNCTION  CALCULATE ELEVATION ANGLE ------------
                function updateElevation(){
                    var elevationCustom = Math.sin(Cesium.Math.toRadians(App.Host.mobileBeta))*polylineLength*1000;
                    var distanceOnFloor = Math.cos(Cesium.Math.toRadians(App.Host.mobileBeta))*polylineLength;
                    var computedDistances = turnDistancesIntoLatLng(distanceOnFloor,0,App.Host.playerLat,App.Host.playerLng);
                    var customLat = computedDistances[0];
                    var customLng = computedDistances[1];
                    var newPoint = Cesium.Cartographic.fromDegrees(customLng, customLat,elevationCustom);
                    var rotationQuaternion = Cesium.Quaternion.fromAxisAngle(playerPosition, Cesium.Math.toRadians(App.Host.angle));
                    var matrixRotation = Cesium.Matrix3.fromQuaternion(rotationQuaternion);
                    var rotatedPointCartesian = Cesium.Matrix3.multiplyByVector(matrixRotation, ellipsoid.cartographicToCartesian(newPoint), new Cesium.Cartesian3());
                    var rotatedPointCartographic = ellipsoid.cartesianToCartographic(rotatedPointCartesian);
                    positionsElevation=[positionElevation1, rotatedPointCartographic];
                    polylineElevation.positions= ellipsoid.cartographicArrayToCartesianArray(positionsElevation);
                }
                /////----------------------------------------------

                ///FUNCTION CAMERA ROTATE--------------------------
                function customCameraRotate(alpha, absAlpha){
                    //here, need to get the current range and keep it.
                    camera.lookAtTransform(transform, new Cesium.HeadingPitchRange(Cesium.Math.toRadians(App.Host.angle*-1+10), Cesium.Math.toRadians(-15), 120000));
                }
                /////----------------------------------------------
                
                ///CLOCK ONTICK----------------------
                viewer.clock.onTick.addEventListener(function(clock) {
                    if(App.Host.rotateCamera===true && isFlying===false){
                        customCameraRotate(App.Host.mobileAlpha, App.Host.mobileAbsAlpha);
                        updateOrientation(polylineOrientation, positionOrientation1, positionOrientation2);
                        updateOrientation(polylineElevation,positionElevation1,positionElevation2);
                    }
                    else if(App.Host.updateElev === true){
                        updateElevation();
                    }
                    if(App.Host.throwGo===true){
                        throwBullet();
                        isFlying=true;
                        console.log('flying.....');
                        App.Host.throwGo = false;
                    }
                    //Set the camera with boundingsphere and entity view! (https://groups.google.com/forum/#!msg/cesium-dev/ES4tnBr7mx8/mUknrw00BVYJ + https://cesiumjs.org/Cesium/Build/Documentation/EntityView.html)
                    if(isFlying && Cesium.JulianDate.greaterThanOrEquals(viewer.clock.currentTime, publicArrivalTime)===true){
                        console.log('has arrived');
                        IO.socket.emit('ball_has_arrived', {gameId:App.gameId, mySocketId:App.whosPlayerTurn, 'hasArrived':'hasArrived'});
                        countCam=0;
                        switchPlayers();
                        isFlying=false;
                    }
                    else if(isFlying && App.Host.isBackward){
                        App.Host.zoomCount--;
                        camera.moveBackward(20000);
                        console.log('BACKWARD'+ App.Host.zoomCount);
                    }else if(isFlying && App.Host.isForward){
                        if(App.Host.zoomCount<0){
                        App.Host.zoomCount++;
                        camera.moveForward(20000);
                        }
                        console.log('FORWARD'+App.Host.zoomCount);
                    }
                });
                /////----------------------------------------------
                /////FUNCTION CHANGE PLAYER------------------------
                function switchPlayers(){
                	console.log('switchPlayers()....');
                	App.Host.shootCount++;
       				console.log('shootCounts = ' + App.Host.shootCount);
        			if(App.Host.shootCount===numberOfShoots*2+1){
	        			App.Host.shootCount=0;
	        			console.log('change target!!!');
	        			changeTarget(); 
	        		}
                	App.playerTurn = 1-App.playerTurn;
                	console.log('change player positions...');
		            App.whosPlayerTurn = App.Host.playersWithPositions[App.playerTurn].mySocketId;
		            IO.socket.emit('changeTurn', {gameId:App.gameId, mySocketId:App.whosPlayerTurn, 'changeTurn':'changeTurn'});
		            // change the vars that are needed:
		            App.Host.playerLat = App.Host.playersWithPositions[App.playerTurn].playerLat;
		            App.Host.playerLng = App.Host.playersWithPositions[App.playerTurn].playerLng;
		            playerPosition = new Cesium.Cartesian3.fromDegrees(App.Host.playerLng,App.Host.playerLat,0);
		            console.log('playerLat = ' + App.Host.playerLat);
		            console.log('playerlng = ' + App.Host.playerLng);
		            console.log('player positions = ' + playerPosition);
		            //call functions to change POV
		            setLines(App.Host.playerLat, App.Host.playerLng);
		            setReferenceFrame(App.Host.playerLat, App.Host.playerLng);
		            //makeOriginPoint(playerPosition, new Cesium.Color.RED());
		            makeOriginPoint(targetPosition, targetColor);
                }
                //-------------------------------------------------
                ///FUNCTION UPDATE ORIENTATION-----------------------
                function updateOrientation(polyline, position1, position2){
                    //for polyline
                    var rotationQuaternion = Cesium.Quaternion.fromAxisAngle(playerPosition, Cesium.Math.toRadians(App.Host.angle));
                    var matrixRotation = Cesium.Matrix3.fromQuaternion(rotationQuaternion);
                    var rotatedOrientation = Cesium.Matrix3.multiplyByVector(matrixRotation, ellipsoid.cartographicToCartesian(position2), new Cesium.Cartesian3());
                    var cartesianPositionOrigin = ellipsoid.cartographicToCartesian(position1);
                    var newPositionOrientation = [cartesianPositionOrigin, rotatedOrientation];
                    polyline.positions = newPositionOrientation;
                }
                /////----------------------------------------------

                ///FUNCTION THROW BULLET---------------------------
                function throwBullet(){
                    console.log('THRW IT!!!');
                    if(App.Host.force>0 && App.Host.elevation>0){
                        interpolatePath(playerPosition, App.Host.playerLat, App.Host.playerLng, App.Host.force, App.Host.elevation, App.Host.angle); console.log('THROW!!!!!!!!');
                    }
                    App.Host.force=0;
                    App.Host.elevation=0;
                }
                /////----------------------------------------------

                ///FUNCTION MAKE ORINIG POINT----------------------
                function makeOriginPoint(location, color){
                     var centralPoint = entities.add({
                      name : 'Central Point',
                      position : location,
                      point : {
                        pixelSize : 15,
                        color : color,
                        outlineColor : Cesium.Color.WHITE,
                        outlineWidth : 2
                      }
                    }); 
                }
                /////----------------------------------------------

                ///FUNCTION COMPUTE DISTANCE-----------------------
                function computeDistance(location1, location2){
                    console.log('compute distance');
                    var distanceKM = Cesium.Cartesian3.distance(location1, location2)/1000;
                }
                /////----------------------------------------------

                ///COMPUTE DISTANCE TO TARGET----------------------
                function computeDistanceToTarget(location1, location2){
                    console.log('compute distance to target!');
                    console.log('location 1 = ');
                    console.log(location1);
                    console.log('location2= ');
                    console.log(location2);
                    var distanceKM = Cesium.Cartesian3.distance(location1, location2)/1000;
                    if(distanceKM <toleranceKM*2){
                    var scoreToAdd=8;
                    //var scoreToAdd= Math.round(mapValue(distanceKM,0,toleranceKM,100,0));
                    }else{scoreToAdd=8;}
                    score+=scoreToAdd;
                    //emit socket here!
                    IO.socket.emit('updateScore',{gameId:App.gameId, mySocketId:App.whosPlayerTurn, scoreToAdd: scoreToAdd});
                    /////SCORE STUFFZ
                    //add the correct score to the correct player!
                    var $pScore = $('#' + App.Host.players[App.playerTurn].mySocketId);
                    $pScore.text( +$pScore.text() + scoreToAdd );
                    /////////////////
                    //emit the score via socket so that the players can get it..?
                    console.log('distance in km to target= ' + distanceKM);
                    document.getElementById("score").innerHTML = score;
                    var distanceLine = entities.add({
                    name : 'distanceLine',
                    polyline : {
                        positions : [location1, location2],
                        width : 1,
                        material : Cesium.Color.GREEN
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
                    return[rng, hgt, imp,spd];
                };
                /////----------------------------------------------

                //FUNCTION GET ARRIVAL POINT-----------------------
                function getArrivalPoint(posInit,lat, lng, speed, angle){
                var curveResults= getCurve(speed,angle,0);
                var height = curveResults[1];
                var horizontalDistance = curveResults[0];
                var computedDistances = turnDistancesIntoLatLng(horizontalDistance,0,lat,lng);
                var customLat = computedDistances[0];
                var customLng = computedDistances[1];
                console.log('horizontal distance === '+ horizontalDistance);
                var arrival = new Cesium.Cartesian3.fromDegrees(customLng, customLat, 0);
                return arrival;
                }
                /////----------------------------------------------
                
                //FUNCTION GET MIDWAY POINT------------------------
                function getMidWayPoint(posInit,lat, lng, speed, angle){
                    var curveResults= getCurve(speed,angle,0);
                    var height = curveResults[1];
                    var midHorizontalDistance = curveResults[0]/2;
                    var computedDistances = turnDistancesIntoLatLng(midHorizontalDistance,0,lat,lng);
                    var customLat = computedDistances[0];
                    var customLng = computedDistances[1];
                    var midWay = new Cesium.Cartesian3.fromDegrees(customLng, customLat, height*1000);
                    return midWay;
                }
                /////----------------------------------------------

                ////////TURN DISTANCES INTO LATLNG------------------------------
                var turnDistancesIntoLatLng = function (distX, distY,lat,lng){
                    var distX = mapValue(distX,-20037,20037, -180,180)+lat;
                    var distY = mapValue(distY, -20037,20037,-90,90)+lng;
                    return [distX, distY];
                };
                /////----------------------------------------------

                ////////MAP VALUE-----------------------------------------------
                function mapValue(value, low1, high1, low2, high2) {
                  //example : map_range(-1, 0, 1, 0, 100) returns -100.
                    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
                }
                /////----------------------------------------------

                //FUNCTION ROTATEPOINT-----------------------------
                function rotatePoint(posInit,lat,lng, speed, angleElev, angleSol){
                    var p = getMidWayPoint(posInit,lat,lng, speed,angleElev);
                    var q = getArrivalPoint(posInit,lat,lng, speed,angleElev);
                    //rotate around custom axis
                    var rotationQuaternion = Cesium.Quaternion.fromAxisAngle(posInit, Cesium.Math.toRadians(angleSol));
                    var matrixRotation = Cesium.Matrix3.fromQuaternion(rotationQuaternion);
                    var rotated = Cesium.Matrix3.multiplyByVector(matrixRotation, p, new Cesium.Cartesian3());
                    var arrivalRotated = Cesium.Matrix3.multiplyByVector(matrixRotation, q, new Cesium.Cartesian3());
                    //property stuff
                    var curveResults= getCurve(speed,angleElev,0);
                    var timeArrival =curveResults[2];
                    var timeHalfway = timeArrival/2;
                    var property = new Cesium.SampledPositionProperty();
                    var departureTime = Cesium.JulianDate.addSeconds(viewer.clock.currentTime, 0, new Cesium.JulianDate());
                    var departurePosition = posInit;
                    property.addSample(departureTime, departurePosition);
                    var halfWayTime = Cesium.JulianDate.addSeconds(viewer.clock.currentTime, timeHalfway, new Cesium.JulianDate());
                    var halfWayPosition = rotated;
                    property.addSample(halfWayTime, halfWayPosition);
                    var arrivalTime = Cesium.JulianDate.addSeconds(viewer.clock.currentTime, timeArrival, new Cesium.JulianDate());
                    publicArrivalTime = Cesium.JulianDate.addSeconds(viewer.clock.currentTime, timeArrival+waitingSecondsOnTarget, new Cesium.JulianDate());;
                    console.log('public arrival time ==== ' + publicArrivalTime);
                    var arrivalPosition = arrivalRotated;
                    ///GET THE STATIC MAP
                    var cartographic = ellipsoid.cartesianToCartographic(arrivalPosition);
                    var longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(2);
                    var latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(2);
                    var url = 'http://dev.virtualearth.net/REST/v1/Imagery/Map/Aerial/'+latitudeString+','+longitudeString+'/15?mapSize=300,200&key=AvRFjXkotEcTdjuZLdPtg2JqWv3yKtMLkBeQnQvQ7nERmEWpdpxqP9itXTf55Yb9';
                    console.log(url);
                    document.getElementById("staticImg").src=url;
                    property.addSample(arrivalTime, arrivalPosition);
                    computeDistance(playerPosition, arrivalPosition);
                    computeDistanceToTarget(targetPosition, arrivalPosition);
                    return property;
                }
                /////----------------------------------------------
                function smoothValue(value, destination, smoothness){
                    //valeur += (destination - valeur) * facteur
                    //facteur entre 0 et 1, sachant que 1 ça va direct
                    value+= (destination - value)* smoothness;
                    return value;
                }
                //------------------------------------------------------------------------------
            },
            //----------------------------------------------------------------END-OF-CESIUM-CODE
        },


        /* *****************************
           *    PLAYER CODE(MOBILE)    *
           ***************************** */

        Player : {
            hostSocketId: '',
            myName: '',
            isMyTurn:'',
            shootCount:0,
            targetCount:0,
            playerLat:'',
            playerLng:'',
            playerCoordinates:[],
            clickCount:0,
            absAlpha: 0,
            alphaToUse:0,
            betaToUse:0,
            betaSent:0,
            volumeToUse:0,
            higherVolume:0,
            averageToUse:0,
            allForces:0,
            allOldForces:0,
            higherForce:0,
            forceChoice:0,
            precisionForce:0,
            isFlying:false,
            isButtonForcePressed:false,
            myLoop:'',
            forceMultiplyFactorVol:1.5,
            forceMultiplyFactorShake:4,
            forceMultiplyFactorTouch:1,
            //getCurveCustom:'',
            isNeedingSound:false,
            isGeolocated:false,
            round:'',
            score:'',
            shouldCount:'false',
            onJoinClick: function () {
                console.log('Join game!!!');
                App.$gameArea.html(App.$templateJoinGame);
            },
            onPlayerStartClick: function() {
                var data = {
                    gameId : +($('#inputGameId').val()),
                    playerName : $('#inputPlayerName').val() || 'anon'
                };
                IO.socket.emit('playerJoinGame', data);
                App.myRole = 'Player';
                App.Player.myName = data.playerName;
                App.Player.clickCount=0;
            },
            onPlayerRestart : function() {
                var data = {
                    gameId : App.gameId,
                    playerName : App.Player.myName
                }
                IO.socket.emit('playerRestart',data);
                App.currentRound = 0;
                $('#gameArea').html("<h3>Waiting on host to start new game.</h3>");
            },
            updateWaitingScreen : function(data) {
                if(IO.socket.id === data.mySocketId){
                    App.myRole = 'Player';
                    App.gameId = data.gameId;
                    $('#playerWaitingMessage')
                        .append('<p/>')
                        .text('Joined Game ' + data.gameId + '. Please wait for game to begin.');
                }
            },
            gameStart: function(){
                console.log('start game as player!!');
                console.log('names are...');
                console.log(App.Player.myName);
                App.$gameArea.html(App.$playerGame);
                $('#player1Score').find('.playerName').html(App.Player.myName);
                console.log('attributing '+App.mySocketId+' id to my score class');
                $('#player1Score').find('.score').attr('id',App.mySocketId);
                //--------------
                console.log('got the scores right for the player!!');
            },
            updateScore:function (data){
            	//update score here!
            	//add the correct score to the correct player!
            	console.log('adding' + data.scoreToAdd +' to my score...');
                var $pScore = $('#' + data.mySocketId);
                $pScore.text( +$pScore.text() + data.scoreToAdd );
                /////////////////

            },
            endGame : function() {
            	console.log('endgame for player!!!!');
               document.getElementById('gameOver').style.display = "block";
               /* $('#gameArea')
                    .html('<div class="gameOver">Game Over!</div>')
                    .append(
                        // Create a button to start a new game.
                        $('<button>Start Again</button>')
                            .attr('id','btnPlayerRestart')
                            .addClass('btn')
                            .addClass('btnGameOver')
                    );*/
            },
            getLocation:function(){
                console.log('GET LCOATION!!!!!');
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(App.Player.showPosition);
                } else {
                    x.innerHTML = "Geolocation is not supported by this browser.";
                }
            },
            showPosition:function (position) {
                App.Player.playerLat = 46+Math.random()*5;
                App.Player.playerLng = 6+Math.random()*3;
                App.Player.playerCoordinates.push(App.Player.playerLat,App.Player.playerLng);
                console.log(App.Player.playerCoordinates);
                App.Player.isGeolocated=true;
                if(App.Player.isGeolocated===true){
                    console.log('emit socket with position!!!');
                    IO.socket.emit('sendGeoLocation',{gameId:App.gameId, mySocketId:App.mySocketId, playerLat:App.Player.playerLat, playerLng:App.Player.playerLng});
                }
            },
            customInit: function(){
            console.log('controller init! C est parti');
            console.log('geolocation...');
            App.Player.getLocation();
            document.getElementById('sliderWrapper').style.display = "none";
            var dataContainerOrientation = document.getElementById('dataContainerOrientation');
            var dataContainerMotion = document.getElementById('dataContainerMotion');
            var compass = document.getElementById('compass');
            var elevation = document.getElementById('elevation');
            var angle = document.getElementById('angle');
            var force = document.getElementById('force');
            if(window.DeviceOrientationEvent && App.Player.isFlying===false) {
                window.addEventListener('deviceorientation', function(event) {
                    var dir ='';
                    var alpha;
                    if(event.webkitCompassHeading) {
                    alpha = event.webkitCompassHeading*-1;
                    }
                    else alpha = event.alpha;
                    var beta = event.beta;
                    var gamma = event.gamma;
                    App.Player.alphaToUse = alpha;
                    App.Player.betaToUse=beta;
                var roundedBeta = Math.round(App.Player.betaToUse);
                compass.style.Transform = 'rotate( ' + alpha + 'deg)';
                compass.style.WebkitTransform = 'rotate( '+ alpha + 'deg)';
                compass.style.MozTransform = 'rotate(' + alpha + 'deg)';
                elevation.style.WebkitTransform = 'rotateX(' + App.Player.betaToUse +'deg)';
                elevation.style.Transform = 'rotateX(' + App.Player.betaToUse +'deg)';
                elevation.style.MozTransform ='rotateX(' + App.Player.betaToUse +'deg)';
                angle.innerHTML = roundedBeta;
                        if(alpha!=null || beta!=null || gamma!=null) 
                        dataContainerOrientation.innerHTML = '<strong>Orientation</strong><br />alpha: ' + alpha + '<br/>beta: ' + beta + '<br />gamma: ' + gamma;
                      }, false);
            }
            if(window.DeviceMotionEvent && App.Player.isFlying===false) {
            window.addEventListener('devicemotion', function(event) {
                        var x;
                        var y;
                        var z; 
                        if(event.accelerationIncludingGravity) {
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
                                App.Player.absAlpha = r.alpha;
                        if(App.Player.clickCount ==0){
                          //send nothing
                        }else if(App.Player.clickCount==1){
                          //socket.emit('send_data_angle',{alpha:App.Player.alphaToUse});
                          IO.socket.emit('send_data_angle',{gameId:App.gameId, mySocketId:App.mySocketId, alpha: App.Player.alphaToUse});
                          console.log('alpha : ' + App.Player.alphaToUse + 'gameId = ' + App.gameId +'mySocketId = ' + App.mySocketId);

                        }else if(App.Player.clickCount==2 && App.Player.betaToUse>=0 && App.Player.betaToUse<=90){
                          //socket.emit('send_data_elevation',{beta:App.Player.betaToUse});
                          IO.socket.emit('send_data_elevation',{gameId:App.gameId, mySocketId:App.mySocketId, beta:App.Player.betaToUse});
                          App.Player.betaSent = App.Player.betaToUse;
                          console.log('beta: ' + App.Player.betaToUse);
                        }
                        else if(App.Player.clickCount===4 && App.Player.forceChoice===1){
                            console.log(App.Player.forceMultiplyFactorShake);
                            App.Player.allForces = Math.abs(x) + Math.abs(y)+ Math.abs(z)*App.Player.forceMultiplyFactorShake;
                            console.log('all player forces : ' + App.Player.allForces);
                            var allForcesToUse = Math.round(App.Player.allForces);
                            force.innerHTML =allForcesToUse;
                            if(App.Player.allForces>App.Player.higherForce){App.Player.higherForce=App.Player.allForces};
                            var distanceInKm= getCurveCustom(App.Player.higherForce,App.Player.betaSent,0);
                            console.log('distance in km = ' + distanceInKm);
                            //force.innerHTML = Math.round(distanceInKm) + " km" ;
                        }
                        dataContainerMotion.innerHTML = html; 
                        });
                }
            },

            customClick: function(){
                console.log('click!');
                App.Player.clickCount++;
                console.log(App.Player.clickCount);
                if(App.Player.clickCount==0){
                document.getElementById('step00').style.display = "block";
                document.getElementById('step01').style.display = "none";
                document.getElementById('step02').style.display = "none";
                document.getElementById('step03').style.display = "none";
                document.getElementById('step04').style.display = "none";
                document.getElementById('dataContainerOrientation').style.display = "none";
                document.getElementById('dataContainerMotion').style.display = "none";
                document.getElementById('sliderWrapper').style.display = "none";
                }
                if(App.Player.clickCount==1){
                document.getElementById('step00').style.display = "none";
                document.getElementById('step01').style.display = "block";
                document.getElementById('step02').style.display = "none";
                document.getElementById('step03').style.display = "none";
                document.getElementById('dataContainerOrientation').style.display = "none";
                document.getElementById('dataContainerMotion').style.display = "none";
                document.getElementById('sliderWrapper').style.display = "none";
                }
                if(App.Player.clickCount==2){
                document.getElementById('step00').style.display = "none";
                document.getElementById('step01').style.display = "none";
                document.getElementById('step02').style.display = "block";
                document.getElementById('step03').style.display = "none";
                document.getElementById('dataContainerOrientation').style.display = "none";
                document.getElementById('dataContainerMotion').style.display = "none";
                document.getElementById('sliderWrapper').style.display = "none";
                }
                if(App.Player.clickCount==3){
                App.Player.clickCount++;
                App.Player.forceChoice=3;
                /*document.getElementById('step00').style.display = "none";
                document.getElementById('step01').style.display = "none";
                document.getElementById('step02').style.display = "none";
                document.getElementById('step03').style.display = "block";
                document.getElementById('dataContainerOrientation').style.display = "none";
                document.getElementById('dataContainerMotion').style.display = "none";
                document.getElementById('sliderWrapper').style.display = "none";*/
                }
                if(App.Player.clickCount==4){
                document.getElementById('step00').style.display = "none";
                document.getElementById('step01').style.display = "none";
                document.getElementById('step02').style.display = "none";
                document.getElementById('step03').style.display = "none";
                document.getElementById('step04').style.display = "block";
                document.getElementById('dataContainerOrientation').style.display = "none";
                document.getElementById('dataContainerMotion').style.display = "none";
                document.getElementById('sliderWrapper').style.display = "none";
                }
                if(App.Player.clickCount==5){
                App.Player.clickCount=0;
                document.getElementById('step00').style.display = "block";
                document.getElementById('step01').style.display = "none";
                document.getElementById('step02').style.display = "none";
                document.getElementById('step03').style.display = "none";
                document.getElementById('step04').style.display = "none";
                document.getElementById('dataContainerOrientation').style.display = "none";
                document.getElementById('dataContainerMotion').style.display = "none";
                document.getElementById('sliderWrapper').style.display = "none";
                }
            },
            displayShake: function(){
                console.log('displayShake');
                App.Player.forceChoice=1;
                App.Player.customClick();
            },
            displaySound: function(){
                console.log('displaySound');
                App.Player.forceChoice=2;
                App.Player.customClick();
                App.Player.launchSound();
            },
            displayPrecision: function(){
                console.log('displayPrecision');
                App.Player.forceChoice=3;
                console.log('forceChoice = ' +App.Player.forceChoice);
                App.Player.customClick();
            },
            changeBackground: function(){
                var wrapperPlayer = document.getElementById('wrapperPlayer');
                console.log('changeBackground!!!');
                App.Player.isButtonForcePressed=true;
                wrapperPlayer.style.background = "red";
                console.log('change background!!!!');
                console.log('you have clicked');
                App.Player.precisionForce=0;
                App.Player.shouldCount=true;
                console.log('should count is true');
                if(App.Player.forceChoice===3 && App.Player.shouldCount===true){
                    App.Player.myLoop=setInterval(function () {
                        
                        App.Player.precisionForceCount()},
                        50);
                    console.log('SET INTERVAL!');
                }
            },
            goThrow: function(){
            	console.log('function gothrow');
                var force = document.getElementById('force');
                var wrapperPlayer = document.getElementById('wrapperPlayer');
                console.log('throw!');
                App.Player.isButtonForcePressed=false;    
                document.body.style.background = "blue";
                //wrapperPlayer.style.backgroundImage = "url('textures/background.jpg')";
                wrapperPlayer.style.backgroundSize ="cover";
                wrapperPlayer.style.backgroundRepeat ="no-repeat";
                App.Player.isFlying=true;
                App.Player.toggleFlyMode();
               /*if(App.Player.forceChoice==1){
                //shake
                IO.socket.emit('send_data_force',{gameId:App.gameId, mySocketId:App.mySocketId,force: App.Player.higherForce});
                IO.socket.emit('throw',{gameId:App.gameId, mySocketId:App.mySocketId});
                App.Player.forceChoice=0;
                }
                 if(App.Player.forceChoice==2){
                //sound
                IO.socket.emit('send_data_force',{gameId:App.gameId, mySocketId:App.mySocketId,force: App.Player.higherVolume});
                IO.socket.emit('throw',{gameId:App.gameId, mySocketId:App.mySocketId});
                console.log('stop registering....');
                App.Player.isNeedingSound=false; 
                App.Player.forceChoice=0; 
                }*/
                 if(App.Player.forceChoice===3  && App.Player.shouldCount===true){
                //precision
                //App.Player.shouldCount=false;
                //clearInterval(App.Player.myLoop);
                //clearTimeout(App.Player.myLoop);
                //console.log('KILL INTERVAL');
                //App.Player.shouldCount=false;
      			console.log('gothrow function forcechoice=3');
                console.log(App.Player.precisionForce);
                IO.socket.emit('send_data_force',{gameId:App.gameId, mySocketId:App.mySocketId,force: App.Player.precisionForce});
                IO.socket.emit('throw',{gameId:App.gameId, mySocketId:App.mySocketId});
                App.Player.forceChoice=0;
                }
                clearInterval(App.Player.myLoop);
                clearTimeout(App.Player.myLoop);
                console.log('KILL INTERVAL');
                App.Player.higherForce=0;
                App.Player.higherVolume=0;
                App.Player.precisionForce=0;
                force.innerHTML = "0";
                console.log('should count is false');
                App.Player.shouldCount=false;
            },
            zoomIn:function(){
                console.log('zoom in');
                IO.socket.emit('zoomIn',{gameId:App.gameId, mySocketId:App.mySocketId,zoom:'zoomIn'});
                //emit socket
            },
            zoomOut:function(){
                console.log('zoom out');
                IO.socket.emit('zoomOut',{gameId:App.gameId, mySocketId:App.mySocketId,zoom:'zoomOut'});
            },
            stopZoomIn:function(){
                console.log('stop zooom in');
                IO.socket.emit('stopZoomIn',{gameId:App.gameId, mySocketId:App.mySocketId,zoom:'stopZoomIn'});
            },
            stopZoomOut:function(){
                console.log('stop zoom out');
                IO.socket.emit('stopZoomOut',{gameId:App.gameId, mySocketId:App.mySocketId,zoom:'stopZoomOut'});
            },
            escapeZoom:function(){
                App.Player.isFlying=false;
                App.Player.clickCount=-1;
                App.Player.customClick();
                console.log('escape zoom!');
            },
            precisionForceCount:function(){
                if(App.Player.shouldCount===true){
                	console.log('precision force count!!');
	                var force = document.getElementById('force');
	                App.Player.precisionForce+=1*App.Player.forceMultiplyFactorTouch;
	                console.log('precision Force = ' + App.Player.precisionForce);
	                var distanceInKm= getCurveCustom(App.Player.precisionForce,App.Player.betaSent,0);
	                force.innerHTML = Math.round(distanceInKm) + " km" ;
            	}
            },
            launchSound:function(){
                App.Player.isNeedingSound=true;
                console.log('launch sound!!!');
                if(navigator.getUserMedia) {
                navigator.getUserMedia({video: false, audio: true}, App.Player.onSuccessSound, App.Player.onErrorSound);
                }
                else if(navigator.webkitGetUserMedia) {
                navigator.webkitGetUserMedia({video: false, audio: true}, App.Player.onSuccessSound, App.Player.onErrorSound);
                }
            },
            getAverageVolume:function(array) {
                var values = 0; 
                // get all the frequency amplitudes
                for (var i = 0; i < array.length; i++) {
                    values += array[i];
                 }
                return values / (array.length);
            },
            onSuccessSound:function(stream){
                if(App.Player.isNeedingSound){
                    console.log('sound is accepted');
                    var force = document.getElementById('force');
                    var context = new AudioContext();
                    var mediaStreamSource = context.createMediaStreamSource(stream);
                    var analyser = context.createAnalyser();
                    analyser.smoothingTimeConstant = 0.3;
                    analyser.fftSize = 1024;
                    var javascriptNode = context.createScriptProcessor(2048, 1, 1);
                    javascriptNode.onaudioprocess = function(e) {
                        var oldAverage = App.Player.volumeToUse;
                        var array =  new Uint8Array(analyser.frequencyBinCount);
                        analyser.getByteFrequencyData(array);  
                        var average = App.Player.getAverageVolume(array)*App.Player.forceMultiplyFactorVol;
                        App.Player.averageToUse=average;
                        App.Player.volumeToUse=average;
                        var roundedVol = Math.round(average);
                        if(App.Player.clickCount===4 && App.Player.forceChoice===2){
                            if(App.Player.higherVolume<average){
                                App.Player.higherVolume=average;
                            }
                            force.innerHTML = roundedVol;
                            var distanceInKm= getCurveCustom(App.Player.higherVolume,App.Player.betaSent,0);
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
                        mediaStreamSource.connect(analyser);
                        analyser.connect(javascriptNode);
                        javascriptNode.connect(context.destination);
                }
            },
            onErrorSound:function(){
                alert('Could not get the sound!');
            },
            toggleFlyMode:function(){
                console.log('toggle fly mode!');
                if(App.Player.isFlying===true){
                    console.log('flight in progress');
                    document.body.style.background = "red";
                    document.getElementById('step00').style.display = "none";
                    document.getElementById('step01').style.display = "none";
                    document.getElementById('step02').style.display = "none";
                    document.getElementById('step03').style.display = "none";
                    document.getElementById('step04').style.display = "none";
                    document.getElementById('sliderWrapper').style.display = "block";
                } else if(App.Player.isFlying===false){
                    console.log('not flying');
                    document.getElementById('sliderWrapper').style.display = "none";
                    //document.body.style.backgroundImage = "url('textures/background.jpg')";
                    document.body.style.background = "blue";
                    document.body.style.backgroundSize ="cover";
                    document.body.style.backgroundRepeat ="no-repeat";
                    App.Player.clickCount=-1;
                    App.Player.customClick();
                }
            },

            getCurveCustom:function(Vo,th,Yo){
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
            },
            sendDebug:function(){
                    console.log('send debug');
                    var debugAlpha=10;
                    var debugBeta=30;
                    var debugForce = 20;
                    App.Player.isFlying=true;
                    App.Player.toggleFlyMode();
                    IO.socket.emit('send_data_angle',{gameId:App.gameId, mySocketId:App.mySocketId,alpha:debugAlpha});
                    IO.socket.emit('send_data_elevation',{gameId:App.gameId, mySocketId:App.mySocketId,beta:debugBeta});
                    IO.socket.emit('send_data_force',{gameId:App.gameId, mySocketId:App.mySocketId,force: debugForce});
                    IO.socket.emit('throw',{gameId:App.gameId, mySocketId:App.mySocketId});
            }
        },
    };
    IO.init();
    App.init();
}($));