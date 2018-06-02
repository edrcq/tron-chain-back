var io = require('socket.io')();
var store = require('./store');
var crypto = require('crypto');

var net = require('net');

var Player = {
    socket: null,
    position: { x: 0, y: 0 },
}

var Game = {
    value: 0.01,
    players: {}, // id : { }
    map: [],
}

var conf = {
    port: 9875,
};

function initGame() {
    store.game = Object.assign({}, Game);
}

function sendToPlayers(data) {
    store.game.players.forEach( (val, i) => {
        val.socket.emit()
    })
}

io.on('connection', (client) => {
    console.log('Connected', client.id, 'from', client.request.connection.remoteAddress);
    store.clients[client.id] = client;
    
    var authToken =  crypto.randomBytes(16).toString('hex');
    store.clientsByTokens[authToken] = client.id;
    client.emit("auth", authToken);

    // middleware
    client.use((data, next) => {
        console.log(data);
        // data = ['action', { data }]
        next();
    });



    client.on('joinGame', (data) => {

    })

    // deplacement

    client.on('up', (data) => {
        client.emit('up', JSON.stringify({ x: '0', y: '1' }));
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