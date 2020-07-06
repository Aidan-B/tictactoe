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
    
    function restart() {
        clearGrid();
        gameOver = false;
    }
    let gameOver = false;
    let socket = io();

    //reload both games on reload of page
    $(window).bind('beforeunload',function(){
        socket.emit('restart', true);
    });

    socket.on('update', function(msg) {
        console.log('update:', msg);
        update(msg.player, $(".game-square[data-row="+msg.row+"][data-col="+msg.col+"]"));
    });

    socket.on('restart', function(msg) {
        console.log("restart:");
        restart();
    });

    socket.on('gameOver', function(msg) {
        console.log('gameOver:', msg);
        gameOver = true;        
    });

    socket.on('gameMessage', function(msg) {
        console.log('gameMessage:', msg)
        $("#message").html(msg);
    });

    //User clicks a square
    $(".game-square").click( function() {        
        if (!gameOver && $(this).is(".game-square:empty")) {
            //send the coordinates of the grid square to server
            let data = {
                "row": $(this).data("row"),
                "col": $(this).data("col")
            };
            socket.emit('update', data);            
        }
    });

    //User clicks reset
    $("#reset-button").click(function() {
        socket.emit('restart', true);
    });
    
});
