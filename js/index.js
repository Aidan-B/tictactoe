$(document).ready(() => {

    //handles player selection
    function selectSquare(element) {
        if (element.is(":empty")) {
            updateImage(turn, element);
            turn = !turn;
        }
    }

    //Sets the grid image to player token
    function updateImage(player1, square) {
        switch (player1) {
            case true: //player 1 (cross)
                square.html('<img src="./resources/Cross.svg" class="player-token"></img>');
                break;

            case false: //player 2 (circle)
                square.html('<img src="./resources/Circle.svg" class="player-token"></img>');
                break;
        
            default: //error
                console.error("The player could not be identified");
                break;
        }
    }

    function clearGrid() {
        console.log("clear button");
        $(".game-square").html("");

    }

    function checkForWin() {

    }



    turn = true;
    gameOver = false;
    
    $(".game-square").click( function() {
        selectSquare($(this));
        gameOver = checkForWin();
    });

    $("#reset-button").click(function() {
        clearGrid();
        turn = true
    });
    
});
