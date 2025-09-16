// Making a IIFE  of our game board
const GameBoard = (function () {

    // Making a 3x3 grid equivalent to 9 cells in a grid
    const gameTiles = Array.from({length: 3}, () => Array(3).fill(null));

    // Function to make a corresponding move
    const makeMove = function (row, column, symbol) 
    {
        if (gameTiles[row][column] === null)
        {
            gameTiles[row][column] = symbol;
            return true;
        }
        else
            return false
    }  

    // Function to check winner
    const getWinner = function () 
    {
        // Checking the rows of our game board
        for (let row of gameTiles)
        {
            if (row[0] && row[0] === row[1] && row[1] === row[2])
                return row[0];
        }

        // Checking columns of our game board
        for (let col = 0; col < 3; col++) 
        {
            if (gameTiles[0][col] && gameTiles[0][col] === gameTiles[1][col] && gameTiles[1][col] === gameTiles[2][col]) 
                return gameTiles[0][col];
        }

        // Checking both the diagonals
        if (gameTiles[0][0] && gameTiles[0][0] === gameTiles[1][1] && gameTiles[1][1] === gameTiles[2][2])
            return gameTiles[0][0];

        if (gameTiles[0][2] && gameTiles[0][2] === gameTiles[1][1] && gameTiles[1][1] === gameTiles[2][0])
            return gameTiles[0][2];

        // If nothing found
        return null;
    };

    // Method to check if board is full
    const isfull = function () 
    {
        return gameTiles.every(row => row.every(cell => cell !== null));
    }

    // Method to reset the board
    const resetBoard = function ()
    {
        for (let r = 0; r < 3; r ++)
        {
            for (let c = 0; c < 3; c ++)
            {
                gameTiles[r][c] = null;
            }
        }
    }

    return { makeMove, getWinner, isfull, resetBoard };

})();

// Making an factory of our game
function Game(player1, player2)
{
    // Setting player 1 as current player
    let currentPlayer = player1;

    const playRound = function (row, column)
    {
        // First allow players to make a move
        const success = GameBoard.makeMove(row, column, currentPlayer.getChoice());

        // If move failed
        if (!success)
        {
            console.log("Move failed");
            return;
        }

        // After move is made we check if win or draw
        const winner = GameBoard.getWinner();

        // if winner declare the winner
        if (winner) 
        {
            currentPlayer.increaseScore();
            console.log(`You won ${currentPlayer.getName()}! Score: ${currentPlayer.getScore()}`);
            GameBoard.resetBoard();
            return;
        }

        if (GameBoard.isfull())
        {
            console.log("It's a Tie");
            GameBoard.resetBoard();
            return;
        }
    
        // Change players
        changePlayer();
    }

    // Function to change the current player
    const changePlayer = function ()
    {
        if (currentPlayer === player1)
            currentPlayer = player2;
        else
            currentPlayer = player1;
    } 

    // Method to reset the game
    const resetGame = function ()
    {
        currentPlayer = player1;
        GameBoard.resetBoard();
    }

    return { playRound, resetGame };
}

// Making a player factory
function Player(name = "John", choice = "X" )
{
    let score = 0;

    // Getter Functions utilizing closures
    const getName = () => name;
    const getScore = () => score;
    const getChoice = () => choice;

    // Function to increase score
    const increaseScore = () => score ++;

    return { getName, getScore, getChoice, increaseScore };
}

const player1 = Player("John", "X");
const player2 = Player("Jane", "O");
const game = Game(player1, player2);