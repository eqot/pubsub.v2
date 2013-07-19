/*global pubsub */

'use strict';

function main() {
    var group = 'dummy';

    pubsub.connect(function () {
        var sub = document.getElementById('sub');
        sub.addEventListener('click', function () {
            // console.log('Subscribe');
            pubsub.subscribe(group, function (message) {
                var item = document.createElement('li');
                item.innerHTML = message;

                var list = document.getElementById('list');
                list.appendChild(item);
            });
        });

        var uns = document.getElementById('uns');
        uns.addEventListener('click', function () {
            // console.log('Unsubscribe');
            pubsub.unsubscribe(group);
        });

        var pub = document.getElementById('pub');
        var msg = document.getElementById('msg');
        pub.addEventListener('click', function () {
            // console.log('Publish');
            pubsub.publish(group, msg.value);
        });
    });
}
