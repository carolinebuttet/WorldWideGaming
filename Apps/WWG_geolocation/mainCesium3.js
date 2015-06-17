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
            IO.socket.on('bothBrowsersAreConnected',IO.displayConnectionForMobile);
            IO.socket.on('beginNewGame', IO.beginNewGame );
            IO.socket.on('gameIsOver', IO.gameOver);
            IO.socket.on('gameIsInterrupted', IO.gameInterrupted);
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
            IO.socket.on('targetAlert',IO.onAlertarget);
            IO.socket.on('playersLocations',IO.onPlayerLocations);
            IO.socket.on('changeTurn',IO.onChangeTurn);
            IO.socket.on('updateScore', IO.onUpdateScore);
            IO.socket.on('chooseColorRed', IO.onPlayerColorRed);
            IO.socket.on('chooseColorBlue',IO.onPlayerColorBlue);
            IO.socket.on('displayHelp', IO.onDisplayHelp);
            IO.socket.on('enableChangeTurn', IO.onEnableChangeTurn);
            IO.socket.on('sendFunFact',IO.onGetFunFact);
            },
        //IO-FUNCTION ON CONNECTION--------------------------------------------
        onConnected : function() {
            console.log('new connection, socket is');
            console.log(IO.socket);
            App.mySocketId = IO.socket.id;
            console.log('my socket id is = ' + App.mySocketId);
        },
        //--------------------------------------------------------------------

        //IO-FUNCTION NEW GAME CREATED-------------------------------------------
        onNewGameCreated : function(data) {
            console.log('new game is created');
            console.log('data is:');
            console.log(data);
            App.Host.gameInit(data);
        },
        //-------------------------------------------------------------------

        //IO-FUNCTION DISPLAY CODE FOR MOBILE------------------------------------
        displayConnectionForMobile:function(data){
            console.log('both browsers are connected, we can start.');
            console.log('display connection code for mobile');
            console.log(data);
            if(App.myRole==='Host'){
                console.log('game id is ' + App.gameId);
                console.log('i should display the code here!');
                document.getElementById('welcomeText').style.display = "none";
                document.getElementById('waitForConnectionText').style.display = "none";
                document.getElementById('displayCode').style.display = "block";
                document.getElementById("codeToDisplay").innerHTML = data.gameId;

            }
        },
        //-------------------------------------------------------------------

        //IO-FUNCTION PLAYER JOINED ROOM ---------------------------------------
        playerJoinedRoom : function(data) {
            console.log('a player joined!!!');
            App[App.myRole].updateWaitingScreen(data);
        },
        //-------------------------------------------------------------------
        
        //IO-FUNCTION PLAYER COLOR BLUE------------------------------------
        onPlayerColorBlue:function(data){
            if(App.myRole==='Player' && App.mySocketId=== data.mySocketId){
                console.log('I am blue!');
                App.Player.isRed=false;
                App.Player.teamColor='blue';
            }
        },
        //-------------------------------------------------------------------
        
        //IO-FUNCTION PLAYER COLOR RED------------------------------------------
        onPlayerColorRed:function(data){
            if(App.myRole==='Player' && App.mySocketId=== data.mySocketId){
                console.log('I am red!');
                App.Player.isRed=true;
                App.Player.teamColor='red';
            }
        },
        //-------------------------------------------------------------------
        
        //IO-FUNCTION RECIEVE PLAYER LOCATION------------------------------------
        onPlayerLocations : function(data) {
            console.log('got the locations here!!');
            console.log(data);
            App.Host.playersWithPositions.push(data);
            console.log('players with positions is now');
            console.log(App.Host.playersWithPositions);
            if(App.Host.playersWithPositions.length===2){
                console.log('geolocation complete. we can init the cesium with the players positions.');
                if(App.myRole==='Host'){
                    console.log('I am a host and I will start the game ang cesium');
                    App.Host.gameStart();
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
        //-------------------------------------------------------------------
        //IO-FUNCTION ENABLE CHANGE TURN------------------------------------
        onEnableChangeTurn:function(data){
            console.log('enable change turn!');
            App.Host.enableChangeTurnVal = true;
        },
        //-------------------------------------------------------------------
        //IO-FUNCTION CHANGE TURN-----------------------------------------------
        onChangeTurn : function(data){
        	console.log('change turns!!!');
            //add the condition that the game is not over!
        	console.log(data);
        	if(App.myRole==='Player'&& data.mySocketId ===App.mySocketId && !App.Player.isGameOver){
        		console.log('IT IS MY TURN');
                App.Player.clickCount=0;
                App.Player.customClick();
        	}else if(App.myRole==='Player' && data.mySocketId != App.mySocketId && !App.Host.isGameOver){
        		console.log('ITS NOT MY TURN!!!');
                document.getElementById('orientationMobileWrapper').style.display="none";
                document.getElementById('azimuthMobileWrapper').style.display="none";
                document.getElementById('forceMobileWrapper').style.display="none";
                document.getElementById('throwMobileWrapper').style.display="none";
                document.getElementById('zoomMobileWrapper').style.display="none";
                document.getElementById('waitMobileWrapper').style.display = "none";
                document.getElementById('funFactsMobile').style.display = "none";
                if(!App.Player.isReadyForFunFact){
                    document.getElementById('waitMobileWrapper').style.display = "block";
                }else{
                    document.getElementById('funFactsMobile').style.display = "block";
                    IO.socket.emit('askFunFact',{gameId:App.gameId, mySocketId:App.mySocketId, currentTarget:App.Player.currentTarget}); 
                }
                
        	}
        },
        //-------------------------------------------------------------------
        
        //IO-FUNCTION UPDATE SCORE-------------------------------------------
        onUpdateScore:function(data){
        	console.log('update score!');
        	if(App.myRole==='Player' && data.mySocketId===App.mySocketId){
        		console.log('I should update my socre!');
        		App.Player.updateScore(data);
        	}
            else if(App.myRole ==='Host'){
                console.log('I should update the score of player ' + data.mySocketId);
                App.Host.updateScore(data);
            }
        },
        //-------------------------------------------------------------------
       //IO-FUNCTION GET FUN FACT -------------------------------------------
        onGetFunFact:function(data){
            console.log('fun fact to display is '+ data.funFactToDisplay);
            //si je suis palyer et que ça n'est pas mon tour:
            if(App.myRole==='Player'){
                App.Player.displayFunFact(data.currentTarget, data.funFactToDisplay);
            }
        },
        //-------------------------------------------------------------------
        //IO-FUNCTION BROWSER JOINED ROOM------------------------------------
        browserJoinedRoom : function(data) {
            console.log('a browser joined!!!');
            console.log('I am actually a ' + App.myRole);
            if(App.myRole ==='Host'){
                App.Host.addNewHost();
            }
        },
        //-------------------------------------------------------------------
        
        //IO-FUNCTION BEGIN NEW GAME-----------------------------------------
        beginNewGame : function(data) {
            if(App.myRole==='Player'){
                App[App.myRole].gameStart();
                //we dont do the game start for host because we don't have the geolocation yet.
            }
            App[App.myRole].customInit();
        },
        //-------------------------------------------------------------------
        
        //IO-FUNCTION ALERT TARGET-------------------------------------------
        onAlertarget:function(data){
            console.log('target has changed, tell the player!');
                App[App.myRole].alertTarget(data);
        },
        //-------------------------------------------------------------------
        
        //IO-FUNCTION GAME OVER----------------------------------------------
        gameOver : function(data) {
            App.Player.isGameOver = true;
            App.Host.isGameOver = true;
            App[App.myRole].endGame(data);
        },
        //-------------------------------------------------------------------
        
        //IO-FUNCTION GAME INTERRUPTED---------------------------------------
        gameInterrupted:function(){
            console.log('game has been interrupted.');
            alert('Oh no! Someone disocnnected and ruined the game!');
        },
        //-------------------------------------------------------------------
        
        //IO-FUNCTION ERROR--------------------------------------------------
        error : function(data) {
            alert(data.message);
        },
        //-------------------------------------------------------------------
        
        //IO-FUNCTION GET FORCE----------------------------------------------
        onDataForce:function(data){
            if(App.myRole==='Host' && data.mySocketId === App.whosPlayerTurn){
                App.Host.camIsInElevPos=true;
                App.Host.rotateCamera=false;
                App.HostupdateElev=false;
                App.Host.force = data.force;
            }else{
            }
        },
        //-------------------------------------------------------------------
        
        //IO-FUNCTION GET ELEVATION------------------------------------------
        onDataElevation:function(data){
            if(App.myRole==='Host' && data.mySocketId === App.whosPlayerTurn){
                App.Host.rotateCamera=false;
                App.Host.updateElev=true;
                App.Host.oldMobileBeta= App.Host.mobileBeta;
                App.Host.mobileBeta= data.beta;
                App.Host.elevation=App.Host.mobileBeta;
            }else{
            } 
        },
        //-------------------------------------------------------------------
        
        //IO-FUNCTION GET ANGLE----------------------------------------------
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
        //-------------------------------------------------------------------
        
        //IO-FUNCTION ON THROW.----------------------------------------------
        onThrow:function(data){
            if(App.myRole==='Host' && data.mySocketId === App.whosPlayerTurn){
                console.log('I listen to you');
                App.Host.throwGo=true;
                App.Host.updateNumberOfBulletsAvailable(data);
            }else{
            }
        },
        //-------------------------------------------------------------------
        
        //IO-FUNCTION ON ZOOM IN---------------------------------------------
        onZoomIn:function(data){
            if(App.myRole==='Host' && data.mySocketId === App.whosPlayerTurn){
                console.log('I listen to you');
                App.Host.isForward=true;
            }else{
            }
        },
        //-------------------------------------------------------------------
        
        //IO-FUNCTION ON ZOOM OUT--------------------------------------------
        onZoomOut:function(data){
            if(App.myRole==='Host' && data.mySocketId === App.whosPlayerTurn){
                console.log('I listen to you');
                App.Host.isBackward=true;
            }else{
            }
        },
        //-------------------------------------------------------------------
        
        //IO-FUNCTION STOP ZOOM IN-------------------------------------------
        onStopZoomIn:function(data){
            if(App.myRole==='Host' && data.mySocketId === App.whosPlayerTurn){
                console.log('I listen to you');
                App.Host.isForward=false;
            }else{
            }
        },
        //-------------------------------------------------------------------
        
        //IO-FUNCTION STOP ZOOM OUT------------------------------------------
        onStopZoomOut:function(data){
            if(App.myRole==='Host' && data.mySocketId === App.whosPlayerTurn){
                console.log('I listen to you');
                App.Host.isBackward=false;
            }else{
            }
        },
        //-------------------------------------------------------------------
        
        //IO-FUNCTION DISPLAY HELP-------------------------------------------
        onDisplayHelp:function(data){
                console.log('toggle help!');
                App.Host.toggleHelp(data);
        },
        //-------------------------------------------------------------------
        
        //IO-FUNCTION GET BALL HAS ARRIVED------------------------------------
        onBallHasArrived:function(data){
            console.log('sockat ball has arrived!');
            if(App.myRole==='Player' && data.mySocketId == App.mySocketId ){
            console.log('ball has arrived for me ! Update mobile phone!');
            App.Player.isFlying=false;
            App.Player.toggleFlyMode();
            }
        },
        //-------------------------------------------------------------------
        
        //IO-FUNCTION GET PICKED CITIES------------------------------------
        onPickedCities:function(data){
            console.log('got the picked cities');
            console.log(data);
            App.Host.cities=data;
            console.log(App.Host.cities);
        }
        //-------------------------------------------------------------------        
};

var App={
        gameId: 0,
        myRole: '',
        mySocketId: '',
        currentRound: 0,
        playerTurn: 0,
        whosPlayerTurn:[],
        numberOfShoots:3,
        numberOfTargets:1,
        isMute : false,
        glissendoSound : new Howl({urls: ['data/sounds/mobile_glissendo.mp3']}),
        /* *************************************
         *                Setup                *
         * *********************************** */
          // SOUNDS FUNCTIONS-------------------------------------------------
           //FUNCTION PLAY SOUND CLICK--------------------
            playSoundClickHowl:function (){
                console.log('play sound  click howl!!');
                //$('#soundClick').trigger('play');
                var sound = new Howl({urls: ['data/sounds/mobile_click.mp3']}).play();
            },
            //---------------------------------------------
            //FUNCTION PLAY SOUND--------------------------
            playSoundHowl :function(url){
                var sound = new Howl({urls: [url]}).play();
            },
            //--------------------------------------------
             //FUNCTION START SOUND------------------------
            startSoundHowl : function(sound){
               sound.fadeIn(1,200);
            },
            //--------------------------------------------
            //FUNCTION STOP SOUND-------------------------
            stopSoundHowl: function(sound){
                //sound.stop();
                sound.fadeOut(0,50,sound.stop());
            },
            //--------------------------------------------
            //FUNCTION PLAY SOUND CLICK--------------------
            playSoundClick:function (){
                console.log('play sound  click!');
                $('#soundClick').trigger('play');
            },
            //---------------------------------------------
            //FUNCTION PLAY SOUND--------------------------
            playSound :function(idName){
                console.log('play sound ' + idName);
                $(idName).trigger('play');
            },
            //--------------------------------------------
            //FUNCTION START SOUND------------------------
            startSound : function(idName){
                console.log('start sound ' + idName);
                $(idName).prop("volume","0");
                $(idName).trigger('play');
                $(idName).animate({volume:1},1);
            },
            //--------------------------------------------
            //FUNCTION MUTE SOUND-------------------------
            toggleSound : function (){
                App.isMute = !App.isMute
                if(App.isMute){
                   $('#soundLoop').trigger('pause'); 
                   //change src of #volIcon
                   $('#volIcon').attr('src','data/soundInactive.png'); 
                }
                else if(!App.isMute){
                    $('#soundLoop').trigger('play');
                    $('#volIcon').attr('src','data/soundActive.png'); 
                }
                //
            },
            //--------------------------------------------
            //FUNCTION STOP SOUND-------------------------
            stopSound: function(idName){
                console.log('stop sound ' + idName);
                $(idName).animate({volume:0},100, function(){
                $(idName).trigger('pause');
                $(idName).prop("currentTime","0");
                });
            },
            //--------------------------------------------

        //APP-FUNCTION INIT--------------------------------------------------
        init: function () {
            console.log('app.init!');
            App.cacheElements();
            App.showInitScreen();
            App.bindEvents();
        },
        //-------------------------------------------------------------------
        
        //APP-FUNCTION SET TEMPLATES-----------------------------------------
        //Create references to on-screen elements used throughout the game.
        cacheElements: function () {
            App.$doc = $(document);
            // Templates
            App.$gameArea = $('#gameArea');
            App.$templateIntroScreenMobile = $('#intro-screen-template-mobile').html();
            App.$newMobileTemplate = $('#new-mobile-template').html();
            App.$templateIntroScreenBrowser = $('#intro-screen-template-browser').html();
            App.$browsersDisplayCode = $('#browsers-are-ready').html();
            App.$templateNewGame = $('#create-game-template').html();
            App.$templateJoinGame = $('#join-game-template').html();
            App.$hostGame = $('#host-game-template').html();
            App.$playerGame = $('#player-game-template').html();
            App.$templateJoinGameAsBrowser= $('#join-game-as-browser-template').html();
        },
        //-------------------------------------------------------------------
        
        //APP-FUNCTION BIND CLICK & TOUCH EVENTS-----------------------------
        bindEvents: function () {
            // Host
            App.$doc.on('click', '#btnCreateGame', App.Host.onCreateClick);
            App.$doc.on('click', '#beginGameButton', App.browserInitScreen);
            // Player
            App.$doc.on('click', '#btnJoinGameController', App.Player.onJoinClick);
            App.$doc.on('click', '#btnJoinGameBrowser', App.Host.onJoinClick);
            App.$doc.on('click', '#btnStartAsBrowser',App.Host.onHostStartClick);
            App.$doc.on('click', '#btnPlayerRestart', App.Player.onPlayerRestart);
            App.$doc.on('click', '#orientationMobile, #azimuthMobile', App.Player.customClick);
            App.$doc.on('touchstart','#forceShield', App.Player.startCountingForce);
            App.$doc.on('touchend','#forceShield', App.Player.stopCountingForce);
            //App.$doc.on('click','#throwMobile', App.Player.goThrow);
            //App.$doc.on('click','#enableChangeTurnWrapper', App.Player.customClick);
            App.$doc.on('click','#zoomRestart, #helpZoomFly', App.Player.customClick);
            //App.$doc.on('click', '#shake', App.Player.displayShake);
            App.$doc.on('click', '#precision', App.Player.displayPrecision);
            App.$doc.on('touchstart' ,'.zoomRestartPlus', App.Player.zoomIn);
            App.$doc.on('touchend','.zoomRestartPlus', App.Player.stopZoomIn);
            App.$doc.on('touchstart','.zoomRestartMinus', App.Player.zoomOut);
            //App.$doc.on('click','#escapeZoom', App.Player.escapeZoom);
            App.$doc.on('touchend','.zoomRestartMinus', App.Player.stopZoomOut);
            App.$doc.on('click','#debug', App.Player.sendDebug);
            App.$doc.on('click','#helpOrientation', App.Player.askHelp);
            App.$doc.on('click','#helpElevation', App.Player.askHelp);
            App.$doc.on('click','#helpForce', App.Player.askHelp);
            App.$doc.on('click','#helpThrow', App.Player.askHelp);
            App.$doc.on('click','#helpZoom', App.Player.askHelp);
            App.$doc.on('click','#helpWait', App.Player.askHelp);
            App.$doc.on('click','.goBack',App.Player.goBack);
            //new player
            App.$doc.on('click','#welcomeConnectMobile', App.displayConnectionFromMobile);
            App.$doc.on('click','#connectionButtonMobile', App.Player.onPlayerStartClick);
            //FNU FACTS
            App.$doc.on('click','#nextFunFact', App.Player.onNextFunFact);
            //SOUNDS
            //App.$doc.on('click','.clickable', App.playSoundClickHowl);
            App.$doc.on('click', '#audioMute', App.toggleSound);
        },
        //-------------------------------------------------------------------
        
        /* *************************************
         *             Game Logic              *
         * *********************************** */

        //APP-FUNCTION SHOW  INIT SCREEN--------------------------------------
        showInitScreen: function() {
            var isMobile = App.mobilecheck();
            if(isMobile===true){
                //check if iphone
                var isIOS = App.iPhoneCheck();
                console.log('you are a mobile');
                App.$gameArea.html(App.$newMobileTemplate);
                App.myRole='Player';
                console.log('i am a ' + App.myRole);
                //make the css and html changes for ios (put buttons higher)
                /*if(isIOS){
                    //make the changes in css here for the 3 buttons (goback, help, enablechangeturn)
                    //.goBack , .helpMobile , .changeTurn to change: top:50%; to top:20%
                    //.css('top', 200);
                    console.log('I AM AN IPHONE !!!!!!!!!!!!!')
                    $('.goBack').css("top", "20%");
                    $('.helpMobile').css("top","20%");
                    $('.changeTurn').css("top","20%");
                }*/
            }else if(isMobile===false){
                console.log('you are a browser');
                App.$gameArea.html(App.$templateIntroScreenBrowser);
                App.myRole = 'Host';
                console.log('I am a ' + App.myRole);
            }
        },
        //-------------------------------------------------------------------
        
        //APP-FUNCTION BROWSER INIT SCREEN-----------------------------------
        browserInitScreen:function(){
            console.log('click!!!!');
            console.log('you are a browser');
            IO.socket.emit('browserWantsToJoinGame',{});
        },
        //-------------------------------------------------------------------
        
        //APP-FUNCTION CHECK IF MOBILE OR BROWSER----------------------------
        mobilecheck :function() {
        var check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
        console.log('check is...' + check);
        return check;
        },
        //-------------------------------------------------------------------
        //APP-FUNCTION CHECK IF MOBILE IS IOS--------------------------------
        iPhoneCheck : function(){
        var iOS = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false );
        return iOS;
        },
        //-------------------------------------------------------------------
        
        //APP-FUNCTION DISPLAY CONNECTION FROM MOBILE------------------------
        displayConnectionFromMobile:function(){
            console.log('click!!!!');
            document.getElementById('welcomeScreenMobile').style.display = "none";
            document.getElementById('connectScreenMobile').style.display = "block";
        },
        //-------------------------------------------------------------------
        
        //APP-FUNCTION SEND CONNECTION FROM MOBILE---------------------------
        sendConnectionFromMobile:function(){
            console.log('send code!!!');
        },
        //-------------------------------------------------------------------
        
        /* *******************************
           *     HOST CODE  (CESIUM)     *
           ******************************* */
        Host : {
            myHostRole:'',
            players : [],
            playersWithPositions:[],
            playersColors:[],
            isNewGame : false,
            isFirstActivation:true,
            enableChangeTurnVal : false,
            numPlayersInRoom: 0,
            numBrowsersInRoom:0,
            shootCount:0,
            targetCount:0,
            isGameOver:false,
			//all other vars
            angle:0,
            elevation:0,
            force:0,
            camIsInElevPos:false,
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

            //APP-HOST-FUNCTION ON CREATE GAME AND ROOM CLICK--------------------
            onCreateClick: function () {
                console.log('create new game and room!!!!');
                App.Host.numBrowsersInRoom++;
            },
            //-------------------------------------------------------------------
        
            //APP-HOST-FUNCTION ONJOIN CLICK--------------------------------------
            onJoinClick: function () {
                console.log('Join game!!!');
                App.$gameArea.html(App.$templateJoinGameAsBrowser);
            },
            //-------------------------------------------------------------------
        
            //APP-HOST-FUNCTION GAME INIT----------------------------------------
            gameInit: function (data) {
                App.gameId = data.gameId;
                console.log('app game id is : ' + App.gameId);
                App.mySocketId = data.mySocketId;
                App.myRole = 'Host';
                App.Host.numPlayersInRoom = 0;
                App.Host.displayNewGameScreen();
                console.log("Game started with ID: " + App.gameId + ' by host: ' + App.mySocketId);
            },
            //-------------------------------------------------------------------
        
            //APP-HOST-FUNCTION HOST START CLICK----------------------------------
            onHostStartClick: function() {
                var data = {
                    gameId : +($('#inputGameId').val()),
                };
                IO.socket.emit('browserJoinGame', data);
                App.myRole = 'Host';
            },
            //-------------------------------------------------------------------
        
            //APP-HOST-DISPLAY NEW GAME SCREEN-----------------------------------
            displayNewGameScreen : function() {
            	console.log('displaynewgame!!!');
                document.getElementById('welcomeText').style.display = "none";
                document.getElementById('waitForConnectionText').style.display = "block";
            },
            //-------------------------------------------------------------------
        
            //APP-HOST-FUNCTION UPDATE WAITING SCREEN ---------------------------
            updateWaitingScreen: function(data) {
                console.log('update waiting screen!');
                App.Host.players.push(data);
                App.Host.numPlayersInRoom ++;
                console.log('num players in room = ' + App.Host.numPlayersInRoom);
                if (App.Host.numPlayersInRoom === 2) {
                    console.log('Room is full. Almost ready!');
                    IO.socket.emit('hostRoomFull',App.gameId);
                    console.log('it is the turn of ' + App.Host.players[App.playerTurn].mySocketId);
                    console.log('players are...');
                    console.log(App.Host.players);
                    App.whosPlayerTurn = App.Host.players[App.playerTurn].mySocketId;
                }
            },
            //-------------------------------------------------------------------
        
            //APP-HOST-FUNCTION ADD NEW HOST--------------------------------------
            addNewHost:function(){
                console.log('add new host!');
                 $('#playersWaiting')
                    .append('<p/>')
                    .text('an other browser joined the game');
                App.Host.numBrowsersInRoom += 1;
                if (App.Host.numPlayersInRoom === 2) {
                }
            },
            //-------------------------------------------------------------------
        
            //APP-HOST-FUNCTION GAME START--------------------------------------

            gameStart: function(){
                console.log('start game as host!!');
                App.$gameArea.html(App.$hostGame);
                $('#player1').find('.teamNameToWrite').html(App.Host.playersWithPositions[0].teamName);
                $('#player2').find('.teamNameToWrite').html(App.Host.playersWithPositions[1].teamName);
                $('#player1').find('.playerInfos').addClass(App.Host.playersWithPositions[0].teamColor);
                $('#player2').find('.playerInfos').addClass(App.Host.playersWithPositions[1].teamColor);
                $('#player1').find('.playerInfos').attr('id',App.Host.playersWithPositions[0].mySocketId);
                $('#player2').find('.playerInfos').attr('id',App.Host.playersWithPositions[1].mySocketId);
            },
            //-------------------------------------------------------------------
        
            //APP-HOST-FUNCTION UPDATE SCORE--------------------------------------
            updateScore:function(data){
                console.log('update score as browser!!!');
                console.log('adding' + data.scoreToAdd +' to my score with the id ' + data.mySocketId);
                var $pScore = $('#' + data.mySocketId).find('.scoreToWrite');
                $pScore.text( +$pScore.text() + data.scoreToAdd );
                $('#scoreInKmToDisplay').text(' '+data.scoreToAdd+' ');
                $('#scoreResultOverlay').show().delay(4000).fadeOut();
            },
            //-------------------------------------------------------------------
        
            //APP-HOST-FUNCTION ALERT NEW TARGET--------------------------------------
            alertTarget:function(data){
                console.log('city is : ' + data.targetName);
                var $pTarget = $('#targetToWrite').text(' ' + data.targetName+ ' ');
                $('#targetOverlay').show().delay(8000).fadeOut();
            },
            //-------------------------------------------------------------------
        
            //APP-HOST-FUNCTION UPDATE BULLETS IN HTML--------------------------------------
            updateNumberOfBulletsAvailable:function(data){
                console.log('update number of bullets available!. this is shoot number' + data.shootCount + 'by socket ' + data.mySocketId);
                $('#'+data.mySocketId).find('.point'+data.shootCount).css("display", "none");
            },
            //-------------------------------------------------------------------
        
            //APP-HOST-FUNCTION TOGGLE HELP--------------------------------------
            toggleHelp:function(data){
                if(App.Host.isFirstActivation){
                console.log('Go sprite Animation!');
                $('#chooseOrientationImgSequence').sprite({fps: 2, no_of_frames: 4});
                $('#chooseElevationimgSequence').sprite({fps: 2, no_of_frames: 3});
                $('#chooseForceImgSequence').sprite({fps: 2, no_of_frames: 3});
                $('#throwImgSequence').sprite({fps: 2, no_of_frames: 2});
                $('#zoomImgSequence').sprite({fps: 2, no_of_frames: 2});
                App.Host.isFirstActivation=false;
                }

                if(App.myRole ==='Host'&& data.mySocketId === App.whosPlayerTurn){
                if(data.clickCount===0){
                }
                else if(data.clickCount===1){
                    $("#tutorialOverlayOrientation").show().delay(4000).fadeOut();
                }
                else if(data.clickCount===2){
                    $("#tutorialOverlayElevation").show().delay(4000).fadeOut();
                }
                else if(data.clickCount===3){
                    $("#tutorialOverlayForce").show().delay(4000).fadeOut();
                }
                else if(data.clickCount===4){
                    $("#tutorialOverlayThrow").show().delay(4000).fadeOut();
                }
                else if(data.clickCount===6){
                    $("#tutorialOverlayZoom").show().delay(4000).fadeOut();
                }
                }

            },
            //-------------------------------------------------------------------
        
            //APP-HOST-FUNCTION ENDGAME--------------------------------------
            endGame : function(data) {
                //STOP THE MAIN MUSIC
                App.stopSound('#soundLoop');
               console.log('Game is over for HOST');
                var $p1 = $('#player1');
                var p1Score = +$p1.find('.scoreToWrite').text();
                var p1Name = $p1.find('.teamNameToWrite').text();
                var $p2 = $('#player2');
                var p2Score = +$p2.find('.scoreToWrite').text();
                var p2Name = $p2.find('.teamNameToWrite').text();
                var winnerName='';
                var winnerScore=0;
                if(p1Score < p2Score){
                    winnerName = p1Name;
                    winnerScore = p1Score;
                    if(App.Host.playersWithPositions[0].teamColor==='blue'){
                        console.log('p1 won with color blue');
                    }else if(App.Host.playersWithPositions[0].teamColor==='red'){
                        console.log('p1 won with color red');
                        $('#gameOverHostImg').attr('src','data/newLogo/game_over_orange.png'); 
                        //$('#gameOverOverlay').css( "background-color", "rgba(255,121,77,0.6)");
                        $('#gameOverResult').css( "background-color", "rgb(255,121,77)");
                        $('#restart').css( "background-color", "rgb(255,121,77)");
                    } 
                }else{
                    winnerName = p2Name;
                    winnerScore = p2Score;
                     if(App.Host.playersWithPositions[1].teamColor==='blue'){
                        console.log('p2 won with color blue');
                    }else if(App.Host.playersWithPositions[1].teamColor==='red'){
                        console.log('p2 won with color red');
                        $('#gameOverHostImg').attr('src','data/newLogo/game_over_orange.png');
                        //$('#gameOverOverlay').css( "background-color", "rgba(255,121,77,0.6)"); 
                        $('#gameOverResult').css( "background-color", "rgb(255,121,77)");
                        $('#restart').css( "background-color", "rgb(255,121,77)");  
                    } 
                }
                $('#winnerTeamToWrite').text(' '+winnerName+' ');
                $('#winnerScoreToWrite').text(' ' + winnerScore+' ');
                document.getElementById('gameOverOverlay').style.display = "block";
                App.Host.numPlayersInRoom = 0;
                App.Host.isNewGame = true;
                //SOUND
                App.playSound('#soundWinner');
            },
            //-------------------------------------------------------------------
        
            //APP-HOST-FUNCTION RESTART GAME--------------------------------------
            restartGame : function() {
                App.$gameArea.html(App.$templateNewGame);
                $('#spanNewGameCode').text(App.gameId);
            },
            //-------------------------------------------------------------------
        
            //APP-HOST-TOGGLE COLORS--------------------------------------
            toggleBackgroundColor:function(){
                console.log('toggle background-color and color of target div!');
                console.log('color of player active is ' + App.Host.playersWithPositions[App.playerTurn].teamColor);
                if(App.Host.playersWithPositions[App.playerTurn].teamColor ==='red'){
                    console.log('red!');
                    $('.tutorialOverlay').css( "background-color", "rgba(255,121,77,1)");
                    $('.overlay').css( "background-color", "rgba(255,121,77,1)");
                    //$("body").css( "background-color", "rgb(255,205,194)");
                    //$('#gameAreaHost').css("border-color", "rgb(255,76,35)");
                    //$("#targetName").css( "background-color", "rgb(255,76,35)");
                   // do the same for help divs
                   //$('.overlay').css("background-color", "rgba(255,205,194,0.8)");
                   //$('.alertBox').css("background-color", "rgb(255,121,77)");

                }else if(App.Host.playersWithPositions[App.playerTurn].teamColor==='blue'){
                    console.log('blue!');
                    $('.tutorialOverlay').css( "background-color", "rgba(0,212,188,1)");
                    $('.overlay').css( "background-color", "rgba(0,212,188,1)");
                    //$("body").css( "background-color", "rgb(237,253,252)");
                    //$('#gameAreaHost').css("border-color", "rgb(0,212,188)");
                    //$("#targetName").css( "background-color", "rgb(0,212,188)");
                    // do the same for help divs
                    //$('.overlay').css("background-color", "rgba(199,255,249,0.8)");
                    //$('.alertBox').css("background-color", "rgb(0,212,188)");
                    //$('.changeTurn').css()
                }
            },

            /* *************************************
             *                CESIUM               *
             * *********************************** */

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
                var viewer = new Cesium.Viewer('cesiumContainer',{
                    animation:false,
                    baseLayerPicker:false,
                    fullscreenButton:false,
                    geocoder:false,
                    homeButton:false,
                    infobBox:false,
                    sceneModePicker:false,
                    selectionIndicator:false,
                    timeline:false,
                    navigationHelpButton:false,
                    navigationInstructionsInitiallyVisible:false,
                    terrainProvider : new Cesium.CesiumTerrainProvider({
                         url : '//assets.agi.com/stk-terrain/world'
                    })
                });
                //COLORS OF GLOBE
                var imageryLayers = viewer.imageryLayers;
                var layer = imageryLayers.get(0);
                layer.brightness= 1.38;//1.26;
                layer.contrast= 1.18;//0.98;
                layer.hue= 0;
                layer.saturation=1.48; //1.7;
                layer.gamma=1.1; //1.02;//1.62;
                //
                var scene = viewer.scene;
                var clock = viewer.clock;
                var entities = viewer.entities;
                var camera = viewer.camera;
                var countCam=0;
                var cameraMaxheight= 4000000; //taken from cesium
                var cameraMinHeightWhileFlying=0;
                var cameraPosInit;
                var transform;
                //SCORE & TARGETS----------
                var score=0;
                var scoreToSend=0;
                //-------------------------
                var toleranceKM=600;
                var playerPosition = new Cesium.Cartesian3.fromDegrees(App.Host.playerLng,App.Host.playerLat,0);
                var test = [[0],[1]];
                var targetCollection = [['Berlin','52.493805', '13.455292'],['London', '51.36', '00.05'],['Paris','48.50','02.20'],['Reykjavik','64.10','-21.57'],['Budapest','47.29','19.05']];
                var targetName='';
                var targetLat=0;
                var targetLng=0;
                var targetPosition=0;
                var targetHeight=0;
                var shootCount=0;
                var targetCount=-1;
                var isFlying=false;
                var isFlyingWithNoDelay=false;
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
                var arrivalAltitude =0 ;
                //--------------------
                //COLOR TESTS---------
                var player1Color = Cesium.Color.RED;
                var player2Color = Cesium.Color.BLUE;
                var targetColor = Cesium.Color.YELLOW;
                //--------------------
                //MARKER TARGET TEST-----
                var markerTarget1;
                var markerTarget2;
                var markerTarget3;
                var targetCreatedCount=0;
                //-----------------------
                ///TIME
                var start = Cesium.JulianDate.now();
                var stop = Cesium.JulianDate.addHours(start, 1, new Cesium.JulianDate()); 
                var publicArrivalTime = new Cesium.JulianDate();
                var publicArrivalTimeWithDelay = new Cesium.JulianDate();
                var waitingSecondsOnTarget=2;
                //Make sure viewer is at the desired time.
                viewer.clock.startTime = start.clone();
                viewer.clock.stopTime = stop.clone();
                viewer.clock.currentTime = start.clone();
                viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //Loop at the end
                viewer.clock.multiplier = 1;
                // disable the default event handlers
                scene.screenSpaceCameraController.enableRotate = false;
                scene.screenSpaceCameraController.enableTranslate = false;
                //scene.screenSpaceCameraControler.enableZoom = false;
                scene.screenSpaceCameraController.enableTilt = false;
                scene.screenSpaceCameraController.enableLook = false;
                console.log('readytoplay');
                switchPlayers();
                setLines(App.Host.playersWithPositions[0].playerLat, App.Host.playersWithPositions[0].playerLng);
                setLines(App.Host.playersWithPositions[1].playerLat, App.Host.playersWithPositions[1].playerLng);
                setReferenceFrame(App.Host.playerLat, App.Host.playerLng,true);
                
                makeOriginPointPlayer(App.Host.playersWithPositions[0]);
                makeOriginPointPlayer(App.Host.playersWithPositions[1]);                
                changeTarget();   
                var targetPosition2 = new Cesium.Cartesian3.fromDegrees(targetLng,targetLat,targetHeight*5);
                var targetPosition3 = new Cesium.Cartesian3.fromDegrees(targetLng,targetLat,targetHeight*10);
                makeOriginPointTarget(targetPosition, targetColor);

                ///CESIUM FUNCTION INTERPOLATE PATH-----------------------
                function interpolatePath( posInit, lat, lng, speed, angleVol, angleSol ){
                    console.log('interpolate path...');
                    var computedPositions = rotatePoint(posInit,lat,lng, speed, angleVol, angleSol);
                    //color
                    var color;
                    if(App.Host.playersWithPositions[App.playerTurn].teamColor ==='blue'){
                        color = Cesium.Color.AQUAMARINE;
                    }else if(App.Host.playersWithPositions[App.playerTurn].teamColor ==='red'){
                        color = Cesium.Color.CORAL;
                    }
                    //
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
                            uri : 'test_old.gltf',
                            minimumPixelSize : 24,
                            size:0.8,
                        },
                        //Show the path as a yellow line sampled in .2 second increments.
                        path : {
                            resolution : 0.2,
                            material:color,
                            /*material : new Cesium.PolylineGlowMaterialProperty({
                                glowPower : 0.5,
                                color : color
                            }),*/
                            width : 4
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

                ////CESIUM FUNCTION CHOOSE RANDOM TARGET------------------
                function changeTarget(){
                    console.log('should reset points here!');
                    $('#'+App.Host.playersWithPositions[0].mySocketId).find('.point1').css("display", "inline-block");
                    $('#'+App.Host.playersWithPositions[0].mySocketId).find('.point2').css("display", "inline-block");
                    $('#'+App.Host.playersWithPositions[0].mySocketId).find('.point3').css("display", "inline-block");
                    $('#'+App.Host.playersWithPositions[1].mySocketId).find('.point1').css("display", "inline-block");
                    $('#'+App.Host.playersWithPositions[1].mySocketId).find('.point2').css("display", "inline-block");
                    $('#'+App.Host.playersWithPositions[1].mySocketId).find('.point3').css("display", "inline-block");
                    if(App.Host.targetCount===App.numberOfTargets){
                        console.log('send socket to say game is over!');
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
                    targetPosition= new Cesium.Cartesian3.fromDegrees(targetLng,targetLat,targetHeight);
                    console.log('targetposition is :');
                    console.log(targetPosition);
                    console.log('chosen city is' + targetName +' '+targetLat +' '+ targetLng);
                    IO.socket.emit('targetAlert', {gameId:App.gameId, targetName:targetName});
                    document.getElementById("targetName").innerHTML = targetName;
                    }
                    App.Host.targetCount++;
                }
                /////----------------------------------------------
                
                ///CESIUM FUNCTION SET REFERENCE FRAME--------------------
                function setReferenceFrame(lat, lng , isForOrientation) {
                    var center = Cesium.Cartesian3.fromDegrees(lng, lat);
                    transform = Cesium.Transforms.eastNorthUpToFixedFrame(center);
                    if(isForOrientation){
                    camera.lookAtTransform(transform, new Cesium.HeadingPitchRange(Cesium.Math.toRadians(0), Cesium.Math.toRadians(-15), 120000));
                    //var cameraHeight = ellipsoid.cartesianToCartographic(camera.positionWC).height;
                    console.log(ellipsoid.cartesianToCartographic(camera.positionWC).height);
                    console.log('lat= ' + lat +', lng = '+ lng);
                    }else{
                    camera.lookAtTransform(transform, new Cesium.HeadingPitchRange(Cesium.Math.toRadians(App.Host.angle-10), Cesium.Math.toRadians(-15), 120000));
                    //camera.lookAtTransform(transform, new Cesium.HeadingPitchRange(Cesium.Math.toRadians(0), Cesium.Math.toRadians(-15), 120000));  
                    }
                    
                }
                /////----------------------------------------------

                ///CESIUM FUNCTION SET LINES------------------------------
                function setLines(lat, lng){
                        console.log('we should remove former lines!');
                        polylines.removeAll();
                    positionElevation1 = Cesium.Cartographic.fromDegrees(lng, lat);
                    positionElevation2 = Cesium.Cartographic.fromDegrees(lng, lat+.3);

                    positionElevationCartesian1 = ellipsoid.cartographicToCartesian(positionElevation1);
                    positionElevationCartesian2 = ellipsoid.cartographicToCartesian(positionElevation2);

                    polylineLength = Cesium.Cartesian3.distance(positionElevationCartesian1, positionElevationCartesian2)/1000;
                    positionsElevation = [positionElevation1, positionElevation2];
                    polylineElevation = polylines.add({
                    width:4,
                    positions : ellipsoid.cartographicArrayToCartesianArray(positionsElevation),
                    material : Cesium.Material.fromType('Color', {
                        color : Cesium.Color.WHITE
                        })
                    });

                    positionOrientation1 = Cesium.Cartographic.fromDegrees(lng, lat);
                    positionOrientation2 = Cesium.Cartographic.fromDegrees(lng, lat+.6);

                    positionOrientationCartesian1 = ellipsoid.cartographicToCartesian(positionOrientation1);
                    positionOrientationCartesian2 = ellipsoid.cartographicToCartesian(positionOrientation2);
                    
                    polylineLengthOrientation = Cesium.Cartesian3.distance(positionOrientationCartesian1, positionOrientationCartesian2)/1000;
                    positionsOrientation = [positionOrientation1, positionOrientation2];
                    polylineOrientation = polylines.add({
                    width:4,
                    positions : ellipsoid.cartographicArrayToCartesianArray(positionsOrientation),
                    material : Cesium.Material.fromType('Color', {
                        color : Cesium.Color.WHITE
                        })
                    });
                }
                /////----------------------------------------------
                
                ///CESIUM FUNCTION  CALCULATE ELEVATION ANGLE ------------
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

                ///CESIUM FUNCTION CAMERA ROTATE--------------------------
                function customCameraRotate(alpha, absAlpha){
                    //here, need to get the current range and keep it.
                    //camera.lookAtTransform(transform, new Cesium.HeadingPitchRange(Cesium.Math.toRadians(App.Host.angle*-1+10), Cesium.Math.toRadians(-15), 120000));
                    camera.lookAtTransform(transform, new Cesium.HeadingPitchRange(Cesium.Math.toRadians(App.Host.angle*-1+4), Cesium.Math.toRadians(-15), 120000));
                }
                /////----------------------------------------------
                
                ///CESIUM CLOCK ONTICK----------------------
                viewer.clock.onTick.addEventListener(function(clock) {
                    //// Change movement speed based on the distance of the camera to the surface of the ellipsoid.
                    var cameraHeight = ellipsoid.cartesianToCartographic(camera.positionWC).height;
                    var moveRate = cameraHeight / 80;

                    if(App.Host.rotateCamera===true && isFlying===false){
                        customCameraRotate(App.Host.mobileAlpha, App.Host.mobileAbsAlpha);
                        updateOrientation(polylineOrientation, positionOrientation1, positionOrientation2);
                        updateOrientation(polylineElevation,positionElevation1,positionElevation2);
                    }
                    else if(App.Host.updateElev === true){
                        if(!App.Host.camIsInElevPos){
                        //setReferenceFrame(App.Host.playerLat, App.Host.playerLng,false);
                        App.Host.camsIsInElevPos=false;
                        }
                        updateElevation();
                    }
                    if(App.Host.throwGo===true){
                        throwBullet();
                        isFlying=true;
                        isFlyingWithNoDelay=true;
                        console.log('flying.....');
                        App.Host.throwGo = false;
                    }
                    //Set the camera with boundingsphere and entity view! (https://groups.google.com/forum/#!msg/cesium-dev/ES4tnBr7mx8/mUknrw00BVYJ + https://cesiumjs.org/Cesium/Build/Documentation/EntityView.html)
                    if(isFlying && isFlyingWithNoDelay && Cesium.JulianDate.greaterThanOrEquals(viewer.clock.currentTime, publicArrivalTime)===true){
                        //SOUND
                        App.stopSound('#soundWind');
                        App.playSound('#soundLanding');
                        isFlyingWithNoDelay=false;
                    }
                    else if(!isFlyingWithNoDelay && isFlying && Cesium.JulianDate.greaterThanOrEquals(viewer.clock.currentTime, publicArrivalTimeWithDelay)===true){
                        //SOUND GOOD OR BAD HERE
                        if(scoreToSend>=800){
                            console.log('you suck');
                            App.playSound('#soundBad2');
                        }
                        if(scoreToSend>500 && scoreToSend<800){
                            App.playSound('#soundBad1');
                        }
                        else if(scoreToSend<200&& scoreToSend>50){
                            var soundsToChoose = ['#soundGood1','#soundGood2','#soundGood3','#soundGood4','#soundGood5'];
                            var randomSound = Math.round(Math.random()*soundsToChoose.length);
                            console.log('good!');
                            console.log(soundsToChoose[randomSound])
                            App.playSound(soundsToChoose[randomSound]);
                        }
                        else if(scoreToSend<=50){
                            console.log('very good !');
                            App.playSound('#soundVeryGood');

                        }

                        console.log('has arrived, lets send the socket');
                        console.log('app.game id = ' + App.gameId);
                        IO.socket.emit('ball_has_arrived', {gameId:App.gameId, mySocketId:App.whosPlayerTurn, 'hasArrived':'hasArrived'});
                        IO.socket.emit('updateScore',{gameId:App.gameId, mySocketId:App.whosPlayerTurn, scoreToAdd: scoreToSend});
                        countCam=0;
                        //switchPlayers();
                        isFlying=false;
                    }
                    else if(App.Host.enableChangeTurnVal===true){
                        switchPlayers();
                        App.Host.enableChangeTurnVal = false;
                    }
                    //ZOOM WHILE FLYING
                    else if(isFlying && App.Host.isBackward && cameraHeight < cameraMaxheight){
                        camera.moveBackward(moveRate);
                        //console.log('camera height = ' + cameraHeight +' VS '+ cameraMinHeightWhileFlying);
                    }else if(isFlying && App.Host.isForward && cameraHeight>cameraMinHeightWhileFlying){
                        camera.moveForward(moveRate);
                        //console.log('camera height = ' + cameraHeight +' VS '+ cameraMinHeightWhileFlying);
                    }
                    //ZOOM WHILE LANDED
                    else if(!isFlying && App.Host.isBackward && cameraHeight < cameraMaxheight){
                        camera.moveBackward(moveRate);
                        //console.log('camera height = ' + cameraHeight);
                    }else if(!isFlying && App.Host.isForward && cameraHeight> arrivalAltitude+500){
                        camera.moveForward(moveRate);
                        //console.log('camera height = ' + cameraHeight);
                    }
                });
                /////----------------------------------------------
                /////CESIUM FUNCTION CHANGE PLAYER------------------------
                function switchPlayers(){
                	console.log('switchPlayers()....');
                	App.Host.shootCount++;
       				console.log('shootCounts = ' + App.Host.shootCount);
        			if(App.Host.shootCount===App.numberOfShoots*2+1){
	        			App.Host.shootCount=1;
	        			console.log('change target!!!');
	        			changeTarget(); 
                        makeOriginPointTarget(targetPosition, targetColor);
	        		}                    
                	App.playerTurn = 1-App.playerTurn;
                	console.log('change player positions...');
		            App.whosPlayerTurn = App.Host.playersWithPositions[App.playerTurn].mySocketId;
		            IO.socket.emit('changeTurn', {gameId:App.gameId, mySocketId:App.whosPlayerTurn, 'changeTurn':'changeTurn'});
		            // change the vars that are needed:
                    App.Host.toggleBackgroundColor();
		            App.Host.playerLat = App.Host.playersWithPositions[App.playerTurn].playerLat;
		            App.Host.playerLng = App.Host.playersWithPositions[App.playerTurn].playerLng;
		            playerPosition = new Cesium.Cartesian3.fromDegrees(App.Host.playerLng,App.Host.playerLat,0);
		            console.log('playerLat = ' + App.Host.playerLat);
		            console.log('playerlng = ' + App.Host.playerLng);
		            console.log('player positions = ' + playerPosition);
		            //call functions to change POV
		            setLines(App.Host.playerLat, App.Host.playerLng);
		            setReferenceFrame(App.Host.playerLat, App.Host.playerLng,true);
		            //makeOriginPoint(playerPosition, new Cesium.Color.RED());
		            //makeOriginPointTarget(targetPosition, targetColor);
                    //underline the team that is playing
                    $('#' + App.Host.playersWithPositions[1-App.playerTurn].mySocketId).find('.teamName').css("text-decoration","none");
                    $('#' + App.Host.playersWithPositions[App.playerTurn].mySocketId).find('.teamName').css("text-decoration","underline");
                }
                //-------------------------------------------------
                ///CESIUM FUNCTION UPDATE ORIENTATION-----------------------
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

                ///CESIUM FUNCTION THROW BULLET---------------------------
                function throwBullet(){
                    console.log('THRW IT!!!');
                    //SOUND
                    App.startSound('#soundWind');
                    if(App.Host.force>0 && App.Host.elevation>0){
                        interpolatePath(playerPosition, App.Host.playerLat, App.Host.playerLng, App.Host.force, App.Host.elevation, App.Host.angle); console.log('THROW!!!!!!!!');
                    }
                    App.Host.force=0;
                    App.Host.elevation=0;
                }
                /////----------------------------------------------

                ///CESIUM FUNCTION MAKE ORINIG POINT----------------------
                function makeOriginPointTarget(location, color){
                    //billboard
                    
                    if(targetCreatedCount===0){
                        markerTarget1 = viewer.entities.add({
                            position : location,
                            billboard :{
                                image : 'data/marker_target.png',
                                verticalOrigin : Cesium.VerticalOrigin.BOTTOM
                            }
                        }); 
                        markerTarget1.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
                    }
                    //
                    else if(targetCreatedCount===1){
                        //grey last marker
                        markerTarget1.billboard.color = new Cesium.Color(1.0, 1.0, 1.0, 0.4);
                        //make other one
                        markerTarget2 = viewer.entities.add({
                            position : location,
                            billboard :{
                                image : 'data/marker_target.png',
                                verticalOrigin : Cesium.VerticalOrigin.BOTTOM
                            }
                        }); 
                        markerTarget2.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
                    }
                    //
                    //
                    else if(targetCreatedCount===2){
                        //grey last marker
                        markerTarget2.billboard.color = new Cesium.Color(1.0, 1.0, 1.0, 0.4);
                        //make other one
                        markerTarget3 = viewer.entities.add({
                            position : location,
                            billboard :{
                                image : 'data/marker_target.png',
                                verticalOrigin : Cesium.VerticalOrigin.BOTTOM
                            }
                        }); 
                        markerTarget3.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
                    }
                    targetCreatedCount ++;
                    console.log('target created count = ' + targetCreatedCount);

                    
                }
                /////----------------------------------------------

                ///CESIUM FUNCTION MAKE ORINIG POINT CUSTOM----------------------
                function makeOriginPointPlayer(player){
                     var color ;
                     var src ;
                     var position = new Cesium.Cartesian3.fromDegrees(player.playerLng, player.playerLat,0);
                     if(player.teamColor ==='blue'){
                        color = Cesium.Color.AQUAMARINE;
                        src = 'data/marker_green.png';
                     }else if(player.teamColor==='red'){
                        color = Cesium.Color.CORAL;
                        src = 'data/marker_orange.png';
                     }
                    //billboard
                    var marker = entities.add({
                        position : position,
                        billboard :{
                            image : src,
                            verticalOrigin : Cesium.VerticalOrigin.BOTTOM
                        }
                    });
                }
                /////----------------------------------------------

                ///CESIUM FUNCTION COMPUTE DISTANCE-----------------------
                function computeDistance(location1, location2){
                    console.log('compute distance');
                    var distanceKM = Cesium.Cartesian3.distance(location1, location2)/1000;
                }
                /////----------------------------------------------

                ///CESIUM COMPUTE DISTANCE TO TARGET----------------------
                function computeDistanceToTarget(location1, location2){
                    console.log('compute distance to target!');
                    console.log('location 1 = ');
                    console.log(location1);
                    console.log('location2= ');
                    console.log(location2);
                    var distanceKM = Cesium.Cartesian3.distance(location1, location2)/1000;
                    var scoreToAdd= Math.round(distanceKM);
                    score+=scoreToAdd;
                    scoreToSend = scoreToAdd;
                    console.log('distance in km to target= ' + distanceKM);
                }
                /////----------------------------------------------

                ///CESIUM CUSTOM FUNCTION TO CALCULATE--------------------
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

                //CESIUM FUNCTION GET ARRIVAL POINT-----------------------
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
                
                //CESIUM FUNCTION GET MIDWAY POINT------------------------
                function getMidWayPoint(posInit,lat, lng, speed, angle){
                    var curveResults= getCurve(speed,angle,0);
                    var height = curveResults[1];
                    var midHorizontalDistance = curveResults[0]/2;
                    var computedDistances = turnDistancesIntoLatLng(midHorizontalDistance,0,lat,lng);
                    var customLat = computedDistances[0];
                    var customLng = computedDistances[1];
                    var midWay = new Cesium.Cartesian3.fromDegrees(customLng, customLat, height*1000);
                    cameraMinHeightWhileFlying = height*1000 + 5000;
                    return midWay;
                }
                /////----------------------------------------------

                ////////CESIUM TURN DISTANCES INTO LATLNG------------------------------
                var turnDistancesIntoLatLng = function (distX, distY,lat,lng){
                    var distX = mapValue(distX,-20037,20037, -180,180)+lat;
                    var distY = mapValue(distY, -20037,20037,-90,90)+lng;
                    return [distX, distY];
                };
                /////----------------------------------------------

                ////////CESIUM MAP VALUE-----------------------------------------------
                function mapValue(value, low1, high1, low2, high2) {
                  //example : map_range(-1, 0, 1, 0, 100) returns -100.
                    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
                }
                /////----------------------------------------------

                //CESIUM FUNCTION ROTATEPOINT-----------------------------
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
                    publicArrivalTime = Cesium.JulianDate.addSeconds(viewer.clock.currentTime, timeArrival+0, new Cesium.JulianDate());
                    publicArrivalTimeWithDelay = Cesium.JulianDate.addSeconds(viewer.clock.currentTime, timeArrival+waitingSecondsOnTarget, new Cesium.JulianDate());
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
                    //calculate height of arrival point for the camera.
                    //getElevationForArrivalPoint(arrivalPosition);
                    //var cartographicPosition = Cesium.Ellipsoid.WGS84.cartesianToCartographic(position);
                    var arrivalPoint = ellipsoid.cartesianToCartographic(q);
                    //var pointOfInterest = Cesium.Cartographic.fromDegrees(-99.64592791446208, 61.08658108795938, 5000, new Cesium.Cartographic());
                    Cesium.sampleTerrain(viewer.terrainProvider, 9, [arrivalPoint]).then(function(samples) {
                        console.log('Height in meters is: ' + samples[0].height);
                        arrivalAltitude = samples[0].height;
                    });
                    return property;
                }
                /*
                //////FUNCTION GET ELEVATION FOR ARRIVAL POINT--------------------
                function getElevationForArrivalPoint(arrivalPosition){
                    Cesium.sampleTerrain(viewer.terrainProvider, 6, [arrivalPosition]).then(function(samples) {
                        console.log('Height in meters is: ' + samples[0].height);
                        arrivalAltitude = samples[0].height;
                    });
                }
                */

                /////CESIUM SMOOTH VALUE------------------------------------------
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
            isRed:true,
            isReadyForFunFact:false,
            teamColor:'',
            isMyTurn:'',
            isGameOver:false,
            isIphone:false,
            shootCount:0,
            targetCount:0,
            playerLat:'',
            playerLng:'',
            playerCoordinates:[],
            clickCount:0,
            absAlpha: 0,
            alphaToUse:0,
            betaToUse:0,
            alphaForResume:0,
            betaForResume:0,
            forceForResume:0,
            betaMobileSmoothOld:0,
            betaSent:0,
            volumeToUse:0,
            higherVolume:0,
            averageToUse:0,
            allForces:0,
            allOldForces:0,
            higherForce:0,
            forceChoice:0,
            precisionForce:0,
            precisionForceToUse:0,
            isFlying:false,
            isButtonForcePressed:false,
            myLoop:'',
            forceMultiplyFactorVol:1.5,
            forceMultiplyFactorShake:4,
            forceMultiplyFactorTouch:1,
            isGeolocated:false,
            round:'',
            score:'',
            shouldCount:'false',
            currentTarget:'',
            compass:'',
            //-------------------------------------------------------------------
            onJoinClick: function () {
                console.log('Join game!!!');
                App.$gameArea.html(App.$templateJoinGame);
            },
            //-------------------------------------------------------------------
        
            //APP-PLAYER-FUNCTION ON PALYER START CLICK-------o-------------------
            onPlayerStartClick: function() {
                var data = {
                    gameId : +($('#inputGameId').val()),
                    playerName : $('#inputPlayerName').val() || 'anon'
                };
                console.log('trying to join with');
                console.log(data);
                IO.socket.emit('playerJoinGame', data);
                App.myRole = 'Player';
                App.Player.myName = data.playerName;
                App.Player.clickCount=0;
            },
            //-------------------------------------------------------------------
        
            //APP-PLAYER-FUNCTION ON PLAYER RESTART------------------------------
            onPlayerRestart : function() {
                var data = {
                    gameId : App.gameId,
                    playerName : App.Player.myName
                }
                IO.socket.emit('playerRestart',data);
                App.currentRound = 0;
                $('#gameArea').html("<h3>Waiting on host to start new game.</h3>");
            },
            //-------------------------------------------------------------------
        
            //APP-PLAYER-FUNCTION UPDATE WAITING SCREEN--------------------------
            updateWaitingScreen : function(data) {
                if(IO.socket.id === data.mySocketId){
                    document.getElementById('connectScreenMobile').style.display = "none";
                    document.getElementById('waitForConnectionScreenMobile').style.display = "block";
                    App.myRole = 'Player';
                    App.gameId = data.gameId;
                    document.getElementById("playerWaitingMessage").innerHTML ='You are connected succesfully under the name ' + data.playerName + ' in game n° ' + data.gameId +'. Please wait for other player to begin';
                }
            },
            //-------------------------------------------------------------------
            //APP-PLAYER_FUNCTION NEXT FUN FACT----------------------------------
            onNextFunFact : function(){
                console.log('next fun fact here!');
                IO.socket.emit('askFunFact',{gameId:App.gameId, mySocketId:App.mySocketId, currentTarget:App.Player.currentTarget}); 
            },
            //-------------------------------------------------------------------
                        
            //APP-PLAYER_FUNCTION DISPLAY FUN FACT---------------------------------
            displayFunFact: function(targetName, funFact){
                console.log('display fun fact :' + targetName + 'fun fact = ' + funFact);
                $('#funFactToDisplay').text(funFact);
            },
            //-------------------------------------------------------------------

            //APP-PLAYER-FUNCTION ASK HELP---------------------------------------
            askHelp:function(){
                console.log('someone asked for help, send a socket!');
                IO.socket.emit('askHelp',{gameId:App.gameId, mySocketId:App.mySocketId, playerLat:App.Player.playerLat, teamColor:App.Player.teamColor, clickCount:App.Player.clickCount});

            },
            //-------------------------------------------------------------------
            //APP-PLAYER-FUNCTION GO BACK---------------------------------------
            goBack:function(){
                console.log('goback!!!');
                App.Player.clickCount-=2;
                App.Player.customClick();
            },
            //APP-PLAYER-FUNCTION GAME START-------------------------------------
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
            //-------------------------------------------------------------------
        
            //APP-PLAYER-FUNCTION UPDATE SCORE-----------------------------------
            updateScore:function (data){
            	console.log('adding' + data.scoreToAdd +' to my score with the id ' + data.mySocketId);
                var $pScore = $('#' + data.mySocketId);
                $pScore.text( +$pScore.text() + data.scoreToAdd );
            },
            //-------------------------------------------------------------------
        
            //APP-PLAYER-FUNCTION ALERT TARGET-----------------------------------
            alertTarget:function(data){
                alert('A new target is chosen: '+ data.targetName); 
                App.Player.currentTarget = data.targetName;
            },
            //-------------------------------------------------------------------
        
            //APP-PLAYER-FUNCTION END GAME---------------------------------------
            endGame : function() {
            	console.log('endgame for player!!!!');
                document.getElementById('orientationMobileWrapper').style.display = "none";
                document.getElementById('azimuthMobileWrapper').style.display = "none";
                document.getElementById('forceMobileWrapper').style.display = "none";
                document.getElementById('throwMobileWrapper').style.display = "none";
                document.getElementById('zoomMobileWrapper').style.display = "none";
                document.getElementById('waitMobileWrapper').style.display = "none";
                document.getElementById('gameOverMobile').style.display = "block";
            },
            //-------------------------------------------------------------------
        
            //APP-PLAYER-FUNCTION GET LOCATION-----------------------------------
            getLocation:function(){
                console.log('GET LOCATION!!!!!');
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(App.Player.showPosition);
                } else {
                    x.innerHTML = "Geolocation is not supported by this browser.";
                }
            },
            //-------------------------------------------------------------------
        
            //APP-PLAYER-FUNCTION SHOW POSITION----------------------------------
            showPosition:function (position) {
                //App.Host.playerLat = position.coords.latitude;
                //App.Host.playerLng=position.coords.longitude;
                App.Player.playerLat = position.coords.latitude;
                App.Player.playerLng = position.coords.longitude;
                App.Player.playerCoordinates.push(App.Player.playerLat,App.Player.playerLng);
                console.log(App.Player.playerCoordinates);
                App.Player.isGeolocated=true;
                //getting the color
                if(App.Player.isGeolocated===true){
                    console.log('emit socket with position!!!');
                    IO.socket.emit('sendGeoLocation',{gameId:App.gameId, mySocketId:App.mySocketId, playerLat:App.Player.playerLat, playerLng:App.Player.playerLng, teamName:App.Player.myName, teamColor:App.Player.teamColor});
                }
            },
            //-------------------------------------------------------------------
        
            //APP-PLAYER-FUNCTION CUSTOM INIT------------------------------------
            customInit: function(){
            console.log('controller init! C est parti');
            console.log('geolocation...');
            App.Player.getLocation();
    
            document.getElementById('controlsScreenMobile').style.display="block";
            if(App.Player.isRed===false){
                console.log('i am blue, we change colors!');
                //$(".controlTopBoxMobile").css( "background-color", "rgb(218,232,231)");
                //$(".logoBoxMobile").css( "background-color", "rgb(174,232,228)");
                $(".helpMobile").css( "background-color", "rgb(0,212,188)");
                $('.circleImg').attr('src','data/green_circle.png');
                $('.waitMobileImg').attr('src','data/newLogo/logo_wait_green.png');
                $('#gameOverImgMobile').attr('src','data/newLogo/game_over_green.png');
                $('.goBack').css( "background-color", "rgb(0,212,188)");
                $('.changeTurn').css( "background-color", "rgb(0,212,188)");
            }
            App.Player.compass = document.getElementById('compass')
            var dataContainerOrientation = document.getElementById('dataContainerOrientation');
            var dataContainerMotion = document.getElementById('dataContainerMotion');
            //var compass = document.getElementById('compass');
            var elevation = document.getElementById('elevationImg');
            var angleToDisplay = document.getElementById('angleToDisplay');
            var angle = document.getElementById('angle');
            var force = document.getElementById('force');
            var oldAlpha=0;
            var smoothedAlpha=0;
            var alpha=0;
            if(window.DeviceOrientationEvent && App.Player.isFlying===false) {

                window.addEventListener('deviceorientation', function(event) {
                    var dir ='';
                    if(event.webkitCompassHeading) {
                    alpha = Math.abs(event.webkitCompassHeading-360);
                    App.Player.isIphone = true;
                    }
                    else alpha = event.alpha;
                    var beta = event.beta;
                    var gamma = event.gamma;
                    
                    App.Player.betaToUse=beta;
                    var roundedBeta = Math.round(App.Player.betaToUse);
                //ORIENTATION
                if(App.Player.clickCount===1){  
                smoothedAlpha = alpha; 
                App.Player.alphaToUse = smoothedAlpha;                 
                }
                /*
                  App.Player.alphaForResume = Math.round(smoothedAlpha);
                  compass.style.Transform = 'translate(-50%,-50%) rotate( ' + smoothedAlpha + 'deg)';
                  compass.style.WebkitTransform = 'translate(-50%,-50%) rotate( '+ smoothedAlpha + 'deg)';
                  compass.style.MozTransform = 'translate(-50%,-50%) rotate(' + smoothedAlpha + 'deg)';
                  IO.socket.emit('send_data_angle',{gameId:App.gameId, mySocketId:App.mySocketId, alpha: smoothedAlpha});
                  var roundedAlpha = Math.round(App.Player.alphaToUse);
                  angleToDisplay.innerHTML = roundedAlpha;
                  //oldAlpha=smoothedAlpha;
                }*/
                
                //ELEVATION       
                else if(App.Player.clickCount===2 && App.Player.betaToUse>=0 && App.Player.betaToUse<=90){
                  var smoothedBeta = App.Player.smoothValueMobile(App.Player.betaMobileSmoothOld, App.Player.betaToUse, 0.1);
                  IO.socket.emit('send_data_elevation',{gameId:App.gameId, mySocketId:App.mySocketId, beta:smoothedBeta});
                  App.Player.betaSent = smoothedBeta;
                  App.Player.betaForResume = Math.round(smoothedBeta);
                   if(smoothedBeta<=90){
                    elevation.style.WebkitTransform = 'translate(-50%,-50%) rotate(' + smoothedBeta*-1 +'deg)';
                    elevation.style.Transform = 'translate(-50%,-50%) rotate(' + smoothedBeta*-1 +'deg)';
                    elevation.style.MozTransform ='translate(-50%,-50%) rotate(' + smoothedBeta*-1 +'deg)';
                    }
                    if(Math.round(smoothedBeta)<=90){
                    angle.innerHTML = Math.round(smoothedBeta);
                    }else if(Math.round(smoothedBeta)>90){
                    angle.innerHTML = '90';
                    }
                  //set the old smooth
                  App.Player.betaMobileSmoothOld = smoothedBeta;
                }
                });
                
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
                        //FORCE
                        if(App.Player.clickCount===4 ){
                            App.Player.allForces = Math.abs(x) + Math.abs(y)+ Math.abs(z)*App.Player.forceMultiplyFactorShake;
                            var allForcesToUse = Math.round(App.Player.allForces);
                            if(App.Player.allForces>App.Player.higherForce){App.Player.higherForce=App.Player.allForces};
                            /*shakeForce.innerHTML =App.Player.higherForce;*/
                            var distanceInKm= App.Player.getCurveCustom(App.Player.higherForce,App.Player.betaSent,0);
                            if(allForcesToUse>90){
                                ////SOUND
                                //App.startSound('#soundSwoosh');
                                //App.playSound('#soundSwoosh');
                                App.playSoundHowl('data/sounds/swoosh.mp3');
                                console.log('play swoosh!!');
                                App.Player.goThrow();
                            }
                        }
                        dataContainerMotion.innerHTML = html; 
                        });
                }
            },
            //-------------------------------------------------------------------
            //APP-PLAYER UPDATE--------------------------------------------------
            update:function() {
                if(App.Player.clickCount===1){
                    App.Player.compass.style.Transform = 'translate(-50%,-50%) rotate( ' + App.Player.alphaToUse + 'deg)';
                    App.Player.compass.style.WebkitTransform = 'translate(-50%,-50%) rotate( '+ App.Player.alphaToUse + 'deg)';
                    App.Player.compass.style.MozTransform = 'translate(-50%,-50%) rotate(' + App.Player.alphaToUse + 'deg)';
                    angleToDisplay.innerHTML = Math.round(App.Player.alphaToUse);
                    IO.socket.emit('send_data_angle',{gameId:App.gameId, mySocketId:App.mySocketId, alpha: App.Player.alphaToUse});
                    requestAnimationFrame(App.Player.update);
                }
            },
            
            //APP-PLAYER-FUNCTION CUSTOM CLICK-----------------------------------

            customClick: function(){
                console.log('click!');
                App.Player.clickCount++;
                console.log(App.Player.clickCount);
                if(App.Player.clickCount==0){
                    if(!App.Player.isReadyForFunFact){
                        document.getElementById('waitMobileWrapper').style.display = "block";
                        document.getElementById('funFactsMobile').style.display = "none";
                    }else{
                        document.getElementById('funFactsMobile').style.display = "block";
                        document.getElementById('waitMobileWrapper').style.display = "none";
                    }
                document.getElementById('orientationMobileWrapper').style.display = "none";
                document.getElementById('azimuthMobileWrapper').style.display = "none";
                document.getElementById('forceMobileWrapper').style.display = "none";
                document.getElementById('throwMobileWrapper').style.display = "none";
                document.getElementById('dataContainerOrientation').style.display = "none";
                document.getElementById('dataContainerMotion').style.display = "none";
                document.getElementById('zoomMobileWrapper').style.display = "none";
                document.getElementById('enableChangeTurnWrapper').style.display='none';
                }
                if(App.Player.clickCount==1){
                //we can enable the fun fact now.
                App.Player.isReadyForFunFact=true;
                //animate arrow
                requestAnimationFrame(App.Player.update);

                document.getElementById('waitMobileWrapper').style.display = "none";
                document.getElementById('orientationMobileWrapper').style.display = "block";
                document.getElementById('azimuthMobileWrapper').style.display = "none";
                document.getElementById('forceMobileWrapper').style.display = "none";
                document.getElementById('dataContainerOrientation').style.display = "none";
                document.getElementById('dataContainerMotion').style.display = "none";
                document.getElementById('zoomMobileWrapper').style.display = "none";
                document.getElementById('enableChangeTurnWrapper').style.display='none';
                document.getElementById('funFactsMobile').style.display = "none";
                }
                if(App.Player.clickCount==2){
                document.getElementById('waitMobileWrapper').style.display = "none";
                document.getElementById('orientationMobileWrapper').style.display = "none";
                document.getElementById('azimuthMobileWrapper').style.display = "block";
                document.getElementById('forceMobileWrapper').style.display = "none";
                document.getElementById('dataContainerOrientation').style.display = "none";
                document.getElementById('dataContainerMotion').style.display = "none";
                document.getElementById('zoomMobileWrapper').style.display = "none";
                document.getElementById('enableChangeTurnWrapper').style.display='none';
                document.getElementById('funFactsMobile').style.display = "none";
                }
                if(App.Player.clickCount==3){
                App.Player.forceChoice=3;
                document.getElementById('waitMobileWrapper').style.display = "none";
                document.getElementById('orientationMobileWrapper').style.display = "none";
                document.getElementById('azimuthMobileWrapper').style.display = "none";
                document.getElementById('forceMobileWrapper').style.display = "block";
                document.getElementById('dataContainerOrientation').style.display = "none";
                document.getElementById('dataContainerMotion').style.display = "none";
                document.getElementById('zoomMobileWrapper').style.display = "none";
                document.getElementById('enableChangeTurnWrapper').style.display='none';
                document.getElementById('funFactsMobile').style.display = "none";
                }
                if(App.Player.clickCount==4){
                document.getElementById('waitMobileWrapper').style.display = "none";
                document.getElementById('orientationMobileWrapper').style.display = "none";
                document.getElementById('azimuthMobileWrapper').style.display = "none";
                document.getElementById('forceMobileWrapper').style.display = "none";
                document.getElementById('throwMobileWrapper').style.display = "block";
                document.getElementById('dataContainerOrientation').style.display = "none";
                document.getElementById('dataContainerMotion').style.display = "none";
                document.getElementById('zoomMobileWrapper').style.display = "none";
                document.getElementById('enableChangeTurnWrapper').style.display='none';
                document.getElementById('funFactsMobile').style.display = "none";
                //display throw infos
                document.getElementById("orientationMobileResume").innerHTML = App.Player.alphaForResume;
                document.getElementById("elevationMobileResume").innerHTML = App.Player.betaForResume;
                document.getElementById("forceMobileResume").innerHTML = App.Player.forceForResume;
                }
                if(App.Player.clickCount==5){
                    //display zoom
                }
                if(App.Player.clickCount==6){
                document.getElementById('enableChangeTurnWrapper').style.display='block';
                document.getElementById('waitMobileWrapper').style.display = "none";
                document.getElementById('orientationMobileWrapper').style.display = "none";
                document.getElementById('azimuthMobileWrapper').style.display = "none";
                document.getElementById('forceMobileWrapper').style.display = "none";
                document.getElementById('throwMobileWrapper').style.display = "none";
                document.getElementById('dataContainerOrientation').style.display = "none";
                document.getElementById('dataContainerMotion').style.display = "none";
                document.getElementById('zoomMobileWrapper').style.display = "none";
                document.getElementById('funFactsMobile').style.display = "none";
                }if(App.Player.clickCount==7){
                //display wait
                App.Player.clickCount=0;
                //socket emit change turn here!
                IO.socket.emit('enableChangeTurn',{gameId:App.gameId, mySocketId:App.mySocketId});
                document.getElementById('waitMobileWrapper').style.display = "block";
                document.getElementById('orientationMobileWrapper').style.display = "none";
                document.getElementById('azimuthMobileWrapper').style.display = "none";
                document.getElementById('forceMobileWrapper').style.display = "none";
                document.getElementById('throwMobileWrapper').style.display = "none";
                document.getElementById('dataContainerOrientation').style.display = "none";
                document.getElementById('dataContainerMotion').style.display = "none";
                document.getElementById('zoomMobileWrapper').style.display = "none";
                document.getElementById('enableChangeTurnWrapper').style.display='none';
                document.getElementById('funFactsMobile').style.display = "none";
                }
            },
            //-------------------------------------------------------------------
        
            //APP-PLAYER-FUNCTION DISPLAY SHAKE----------------------------------
            displayShake: function(){
                App.Player.forceChoice=1;
                App.Player.customClick();
            },
            //-------------------------------------------------------------------

            //APP-PLAYER-FUNCTION DISPLAY PRECISION------------------------------
            displayPrecision: function(){
                App.Player.forceChoice=3;
                App.Player.customClick();
            },
            //-------------------------------------------------------------------
        
            //APP-PLAYER-FUNCTION START COUNTING FORCE---------------------------
            startCountingForce: function(){
                //SOUND
                //App.startSound('#soundGlissendo');
                App.startSoundHowl(App.glissendoSound);
                App.Player.isButtonForcePressed=true;
                App.Player.precisionForce=0;
                App.Player.shouldCount=true;
                if(App.Player.forceChoice===3 && App.Player.shouldCount===true){
                    App.Player.myLoop=setInterval(function () {
                        
                        App.Player.precisionForceCount()},
                        50);
                    console.log('SET INTERVAL!');
                }
            },
            //-----------------------------------------------------------------------

            //APP-PLAYER-FUNCTION PRECISION FORCE COUNT-------------------------------
            precisionForceCount:function(){
                if(App.Player.shouldCount===true){
                    var force = document.getElementById('force');
                    //limit in precision force count!
                   if(App.Player.precisionForce<200){
                        App.Player.precisionForce+=1*App.Player.forceMultiplyFactorTouch;
                    }
                    console.log(App.Player.precisionForce);
                    App.Player.precisionForceToUse = App.Player.precisionForce;
                    var distanceInKm= App.Player.getCurveCustom(App.Player.precisionForce,App.Player.betaSent,0);
                    var dimensionToChange = 10+App.Player.precisionForce;
                    document.getElementById('forceImg').style.width=dimensionToChange+"px" ;
                     document.getElementById('forceImg').style.height=dimensionToChange+"px" ;
                    force.innerHTML = Math.round(distanceInKm);
                    App.Player.forceForResume = Math.round(distanceInKm);
                }
            },
            //------------------------------------------------------------------------

            //APP-PLAYER-FUNCTION STOP PRECISION FORCE COUNT--------------------------
            stopCountingForce:function(){
                //App.stopSound('#soundGlissendo');
                App.stopSoundHowl(App.glissendoSound);
                console.log('function stop counting force');
                var force = document.getElementById('force');
                App.Player.isButtonForcePressed=false;    
                clearInterval(App.Player.myLoop);
                clearTimeout(App.Player.myLoop);
                console.log('KILL INTERVAL');
                App.Player.higherForce=0;
                App.Player.higherVolume=0;
                App.Player.precisionForce=0;
                force.innerHTML = "0";
                console.log('should count is false');
                App.Player.shouldCount=false;
                App.Player.customClick();
            },
            //-----------------------------------------------------------------------

        
            //APP-PLAYER-FUNCTION GO THROW---------------------------------------
            goThrow: function(){
            	console.log('function gothrow');
                var force = document.getElementById('force');
                console.log('throw!');
                App.Player.isButtonForcePressed=false;    
                App.Player.isFlying=true;
                App.Player.toggleFlyMode();
                App.Player.shootCount++;
                App.Player.clickCount++;
                if(App.Player.shootCount===App.numberOfShoots+1){
                    console.log('reset shootcount!');
                    App.Player.shootCount=1;
                }
      			console.log('gothrow function forcechoice=3');
                console.log('force to use = ' + App.Player.precisionForceToUse);
                IO.socket.emit('send_data_force',{gameId:App.gameId, mySocketId:App.mySocketId,force: App.Player.precisionForceToUse});
                IO.socket.emit('throw',{gameId:App.gameId, mySocketId:App.mySocketId, shootCount:App.Player.shootCount});
                App.Player.forceChoice=0;
                App.Player.higherForce=0;
                App.Player.higherVolume=0;
                App.Player.precisionForce=0;
                force.innerHTML = "0";
                console.log('should count is false');
                App.Player.shouldCount=false;
            },
            //-------------------------------------------------------------------
        
            //APP-PLAYER-FUNCTION ZOOM IN----------------------------------------
            zoomIn:function(){
                console.log('zoom in');
                IO.socket.emit('zoomIn',{gameId:App.gameId, mySocketId:App.mySocketId,zoom:'zoomIn'});
            },
            //-------------------------------------------------------------------
        
            //APP-PLAYER-FUNCTION ZOOM OUT---------------------------------------
            zoomOut:function(){
                console.log('zoom out');
                IO.socket.emit('zoomOut',{gameId:App.gameId, mySocketId:App.mySocketId,zoom:'zoomOut'});
            },
            //---------------------------------------------------------------------
        
            //APP-PLAYER-FUNCTION STOP ZOOM IN-------------------------------------
            stopZoomIn:function(){
                console.log('stop zooom in');
                IO.socket.emit('stopZoomIn',{gameId:App.gameId, mySocketId:App.mySocketId,zoom:'stopZoomIn'});
            },
            //----------------------------------------------------------------------
        
            //APP-PLAYER-FUNCTION STOP ZOOM OUT-------------------------------------
            stopZoomOut:function(){
                console.log('stop zoom out');
                IO.socket.emit('stopZoomOut',{gameId:App.gameId, mySocketId:App.mySocketId,zoom:'stopZoomOut'});
            },
            //-----------------------------------------------------------------------
        
            //APP-PLAYER-FUNCTION ESCAPE ZOOM----------------------------------------
            escapeZoom:function(){
                App.Player.isFlying=false;
                App.Player.clickCount=-1;
                App.Player.customClick();
                console.log('escape zoom!');
            },
            //------------------------------------------------------------------------
        
            //APP-PLAYER-FUNCTION TOGGLE FLY MODE-------------------------------------
            toggleFlyMode:function(){
                console.log('toggle fly mode!');
                if(App.Player.isFlying===true){
                    console.log('flight in progress');
                    document.getElementById('waitMobileWrapper').style.display = "none";
                    document.getElementById('orientationMobileWrapper').style.display = "none";
                    document.getElementById('azimuthMobileWrapper').style.display = "none";
                    document.getElementById('forceMobileWrapper').style.display = "none";
                    document.getElementById('throwMobileWrapper').style.display = "none";
                    document.getElementById('zoomMobileWrapper').style.display = "block";
                    document.getElementById('funFactsMobile').style.display = "none";
                } else if(App.Player.isFlying===false){
                    console.log('not flying');
                    App.Player.clickCount=5;
                    App.Player.customClick();
                }
            },
            //-------------------------------------------------------------------------
        
            //APP-PLAYER-FUNCTION GET CURVE CUSTOM-------------------------------------

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
            //-------------------------------------------------------------------

            //APP-PLAYER-FUNCTION SMOOTH MOBILE VALUE----------------------------
            smoothValueMobile:function(value, destination, smoothness){
                    //valeur += (destination - valeur) * facteur
                    //facteur entre 0 et 1, sachant que 1 ça va direct
                    value+= (destination - value)* smoothness;
                    return value;
            },
        
            //APP-PLAYER-FUNCTION SEND DEBUG-------------------------------------
            sendDebug:function(){
                    console.log('send debug');
                    var debugAlpha=10;
                    var debugBeta=30;
                    var debugForce = 20;
                    App.Player.isFlying=true;
                    App.Host.camsIsInElevPos=true;
                    App.Player.shootCount++;
                    if(App.Player.shootCount===App.numberOfShoots+1){
                        console.log('reset shootcount!');
                        App.Player.shootCount=1;
                    }
                    App.Player.toggleFlyMode();
                    IO.socket.emit('send_data_angle',{gameId:App.gameId, mySocketId:App.mySocketId,alpha:debugAlpha});
                    IO.socket.emit('send_data_elevation',{gameId:App.gameId, mySocketId:App.mySocketId,beta:debugBeta});
                    IO.socket.emit('send_data_force',{gameId:App.gameId, mySocketId:App.mySocketId,force: debugForce});
                    IO.socket.emit('throw',{gameId:App.gameId, mySocketId:App.mySocketId, shootCount:App.Player.shootCount});
            }
            //-------------------------------------------------------------------
        },
    };
    IO.init();
    App.init();
}($));