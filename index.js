var io = require('socket.io')();
var store = require('./store');
var crypto = require('crypto');

var net = require('net');

var Player = {
    socket: null,
    pos: { x: 0, y: 0 },
    direction: '',
    dead: false,
}

var Game = {
    started: false,
    value: 0.01,
    players: [], 
    playersId: {}, // id : 0, 1, 2, 3
    map: [],
}

var conf = {
    port: 9875,
};

const MAX_PLAYERS = 2;

function initGame() {
    store.game = Object.assign({}, Game);
}

function startGame() {
    var game = store.game;
    var players = game.players;

    var dataToSend = {
        p1: { x: players[0].pos.x, y: players[0].pos.y, direction: players[0].direction },
        p2: { x: players[1].pos.x, y: players[1].pos.y, direction: players[1].direction },
        /*p3: { x: players[2].pos.x, y: players[2].pos.y, direction: players[2].direction },
        p4: { x: players[3].pos.x, y: players[3].pos.y, direction: players[3].direction }, */
    };
    console.log('send start game');
    sendToPlayers('startGame', dataToSend);
}

function sendToPlayers(event, data) {
    console.log(event, data);
    store.game.players[0].socket.emit(event, data);
    store.game.players[1].socket.emit(event, data);
    /*store.game.players.forEach( (p, i) => {
        console.log('ID START', p.socket.id, event);
        p.socket.emit(event, data);
    })*/
}

function moveP(pos, player) {
    let direction = player.direction;

    if (player.dead === true) { return ; }

    if (direction == 'top') {
        player.pos.y++;
    }
    else if (direction == 'down') {
        player.pos.y--;
    }
    else if (direction == 'left') {
        player.pos.x--;
    }
    else if (direction == 'right') {
        player.pos.x++;
    }

    store.game.players[pos] = player;
}

function gameLoop() {
    console.log('gameLoop');
    if (store.inloop === true) { return ; }
    store.inloop = true;
    var game = store.game;
    var players = game.players;
    console.log('started', game.started);

    if (players.length < MAX_PLAYERS) { store.inloop = false; return ; }
    if (store.game.started === false) {
        store.game.started = true;
        startGame();
    }

    moveP(0, players[0]);
    moveP(1, players[1]);
    /*moveP(2, players[2]);
    moveP(3, players[3]);*/

    players = store.game.players;

    var dataToSend = {
        p1: { x: players[0].pos.x, y: players[0].pos.y, direction: players[0].direction },
        p2: { x: players[1].pos.x, y: players[1].pos.y, direction: players[1].direction },
    /*    p3: { x: players[2].pos.x, y: players[2].pos.y, direction: players[2].direction },
        p4: { x: players[3].pos.x, y: players[3].pos.y, direction: players[3].direction }, */
    };

    sendToPlayers('updateGame', dataToSend);
    store.inloop = false;
}

io.on('connection', (client) => {
    console.log('Connected', client.id, 'from', client.request.connection.remoteAddress);
    store.clients[client.id] = client;
    
    let authToken =  crypto.randomBytes(16).toString('hex');
    store.clientsByTokens[authToken] = client.id;
    client.emit("auth", authToken);
    client.authToken = authToken;

    
    // middleware
    client.use((data, next) => {
        console.log(client.authToken, client.id);
        console.log(data);
        // data = ['action', { data }]
        next();
    });



    client.on('joinGame', (data) => {
        client.playerData = Object.assign({}, Player);
        client.playerData.socket = client;
    
        if (store.game.players.length == 0) {
            client.playerData.pos = { x: -15, y: 15 };
            client.playerData.direction = 'right';
        }
        else if (store.game.players.length == 1) {
            client.playerData.pos = { x: -15, y: -15 };
            client.playerData.direction = 'right';
        }
        /*else if (store.game.players.length == 2) {
            client.playerData.pos = { x: -25, y: -25 };
            client.playerData.direction = 'top';
        }
        else if (store.game.players.length == 3) {
            client.playerData.pos = { x: 25, y: -25 };
            client.playerData.direction = 'left';
        }*/
        else {
            return ;
        }

        let count = store.game.players.length;
        store.game.playersId[client.id] = count;
        store.game.players.push(client.playerData);
        
        client.emit('joinGame', { x: client.playerData.pos.x, y: client.playerData.pos.y, direction: client.playerData.direction, idPlayer: (count + 1) });
    })

    client.on('startGame', (data) => {

        
    })

    client.on('dead', (data) => {
        var pn = store.game.playersId[client.id];
        var playerData = store.game.players[pn];
        if (!pn || !playerData) { return ; }
        playerData.dead = true;
        store.game.players[pn] = playerData;
        client.playerData = playerData;
    })

    // deplacement

    client.on('up', (data) => {
        var pn = store.game.playersId[client.id];
        var playerData = store.game.players[pn];
        if (!pn || !playerData) { return ; }
        if (playerData.dead === true) { return ;}
        playerData.direction = 'up';
        store.game.players[pn] = playerData;
        client.playerData = playerData;
        console.log(pn, 'up');
    });

    client.on('left', (data) => {
        var pn = store.game.playersId[client.id];
        var playerData = store.game.players[pn];
        if (!pn || !playerData) { return ; }
        if (playerData.dead === true) { return ;}
        playerData.direction = 'left';
        store.game.players[pn] = playerData;
        client.playerData = playerData;
        console.log(pn, 'left');
    });

    client.on('right', (data) => {
        var pn = store.game.playersId[client.id];
        var playerData = store.game.players[pn];
        if (!pn || !playerData) { return ; }
        if (playerData.dead === true) { return ;}
        playerData.direction = 'right';
        store.game.players[pn] = playerData;
        client.playerData = playerData;
        console.log(pn, 'right');
    });

    client.on('down', (data) => {
        var pn = store.game.playersId[client.id];
        var playerData = store.game.players[pn];
        if (!pn || !playerData) { return ; }
        if (playerData.dead === true) { return ;}
        playerData.direction = 'down';
        store.game.players[pn] = playerData;
        client.playerData = playerData;
        console.log(pn, 'down');
    });


    client.on('disconnect', () => {
        delete store.clients[client.id];
        console.log('Disconnected', client.id);
    });
});

initGame();
setInterval(gameLoop, 1000);

io.listen(conf.port);
console.log('Listening WebSocket on', conf.port);