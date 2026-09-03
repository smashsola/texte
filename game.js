const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("high-score");
const message = document.getElementById("message");
const startButton = document.getElementById("start-button");

const gridSize = 20;
const tileSize = canvas.width / gridSize;

let snake;
let food;
let direction;
let nextDirection;
let score = 0;
let highScore = Number(localStorage.getItem("snakeHighScore")) || 0;
let gameLoop;
let gameRunning = false;

highScoreElement.textContent = highScore;

function startGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];

    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    scoreElement.textContent = score;

    createFood();
    gameRunning = true;
    message.classList.add("hidden");

    clearInterval(gameLoop);
    gameLoop = setInterval(update, 110);
}

function update() {
    direction = nextDirection;

    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };

    if (hitWall(head) || hitSnake(head)) {
        gameOver();
        return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreElement.textContent = score;

        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem("snakeHighScore", highScore);
        }

        createFood();
    } else {
        snake.pop();
    }

    draw();
}

function hitWall(head) {
    return (
        head.x < 0 ||
        head.x >= gridSize ||
        head.y < 0 ||
        head.y >= gridSize
    );
}

function hitSnake(head) {
    return snake.some(part => part.x === head.x && part.y === head.y);
}

function createFood() {
    do {
        food = {
            x: Math.floor(Math.random() * gridSize),
            y: Math.floor(Math.random() * gridSize)
        };
    } while (snake.some(part => part.x === food.x && part.y === food.y));
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = "#151a24";
    ctx.lineWidth = 1;

    for (let i = 1; i < gridSize; i++) {
        const position = i * tileSize;

        ctx.beginPath();
        ctx.moveTo(position, 0);
        ctx.lineTo(position, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, position);
        ctx.lineTo(canvas.width, position);
        ctx.stroke();
    }

    // Food
    ctx.fillStyle = "#ff5c5c";
    ctx.beginPath();
    ctx.arc(
        food.x * tileSize + tileSize / 2,
        food.y * tileSize + tileSize / 2,
        tileSize * 0.35,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // Snake
    snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? "#72e28a" : "#42b962";

        ctx.fillRect(
            part.x * tileSize + 2,
            part.y * tileSize + 2,
            tileSize - 4,
            tileSize - 4
        );
    });
}

function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);

    message.innerHTML = `
        <h2>💥 Game Over!</h2>
        <p>Você fez <strong>${score}</strong> ponto${score === 1 ? "" : "s"}.</p>
        <button id="restart-button">JOGAR NOVAMENTE</button>
    `;

    message.classList.remove("hidden");

    document
        .getElementById("restart-button")
        .addEventListener("click", startGame);
}

function changeDirection(newDirection) {
    if (!gameRunning) return;

    // Impede a cobra de virar diretamente para trás.
    if (
        newDirection.x === -direction.x &&
        newDirection.y === -direction.y
    ) {
        return;
    }

    nextDirection = newDirection;
}

document.addEventListener("keydown", event => {
    const key = event.key.toLowerCase();

    const directions = {
        arrowup: { x: 0, y: -1 },
        w: { x: 0, y: -1 },
        arrowdown: { x: 0, y: 1 },
        s: { x: 0, y: 1 },
        arrowleft: { x: -1, y: 0 },
        a: { x: -1, y: 0 },
        arrowright: { x: 1, y: 0 },
        d: { x: 1, y: 0 }
    };

    if (directions[key]) {
        event.preventDefault();
        changeDirection(directions[key]);
    }

    if (key === " " && !gameRunning) {
        startGame();
    }
});

startButton.addEventListener("click", startGame);

draw();
