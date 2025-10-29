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
// NUOVO ARRAY PER GLI ASTEROIDI FISSI
let asteroids = []; 
let direction = 'right'; // Direzione iniziale del verme
let score = 0;
let gameOver = false;

// VARIABILI PER LA VELOCITÀ ADATTIVA E IL TIMER
let gameInterval;
let gameSpeed = 150; // Velocità in ms. Valore corrente di aggiornamento.
const initialGameSpeed = 150; // Velocità di base per il reset.
const speedDecrease = 5; // Di quanto diminuire la velocità (es. 5ms)
const speedThreshold = 3; // Ogni quante unità di punteggio aumentare la velocità

// VARIABILI E COSTANTI PER L'HIGH SCORE
let highScore = 0;
const HIGH_SCORE_KEY = 'wormDayHighScore';

// VARIABILI PER LA GESTIONE DELLO SWIPE
let touchStartX = 0;
let touchStartY = 0;
const minSwipeDistance = 10; // Distanza minima in pixel per considerare un movimento come swipe

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

    // NUOVO: Disegna gli Asteroidi
    ctx.fillStyle = '#666666'; // Grigio scuro per l'asteroide
    ctx.strokeStyle = '#444444'; 
    for (let asteroid of asteroids) {
        ctx.fillRect(asteroid.x * gridSize, asteroid.y * gridSize, gridSize, gridSize);
        ctx.strokeRect(asteroid.x * gridSize, asteroid.y * gridSize, gridSize, gridSize);
    }
    
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

    // 1. Muovi il verme
    const head = { x: worm[0].x, y: worm[0].y };

    switch (direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }

    // 2. Controlla i bordi (il verme esce da un lato e rientra dall'altro)
    if (head.x < 0) head.x = (canvas.width / gridSize) - 1;
    if (head.x >= (canvas.width / gridSize)) head.x = 0;
    if (head.y < 0) head.y = (canvas.height / gridSize) - 1;
    if (head.y >= (canvas.height / gridSize)) head.y = 0;

    // 3. Controlla collisione con gli ASTEROIDI (NUOVA LOGICA)
    for (let asteroid of asteroids) {
        if (head.x === asteroid.x && head.y === asteroid.y) {
            // Se si scontra con un asteroide, Game Over
            gameOver = true;
        }
    }

    // 4. Controlla collisione con se stesso
    for (let i = 1; i < worm.length; i++) {
        if (head.x === worm[i].x && head.y === worm[i].y) {
            // Se si scontra con la sua coda, Game Over
            gameOver = true;
        }
    }

    // --- GESTIONE GAME OVER ---
    if (gameOver) {
        clearInterval(gameInterval);

        let isNewRecord = false;
        if (score > highScore) {
            highScore = score;
            saveHighScore();
            isNewRecord = true;
        }

        // Aggiorna e mostra la schermata di Game Over
        finalScoreElement.textContent = score;
        
        if (isNewRecord) {
             highScoreDisplayElement.textContent = `${highScore} (Nuovo Record!)`;
        } else {
             highScoreDisplayElement.textContent = highScore;
        }
        
        gameOverScreen.classList.remove('hidden');
        return;
    }
    // -------------------------

    worm.unshift(head); // Aggiungi la nuova testa

    // 5. Controlla se il verme ha mangiato il cibo
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
        worm.pop(); // Rimuovi la coda se non ha mangiato (mantiene la lunghezza)
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

// NUOVA FUNZIONE PER GESTIRE LO SWIPE
function handleSwipe(event) {
    if (gameOver) return;

    // Se l'evento ha più di un punto di contatto (multi-touch), ignora
    if (event.touches.length > 1) return; 
    
    // Calcola le coordinate finali del tocco
    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;

    // Calcola la distanza percorsa in X e Y
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    // Controlla se la distanza è sufficiente per essere considerata uno swipe
    if (Math.abs(diffX) < minSwipeDistance && Math.abs(diffY) < minSwipeDistance) {
        return; // Troppo piccolo, non è uno swipe
    }

    // Determina la direzione dello swipe
    // Controlla se lo swipe orizzontale è maggiore di quello verticale
    if (Math.abs(diffX) > Math.abs(diffY)) { 
        // Movimento ORIZZONTALE
        if (diffX > 0) {
            handleButtonClick('right'); // 'right'
        } else {
            handleButtonClick('left'); // 'left'
        }
    } else { 
        // Movimento VERTICALE
        if (diffY > 0) {
            handleButtonClick('down'); // 'down'
        } else {
            handleButtonClick('up'); // 'up'
        }
    }
    
    // Impedisce lo scorrimento della pagina
    event.preventDefault(); 
}

// Inizializzazione del gioco
// Inizializzazione del gioco
function initGame() {
    // 1. Carica l'High Score salvato
    loadHighScore(); 

    // 2. Resetta la velocità al valore di base
    gameSpeed = initialGameSpeed; 

    // 3. Resetta lo stato del verme e del gioco
    worm = [{ x: 10, y: 10 }];
    direction = 'right';
    score = 0;
    gameOver = false;
    clearInterval(gameInterval); // Resetta qualsiasi timer attivo

    // 4. Genera il cibo (deve avvenire prima degli asteroidi per evitare sovrapposizioni)
    generateFood(); 

    // 5. Genera gli asteroidi (Genera qui il numero di asteroidi desiderato)
    generateAsteroids(5); // Esempio: genera 5 asteroidi

    // 6. Disegna la scena iniziale e avvia il ciclo di gioco
    draw();
    gameInterval = setInterval(update, gameSpeed); 
}
// NUOVA FUNZIONE PER GENERARE GLI ASTEROIDI
function generateAsteroids(count) {
    asteroids = []; // Resetta l'array ad ogni nuovo gioco
    
    // Calcola le dimensioni della griglia
    const gridWidth = canvas.width / gridSize;
    const gridHeight = canvas.height / gridSize;

    for (let i = 0; i < count; i++) {
        let newAsteroid = {};
        let collision = true;
        
        // Continua a cercare una posizione finché non ne trova una libera
        while (collision) {
            newAsteroid = {
                x: Math.floor(Math.random() * gridWidth),
                y: Math.floor(Math.random() * gridHeight)
            };

            collision = false;

            // 1. Controlla collisione con il Verme iniziale
            for (let segment of worm) {
                if (segment.x === newAsteroid.x && segment.y === newAsteroid.y) {
                    collision = true;
                    break;
                }
            }
            
            // 2. Controlla collisione con il Cibo iniziale
            if (newAsteroid.x === food.x && newAsteroid.y === food.y) {
                 collision = true;
            }

            // 3. Controlla collisione con altri Asteroidi
            for (let existing of asteroids) {
                if (existing.x === newAsteroid.x && existing.y === newAsteroid.y) {
                    collision = true;
                    break;
                }
            }
        }
        
        asteroids.push(newAsteroid);
    }
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

// EVENT LISTENERS PER LO SWIPE SUL CANVAS
canvas.addEventListener('touchstart', event => {
    if (gameOver) return;
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
    // Impedisce lo scorrimento della pagina all'inizio del tocco
    event.preventDefault(); 
}, { passive: false }); // { passive: false } è necessario per prevenire il default

canvas.addEventListener('touchmove', event => {
    // Impedisce lo scorrimento della pagina durante il tocco
    event.preventDefault(); 
}, { passive: false });

canvas.addEventListener('touchend', handleSwipe);

// Avvia il gioco
initGame();
