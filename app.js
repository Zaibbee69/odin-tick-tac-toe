class GameBoard {
    constructor() {
        this.gameTiles = Array.from({ length: 3 }, () => Array(3).fill(null));
    }

    makeMove(row, column, symbol) {
        if (this.gameTiles[row][column] === null) {
            this.gameTiles[row][column] = symbol;
            return true;
        }
        return false;
    }

    getWinner() {
        const b = this.gameTiles;

        // Rows
        for (let row of b) {
            if (row[0] && row[0] === row[1] && row[1] === row[2]) return row[0];
        }
        // Columns
        for (let col = 0; col < 3; col++) {
            if (b[0][col] && b[0][col] === b[1][col] && b[1][col] === b[2][col]) return b[0][col];
        }
        // Diagonals
        if (b[0][0] && b[0][0] === b[1][1] && b[1][1] === b[2][2]) return b[0][0];
        if (b[0][2] && b[0][2] === b[1][1] && b[1][1] === b[2][0]) return b[0][2];

        return null;
    }

    isFull() {
        return this.gameTiles.every(row => row.every(cell => cell !== null));
    }

    resetBoard() {
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                this.gameTiles[r][c] = null;
            }
        }
    }
}


class Game {
    constructor(player1, player2, board) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = board;
        this.currentPlayer = player1;
    }

    playRound(row, col) {
        if (!this.board.makeMove(row, col, this.currentPlayer.getChoice())) return null;

        const placedSymbol = this.currentPlayer.getChoice();

        if (this.board.getWinner()) {
            this.currentPlayer.increaseScore();
            return { result: "winner", player: this.currentPlayer, symbol: placedSymbol };
        }

        if (this.board.isFull()) {
            return { result: "tie", symbol: placedSymbol };
        }

        this.changePlayer();
        return { result: "continue", symbol: placedSymbol };
    }

    changePlayer() {
        this.currentPlayer = (this.currentPlayer === this.player1) ? this.player2 : this.player1;
    }

    resetGame() {
        this.currentPlayer = this.player1;
        this.board.resetBoard();
    }
}


// Making a player factory
class Player {
    constructor(name = "John", choice = "X", avatar) {
        this.name = name;
        this.choice = choice;
        this.avatar = avatar;
        this.score = 0;
    }

    getName() { return this.name; }
    getChoice() { return this.choice; }
    getAvatar() { return this.avatar; }
    getScore() { return this.score; }
    increaseScore() { this.score++; }
}


// --- GameController (Encapsulation) ---
class GameController {
    constructor() {
        this.players = {};
        this.board = new GameBoard();
        this.game = null;
    }

    init() {
        document.querySelector("#player-menu-btn")
            .addEventListener("click", (e) => this.handleFormData(e, "player1", "player2", ".player-menu"));

        document.querySelector("#bot-menu-btn")
            .addEventListener("click", (e) => this.handleFormData(e, "player", "bot", ".bot-menu"));

        document.querySelector("#reset-btn")
            .addEventListener("click", () => this.resetUI());
    }

    handleFormData(e, form1Id, form2Id, menuSelector) {
        e.preventDefault();

        const gameDiv = document.querySelector(".player-game");
        const menu = document.querySelector(menuSelector);

        const p1Data = Object.fromEntries(new FormData(document.getElementById(form1Id)).entries());
        const p2Data = Object.fromEntries(new FormData(document.getElementById(form2Id)).entries());

        if (p1Data.symbol === p2Data.symbol) {
            alert("Both players cannot pick the same symbol!");
            return;
        }

        this.players.player1 = new Player(p1Data.name, p1Data.symbol, p1Data.avatar);
        this.players.player2 = new Player(p2Data.name, p2Data.symbol, p2Data.avatar);

        this.game = new Game(this.players.player1, this.players.player2, this.board);

        menu.classList.remove("show");
        gameDiv.classList.add("show");

        this.setupBoardEvents();
    }

    setupBoardEvents() {
        document.querySelectorAll(".cell").forEach(cell => {
            cell.textContent = "";
            cell.className = "cell nes-container nes-btn nes-pointer is-rounded";

            cell.addEventListener("click", () => {
                const row = cell.dataset.row;
                const col = cell.dataset.col;

                const outcome = this.game.playRound(row, col);

                if (!outcome) return;

                if (outcome.symbol === "X")
                    cell.classList.add("is-primary");
                else
                    cell.classList.add("is-warning");

                cell.textContent = outcome.symbol;

                if (outcome.result === "winner") {
                    document.querySelector(".winner-ctn").classList.add("show");
                } else if (outcome.result === "tie") {
                    document.querySelector(".tie-ctn").classList.add("show");
                }
            }, { once: true });
        });
    }

    resetUI() {
        this.board.resetBoard();
        document.querySelectorAll(".cell").forEach(cell => {
            cell.textContent = "";
            cell.className = "cell nes-container nes-btn nes-pointer is-rounded";
        });
        this.setupBoardEvents();
    }
}


const controller = new GameController();
controller.init();


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

