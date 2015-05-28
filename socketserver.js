var io;
var gameSocket;
var crypto = require('crypto');

//INIT GAME----------------------------------------
exports.initGame = function(sio, socket){
    console.log('init game!!!!');
    io = sio;
    gameSocket = socket;
    gameSocket.emit('connected', { message: "You are connected!" });
    // Host Events
    gameSocket.on('hostCreateNewGame', hostCreateNewGame);
    gameSocket.on('browserJoinGame', browserJoinGame);
    gameSocket.on('hostRoomFull', hostPrepareGame);
    gameSocket.on('ball_has_arrived',onBallHasArrived);
    gameSocket.on('changeTurn',onChangeTurn);
    gameSocket.on('updateScore',onUpdateScore);
    gameSocket.on('gameIsOver',onEndGame);
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
}


function hostPickCities(gameId){
    var targetCollection = [['Berlin','52.493805', '13.455292'],['London', '51.36', '00.05'],['Paris','48.50','02.20'],['Reykjavik','64.10','-21.57'],['Budapest','47.29','19.05']];
    var pickedCities=[];
    console.log('hostpickcities!!');
    for(i =0;i<3;i++){
        var randomNumber = Math.floor(Math.random()*targetCollection.length);
        var chosenCity = targetCollection[randomNumber];
        console.log(chosenCity);
        pickedCities.push(chosenCity);
        }
    console.log(pickedCities);
    io.sockets.in(gameId).emit('pickedCities', pickedCities);
    //send those cities to the game!
}

function hostPrepareGame(gameId) {
    var sock = this;
    var data = {
        mySocketId : sock.id,
        gameId : gameId
    };
    hostPickCities(gameId);
    console.log("All Players Present. Preparing game...");
    io.sockets.in(data.gameId).emit('beginNewGame', data);
};
function browserJoinGame(data) {
    var sock = this;
    var room = gameSocket.adapter.rooms[data.gameId];
      if( room != undefined ){
        console.log('room found, lets join it ! ');
        data.mySocketId = sock.id;
        sock.join(data.gameId);
        console.log('Browser joining game: ' + data.gameId );
        io.sockets.in(data.gameId).emit('browserJoinedRoom', data);
    } else {
        console.log('room not found');
        this.emit('error',{message: "This room does not exist."} );
    }
};
function hostStartGame(gameId){
	console.log('Game Started!!!!');
};
function onBallHasArrived(data){
    console.log(data);
    io.sockets.in(data.gameId).emit('ball_has_arrived', data);
    console.log('sending the info to host...');
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
/* *****************************
   *                           *
   *     PLAYER FUNCTIONS      *
   *                           *
   ***************************** */

function playerJoinGame(data) {
    //console.log('Player ' + data.playerName + 'attempting to join game: ' + data.gameId );
    // A reference to the player's Socket.IO socket object
    var sock = this;
    var room = gameSocket.adapter.rooms[data.gameId];
      if( room != undefined ){
    	console.log('room found, lets join it ! ');
        data.mySocketId = sock.id;
        sock.join(data.gameId);
        console.log('Player ' + data.playerName + ' joining game: ' + data.gameId );
        io.sockets.in(data.gameId).emit('playerJoinedRoom', data);
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
    console.log('ondataangle');
    console.log(data);
    io.sockets.in(data.gameId).emit('hostGetDataAngle', data);
}
function onDataElevation(data){
    console.log('ondataelev');
    console.log(data);
    io.sockets.in(data.gameId).emit('hostGetDataElev', data);
}
function onThrow(data){
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