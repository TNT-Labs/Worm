const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 20; // Dimensione di ogni "segmento" del verme
let worm = [{ x: 10, y: 10 }]; // Posizione iniziale del verme
let food = {}; // Posizione del cibo
let direction = 'right'; // Direzione iniziale del verme
let score = 0;
let gameOver = false;
// Variabile globale per il timer
let gameInterval;

// Variabile di VELOCITÀ BASE (in ms - più è alto, più è lento)
let gameSpeed = 150; 
const speedDecrease = 5; // Di quanto diminuire la velocità (es. 5ms)
const speedThreshold = 3; // Ogni quante unità di punteggio aumentare la velocità

// NUOVA VARIABILE GLOBALE PER L'HIGH SCORE
let highScore = 0;

// CHIAVE DI ARCHIVIAZIONE
const HIGH_SCORE_KEY = 'wormDayHighScore'; 

// Usiamo una costante per la chiave per evitare errori di battitura
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
    ctx.clearRect(0, 0, canvas.width, canvas.height); 

    // Disegna il cibo... (nessuna modifica qui)
    // ...

    // Disegna il verme... (nessuna modifica qui)
    // ...
    
    // Disegna il punteggio CORRENTE (in alto a sinistra)
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Punti: ' + score, 10, 30);

    // NUOVO: Disegna l'High Score (in alto a destra)
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
            
            // --- INIZIO NUOVA LOGICA DI GAME OVER ---
            gameOver = true;
            clearInterval(gameInterval);

            // Controlla se il punteggio corrente è un nuovo record
            if (score > highScore) {
                highScore = score; // Aggiorna la variabile locale
                saveHighScore(); // Salva in localStorage
                alert('NUOVO RECORD! Punteggio: ' + score);
            } else {
                alert('Game Over! Punteggio: ' + score);
            }
            // --- FINE NUOVA LOGICA DI GAME OVER ---
            
            return;
        }
    }

    worm.unshift(head); // Aggiungi la nuova testa

    // Controlla se il verme ha mangiato il cibo
    if (head.x === food.x && head.y === food.y) {
        score++;
        generateFood(); // Genera nuovo cibo

        // --- INIZIO NUOVA LOGICA DI VELOCITÀ ---
        // Controlla se è il momento di aumentare la velocità
        if (score % speedThreshold === 0) {
            // Assicurati che il gioco non diventi *troppo* veloce
            if (gameSpeed > 50) { 
                gameSpeed -= speedDecrease;
                
                // Riavvia il timer con la nuova velocità
                clearInterval(gameInterval);
                gameInterval = setInterval(update, gameSpeed);
                
                console.log("Velocità aumentata a:", gameSpeed); // Utile per il debug
            }
        }
        // --- FINE NUOVA LOGICA DI VELOCITÀ ---
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

// Inizializzazione del gioco
function initGame() {
    loadHighScore(); 

    // NUOVO: Resetta la velocità all'inizio del gioco
    gameSpeed = 150; // Resetta al valore iniziale

    worm = [{ x: 10, y: 10 }];
    direction = 'right';
    score = 0;
    gameOver = false;
    clearInterval(gameInterval);
    generateFood();
    draw();
    
    // NUOVO: Usa la velocità di base per il primo avvio
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
