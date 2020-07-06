var express = require('express')
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

let roomId;

//only send public directory to clients
app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/welcome.html');
});
app.get('/room', (req, res) => {
    res.sendFile(__dirname + '/public/game.html');
    roomId = req.query.id;
});

http.listen(3000, () => {
    console.log('listening on *:3000');
});

io.on('connection', (socket) => {
    socket.join(roomId);
    let room = io.sockets.adapter.rooms[roomId];
    room.grid = [[0,0,0],[0,0,0],[0,0,0]];
    room.player = "x";
    console.log('user '+socket.id+' connected to ' + roomId);

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
            
            printGrid(grid);
            
            io.to(roomId).emit('gameOver', player);
            io.to(roomId).emit('gameMessage', (player === "x" ? "X wins!" : "O wins!"));
        }  
    }
    function printGrid(grid) {
        console.log(grid[0]);
        console.log(grid[1]);
        console.log(grid[2]);
    }

    socket.on('update', (msg) => {
        console.log("update");
        room.grid[msg.row][msg.col] = room.player;
        msg = {
            "player": room.player,
            "col": msg.col,
            "row": msg.row
        }
        io.to(roomId).emit('update', msg);
        
        checkForWin(room.grid, room.player);
        printGrid(room.grid);

        //toggle player each turn
        room.player = (room.player === "x" ? "o" : "x")
    });

    //reset game to clear board
    socket.on('restart', (msg) => {
        console.log("restart");

        room.grid = [[0,0,0],[0,0,0],[0,0,0]];
        room.player = "x";
        
        io.to(roomId).emit('restart', msg);
        io.to(roomId).emit('gameMessage', "Welcome!");
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});
