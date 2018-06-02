var io = require('socket.io')();
var store = require('./store');
var crypto = require('crypto');

var conf = {
    port: 9875,
};

io.on('connection', (client) => {
    console.log('Connected', client.id, 'from', client.request.connection.remoteAddress);
    store.clients[client.id] = client;
    
    var authToken =  crypto.randomBytes(16).toString('hex');
    store.clientsByTokens[authToken] = client.id;
    client.emit("up", authToken);

    // middleware
    client.use((data, next) => {
        console.log(data);
        // data = ['action', { data }]
        next();
    });



    client.on('join', (data) => {
        
    })

    // deplacement

    client.on('up', (data) => {
        //console.log('')
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