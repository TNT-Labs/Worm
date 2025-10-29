const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 20; // Dimensione di ogni "segmento" del verme
let worm = [{ x: 10, y: 10 }]; // Posizione iniziale del verme
let food = {}; // Posizione del cibo
let direction = 'right'; // Direzione iniziale del verme
let score = 0;
let gameOver = false;
let gameInterval;
const gameSpeed = 150; // Millisecondi tra un aggiornamento e l'altro

function generateFood() {
    food = {
        x: Math.floor(Math.random() * (canvas.width / gridSize)),
        y: Math.floor(Math.random() * (canvas.height / gridSize))
    };
    // Assicurati che il cibo non appaia sul verme
    for (let segment of worm) {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood(); // Rigenera se il cibo è sul verme
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Cancella tutto

    // Disegna il cibo (un piccolo asteroide o stella)
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize / 3, 0, Math.PI * 2);
    ctx.fill();

    // Disegna il verme
    for (let i = 0; i < worm.length; i++) {
        ctx.fillStyle = (i === 0) ? '#00eaff' : '#00aaff'; // Testa celeste, corpo azzurro
        ctx.fillRect(worm[i].x * gridSize, worm[i].y * gridSize, gridSize, gridSize);
        ctx.strokeStyle = '#006699'; // Bordo più scuro
        ctx.strokeRect(worm[i].x * gridSize, worm[i].y * gridSize, gridSize, gridSize);
    }

    // Disegna il punteggio
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Punteggio: ' + score, 10, 30);
}

function update() {
    if (gameOver) return;

    // Muovi il verme
    const head = { x: worm[0].x, y: worm[0].y };

    switch (direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }

    // Controlla i bordi (il verme esce da un lato e rientra dall'altro)
    if (head.x < 0) head.x = (canvas.width / gridSize) - 1;
    if (head.x >= (canvas.width / gridSize)) head.x = 0;
    if (head.y < 0) head.y = (canvas.height / gridSize) - 1;
    if (head.y >= (canvas.height / gridSize)) head.y = 0;

    // Controlla collisione con se stesso
    for (let i = 1; i < worm.length; i++) {
        if (head.x === worm[i].x && head.y === worm[i].y) {
            gameOver = true;
            alert('Game Over! Punteggio: ' + score);
            clearInterval(gameInterval);
            return;
        }
    }

    worm.unshift(head); // Aggiungi la nuova testa

    // Controlla se il verme ha mangiato il cibo
    if (head.x === food.x && head.y === food.y) {
        score++;
        generateFood(); // Genera nuovo cibo
    } else {
        worm.pop(); // Rimuovi la coda se non ha mangiato
    }

    draw();
}

function handleKeyPress(event) {
    if (gameOver) return;
    const keyPressed = event.key;

    switch (keyPressed) {
        case 'ArrowUp':
            if (direction !== 'down') direction = 'up';
            break;
        case 'ArrowDown':
            if (direction !== 'up') direction = 'down';
            break;
        case 'ArrowLeft':
            if (direction !== 'right') direction = 'left';
            break;
        case 'ArrowRight':
            if (direction !== 'left') direction = 'right';
            break;
    }
}

function handleButtonClick(newDirection) {
    if (gameOver) return;
    if (newDirection === 'up' && direction !== 'down') direction = 'up';
    else if (newDirection === 'down' && direction !== 'up') direction = 'down';
    else if (newDirection === 'left' && direction !== 'right') direction = 'left';
    else if (newDirection === 'right' && direction !== 'left') direction = 'right';
}

// Inizializzazione del gioco
function initGame() {
    worm = [{ x: 10, y: 10 }];
    direction = 'right';
    score = 0;
    gameOver = false;
    clearInterval(gameInterval);
    generateFood();
    draw();
    gameInterval = setInterval(update, gameSpeed);
}

// Event Listeners
document.addEventListener('keydown', handleKeyPress);

document.getElementById('up').addEventListener('click', () => handleButtonClick('up'));
document.getElementById('down').addEventListener('click', () => handleButtonClick('down'));
document.getElementById('left').addEventListener('click', () => handleButtonClick('left'));
document.getElementById('right').addEventListener('click', () => handleButtonClick('right'));

// Avvia il gioco
initGame();
