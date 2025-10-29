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
// NUOVE VARIABILI PER LO SFONDO ANIMATO
const STAR_COUNT = 100;
let stars = [];
// VARIABILI PER IL POWER-UP
let powerUp = null; // Posizione del power-up {x, y, type}
let isShieldActive = false;
let shieldTimer = 0;
const SHIELD_DURATION = 50; // Durata dello scudo (in cicli di update)
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

// NUOVA FUNZIONE PER GENERARE IL POWER-UP
function maybeGeneratePowerUp() {
    // Probabilità di generazione (es. 1 su 30 cicli di generazione cibo)
    if (Math.random() < 0.03) { 
        powerUp = generateRandomSafePosition();
        powerUp.type = 'shield'; // Per ora, solo uno scudo
    }
}

// Funzione di utilità per trovare una posizione non occupata (da aggiungere al codice)
function generateRandomSafePosition() {
    const gridWidth = canvas.width / gridSize;
    const gridHeight = canvas.height / gridSize;
    let safePos = {};
    let collision = true;

    while (collision) {
        safePos = {
            x: Math.floor(Math.random() * gridWidth),
            y: Math.floor(Math.random() * gridHeight)
        };

        collision = false;
        
        // Controlla collisione con Verme, Cibo e Asteroidi
        for (let segment of worm) {
            if (segment.x === safePos.x && segment.y === safePos.y) collision = true;
        }
        if (safePos.x === food.x && safePos.y === food.y) collision = true;
        for (let asteroid of asteroids) {
            if (asteroid.x === safePos.x && asteroid.y === safePos.y) collision = true;
        }
    }
    return safePos;
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

// NUOVA FUNZIONE PER GENERARE LE STELLE
function generateStars() {
    stars = [];
    const gridWidth = canvas.width;
    const gridHeight = canvas.height;

    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
            x: Math.random() * gridWidth,
            y: Math.random() * gridHeight,
            // 'size' e 'speed' casuali per l'effetto parallasse
            size: Math.random() * 2 + 0.5, // Stelle più piccole si muovono più lentamente
            speed: Math.random() * 0.1 + 0.05 // Velocità molto bassa
        });
    }
}

function draw() {
    // 1. Cancella e imposta lo sfondo del canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height); 

    // NUOVO: Disegna le Stelle (Sfondo Animato)
    ctx.fillStyle = 'white';
    for (let star of stars) {
        ctx.beginPath();
        // Disegna un cerchio o un piccolo quadrato per la stella
        ctx.arc(star.x, star.y, star.size / 2, 0, Math.PI * 2); 
        ctx.fill();
    }
    
    // 2. Disegna il Cibo (un piccolo asteroide o stella)
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize / 3, 0, Math.PI * 2);
    ctx.fill();

    // 3. Disegna gli Asteroidi Fissi
    ctx.fillStyle = '#666666'; // Grigio scuro per l'asteroide
    ctx.strokeStyle = '#444444'; 
    for (let asteroid of asteroids) {
        ctx.fillRect(asteroid.x * gridSize, asteroid.y * gridSize, gridSize, gridSize);
        ctx.strokeRect(asteroid.x * gridSize, asteroid.y * gridSize, gridSize, gridSize);
    }

    // NUOVO: Disegna il Power-up
    if (powerUp) {
        // Disegna un quadrato blu brillante per lo scudo
        ctx.fillStyle = '#00ffff'; 
        ctx.strokeStyle = 'white';
        ctx.fillRect(powerUp.x * gridSize, powerUp.y * gridSize, gridSize, gridSize);
        ctx.strokeRect(powerUp.x * gridSize, powerUp.y * gridSize, gridSize, gridSize);
    }
    
    // 4. DISEGNO DEL VERME
    
    // Disegna il CORPO del verme (dal secondo segmento in poi)
    ctx.fillStyle = '#00aaff'; // Corpo azzurro
    ctx.strokeStyle = '#006699'; // Bordo più scuro

    for (let i = 1; i < worm.length; i++) {
        ctx.fillRect(worm[i].x * gridSize, worm[i].y * gridSize, gridSize, gridSize);
        ctx.strokeRect(worm[i].x * gridSize, worm[i].y * gridSize, gridSize, gridSize);
    }

    // Disegna la TESTA DISTINTIVA (indice 0)
    const head = worm[0];
    const headX = head.x * gridSize;
    const headY = head.y * gridSize;

    // Disegna il blocco base della testa (più brillante)
    ctx.fillStyle = '#00eaff'; // Testa celeste
    ctx.fillRect(headX, headY, gridSize, gridSize);
    ctx.strokeStyle = '#006699'; 
    ctx.strokeRect(headX, headY, gridSize, gridSize);

    // Disegna un piccolo Indicatore di direzione (Occhio/Punta) sulla testa
    ctx.fillStyle = '#ffcc00'; // Giallo brillante

    let indicatorX = headX + gridSize / 2;
    let indicatorY = headY + gridSize / 2;
    let indicatorSize = gridSize / 5;

    switch (direction) {
        case 'up':
            indicatorY = headY + indicatorSize;
            break;
        case 'down':
            indicatorY = headY + gridSize - indicatorSize;
            break;
        case 'left':
            indicatorX = headX + indicatorSize;
            break;
        case 'right':
            indicatorX = headX + gridSize - indicatorSize;
            break;
    }

    // Disegna il cerchio indicatore
    ctx.beginPath();
    ctx.arc(indicatorX, indicatorY, indicatorSize, 0, Math.PI * 2);
    ctx.fill();

    // NUOVO: Effetto Scudo Attivo
    if (isShieldActive) {
        ctx.strokeStyle = '#00ffff'; // Bordo ciano brillante
        ctx.lineWidth = 3;
        
        // Disegna un bordo attorno a ogni segmento per mostrare lo scudo
        for (let segment of worm) {
            ctx.strokeRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        }
        ctx.lineWidth = 1; // Ripristina la larghezza della linea
    }
    
    // 5. Disegna il Punteggio CORRENTE (in alto a sinistra)
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Punti: ' + score, 10, 30);

    // 6. Disegna l'High Score (in alto a destra)
    const highScoreText = 'Record: ' + highScore;
    const textWidth = ctx.measureText(highScoreText).width;
    ctx.fillText(highScoreText, canvas.width - textWidth - 10, 30);
}

