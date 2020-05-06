const amqp = require('amqplib/callback_api');
const EventEmitter = require('events');
const emitter = new EventEmitter();

module.exports = function MessageQueue({
    amqpUrl = 'amqp://localhost',
    bindings,
    channelOptions = {
        noAck: false
    },
    exchangeName = '',
    exchangeType = 'topic',
    exchangeOptions = {
        durable: false
    },
    onChannelReady
}) {
    amqp.connect(amqpUrl, (errConn, connection) => {
        if (errConn) throw errConn;
        connection.createChannel((errChannel, channel) => {
            if (errChannel) throw errChannel;
            channel.assertExchange(exchangeName, exchangeType, exchangeOptions);
            Object.values(bindings).forEach(queue => channel.assertQueue(queue));
            Object.keys(bindings).forEach(key => {
                channel.bindQueue(bindings[key], exchangeName, key);
            });
            onChannelReady(channel);
        }, channelOptions);


        emitter.on('close', () => {
            connection.close();
        })
    });

    const close = () => emitter.emit('close');

    this.emitter = emitter;
    this.close = close;
}
