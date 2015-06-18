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
    gameSocket.on('askFunFact', onSendFunFact);
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
    /*var targetCollection = 
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
    ];*/
    /*var targetCollection = 
        [
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
        ];*/
    var targetCollection = 
        [
            ['Copenhagen','55.41','12.34'],
            ['Copenhagen','55.41','12.34'],
            ['Copenhagen','55.41','12.34'],
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
function onSendFunFact(data){
        var funFactsCollection = [
        ['Berlin',
            'Berlin is nine times bigger than Paris.', 
            'Berlin has around 1,700 bridges, easily beating Venice.', 
            'The first set of traffic lights in Europe was put into service in Potsdamer Platz in 1924.',
            'Berlin is said to have more museums than rainy days.', 
            'There are over 180 kilometres of navigable waterways within the Berlin city limits. '
        ],
        
        ['London',
            'To get a London taxi license, you have to prove that you know every single street and landmark in London.',
            'The 2012 Olympics had the biggest military buildup in London Since World War II.',
            'In 1251, Henry III was given a polar bear and kept on a long chain so that it could swim in the Thames.',
            'The Bedlam asylum was one of most popular tourist attractions of 18th century London.',
            'There are about 20 hidden rivers underneath London.',
            'Royal Navy ships entering the Port of London are still required by law to give a barrel of rum to the Constable of the Tower.',
            'The 1908 Russian Olympic team arrived 12 days late to London because they hadn’t yet started using the Gregorian calendar.',
            '20% of all women in 1700s London were prostitutes'
        ],

        ['Paris',
            'there are more dogs in Paris than Parisians',
            'The municipal government forbid Tom Cruise from becoming an honorary citizen of the city',
            'Guy de Maupassant hated the Eiffel Tower.',
            'A hospital doorkeeper got lost in 1793 and his body was found 11 years later.',
            'During WWI, France built a ‘Fake Paris’ near the capital city to confuse German pilots.',
            'When the mummy of Ramesses II was flown to Paris in 1974, it got a passport that listed his occupation as “King (deceased)”.',
            'There is an oversized bronze statue of Zidane headbutting Materazzi in Paris'
        ],

        ['Budapest',
            'A restaurant in Budapest brings three dice with the bill. If you roll three sixes then the meal is on the house',
            'Budapest has more thermal springs than any other capital city in the world',
            'Budapest has the oldest subway-line in mainland Europe',
        ],
        
        ['Vienna',
            'Vienna is home of the first snow globes, and these were invented by accident.',
            'Beloved Empress Elisabeth “Sisi” of Austria suffered potentially from anorexia.',
            'In Austria, the Tracht, or traditional folk costume, is accepted as formal wear .',
            'Austrian composer Franz Schubert was nicknamed Schwammerl (Little Mushroom) by his friends'
        ],

        ['Prague',
            'The locals drink more beer per capita than any other country in the world.',
            'The traditional Christmas dish in Prague is carp.',
            'The 9th century Prague Castle is in the Guinness book of records as the oldest castle in the world'
        ],
        
        ['Dublin',
            'The Irish Parliament voted itself out of existence in 1801',
            'O’Connell Bridge is the only traffic bridge in Europe which is wider than it is long',
            'Dublin was originally called ‘Dubh Linn’ meaning ‘Black Pool’.',
            'The average 25-year-old Dubliner still lives with his/her parents.',
            'There are 12 places called Dublin in the United States and 6 in Australia.',
            'Montgomery Street in Dublin was once the biggest red-light district in Europe with an estimated 1600 prostitutes.'
        ],
        
        ['Rome',
            'The first-ever shopping mall was built by the Emperor Trajan in Rome.',
            'On the day the Colosseum officially opened, 5,000 animals were killed',
            'Ancient Romans believed that sniffing cyclamen flowers would prevent baldness,',
            'There are 280 fountains in Rome',
            'Rome has a museum dedicated entirely to pasta'
        ],

        ['Vaduz',
            'Vaduz in the capital of Liechtenstein',
            'Vaduz is way too small to have any interesting facts.'
        ],

        ['Luxembourg',
            'Luxembourg is the least populated country in the European Union, with only 465,000 inhabitants',
            'Luxembourg has won five times the Eurovision Song Contest ',
            'Luxembourg is the country with the highest nominal GDP per capita in the world.',
        ],
        
        ['Amsterdam',
            'Amsterdam has 165 canals',
            '25000 bicycles end up in Amsterdam’s canals each year',
            'The average house in Amsterdam sits on between 5 and 10 support poles',
            'Amsterdam is home to highest number of nationalities out of any city in the world',
            'Over 85% of Amsterdam residents can speak more than two languages',
            'Dutch are the tallest people in the world, with 184cm for men and 170 for women.',
        ],
        
        ['Oslo',
            'Norway has 22,000km of coastline, which is twice the length of the earth',
            'There are over 50,000 islands in Norway',
            'If Norway was flipped upside down it would reach Rome',
            'In 2008, Norway knighted a penguin.',
            'It is illegal to spay or neuter your dog in Norway',
            'Norway gets 98-99% of its electricity from hydroelectric power'
        ],
        
        ['Bratislava',
            'Bratislava has the world’s highest number of castles per capita',
            'Slovakia has more than 6000 caves',
            'Bratislava is the only capital in the world bordering two countries',
            'Bratislava is the geographical midpoint of europe',
            'In Slovakia, students, kids and disabled can travel by train for free.',
            'Slovakia is one of the top 3 countries with the most beautiful women in the world',
            'Bratislava is the city which had the largest motorcycle wedding procession (597 motorcycles)',
        ],
        
        ['Ljubljana',
            'Handball is a very popular sport in Ljubljana, especially with women',
            'Ljubljana translates to The Loved One',
            'Lulbljana is the capital of Slovenia.',
            'There are between 500 and 700 brown bears in Slovenia',
            'Slovenian people are said to be ridiculously good looking.',
            'Slovenia has a Salt Makers’ Festival, a Cabbage Festival, and a Chestnut Sunday',
        ],
        
        ['Madrid',
            'It is the highest capital city in Europe. (660 m)',
            'Spain has the world second highest number of bars per inhabitants',
            'Madrid has the oldest restaurant in the world, that opened in 1725',
            'Madrid holds the record of the most ham slices prepared in one hour (2160 slices)',
        ],
        
        ['Belgrade',
            'In Belgrade, Johnny is a nickname for Nikola.',
            'Sillicon Valley is a part of the city where the girls are famous for their breast implants',
            'Serbia has the Highest Number of Refugees in Europe',
            'Serbian Orthodox Church Believers Jump in the Frozen Danube Every Winter'
        ],
    ];
    var cityNumber=0;
    var funFactRandomNumber=0;

    for(i=0; i<funFactsCollection.length;i++){
            if(data.currentTarget === funFactsCollection[i][0]){
                cityNumber=i;
                console.log('currentTarget is ' + funFactsCollection[i][0]);
                console.log('it is the number ' +cityNumber);
            }
    }
    funFactRandomNumber = Math.ceil(Math.random()*(funFactsCollection[cityNumber].length-1));
    var funFactToDisplay = funFactsCollection[cityNumber][funFactRandomNumber];
    console.log('fun fact to be sent is :' + funFactToDisplay);

    io.sockets.in(data.gameId).emit('sendFunFact',{gameId:data.gameId, mySocketId:data.mySocketId, currentTarget:data.currentTarget ,funFactToDisplay:funFactToDisplay});

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