function update() {
    if (gameOver) return;

    // 1. GESTIONE TIMER SCUDO
    if (isShieldActive) {
        shieldTimer--;
        if (shieldTimer <= 0) {
            isShieldActive = false; // Scudo disattivato
            console.log("Scudo disattivato."); 
        }
    }
    
    // 2. Muovi le stelle per l'effetto di parallasse
    const gridWidth = canvas.width;
    const gridHeight = canvas.height;

    for (let star of stars) {
        star.x += star.speed;
        star.y += star.speed / 2;

        if (star.x > gridWidth) {
            star.x = 0;
            star.y = Math.random() * gridHeight;
        }
        if (star.y > gridHeight) {
            star.y = 0;
            star.x = Math.random() * gridWidth;
        }
    }

    // 3. Muovi il verme (calcola la nuova testa)
    const head = { x: worm[0].x, y: worm[0].y };

    switch (direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }

    // 4. Controlla i bordi (Teletrasporto)
    if (head.x < 0) head.x = (canvas.width / gridSize) - 1;
    if (head.x >= (canvas.width / gridSize)) head.x = 0;
    if (head.y < 0) head.y = (canvas.height / gridSize) - 1;
    if (head.y >= (canvas.height / gridSize)) head.y = 0;

    // 5. Controlla collisione con gli ASTEROIDI (Logica Scudo)
    for (let asteroid of asteroids) {
        if (head.x === asteroid.x && head.y === asteroid.y) {
            if (!isShieldActive) { // Game Over solo se lo scudo NON è attivo
                gameOver = true;
            } else {
                 // Scudo attivo: distrugge l'asteroide
                 asteroids = asteroids.filter(a => a.x !== asteroid.x || a.y !== asteroid.y);
                 break; // Esce dal loop dopo aver distrutto l'asteroide
            }
        }
    }

    // 6. Controlla collisione con se stesso (Logica Scudo)
    for (let i = 1; i < worm.length; i++) {
        if (head.x === worm[i].x && head.y === worm[i].y) {
            if (!isShieldActive) { // Game Over solo se lo scudo NON è attivo
                gameOver = true;
            }
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

    // 7. Controlla raccolta Power-up (NUOVA LOGICA)
    if (powerUp && head.x === powerUp.x && head.y === powerUp.y) {
        if (powerUp.type === 'shield') {
            isShieldActive = true;
            shieldTimer = SHIELD_DURATION;
            powerUp = null; // Rimuove il power-up raccolto
            console.log("Scudo Energetico Attivato!");
        }
    }

    worm.unshift(head); // Aggiungi la nuova testa

    // 8. Controlla se il verme ha mangiato il cibo
    if (head.x === food.x && head.y === food.y) {
        score++;
        generateFood(); // Genera nuovo cibo
        
        maybeGeneratePowerUp(); // Tenta di generare un power-up

        // LOGICA DI VELOCITÀ ADATTIVA
        if (score % speedThreshold === 0) {
            if (gameSpeed > 50) {
                gameSpeed -= speedDecrease;
                clearInterval(gameInterval);
                gameInterval = setInterval(update, gameSpeed);
            }
        }

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

    // 4. Resetta le variabili del Power-up (NUOVA LOGICA)
    powerUp = null;
    isShieldActive = false;
    shieldTimer = 0;

    // 5. Genera il cibo (deve avvenire prima degli asteroidi per evitare sovrapposizioni)
    generateFood(); 

    // 6. Genera gli asteroidi
    generateAsteroids(5); 

    // 7. Genera lo sfondo animato
    generateStars(); 

    // 8. Disegna la scena iniziale e avvia il ciclo di gioco
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
