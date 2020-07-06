var express = require('express')
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

let roomId;
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

//only send public directory to clients
app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/welcome.html');
});
app.get('/room', (req, res) => {
    res.sendFile(__dirname + '/public/game.html');
    roomId = req.query.id;
});

http.listen(port, () => {
    console.log('listening on *:3000');
});

io.on('connection', (socket) => {
    //TODO: restrict total connections to 2
    socket.join(roomId);
    socket.emit('roomId', { "roomId": roomId } ); //Connect user to room
    
    let room = io.sockets.adapter.rooms;
    room[roomId].grid = [[0,0,0],[0,0,0],[0,0,0]];
    room[roomId].player = "x";
    // console.log('user '+socket.id+' connected to ' + roomId);

    function checkForWin(grid, player, roomId) {
        
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
            
            // console.log("Winner", player);
            // printGrid(grid);
            return true;
        }  
        return false;
    }
    //For debug purposes
    // function printGrid(grid) {
    //     console.log(grid[0]);
    //     console.log(grid[1]);
    //     console.log(grid[2]);
    // }

    //Update game board
    socket.on('update', (msg) => {
        // console.log("update", msg);
        room[msg.roomId].grid[msg.row][msg.col] = room[msg.roomId].player;
        out = {
            "player": room[msg.roomId].player,
            "col": msg.col,
            "row": msg.row
        }
        io.to(msg.roomId).emit('update', out);
        
        if (checkForWin(room[msg.roomId].grid, out.player)) {
            io.to(msg.roomId).emit('gameOver', out.player);
            io.to(msg.roomId).emit('gameMessage', (out.player === "x" ? "X wins!" : "O wins!"));
        } else {
            io.to(msg.roomId).emit('gameMessage', (out.player === "x" ? "O's turn" : "X's turn"));
        }

        //toggle player each turn
        room[msg.roomId].player = (room[msg.roomId].player === "x" ? "o" : "x")
    });

    //reset game to clear board
    socket.on('restart', (msg) => {
        // console.log("restart", msg);

        if (room[msg.roomId]) {
            room[msg.roomId].grid = [[0,0,0],[0,0,0],[0,0,0]];
            room[msg.roomId].player = "x";
            io.to(msg.roomId).emit('restart', msg);
            io.to(msg.roomId).emit('gameMessage', "X's turn");
        }
    });

    socket.on('disconnect', () => {
        // console.log('user disconnected');
    });
});
