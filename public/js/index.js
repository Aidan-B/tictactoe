$(document).ready(() => {

    //Sets the grid image to player token
    function update(player, square) {
        switch (player) {
            case "x": //player 1 (cross)
                square.html('<img src="./img/Cross.svg" class="player-token"></img>');
                square.addClass("cross");
                break;

            case "o": //player 2 (circle)
                square.html('<img src="./img/Circle.svg" class="player-token"></img>');
                square.addClass("circle")
                break;
        
            default: //error
                console.error("The player could not be identified");
                break;
        }
    }

    //Clears the game board
    function clearGrid() {
        $(".game-square").html("");
        $(".game-square").removeClass("circle");
        $(".game-square").removeClass("cross");

    }

    /*//Checks for a winner and updates the win status
    function checkForWin(player) {

        console.log("checking for winner");
        let $token = $("#gameGrid").children(".row").find(".game-square");
        
        let tokenName = (player === "o" ? 'circle' : 'cross');

        //TODO: Maybe if I want to make the board scaleable I can apply some math here,
        //      I figure this is appropriate for this situation.

                //Win for row, (0,1,2),(3,4,5),(6,7,8)
        if ($token.eq(0).hasClass(tokenName) && $token.eq(1).hasClass(tokenName) && $token.eq(2).hasClass(tokenName) ||
            $token.eq(3).hasClass(tokenName) && $token.eq(4).hasClass(tokenName) && $token.eq(5).hasClass(tokenName) ||
            $token.eq(6).hasClass(tokenName) && $token.eq(7).hasClass(tokenName) && $token.eq(8).hasClass(tokenName)
            ||  //Win for column (0,3,6),(1,4,7),(2,5,8)
            $token.eq(0).hasClass(tokenName) && $token.eq(3).hasClass(tokenName) && $token.eq(6).hasClass(tokenName) ||
            $token.eq(1).hasClass(tokenName) && $token.eq(4).hasClass(tokenName) && $token.eq(7).hasClass(tokenName) ||
            $token.eq(2).hasClass(tokenName) && $token.eq(5).hasClass(tokenName) && $token.eq(8).hasClass(tokenName)                
            ||  //Win for diagonals (0,4,8),(2,4,6)
            $token.eq(0).hasClass(tokenName) && $token.eq(4).hasClass(tokenName) && $token.eq(8).hasClass(tokenName) ||
            $token.eq(2).hasClass(tokenName) && $token.eq(4).hasClass(tokenName) && $token.eq(6).hasClass(tokenName)
            ) {
            console.log("Winner found")
            socket.emit('gameOver', player);
        }   
    }*/
    
    function restart() {
        clearGrid();
        player = "x";
        gameOver = false;
        socket.emit('gameMessage', "Welcome!");
        
    }

    let player = "x";
    let gameOver = false;
    let socket = io();

    //reload both games on reload of page
    $(window).bind('beforeunload',function(){
        socket.emit('restart', true);
    });

    //TODO: game events should call socket that then broadcasts the update to each client. Client then
    socket.on('update', function(msg) {
        console.log(msg);
        player = (msg.player === "x" ? "o" : "x");
        update(msg.player, $(".game-square[data-row="+msg.row+"][data-col="+msg.col+"]"));
        let message = (player === "x" ? "X's turn" : "O's turn");
        socket.emit('gameMessage', message);
        // checkForWin(msg.player);
    });

    socket.on('restart', function(msg) {
        console.log("received restart message");
        restart();
    });

    socket.on('gameOver', function(msg) {
        gameOver = true;
        console.log(msg + " wins");
        // let message = (msg === "x" ? "X wins!" : "O wins!");
        // socket.emit('gameMessage', message);
        
    });

    socket.on('gameMessage', function(msg) {
        console.log('gameMessage', msg)
        $("#message").html(msg);
    });

    //User clicks a square
    $(".game-square").click( function() {        

        if (!gameOver && $(this).is(".game-square:empty")) {
            
            let data = { "player": player, "row": $(this).data("row"), "col": $(this).data("col") };
            socket.emit('update', data);            
        }

    });

    //User clicks reset
    $("#reset-button").click(function() {
        socket.emit('restart', true);
    });
    
});
