const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// RIFERIMENTI DOM PER LA SCHERMATA DI GAME OVER
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreElement = document.getElementById('finalScore');
const highScoreDisplayElement = document.getElementById('highScoreDisplay');
const restartButton = document.getElementById('restartButton');

// NOTA: gridSize viene calcolato dinamicamente in resizeCanvas()
let gridSize = 20; 
let worm = [{ x: 10, y: 10 }]; 
let food = {}; 
let direction = 'right'; 
let score = 0;
let gameOver = false;

// VARIABILI PER GLI ELEMENTI DI GIOCO
let asteroids = []; 
let stars = []; 

// VARIABILI PER LA VELOCITÀ ADATTIVA E IL TIMER
let gameInterval;
let gameSpeed = 150; 
const initialGameSpeed = 150; 
const speedDecrease = 5; 
const speedThreshold = 3; 

// VARIABILI E COSTANTI PER L'HIGH SCORE
let highScore = 0;
const HIGH_SCORE_KEY = 'wormDayHighScore';

// VARIABILI PER LA GESTIONE DELLO SWIPE
let touchStartX = 0;
let touchStartY = 0;
const minSwipeDistance = 10;

// VARIABILI PER LO SFONDO ANIMATO
const STAR_COUNT = 100;

// VARIABILI PER IL POWER-UP
let powerUp = null;
let isShieldActive = false;
let shieldTimer = 0;
const SHIELD_DURATION = 50; 

// VARIABILI E COSTANTI PER I LIVELLI
let currentLevel = 1;
const SCORE_TO_NEXT_LEVEL = 10;
const ASTEROIDS_PER_LEVEL = 2;

// ----------------------------------------------------------------------
// FUNZIONI DI UTILITÀ (CARICAMENTO, SALVATAGGIO, GENERAZIONE SICURA)
// ----------------------------------------------------------------------

function loadHighScore() {
    const storedScore = localStorage.getItem(HIGH_SCORE_KEY);
    if (storedScore !== null) {
        highScore = parseInt(storedScore, 10);
    }
}

function saveHighScore() {
    localStorage.setItem(HIGH_SCORE_KEY, highScore);
}

/**
 * Genera una posizione casuale garantendo che non sia su verme, asteroidi, cibo o power-up.
 * @param {Array<Object>} ignoreList - Lista di oggetti ({x, y}) da ignorare temporaneamente.
 */
function generateRandomSafePosition(ignoreList = []) {
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
        
        // 1. Controlla collisione con il Verme (Corpo e Testa)
        for (let segment of worm) {
            if (segment.x === safePos.x && segment.y === safePos.y) collision = true;
        }

        // 2. Controlla collisione con gli Asteroidi
        for (let asteroid of asteroids) {
            if (asteroid.x === safePos.x && asteroid.y === safePos.y) collision = true;
        }

        // 3. Controlla collisione con elementi nella lista di ignore
        for (let item of ignoreList) {
             if (item && item.x === safePos.x && item.y === safePos.y) collision = true;
        }
    }
    return safePos;
}

function generateFood() {
    food = generateRandomSafePosition(powerUp ? [powerUp] : []);
}

function calculateAsteroidCount() {
    const baseAsteroids = 5; 
    return baseAsteroids + (currentLevel - 1) * ASTEROIDS_PER_LEVEL;
}

function generateAsteroids(count) {
    asteroids = [];
    for (let i = 0; i < count; i++) {
        // Ignora cibo e powerUp
        asteroids.push(generateRandomSafePosition([food, powerUp].filter(item => item !== null)));
    }
}

function generateStars() {
    stars = [];
    const gridWidth = canvas.width;
    const gridHeight = canvas.height;

    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
            x: Math.random() * gridWidth,
            y: Math.random() * gridHeight,
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 0.1 + 0.05
        });
    }
}

function maybeGeneratePowerUp() {
    if (Math.random() < 0.03 && powerUp === null) { 
        powerUp = generateRandomSafePosition([food]);
        powerUp.type = 'shield';
    }
}

