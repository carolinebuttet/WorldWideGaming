var io;
var gameSocket;
var crypto = require('crypto');
var gameCount=0;
var games={};

//INIT GAME----------------------------------------
exports.initGame = function(sio, socket){
    console.log('init game!!!!');
    io = sio;
    gameSocket = socket;
    gameSocket.emit('connected', { message: "You are connected!" });
    gameSocket.on('disconnect', customDisconnect);
    // Host Events
    gameSocket.on('browserWantsToJoinGame', browserWantsToJoinGame);
    gameSocket.on('hostCreateNewGame', hostCreateNewGame);
    gameSocket.on('browserJoinGame', browserJoinGame);
    gameSocket.on('hostRoomFull', hostPrepareGame);
    gameSocket.on('ball_has_arrived',onBallHasArrived);
    gameSocket.on('changeTurn',onChangeTurn);
    gameSocket.on('updateScore',onUpdateScore);
    gameSocket.on('gameIsOver',onEndGame);
    gameSocket.on('targetAlert',onAlertarget);
    // Player Events
    gameSocket.on('playerJoinGame', playerJoinGame);
    gameSocket.on('send_data_force',onDataForce);
    gameSocket.on('send_data_angle', onDataAngle);
    gameSocket.on('send_data_elevation', onDataElevation);
    gameSocket.on('throw',onThrow);
    gameSocket.on('zoomIn',onZoomIn);
    gameSocket.on('zoomOut',onZoomOut);
    gameSocket.on('stopZoomIn',onStopZoomIn);
    gameSocket.on('stopZoomOut',onStopZoomOut);
    gameSocket.on('sendGeoLocation',onLocation);
    gameSocket.on('askHelp', onSendHelp);
    gameSocket.on('enableChangeTurn', onEnableChangeTurn);
};
//--------------------------------------------------

//CRYPTO CONNECTION CODES---------------------------
function random (howMany, chars) {
    chars = chars 
        || "0123456789";
    var rnd = crypto.randomBytes(howMany)
        , value = new Array(howMany)
        , len = chars.length;
    for (var i = 0; i < howMany; i++) {
        value[i] = chars[rnd[i] % len];
    }
    return value.join('');
}
var socketCodes = {};
//--------------------------------------------------

/* *******************************
   *                             *
   *       HOST FUNCTIONS        *
   *                             *
   ******************************* */
function customDisconnect(){
    console.log('client disconnected, need to close room and game!');
    console.log(this.id);
    console.log(games);
    for(var gameid in games){
        var game_instance = games[gameid];
        if(game_instance.hostPlayer=== this.id || game_instance.clientPlayer===this.id || game_instance.controller1===this.id || game_instance.controller2===this.id){
            console.log('delete this game!!');
            console.log(game_instance);
            var data = {mySocketId: this.id , gameId:gameid};
            customEndGame(data);
        }  
    }
}

function browserWantsToJoinGame(){
    console.log('browser wants to join game!!!');
    console.log('looking for a game. we have ' + gameCount);
    if(gameCount){
        console.log('we have active games, lets see if they need someone');
        var joinedAGame=false;
         /////FOR CHECK GAMES! 
         console.log('games are : ');
         console.log(games);
         console.log(gameCount);
         console.log(gameid in games);
            for(var gameid in games) {
                console.log('in the for');
                var game_instance = games[gameid];
                if(game_instance.playerCount < 2) {
                    joinedAGame = true;
                    var sock = this;
                    var room = gameid;
                    var data = {
                         mySocketId : sock.id,
                         gameId : gameid
                    };
                    console.log('data = ' + data);
                    console.log('room = ' + room);
                    game_instance.clientPlayer = this.id;
                    game_instance.playerCount++;
                    //join room-----------
                    console.log('room found, lets join it ! ');
                    console.log('game id = ' + gameid);
                    //data.mySocketId = this.id;
                    console.log('this. id = ' + this.id);
                    data.gameId = gameid;
                    sock.join(gameid);
                    console.log('Browser joining game: ' + data.gameId );
                    io.sockets.in(data.gameId).emit('browserJoinedRoom', data);
                    console.log(data);
                    //--------------------
                    console.log('start game for good!');
                    io.sockets.in(data.gameId).emit('bothBrowsersAreConnected',data);
                    console.log('sent socket ' + data);
                } //if less than 2 players
            } //for all games*/
            if(!joinedAGame) {
                console.log('no game found');
                //this.createGame(player);
                console.log('create a game, there are none.');
                ////CREATE GAME--------------------------------------------
                console.log('create a new game!');
                console.log('generate code..');
                var thisGameId = random(5);
                console.log(thisGameId);
                while(thisGameId in socketCodes || thisGameId<9999){thisGameId = random(5);}
                console.log('send code to broswer');
                this.emit('newGameCreated', {gameId: thisGameId, mySocketId: this.id});
                this.join(thisGameId.toString());
                console.log('joined the room nr' + thisGameId.toString());
                var theGame = {id:thisGameId, hostPlayer:this.id, clientPlayer:null, playerCount:1};
                games[theGame.id] = theGame;
                console.log(theGame);
                console.log(games);
                gameCount++;
            }//if has not joined a game
    }
    else{
        console.log('create a game, there are none.');
        ////CREATE GAME--------------------------------------------
        console.log('create a new game!');
        console.log('generate code..');
        var thisGameId = random(5);
        console.log(thisGameId);
        while(thisGameId in socketCodes || thisGameId<9999){thisGameId = random(5);}
        console.log('send code to broswer');
        this.emit('newGameCreated', {gameId: thisGameId, mySocketId: this.id});
        this.join(thisGameId.toString());
        console.log('joined the room nr' + thisGameId.toString());
        var theGame = {id:thisGameId, hostPlayer:this.id, clientPlayer:null, playerCount:1};
        games[theGame.id] = theGame;
        console.log(theGame);
        console.log(games);
        gameCount++;
        ////-------------------------------------------------------
    }// if there is no game at all
}


