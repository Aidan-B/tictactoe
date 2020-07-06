var express = require('express')
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

//TODO: Use the grid stored server side to calculate wins
let grid = [[0,0,0],[0,0,0],[0,0,0]];
console.log(grid);

//only send public directory to clients
app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('update', (msg) => {
        console.log(msg);
        grid[msg.row][msg.col] = msg.player;
        console.log(grid);
        io.emit('update', msg);
    });

    socket.on('restart', (msg) => {
        grid = [[0,0,0],[0,0,0],[0,0,0]];
        console.log(grid);
        io.emit('restart', msg);
    });

    socket.on('gameOver', (msg) => {
        console.log("gameover")
        io.emit('gameOver', msg);
    });

    socket.on('gameMessage', (msg) => {
        io.emit('gameMessage', msg);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