// NUOVA FUNZIONE PER IL CALCOLO RESPONSIVO
function resizeCanvas() {
    // La dimensione massima è 400px (fissata in CSS)
    const MAX_SIZE = 400; 

    // Prendiamo la dimensione disponibile basata sulla larghezza della finestra
    let size = window.innerWidth;
    
    // Limita la dimensione
    size = Math.min(MAX_SIZE, size);
    
    // Rendi la dimensione un multiplo di 20 (i blocchi logici)
    const BLOCKS = 20; 
    let newCanvasSize = Math.floor(size / BLOCKS) * BLOCKS;
    
    // Aggiusta se la dimensione è troppo piccola (sicurezza)
    if (newCanvasSize < 200) newCanvasSize = 200; 

    // Assegna le nuove dimensioni al canvas
    canvas.width = newCanvasSize;
    canvas.height = newCanvasSize;
    
    // Ricalcola gridSize
    gridSize = newCanvasSize / BLOCKS; 
    
    if (!gameOver) draw();
}

// ----------------------------------------------------------------------
// FUNZIONE DRAW() - DISEGNO
// ----------------------------------------------------------------------

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); 

    // 1. Disegna le Stelle (Sfondo Animato)
    ctx.fillStyle = 'white';
    for (let star of stars) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size / 2, 0, Math.PI * 2); 
        ctx.fill();
    }
    
    // 2. Disegna il Cibo
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize / 3, 0, Math.PI * 2);
    ctx.fill();

    // 3. Disegna gli Asteroidi Fissi
    ctx.fillStyle = '#666666';
    ctx.strokeStyle = '#444444'; 
    for (let asteroid of asteroids) {
        ctx.fillRect(asteroid.x * gridSize, asteroid.y * gridSize, gridSize, gridSize);
        ctx.strokeRect(asteroid.x * gridSize, asteroid.y * gridSize, gridSize, gridSize);
    }

    // 4. Disegna il Power-up
    if (powerUp) {
        ctx.fillStyle = '#00ffff'; 
        ctx.strokeStyle = 'white';
        ctx.fillRect(powerUp.x * gridSize, powerUp.y * gridSize, gridSize, gridSize);
        ctx.strokeRect(powerUp.x * gridSize, powerUp.y * gridSize, gridSize, gridSize);
    }
    
    // 5. DISEGNO DEL VERME
    
    // Disegna il CORPO del verme
    ctx.fillStyle = '#00aaff';
    ctx.strokeStyle = '#006699';
    for (let i = 1; i < worm.length; i++) {
        ctx.fillRect(worm[i].x * gridSize, worm[i].y * gridSize, gridSize, gridSize);
        ctx.strokeRect(worm[i].x * gridSize, worm[i].y * gridSize, gridSize, gridSize);
    }

    // Disegna la TESTA DISTINTIVA (indice 0)
    const head = worm[0];
    const headX = head.x * gridSize;
    const headY = head.y * gridSize;

    ctx.fillStyle = '#00eaff'; 
    ctx.fillRect(headX, headY, gridSize, gridSize);
    ctx.strokeStyle = '#006699'; 
    ctx.strokeRect(headX, headY, gridSize, gridSize);

    // Disegna l'Indicatore di direzione (Occhio/Punta)
    ctx.fillStyle = '#ffcc00';

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

    ctx.beginPath();
    ctx.arc(indicatorX, indicatorY, indicatorSize, 0, Math.PI * 2);
    ctx.fill();
    
    // 6. Effetto Scudo Attivo
    if (isShieldActive) {
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 3;
        
        for (let segment of worm) {
            ctx.strokeRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        }
        ctx.lineWidth = 1; 
    }
    
    // 7. Disegna i Punteggi
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Punti: ' + score, 10, 30);
    
    const highScoreText = 'Record: ' + highScore;
    const textWidth = ctx.measureText(highScoreText).width;
    ctx.fillText(highScoreText, canvas.width - textWidth - 10, 30);
    
    // 8. Disegna Livello
    ctx.fillText('Livello: ' + currentLevel, 10, 60);
}

// ----------------------------------------------------------------------
// FUNZIONE UPDATE() - LOGICA DI GIOCO
// ----------------------------------------------------------------------

