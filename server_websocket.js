(function() {
    "use strict";
    /*global console,require,__dirname,process*/
    /*jshint es3:false*/
    var express = require('express');
    var compression = require('compression');
    var url = require('url');
    var request = require('request');
    var crypto = require('crypto');

    var yargs = require('yargs').options({
        'port' : {
            'default' : 8080,
            'description' : 'Port to listen on.'
        },
        'public' : {
            'type' : 'boolean',
            'description' : 'Run a public server that listens on all interfaces.'
        },
        'upstream-proxy' : {
            'description' : 'A standard proxy server that will be used to retrieve data.  Specify a URL including port, e.g. "http://proxy:8000".'
        },
        'bypass-upstream-proxy-hosts' : {
            'description' : 'A comma separated list of hosts that will bypass the specified upstream_proxy, e.g. "lanhost1,lanhost2"'
        },
        'help' : {
            'alias' : 'h',
            'type' : 'boolean',
            'description' : 'Show this help.'
        }
    });
    var argv = yargs.argv;

    if (argv.help) {
        return yargs.showHelp();
    }

    // eventually this mime type configuration will need to change
    // https://github.com/visionmedia/send/commit/d2cb54658ce65948b0ed6e5fb5de69d022bef941
    var mime = express.static.mime;
    mime.define({
        'application/json' : ['czml', 'json', 'geojson', 'topojson', 'gltf'],
        'text/plain' : ['glsl']
    });

    var app = express();
    app.use(compression());
    app.use(express.static(__dirname));
    function getRemoteUrlFromParam(req) {
        var remoteUrl = req.params[0];
        if (remoteUrl) {
            // add http:// to the URL if no protocol is present
            if (!/^https?:\/\//.test(remoteUrl)) {
                remoteUrl = 'http://' + remoteUrl;
            }
            remoteUrl = url.parse(remoteUrl);
            // copy query string
            remoteUrl.search = url.parse(req.url).search;
        }
        return remoteUrl;
    }

    var dontProxyHeaderRegex = /^(?:Host|Proxy-Connection|Connection|Keep-Alive|Transfer-Encoding|TE|Trailer|Proxy-Authorization|Proxy-Authenticate|Upgrade)$/i;

    function filterHeaders(req, headers) {
        var result = {};
        // filter out headers that are listed in the regex above
        Object.keys(headers).forEach(function(name) {
            if (!dontProxyHeaderRegex.test(name)) {
                result[name] = headers[name];
            }
        });
        return result;
    }

    var upstreamProxy = argv['upstream-proxy'];
    var bypassUpstreamProxyHosts = {};
    if (argv['bypass-upstream-proxy-hosts']) {
        argv['bypass-upstream-proxy-hosts'].split(',').forEach(function(host) {
            bypassUpstreamProxyHosts[host.toLowerCase()] = true;
        });
    }

    app.get('/proxy/*', function(req, res, next) {
        // look for request like http://localhost:8080/proxy/http://example.com/file?query=1
        var remoteUrl = getRemoteUrlFromParam(req);
        if (!remoteUrl) {
            // look for request like http://localhost:8080/proxy/?http%3A%2F%2Fexample.com%2Ffile%3Fquery%3D1
            remoteUrl = Object.keys(req.query)[0];
            if (remoteUrl) {
                remoteUrl = url.parse(remoteUrl);
            }
        }

        if (!remoteUrl) {
            return res.send(400, 'No url specified.');
        }

        if (!remoteUrl.protocol) {
            remoteUrl.protocol = 'http:';
        }

        var proxy;
        if (upstreamProxy && !(remoteUrl.host in bypassUpstreamProxyHosts)) {
            proxy = upstreamProxy;
        }

        // encoding : null means "body" passed to the callback will be raw bytes

        request.get({
            url : url.format(remoteUrl),
            headers : filterHeaders(req, req.headers),
            encoding : null,
            proxy : proxy
        }, function(error, response, body) {
            var code = 500;

            if (response) {
                code = response.statusCode;
                res.header(filterHeaders(req, response.headers));
            }

            res.send(code, body);
        });
    });

    var server = app.listen(argv.port, argv.public ? undefined : 'localhost', function() {
        if (argv.public) {
            console.log('Cesium development server running publicly.  Connect to http://localhost:%d/', server.address().port);
        } else {
            console.log('Cesium development server running locally.  Connect to http://localhost:%d/', server.address().port);
        }
    });
    //SOCKET.IO
    var io = require('socket.io')(server);
    ///CONNECTION CODES
    //CRYPTO
    function random (howMany, chars) {
        chars = chars 
            || "0123456789";
        var rnd = crypto.randomBytes(howMany)
            , value = new Array(howMany)
            , len = chars.length;

        for (var i = 0; i < howMany; i++) {
            value[i] = chars[rnd[i] % len]
        };

        return value.join('');
    }

    var socketCodes = {};

    io.on('connection', function(socket){
        console.log('a user connected, yay');
        socket.emit('welcome', {test:'test'});
        socket.on('device', function(device){
            console.log(device);
            if(device.type == 'game'){
                console.log('you are a browser')
                //var gameCode = crypto.randomBytes(3).toString('hex');
                var gameCode = random(5);
                while(gameCode in socketCodes){gameCode = random(5);/*gameCode = crypto.randomBytes(3).toString('hex');*/}
                //socketCodes[gameCode] = io.sockets.sockets[socket.id];
                socketCodes[gameCode]=io.sockets[socket.id];
                socket.gameCode = gameCode
                socket.emit('initialize', gameCode);
            }
          else if(device.type == 'controller'){
                console.log('youre a controller');
                if(device.gameCode in socketCodes){
                    console.log('connected succesfully');
                    socket.gameCode = device.gameCode
                    socket.emit('connected', {});
                    //socketCodes[device.gameCode].emit('connected', {});
                }
             else{
                console.log('wrong code');
                socket.emit('fail', {});
                socket.disconnect();
            }
          }
       });
        //socket events
        socket.on('welcome',function(data){
            console.log(data);
            io.emit('welcome',data);
        });
        socket.on('my other event', function (data) {
            console.log(data);
            io.emit('chat message' , data);
        });
        socket.on('send_data_angle', function (data) {
            console.log(data);
            io.emit('angle_data' , data);
        });
        socket.on('send_data_elevation', function (data) {
            console.log(data);
            io.emit('elevation_data' , data);
        });
        socket.on('send_data_force', function (data) {
            console.log(data);
            io.emit('force_data' , data);
        });
        socket.on('throw', function(){
            io.emit('throw');
        });
        socket.on('ball_has_arrived',function(data){
            console.log(data);
            io.emit('ball_has_arrived',data);
        });
        socket.on('zoomIn',function(data){
            console.log(data);
            io.emit('zoomIn',data);
        });
        socket.on('zoomOut',function(data){
            console.log(data);
            io.emit('zoomOut',data);
        });
        socket.on('stopZoomIn',function(){
            io.emit('stopZoomIn');
            console.log('stop zoom in');
        });
        socket.on('stopZoomOut',function(){
            io.emit('stopZoomOut');
            console.log('stop zoom out');
        });
        socket.on('disconnect', function(){
            console.log('user disconnected');
        });
        socket.on('device',function(data) {
            console.log(data);
            io.emit('device',data);
        });
        socket.on('connected',function(data){
            //console.log('connected succesfully!!, we can start the game!');
            io.emit('connected',data);
        });
        socket.on('fail', function(){
            console.log('connection failed because U SUCK');
        });
    });

    //---------

    server.on('error', function (e) {
        if (e.code === 'EADDRINUSE') {
            console.log('Error: Port %d is already in use, select a different port.', argv.port);
            console.log('Example: node server.js --port %d', argv.port + 1);
        } else if (e.code === 'EACCES') {
            console.log('Error: This process does not have permission to listen on port %d.', argv.port);
            if (argv.port < 1024) {
                console.log('Try a port number higher than 1024.');
            }
        }
        console.log(e);
        process.exit(1);
    });

    server.on('close', function() {
        console.log('Cesium development server stopped.');
    });

    process.on('SIGINT', function() {
        server.close(function() {
            process.exit(0);
        });
    });

})();