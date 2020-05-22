You will need an `exchangeName` for the channel and `bindings` to map keys to queues.
```
const MessageQueue = require('amqp-reuse');

const exchangeName = 'domfeed';
const bindings = {
    enqueued: 'unverified_domains',
    verified: 'verified_domains',
    failed: 'failed_cf_lookups'
};
```


Create a handler function for the `onChannelReady` parameter of the instance.
`onChannelReady` must be a function. Both `connection` and `channel` are returned and are the respective objects from AMQP.
In this function, you can `publish`, `consume`, or otherwise utilize both the `channel` and `connection`.
In this case, `flow` is the handler for the open AMQP connection and channel.


This would also be a good place to set up an emitter to use events instead of a callback.
```
const flow = ({ channel, connection }) => {
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
            publish('ping!', 'verified');
        }, Math.random() * 60000);
    }
}

```

Create an instance of `MessageQueue`.
```
new MessageQueue({
    exchangeName,
    bindings,
    onChannelReady: flow
});
```

Example parameters:
    amqpUrl = 'amqp://localhost',
    bindings,
    channelOptions = {
        noAck: false
    },
    exchangeName,
    exchangeType = 'topic',
    exchangeOptions = {
        durable: false
    },
    onChannelReady



If, for some reason, you want to close the connetion, you can use:
the `onChannelReady.connection` object `connection.close()`  