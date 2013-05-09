'use strict';

var pubsub = require('./client').pubsub;
// console.log(pubsub);

var io = require('socket.io').listen(pubsub.PORT);
var sioclient = require('socket.io-client');
var widgetScript = require('fs').readFileSync('server/client.js');

io.configure(function () {
    io.set('resource', '/' + pubsub.RESOURCE);
    io.enable('browser client gzip');
});

sioclient.builder(io.transports(), function (err, siojs) {
    if (!err) {
        io.static.add('/' + pubsub.SCRIPT, function (path, callback) {
            callback(null, new Buffer(siojs + ';' + widgetScript));
        });
    }
});

io.sockets.on('connection', function (socket) {
    // console.log('Connected');

    socket.on(pubsub.Message.SUBSCRIBE, function (group) {
        // console.log('Subscribed: ' + group);
        socket.join(group);
    });

    socket.on(pubsub.Message.UNSUBSCRIBE, function (group) {
        // console.log('Unsubscribed: ' + group);
        socket.leave(group);
    });

    socket.on(pubsub.Message.PUBLISH, function (message) {
        // console.log(message);
        io.sockets.to(message.group).emit(pubsub.Message.RECEIVE, message.content);
    });
});
