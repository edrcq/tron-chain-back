var io = require('socket.io')();
var store = require('./store');

var conf = {
    port: 9875,
};

io.on('connection', (client) => {
    console.log('Connected', client.id, 'from', client.request.connection.remoteAddress);
    store.clients[client.id] = client;

    client.emit("up", "test");

    // middleware
    client.use((data, next) => {
        console.log(data);
        // data = ['action', { data }]
        next();
    });

    client.on('up', (data) => {

    });

    client.on('list', (data) => {
        client.emit({clients: store.clients});
    });

    client.on('left', (data) => {
        
    });

    client.on('right', (data) => {
        
    });

    client.on('down', (data) => {
        
    });


    client.on('disconnect', () => {
        delete store.clients[client.id];
        console.log('Disconnected', client.id);
    });
});


io.listen(conf.port);
console.log('Listening WebSocket on', conf.port);