function hostCreateNewGame() {
	console.log('create a new game!');
	console.log('generate code..');
	var thisGameId = random(5);
    console.log(thisGameId);
    while(thisGameId in socketCodes || thisGameId<9999){thisGameId = random(5);}
    console.log('send code to broswer');
    this.emit('newGameCreated', {gameId: thisGameId, mySocketId: this.id});
    this.join(thisGameId.toString());
    console.log('joined the room nr' + thisGameId.toString());
    gameCount++;
}


function hostPickCities(gameId){
    //var targetCollection = [['Berlin','52.493805', '13.455292'],['London', '51.36', '00.05'],['Paris','48.50','02.20'],['Reykjavik','64.10','-21.57'],['Budapest','47.29','19.05']];
    var targetCollection = 
    [
        ['Berlin','52.493805', '13.455292'],
        ['London', '51.36', '-00.05'],
        ['Paris','48.50','02.20'],
        ['Reykjavik','64.10','-21.57'],
        ['Budapest','47.29','19.05'],
        ['Vienna','48.12','16.22'],
        ['Brussels','50.51','04.21'],
        ['Sofia','42.45','23.20'],
        ['Prague','50.05','14.22'],
        ['Nicosia','35.10','33.25'],
        ['Copenhagen','55.41','12.34'],
        ['Tallinn','59.22','24.48'],
        ['Helsinki','60.15','25.03'],
        ['Athens','37.58','23.46'],
        ['Nuuk','64.10','-51.35'],
        ['Dublin','53.21','-06.15'],
        ['Rome','41.54','12.29'],
        ['Riga','56.53','24.08'],
        ['Vaduz','47.08','09.31'],
        ['Vilnius','54.38','25.19'],
        ['Luxembourg','49.37','06.09' ],
        ['Valletta','35.54' ,'14.31'],
        ['Amsterdam','52.23','04.54'],
        ['Oslo','59.55','10.45'],
        ['Lisbon','38.42','-09.10'],
        ['Bucuresti','44.27','26.10'],
        ['Bratislava','48.10','17.07' ],
        ['Ljubljana','46.04','14.33' ],
        ['Madrid','40.25','-03.45' ],
        ['Stockholm','59.20','18.03' ],
        ['Bern','46.57','07.28 '],
        ['Ankara','39.57','32.54'],
        ['Kiev','50.30','30.28'],
        ['Belgrade','44.50','20.37'],
    ];
    var pickedCities=[];
    var randomPick=[];
    console.log('hostpickcities!!');
    for(i =0;i<3;i++){
        var randomNumber = Math.floor(Math.random()*targetCollection.length); 
        console.log('array length = '  + targetCollection.length);     
        var chosenCity = targetCollection[randomNumber];
        console.log(chosenCity);
        pickedCities.push(chosenCity);
        randomPick.push(randomNumber);
        //remove city so that ist not selected twice.
        var index = targetCollection.indexOf(randomNumber);
        if (index > -1) {
            targetCollection.splice(randomNumber, 1);
            }
        console.log('new target collection is ');
        console.log(targetCollection);
        }
    console.log(pickedCities);
    io.sockets.in(gameId).emit('pickedCities', pickedCities);
    //send those cities to the game!
}
function onEnableChangeTurn(data){
    console.log('enable change turn!');
    io.sockets.in(data.gameId).emit('enableChangeTurn',data);
}
function onAlertarget(data){
    console.log('data');
    io.sockets.in(data.gameId).emit('targetAlert',data);
}