function update() {
    if (gameOver) return;

    // 1. GESTIONE TIMER SCUDO
    if (isShieldActive) {
        shieldTimer--;
        if (shieldTimer <= 0) {
            isShieldActive = false;
        }
    }
    
    // 2. Muovi le stelle (Sfondo Animato)
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
            if (!isShieldActive) { 
                gameOver = true;
            } else {
                 asteroids = asteroids.filter(a => a.x !== asteroid.x || a.y !== asteroid.y);
                 break;
            }
        }
    }

    // 6. Controlla collisione con se stesso (Logica Scudo)
    for (let i = 1; i < worm.length; i++) {
        if (head.x === worm[i].x && head.y === worm[i].y) {
            if (!isShieldActive) {
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

    // 7. Controlla raccolta Power-up
    if (powerUp && head.x === powerUp.x && head.y === powerUp.y) {
        if (powerUp.type === 'shield') {
            isShieldActive = true;
            shieldTimer = SHIELD_DURATION;
            powerUp = null;
        }
    }

    worm.unshift(head); // Aggiungi la nuova testa

    // 8. Controlla se il verme ha mangiato il cibo
    if (head.x === food.x && head.y === food.y) {
        score++;
        
        // CONTROLLO AVANZAMENTO LIVELLO
        if (score % SCORE_TO_NEXT_LEVEL === 0 && score > 0) {
            currentLevel++;
            alert(`Livello ${currentLevel} raggiunto! Nuovi pericoli ti aspettano!`);
            partialGameRestart();
            return; 
        }

        generateFood(); 
        maybeGeneratePowerUp(); 

        // LOGICA DI VELOCITÀ ADATTIVA
        if (score % speedThreshold === 0) {
            if (gameSpeed > 50) {
                gameSpeed -= speedDecrease;
                if (gameSpeed < 50) gameSpeed = 50; 
                
                clearInterval(gameInterval);
                gameInterval = setInterval(update, gameSpeed);
            }
        }

    } else {
        worm.pop(); 
    }

    draw();
}

// ----------------------------------------------------------------------
// FUNZIONE INITGAME() / RESTART
// ----------------------------------------------------------------------

function partialGameRestart() {
    gameOver = false;
    clearInterval(gameInterval);

    worm = [{ x: 10, y: 10 }];
    direction = 'right';
    powerUp = null;
    isShieldActive = false;
    shieldTimer = 0;

    generateFood(); 
    generateAsteroids(calculateAsteroidCount()); 
    
    draw();
    gameInterval = setInterval(update, gameSpeed); 
}

function initGame() {
    // 1. Imposta la dimensione del canvas in base alla finestra
    resizeCanvas(); 

    loadHighScore(); 

    currentLevel = 1;
    gameSpeed = initialGameSpeed; 
    worm = [{ x: 10, y: 10 }];
    direction = 'right';
    score = 0;
    gameOver = false;
    clearInterval(gameInterval);

    powerUp = null;
    isShieldActive = false;
    shieldTimer = 0;

    // 2. Rigenera gli elementi in base al nuovo gridSize
    generateFood(); 
    generateAsteroids(calculateAsteroidCount()); 
    generateStars(); 

    draw();
    gameInterval = setInterval(update, gameSpeed); 
}

// ----------------------------------------------------------------------
// GESTIONE INPUT (TASTIERA E SWIPE)
// ----------------------------------------------------------------------

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

function handleSwipe(event) {
    if (gameOver) return;

    if (event.changedTouches.length === 0) return;
    
    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;

    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    if (Math.abs(diffX) < minSwipeDistance && Math.abs(diffY) < minSwipeDistance) {
        return;
    }

    if (Math.abs(diffX) > Math.abs(diffY)) { 
        if (diffX > 0) {
            handleButtonClick('right');
        } else {
            handleButtonClick('left');
        }
    } else { 
        if (diffY > 0) {
            handleButtonClick('down');
        } else {
            handleButtonClick('up');
        }
    }
    event.preventDefault(); 
}

// ----------------------------------------------------------------------
// EVENT LISTENERS E AVVIO
// ----------------------------------------------------------------------

document.addEventListener('keydown', handleKeyPress);

document.getElementById('up').addEventListener('click', () => handleButtonClick('up'));
document.getElementById('down').addEventListener('click', () => handleButtonClick('down'));
document.getElementById('left').addEventListener('click', () => handleButtonClick('left'));
document.getElementById('right').addEventListener('click', () => handleButtonClick('right'));

restartButton.addEventListener('click', () => {
    gameOverScreen.classList.add('hidden');
    initGame();
});

// Event Listeners per lo Swipe sul Canvas
canvas.addEventListener('touchstart', event => {
    if (gameOver) return;
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
    event.preventDefault(); 
}, { passive: false }); 

canvas.addEventListener('touchmove', event => {
    if (!gameOver) event.preventDefault(); 
}, { passive: false });

canvas.addEventListener('touchend', handleSwipe);

// Listener per il ridimensionamento della finestra
window.addEventListener('resize', () => {
    resizeCanvas();
    if (!gameOver) draw(); 
});

initGame();
