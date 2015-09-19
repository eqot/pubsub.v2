'use strict';

var url = require('url');

var pubsub = require('./client').pubsub;

console.log(process.env.PORT);
var io = require('socket.io').listen(process.env.PORT || pubsub.PORT);
var ioClient = require('socket.io-client');
var clientScript = require('fs').readFileSync(__dirname + '/client.js');

io.configure(function () {
    io.set('log level', 1);
    io.set('resource', '/' + pubsub.RESOURCE);
    io.enable('browser client gzip');
});

ioClient.builder(io.transports(), function (err, siojs) {
    if (!err) {
        io.static.add('/' + pubsub.SCRIPT, function (path, callback) {
            callback(null, new Buffer(siojs + ';' + clientScript));
        });
    }
});

var ids = [];

io.sockets.on('connection', function (socket) {
    // console.log('Connected');

    var origin = (socket.handshake.xdomain) ?
        url.parse(socket.handshake.headers.origin).hostname : 'local';
    var id = origin || 'local';
    // console.log(id);

    var index = ids.indexOf(id);
    if (index === -1) {
        ids.push(id);
        index = ids.indexOf(id);
    }
    // console.log(ids);
    // console.log(index);

    socket.on(pubsub.Message.SUBSCRIBE, function (group) {
        // console.log('Subscribed: ' + group);
        socket.join(group);
    });

    socket.on(pubsub.Message.UNSUBSCRIBE, function (group) {
        // console.log('Unsubscribed: ' + group);
        socket.leave(group);
    });

    socket.on(pubsub.Message.PUBLISH, function (message) {
        // message.content._index = index;
        // console.log(message);
        io.sockets.to(message.group).emit(pubsub.Message.RECEIVE, message.content);
    });

    socket.on('disconnect', function () {
        // console.log('disconnect: ' + id);
        index = ids.indexOf(id);
        if (index !== -1) {
            ids.splice(index, 1);
        }
        // console.log(ids);
    });
});
