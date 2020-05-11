const amqp = require('amqplib/callback_api');

module.exports = function MessageQueue({
    amqpUrl = 'amqp://localhost', // URL of the AMQP server in format amqp://<username>:<password>@<server-address>:<port>
    bindings, // Object containing {key_name_first: 'some_queue_name', key_name_first: 'some_queue_name'} mappings.
    channelOptions = { // these options will be passed to the channel options
        noAck: false
    },
    exchangeName, // name of the exchange to keep open
    exchangeType = 'topic', // the type of exchange. 'topic' is versatile and you can use like 'direct' if not including bindings 
    exchangeOptions = { // these will be passed directly when connecting the exchange
        durable: false
    },
    onChannelReady // callback function that will run while connection open
}) {
    amqp.connect(amqpUrl, (errConn, connection) => {
        if (errConn) throw errConn;
        connection.createChannel((errChannel, channel) => {
            if (errChannel) throw errChannel;
            // cannot create empty exchange.
            if (exchangeName) channel.assertExchange(exchangeName, exchangeType, exchangeOptions);
            // cannot create bindings on default exchange
            if (bindings) {
                Object.values(bindings).forEach(queue => channel.assertQueue(queue));
                Object.keys(bindings).forEach(key => {
                    channel.bindQueue(bindings[key], exchangeName, key);
                });
            } else {
                channel.assertQueue('');
            }
            onChannelReady({ channel, connection });
        }, channelOptions);
    });
}
