 var
        game_server = module.exports = { games : {}, game_count:0 },
        UUID        = require('node-uuid'),
        verbose     = true;

    global.window = global.document = global;
        //Import shared game library code.
    require('./Apps/multitest00/game.core.js');

    game_server.onMessage = function(client,message) {
        console.log('message');
    };

    game_server._onMessage = function(client,message) {
        console.log('_message');
    }; 
    game_server.createGame = function(player) {
        console.log('crategame');
        var thegame = {
                id : UUID(),                
                player_host:player,         
                player_client:null,         
                player_count:1            
            };
        this.games[ thegame.id ] = thegame;
        this.game_count++;
        thegame.gamecore = new game_core( thegame );
        thegame.gamecore.update( new Date().getTime() );
        player.send('s.h.'+ String(thegame.gamecore.local_time).replace('.','-'));
        console.log('server host at  ' + thegame.gamecore.local_time);
        player.game = thegame;
        player.hosting = true;
        console.log('player ' + player.userid + ' created a game with id ' + player.game.id);
        return thegame;
    }; 

    game_server.startGame = function(game) {
        console.log('start game');
        game.player_client.send('s.j.' + game.player_host.userid);
        game.player_client.game = game;
        game.player_client.send('s.r.'+ String(game.gamecore.local_time).replace('.','-'));
        game.player_host.send('s.r.'+ String(game.gamecore.local_time).replace('.','-'));
        //set this flag, so that the update loop can run it.
        game.active = true;
    }; 

    game_server.findGame = function(player) {
        console.log('find game');
        console.log('looking for a game. We have : ' + this.game_count)
        if(this.game_count) {
            var joined_a_game = false;
            for(var gameid in this.games) {
                if(!this.games.hasOwnProperty(gameid)) continue;
                var game_instance = this.games[gameid];
                if(game_instance.player_count < 2) {
                    joined_a_game = true;
                    game_instance.player_client = player;
                    game_instance.gamecore.players.other.instance = player;
                    game_instance.player_count++;
                    this.startGame(game_instance);
                } 
            } 
            if(!joined_a_game) {
                this.createGame(player);
            } 
        } else { 
            this.createGame(player);
        }
    }; 

        game_server.endGame = function(gameid, userid) {
        console.log('endgame');
        var thegame = this.games[gameid];
        if(thegame) {
            thegame.gamecore.stop_update();
            if(thegame.player_count > 1) {
                if(userid == thegame.player_host.userid) {
                    if(thegame.player_client) {
                        thegame.player_client.send('s.e');
                        this.findGame(thegame.player_client);
                    }   
                } else {
                    if(thegame.player_host) {
                        thegame.player_host.send('s.e');
                        thegame.player_host.hosting = false;
                        this.findGame(thegame.player_host);
                    }
                }
            }
            delete this.games[gameid];
            this.game_count--;
            console.log('game removed. there are now ' + this.game_count + ' games' );
        } else {
            console.log('that game was not found!');
        }
    }; 


