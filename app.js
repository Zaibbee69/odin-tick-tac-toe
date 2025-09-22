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
        document.querySelector(".winner-ctn").classList.remove("show");

        document.querySelector(".tie-ctn").classList.remove("show");

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

    const playRound = function (row, column) {
    const success = GameBoard.makeMove(row, column, currentPlayer.getChoice());
    if (!success) return null;

    const placedSymbol = currentPlayer.getChoice();

    const winner = GameBoard.getWinner();
    if (winner) {
        currentPlayer.increaseScore();
        document.querySelector(".winner-ctn").classList.add("show");
        console.log(`You won ${currentPlayer.getName()}! Score: ${currentPlayer.getScore()}`);
        return placedSymbol;
    }

    if (GameBoard.isfull()) {
        document.querySelector(".tie-ctn").classList.add("show");
        console.log("It's a Tie");
        return placedSymbol;
    }

    changePlayer();
    return placedSymbol;
};


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
function Player(name = "John", choice = "X", avatar )
{
    let score = 0;

    // Getter Functions utilizing closures
    const getName = () => name;
    const getScore = () => score;
    const getChoice = () => choice;
    const getAvatar = () => avatar;

    // Function to increase score
    const increaseScore = () => score ++;

    return { getName, getScore, getChoice, getAvatar, increaseScore };
}

// --- GameController (Encapsulation) ---
const GameController = (function () {
    let players = {};
    let game = null;

    function handleFormData(e, form1Id, form2Id, menuSelector) {
        e.preventDefault();
        
        const gameDiv = document.querySelector(".player-game");
        const menu = document.querySelector(menuSelector);

        const p1Data = Object.fromEntries(new FormData(document.getElementById(form1Id)).entries());
        const p2Data = Object.fromEntries(new FormData(document.getElementById(form2Id)).entries());

        if (p1Data.symbol === p2Data.symbol) {
            alert("Both players cannot pick the same symbol! Choose different ones.");
            return;
        }

        players.player1 = Player(p1Data.name, p1Data.symbol, p1Data.avatar);
        players.player2 = Player(p2Data.name, p2Data.symbol, p1Data.avatar);

        game = Game(players.player1, players.player2);

        document.querySelector(".player1-name").textContent = p1Data.name;
        document.querySelector(".player1-symbol").textContent = p1Data.symbol;
        document.querySelector(".player1-avatar").classList.add(p1Data.avatar);

        document.querySelector(".player2-name").textContent = p2Data.name;
        document.querySelector(".player2-symbol").textContent = p2Data.symbol;
        document.querySelector(".player2-avatar").classList.add(p2Data.avatar);

        console.log("Players ready:", players);
        game.resetGame();

        menu.classList.remove("show");
        gameDiv.classList.add("show");

        setupBoardEvents();
    }

    function handleInput(e, inputTitle)
    {
        const title = document.querySelector(inputTitle);
        title.textContent = e.target.value;
    }

    function handleCharacter(e, charHolderSelector) 
    {
        const avatar = e.target.value;               // e.g. "nes-mario"
        const charHolder = document.querySelector(charHolderSelector);

        // clear previous avatar class if needed
        charHolder.className = charHolderSelector.replace(".", "");      

        // add the new avatar class
        charHolder.classList.add(avatar);           
    }

    function setupBoardEvents() {
        document.querySelectorAll(".cell").forEach(cell => {
            cell.textContent = ""; // clear UI
            cell.addEventListener("click", () => {
                const row = cell.dataset.row;
                const col = cell.dataset.col;

                const currentSymbol = game.playRound(row, col);

                if (currentSymbol === "X")
                    cell.classList.add("is-primary");
                
                else
                    cell.classList.add("is-warning");

                if (currentSymbol) {
                    cell.textContent = currentSymbol;
                }
        }, { once: true });
    });
    }

    document.querySelector("#reset-btn").addEventListener("click", () => {
        GameBoard.resetBoard();

        document.querySelectorAll(".cell").forEach(cell => {
        cell.textContent = "";
        cell.className = "cell nes-container nes-btn nes-pointer is-rounded";

        cell.replaceWith(cell.cloneNode(true));
        });

        setupBoardEvents();
    });

    function init() {
        document.querySelector("#player-menu-btn")
        .addEventListener("click", (e) => handleFormData(e, "player1", "player2", ".player-menu"));

        document.querySelector("#bot-menu-btn")
        .addEventListener("click", (e) => handleFormData(e, "player", "bot", ".bot-menu"));

        document.querySelector(".player-input").addEventListener("change", (e) => handleInput(e, ".player-title"));
        document.querySelector(".player-input2").addEventListener("change", (e) => handleInput(e, ".player-title2"));
        document.querySelector(".player-input3").addEventListener("change", (e) => handleInput(e, ".player-title3"));

        document.querySelector(".player-avatar").addEventListener("change", (e) => handleCharacter(e, ".player-holder"));    
        document.querySelector(".player-avatar2").addEventListener("change", (e) => handleCharacter(e, ".player-holder2"));    
        document.querySelector(".player-avatar3").addEventListener("change", (e) => handleCharacter(e, ".player-holder3"));    

    }

    return {
        init,
        getPlayers: () => players,
        getGame: () => game,
    };
})();

GameController.init();

function playerMenu()
{
    const header = document.querySelector("header");
    const playerDiv = document.querySelector(".player-menu");
    header.classList.add("hide");
    header.addEventListener("animationend", () => {
        header.style.display = "none";
        playerDiv.classList.add("show");

    }, { once: true });    
}

function botMenu()
{
    const header = document.querySelector("header");
    const botDiv = document.querySelector(".bot-menu");
    header.classList.add("hide");
    header.addEventListener("animationend", () => {
        header.style.display = "none";
        botDiv.classList.add("show");

    }, { once: true });   
}



function toggleReset() {
    const header = document.querySelector("header");
    const sections = [
        ".bot-menu",
        ".player-menu",
        ".player-game",
        ".tie-ctn",
        ".winner-ctn"
    ];

    // Hide all other sections
    sections.forEach(sel => {
        const el = document.querySelector(sel);
        if (!el) return;
        el.style.display = "none"; 
    });

    // Show header again
    header.style.display = "flex";
    header.classList.remove("hide");
    header.classList.add("show");

    // Reset game state
    GameBoard.resetBoard();
}