function hostPrepareGame(gameId) {
    console.log('room is full. we prepare the game.....');
    var sock = this;
    var data = {
        mySocketId : sock.id,
        gameId : gameId
    };
    hostPickCities(gameId);
    io.sockets.in(data.gameId).emit('beginNewGame', data);
}
function browserJoinGame(data) {
    var sock = this;
    var room = gameSocket.adapter.rooms[data.gameId];
      if( room !== undefined ){
        console.log('room found, lets join it ! ');
        data.mySocketId = sock.id;
        sock.join(data.gameId);
        console.log('Browser joining game: ' + data.gameId );
        io.sockets.in(data.gameId).emit('browserJoinedRoom', data);
    } else {
        console.log('room not found');
        this.emit('error',{message: "This room does not exist."} );
    }
}
function hostStartGame(gameId){
	console.log('Game Started!!!!');
}
function onBallHasArrived(data){
    console.log('ball has arrived!!');
    console.log(data);
    io.sockets.in(data.gameId).emit('ball_has_arrived', data);
   // console.log('sending the info to host...');
}
function onChangeTurn(data){
    console.log('got the change turns!');
    console.log(data);
    io.sockets.in(data.gameId).emit('changeTurn',data);
}
function onUpdateScore(data){
    console.log(data);
    io.sockets.in(data.gameId).emit('updateScore',data);
}
function onEndGame(data){
    io.sockets.in(data.gameId).emit('gameIsOver',data);

}
function customEndGame(data){
    io.sockets.in(data.gameId).emit('gameIsInterrupted',data);
    console.log('end game ! ');
    console.log(data);
    delete games[data.gameId];
    gameCount--;
    console.log('game removed. there are now ' + gameCount + ' games' );
}
/* *****************************
   *                           *
   *     PLAYER FUNCTIONS      *
   *                           *
   ***************************** */
//var playerCountCustom=0;
function playerJoinGame(data) {
    var sock = this;
    var room = gameSocket.adapter.rooms[data.gameId];
      if( room != undefined ){
    	console.log('room found, lets join it ! ');
        data.mySocketId = sock.id;
        sock.join(data.gameId);
        console.log('Player ' + data.playerName + ' joining game: ' + data.gameId );
        io.sockets.in(data.gameId).emit('playerJoinedRoom', data);
        //var theGame = {id:thisGameId, hostPlayer:this.id, clientPlayer:null, playerCount:1};
        //games[theGame.id] = theGame;
        if(games[data.gameId].controller1){
            games[data.gameId].controller2 = data.mySocketId;
            console.log('Player with socket id' + data.mySocketId +' is red');
            io.sockets.in(data.gameId).emit('chooseColorRed', data);
        }else{
            games[data.gameId].controller1 = data.mySocketId;
            console.log('Player with socket id' + data.mySocketId +' is blue');
            io.sockets.in(data.gameId).emit('chooseColorBlue', data);
        }
        console.log(games);

    } else {
    	console.log('room not found');
        this.emit('error',{message: "This room does not exist."} );
    }
}
function onLocation(data){
    console.log('got your location!!!');
    console.log(data);
    io.sockets.in(data.gameId).emit('playersLocations', data);
}
function onDataForce(data){
    console.log('ondataforce');
    console.log(data);
    io.sockets.in(data.gameId).emit('hostGetDataForce', data);
}
function onDataAngle(data){
    //console.log('ondataangle');
    //console.log(data);
    io.sockets.in(data.gameId).emit('hostGetDataAngle', data);
}
function onDataElevation(data){
    //console.log('ondataelev');
    //console.log(data);
    io.sockets.in(data.gameId).emit('hostGetDataElev', data);
}
function onThrow(data){
    console.log('throw!');
    console.log(data);
    io.sockets.in(data.gameId).emit('hostGetThrow', data);
}
function onZoomIn(data){
    console.log(data);
    io.sockets.in(data.gameId).emit('hostZoomIn', data);
}
function onZoomOut(data){
    console.log(data);
    io.sockets.in(data.gameId).emit('hostZoomOut', data);
}
function onStopZoomIn(data){
    console.log(data);
    io.sockets.in(data.gameId).emit('hostStopZoomIn', data);
}
function onStopZoomOut(data){
    console.log(data);
    io.sockets.in(data.gameId).emit('hostStopZoomOut', data);
}
function onSendHelp(data){
    console.log(data);
    io.sockets.in(data.gameId).emit('displayHelp', data);
}


