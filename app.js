var express = require('express')
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);


//only send public directory to clients
app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});

io.on('connection', (socket) => {

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
            
            io.emit('gameOver', player);
            io.emit('gameMessage', (player === "x" ? "X wins!" : "O wins!"));
        }  
    }

    function printGrid(grid) {
        console.log(grid[0]);
        console.log(grid[1]);
        console.log(grid[2]);
    }
    
    
    let grid = [[0,0,0],[0,0,0],[0,0,0]];
    let player = "x";

    console.log('a user connected');

    //update board on
    socket.on('update', (msg) => {
        console.log("update");
        grid[msg.row][msg.col] = player;
        msg = {
            "player": player,
            "col": msg.col,
            "row": msg.row
        }
        io.emit('update', msg);
        
        checkForWin(grid, player);
        printGrid(grid);
        
        //toggle player each turn
        player = (player === "x" ? "o" : "x")
    });

    //reset game to clear board
    socket.on('restart', (msg) => {
        console.log("restart");

        grid = [[0,0,0],[0,0,0],[0,0,0]];
        player = "x";
        
        io.emit('restart', msg);
        io.emit('gameMessage', "Welcome!");
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});
