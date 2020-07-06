var express = require('express')
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

function checkForWin(grid, player) {
    console.log("checking for winner");
    
    //TODO: Maybe if I want to make the board scaleable I can apply some math here,
    //      I figure this is appropriate for this situation.

            //Win for row
    if ((grid[0][0] == player && grid[0][1] == player && grid[0][2] == player) ||
        (grid[1][0] == player && grid[1][1] == player && grid[1][2] == player) ||
        (grid[2][0] == player && grid[2][1] == player && grid[2][2] == player)
        ||  //Win for column
        (grid[0][0] == player && grid[1][0] == player && grid[2][0] == player) ||
        (grid[0][1] == player && grid[1][1] == player && grid[2][1] == player) ||
        (grid[0][2] == player && grid[1][2] == player && grid[2][2] == player)                
        ||  //Win for diagonals
        (grid[0][0] == player && grid[1][1] == player && grid[2][2] == player) ||
        (grid[2][0] == player && grid[1][1] == player && grid[0][2] == player)
        ) {
        console.log("Winner found");
        console.log(grid[0]);
        console.log(grid[1]);
        console.log(grid[2]);
        
        io.emit('gameOver', player);
        io.emit('gameMessage', (player === "x" ? "X wins!" : "O wins!"));
    }  
}


//TODO: Use the grid stored server side to calculate wins
let grid = [[0,0,0],[0,0,0],[0,0,0]];

//only send public directory to clients
app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('update', (msg) => {
        console.log("update");
        grid[msg.row][msg.col] = msg.player;
        io.emit('update', msg);
        checkForWin(grid, msg.player);
    });

    socket.on('restart', (msg) => {
        grid = [[0,0,0],[0,0,0],[0,0,0]];
        console.log("restart");
        io.emit('restart', msg);
    });

    socket.on('gameOver', (msg) => {
        console.log("gameover")
        io.emit('gameOver', msg);
    });

    socket.on('gameMessage', (msg) => {
        console.log("gameMessage");
        io.emit('gameMessage', msg);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});