$(document).ready(() => {

    //handles player selection
    function selectSquare(element) {
        if (element.is(":empty")) {
            updateImage(player, element);
        }
    }

    //Sets the grid image to player token
    function updateImage(player, square) {
        switch (player) {
            case false: //player 1 (cross)
                square.html('<img src="./img/Cross.svg" class="player-token"></img>');
                square.addClass("cross");
                break;

            case true: //player 2 (circle)
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

    //Checks for a winner and updates the win status
    function checkForWin(player) {

        //might be a good idea to store this in an array on the server side so that people cant
        //just go into the inspector to win... although that sounds like a fun cheat code :)
        let $token = $("#gameGrid").children(".row").find(".game-square");
        
        let tokenName = (player ? 'circle' : 'cross');

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
                
            let message = (!player ? "X wins!" : "O wins!");
            $("#message").html(message);
            return true;
        }
        return false;   
    }


    //player 0 is cross, player 1 is circle
    let player = true;
    let gameOver = false;
    let socket = io();

    //User clicks a square
    $(".game-square").click( function() {
        
        if (!gameOver) {
            player = !player;
            selectSquare($(this));

            let message = (player ? "X's turn" : "O's turn");
            $("#message").html(message);
            
            gameOver = checkForWin(player);
        }
    });

    //User clicks reset
    $("#reset-button").click(function() {
        clearGrid();
        player = true;
        gameOver = false;
        $("#message").html("Welcome!");
    });
    
});
