const MessageQueue = require('../');

const exchangeName = 'domfeed';
const bindings = {
    enqueued: 'unverified_domains',
    verified: 'verified_domains',
    failed: 'failed_cf_lookups'
};

const flow = channel => {
    // we publish to exchanges
    const publish = (message, key) => channel.publish(exchangeName, key, Buffer.from(message), { persistent: true })

    // ... and we consume queues
    var i = 0;
    channel.consume('verified_domains', message => {
        i++;
        console.log(`Consume Message ${i}: ${message.content.toString()} `);
        setTimeout(() => channel.ack(message), Math.random() * 5000);
    });


    for (var i = 1000; i > 0; i--) {
        setTimeout(() => {
            publish('gotcha', 'verified');
        }, Math.random() * 60000);
    }
}

const mq = new MessageQueue({
    exchangeName,
    bindings,
    onChannelReady: flow
});

