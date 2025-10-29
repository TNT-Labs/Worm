const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// RIFERIMENTI DOM PER LA SCHERMATA DI GAME OVER
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreElement = document.getElementById('finalScore');
const highScoreDisplayElement = document.getElementById('highScoreDisplay');
const restartButton = document.getElementById('restartButton');

const gridSize = 20; // Dimensione di ogni "segmento" del verme
let worm = [{ x: 10, y: 10 }]; // Posizione iniziale del verme
let food = {}; // Posizione del cibo
let direction = 'right'; // Direzione iniziale del verme
let score = 0;
let gameOver = false;

// VARIABILI PER LA VELOCITÀ ADATTIVA E IL TIMER
let gameInterval;
let gameSpeed = 150; // Velocità iniziale (in ms - più è alto, più è lento)
const initialGameSpeed = 150; // Velocità da usare per il reset
const speedDecrease = 5; // Di quanto diminuire la velocità (es. 5ms)
const speedThreshold = 3; // Ogni quante unità di punteggio aumentare la velocità

// VARIABILI E COSTANTI PER L'HIGH SCORE
let highScore = 0;
const HIGH_SCORE_KEY = 'wormDayHighScore';

function loadHighScore() {
    // Tenta di recuperare l'high score da localStorage
    const storedScore = localStorage.getItem(HIGH_SCORE_KEY);
    if (storedScore !== null) {
        // Converte il valore in un numero intero
        highScore = parseInt(storedScore, 10);
    }
}

function saveHighScore() {
    // Salva l'high score aggiornato
    localStorage.setItem(HIGH_SCORE_KEY, highScore);
}

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

    // Disegna il punteggio CORRENTE (in alto a sinistra)
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Punti: ' + score, 10, 30);

    // Disegna l'High Score (in alto a destra)
    const highScoreText = 'Record: ' + highScore;
    const textWidth = ctx.measureText(highScoreText).width;
    // Posizionamento basato sulla larghezza del testo
    ctx.fillText(highScoreText, canvas.width - textWidth - 10, 30);
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
            
            // LOGICA DI GAME OVER PERSONALIZZATA
            gameOver = true;
            clearInterval(gameInterval);

            let isNewRecord = false;
            if (score > highScore) {
                highScore = score;
                saveHighScore();
                isNewRecord = true;
            }

            // 2. Aggiorna e mostra la schermata di Game Over
            finalScoreElement.textContent = score;
            highScoreDisplayElement.textContent = highScore;
            gameOverScreen.classList.remove('hidden');

            if (isNewRecord) {
                 highScoreDisplayElement.textContent += " (Nuovo Record!)";
            }
            
            return;
        }
    }

    worm.unshift(head); // Aggiungi la nuova testa

    // Controlla se il verme ha mangiato il cibo
    if (head.x === food.x && head.y === food.y) {
        score++;
        generateFood(); // Genera nuovo cibo

        // LOGICA DI VELOCITÀ ADATTIVA
        if (score % speedThreshold === 0) {
            if (gameSpeed > 50) { // Limite di velocità minima (massima velocità)
                gameSpeed -= speedDecrease;
                
                // Riavvia il timer con la nuova velocità
                clearInterval(gameInterval);
                gameInterval = setInterval(update, gameSpeed);
            }
        }
        // FINE LOGICA DI VELOCITÀ ADATTIVA

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
    loadHighScore(); 

    // Resetta la velocità all'inizio del gioco
    gameSpeed = initialGameSpeed; 

    worm = [{ x: 10, y: 10 }];
    direction = 'right';
    score = 0;
    gameOver = false;
    clearInterval(gameInterval);
    generateFood();
    draw();
    
    // Avvia il ciclo di gioco con la velocità di base
    gameInterval = setInterval(update, gameSpeed); 
}

// Event Listeners
document.addEventListener('keydown', handleKeyPress);

document.getElementById('up').addEventListener('click', () => handleButtonClick('up'));
document.getElementById('down').addEventListener('click', () => handleButtonClick('down'));
document.getElementById('left').addEventListener('click', () => handleButtonClick('left'));
document.getElementById('right').addEventListener('click', () => handleButtonClick('right'));

// EVENT LISTENER PER IL PULSANTE RICOMINCIA
restartButton.addEventListener('click', () => {
    // Nasconde la schermata di Game Over
    gameOverScreen.classList.add('hidden');
    // Avvia un nuovo gioco
    initGame();
});

// Avvia il gioco
initGame();
