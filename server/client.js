/*global io */

'use strict';

var pubsub = {
    // Url for client script is http://<HOST>:<PORT>/<RESOURCE>/<SCRIPT>
    HOST: 'localhost',
    PORT: 9000,
    RESOURCE: 'pubsub',
    SCRIPT: 'client.js',

    Message: {
        SUBSCRIBE: 'sub',
        UNSUBSCRIBE: 'uns',
        PUBLISH: 'pub',
        RECEIVE: 'rec'
    },

    socket: null,
    callbacks: {},

    connect: function (callback) {
        var socket = io.connect('http://' + this.HOST + ':' + this.PORT + '/',
            {resource: this.RESOURCE});
        var that = this;
        socket.on('connect', function () {
            that.socket = socket;

            if (callback) {
                callback();
            }
        });
    },

    disconnect: function () {
        this.socket = null;
    },

    subscribe: function (group, callback) {
        if (!this.socket) {
            return;
        }

        // Check if the speficifed group has been already subscribed
        if (this.callbacks[group]) {
            return;
        }

        this.socket.emit(this.Message.SUBSCRIBE, group);

        if (callback) {
            this.socket.on(this.Message.RECEIVE, callback);
            this.callbacks[group] = callback;
        }
    },

    unsubscribe: function (group) {
        if (!this.socket) {
            return;
        }

        if (!this.callbacks[group]) {
            return;
        }

        this.socket.emit(this.Message.UNSUBSCRIBE, group);

        this.socket.removeListener(this.Message.RECEIVE, this.callbacks[group]);
        this.callbacks[group] = null;
    },

    publish: function (group, content) {
        if (!this.socket) {
            return;
        }

        this.socket.emit(this.Message.PUBLISH, {
            group: group,
            content: content
        });
    }
};

// Check if this script is loaded at server side
if (typeof exports !== 'undefined') {
    // console.log('exports');
    exports.pubsub = pubsub;
}

// Check if this script is loaded at client side
if (typeof window !== 'undefined') {
    // console.log('window');
    window.pubsub = pubsub;
}
