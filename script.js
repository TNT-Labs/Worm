const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// RIFERIMENTI DOM PER LA SCHERMATA DI GAME OVER
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreElement = document.getElementById('finalScore');
const highScoreDisplayElement = document.getElementById('highScoreDisplay');
const restartButton = document.getElementById('restartButton');

// RIFERIMENTI DOM PER LA CLASSIFICA (NUOVI)
const leaderboardList = document.getElementById('leaderboardList');
const saveScoreSection = document.getElementById('saveScoreSection');
const playerNameInput = document.getElementById('playerNameInput');
const saveScoreButton = document.getElementById('saveScoreButton');

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

// VARIABILI E COSTANTI PER L'HIGH SCORE E LA CLASSIFICA (AGGIORNATE)
let highScore = 0; 
const HIGH_SCORE_KEY = 'wormDayHighScore'; 
const LEADERBOARD_KEY = 'wormDayLeaderboard'; 
const MAX_LEADERBOARD_ENTRIES = 5; 

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

let isSpeedBoostActive = false;
let speedBoostTimer = 0;
const SPEED_BOOST_DURATION = 30; 
let isSlowDownActive = false;
let slowDownTimer = 0;
const SLOW_DOWN_DURATION = 40; 

// VARIABILI E COSTANTI PER I LIVELLI
let currentLevel = 1;
const SCORE_TO_NEXT_LEVEL = 10;
const ASTEROIDS_PER_LEVEL = 2;

// ----------------------------------------------------------------------
// FUNZIONI DI UTILITÀ PER LA CLASSIFICA
// ----------------------------------------------------------------------

function loadHighScore() {
    const storedScore = localStorage.getItem(HIGH_SCORE_KEY);
    if (storedScore !== null) {
        highScore = parseInt(storedScore, 10);
    }
}

function loadLeaderboard() {
    const storedLeaderboard = localStorage.getItem(LEADERBOARD_KEY);
    try {
        if (storedLeaderboard) {
            return JSON.parse(storedLeaderboard);
        }
    } catch (e) {
        console.error("Errore nel parsing della classifica da localStorage:", e);
    }
    return [];
}

function saveLeaderboard(leaderboard) {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
}

function displayLeaderboard() {
    let leaderboard = loadLeaderboard();
    
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, MAX_LEADERBOARD_ENTRIES);

    leaderboardList.innerHTML = ''; 

    if (leaderboard.length === 0) {
        leaderboardList.innerHTML = '<li>Nessun punteggio registrato ancora!</li>';
        return;
    }

    leaderboard.forEach((entry, index) => {
        const date = new Date(entry.date).toLocaleDateString();
        const listItem = document.createElement('li');
        
        const rank = index + 1;
        const rankDisplay = rank === 1 ? '🥇' : `${rank}.`;
        
        listItem.innerHTML = `
            <strong>${rankDisplay} ${entry.name.toUpperCase()}</strong>: 
            ${entry.score} punti (Livello ${entry.level}) <span style="font-size: 0.8em; color: #aaa;">- ${date}</span>
        `;
        leaderboardList.appendChild(listItem);
    });
}

function savePlayerScore() {
    // Trimma e limita il nome a 3 caratteri, default "AAA"
    const name = playerNameInput.value.trim().substring(0, 3).toUpperCase() || 'AAA';
    
    if (score === 0) return; // Non salvare punteggi nulli

    const newEntry = {
        score: score,
        level: currentLevel,
        name: name,
        date: new Date().toISOString()
    };
    
    let leaderboard = loadLeaderboard();
    leaderboard.push(newEntry);
    
    leaderboard.sort((a, b) => b.score - a.score); 
    leaderboard = leaderboard.slice(0, MAX_LEADERBOARD_ENTRIES); 
    
    saveLeaderboard(leaderboard);
    
    saveScoreSection.classList.add('hidden');
    
    displayLeaderboard();
    localStorage.setItem('lastPlayerName', name); 
}

// ----------------------------------------------------------------------
// FUNZIONI DI GIOCO (Generate Position, Resize, Draw, etc.)
// ----------------------------------------------------------------------

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
        
        for (let segment of worm) {
            if (segment.x === safePos.x && segment.y === safePos.y) collision = true;
        }

        for (let asteroid of asteroids) {
            if (asteroid.x === safePos.x && asteroid.y === safePos.y) collision = true;
        }

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
    if (Math.random() < 0.05 && powerUp === null) { 
        const types = ['shield', 'speed', 'slow'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        
        powerUp = generateRandomSafePosition([food]);
        powerUp.type = randomType;
    }
}

function resizeCanvas() {
    const MAX_SIZE = 400; 
    let size = window.innerWidth;
    
    size = Math.min(MAX_SIZE, size);
    
    const BLOCKS = 20; 
    let newCanvasSize = Math.floor(size / BLOCKS) * BLOCKS;
    
    if (newCanvasSize < 200) newCanvasSize = 200; 

    canvas.width = newCanvasSize;
    canvas.height = newCanvasSize;
    
    gridSize = newCanvasSize / BLOCKS; 
    
    if (!gameOver) draw();
}

// ----------------------------------------------------------------------
// FUNZIONE DRAW() - DISEGNO (Omessa per brevità, non contiene logica di bug)
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
        let color = '#00ffff'; 
        let strokeColor = 'white';

        if (powerUp.type === 'speed') {
            color = '#ff0000'; 
            strokeColor = 'yellow';
        } else if (powerUp.type === 'slow') {
            color = '#00ff00'; 
            strokeColor = 'white';
        }
        
        ctx.fillStyle = color; 
        ctx.strokeStyle = strokeColor;
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

    // ... (Gestione timer Power-up e Muovi stelle - Logica OK)

    // 1. GESTIONE TIMER POWER-UP
    if (isShieldActive) {
        shieldTimer--;
        if (shieldTimer <= 0) {
            isShieldActive = false;
        }
    }
    if (isSpeedBoostActive) {
        speedBoostTimer--;
        if (speedBoostTimer <= 0) {
            isSpeedBoostActive = false;
            clearInterval(gameInterval);
            gameInterval = setInterval(update, gameSpeed);
        }
    }
    if (isSlowDownActive) {
        slowDownTimer--;
        if (slowDownTimer <= 0) {
            isSlowDownActive = false;
            clearInterval(gameInterval);
            gameInterval = setInterval(update, gameSpeed);
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

    // 3. Muovi il verme
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

    // 5. e 6. Collisioni (Asteroidi e Se Stesso)
    for (let asteroid of asteroids) {
        if (head.x === asteroid.x && head.y === asteroid.y) {
            if (!isShieldActive) { gameOver = true; } 
            else { asteroids = asteroids.filter(a => a.x !== asteroid.x || a.y !== asteroid.y); break; }
        }
    }
    for (let i = 1; i < worm.length; i++) {
        if (head.x === worm[i].x && head.y === worm[i].y) {
            if (!isShieldActive) { gameOver = true; }
        }
    }


    // --- GESTIONE GAME OVER (FIX LOGICO: Punteggio > 0) ---
    if (gameOver) {
        clearInterval(gameInterval);
        
        let leaderboard = loadLeaderboard();

        // Determina se il punteggio è abbastanza alto per la classifica (Top 5)
        const isHighEnough = leaderboard.length < MAX_LEADERBOARD_ENTRIES || score > leaderboard[leaderboard.length - 1].score;

        let isNewRecord = false;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem(HIGH_SCORE_KEY, highScore);
            isNewRecord = true;
        }

        finalScoreElement.textContent = score;
        highScoreDisplayElement.textContent = isNewRecord ? `${highScore} (Nuovo Record!)` : highScore;
        
        // MOSTRA LA SEZIONE SALVATAGGIO SOLO SE TOP SCORE E PUNTEGGIO > 0
        if (isHighEnough && score > 0) { 
             saveScoreSection.classList.remove('hidden');
             playerNameInput.value = localStorage.getItem('lastPlayerName') || ''; 
        } else {
             saveScoreSection.classList.add('hidden');
        }
        
        gameOverScreen.classList.remove('hidden');
        
        displayLeaderboard();
        return;
    }
    // -------------------------

    // 7. Controlla raccolta Power-up 
    if (powerUp && head.x === powerUp.x && head.y === powerUp.y) {
        // ... (Logica Power-up omessa per brevità)
        switch(powerUp.type) {
            case 'shield':
                isShieldActive = true;
                shieldTimer = SHIELD_DURATION;
                isSpeedBoostActive = false;
                isSlowDownActive = false;
                break;
            case 'speed':
                isSpeedBoostActive = true;
                speedBoostTimer = SPEED_BOOST_DURATION;
                clearInterval(gameInterval);
                gameInterval = setInterval(update, gameSpeed / 2); 
                isSlowDownActive = false;
                break;
            case 'slow':
                isSlowDownActive = true;
                slowDownTimer = SLOW_DOWN_DURATION;
                clearInterval(gameInterval);
                gameInterval = setInterval(update, gameSpeed * 2); 
                isSpeedBoostActive = false;
                break;
        }
        powerUp = null; 
    }

    worm.unshift(head); 

    // 8. Controlla se il verme ha mangiato il cibo 
    if (head.x === food.x && head.y === food.y) {
        score++;
        
        if (score % SCORE_TO_NEXT_LEVEL === 0 && score > 0) {
            currentLevel++;
            alert(`Livello ${currentLevel} raggiunto! Nuovi pericoli ti aspettano!`);
            partialGameRestart();
            return; 
        }

        generateFood(); 
        maybeGeneratePowerUp(); 

        // LOGICA DI VELOCITÀ ADATTIVA (CON FIX)
        if (score % speedThreshold === 0) {
            if (gameSpeed > 50) {
                gameSpeed -= speedDecrease;
                if (gameSpeed < 50) gameSpeed = 50; 
                
                if (!isSpeedBoostActive && !isSlowDownActive) {
                    clearInterval(gameInterval);
                    gameInterval = setInterval(update, gameSpeed);
                }
            }
        }

    } else {
        worm.pop(); 
    }

    draw();
}

// ----------------------------------------------------------------------
// FUNZIONE INITGAME() / RESTART (Logica OK)
// ----------------------------------------------------------------------

function partialGameRestart() {
    gameOver = false;
    clearInterval(gameInterval);
    worm = [{ x: 10, y: 10 }];
    direction = 'right';
    powerUp = null;
    isShieldActive = false;
    shieldTimer = 0;
    isSpeedBoostActive = false;
    speedBoostTimer = 0;
    isSlowDownActive = false;
    slowDownTimer = 0;
    generateFood(); 
    generateAsteroids(calculateAsteroidCount()); 
    draw();
    gameInterval = setInterval(update, gameSpeed); 
}

function initGame() {
    resizeCanvas(); 
    loadHighScore(); 
    displayLeaderboard(); 

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
    isSpeedBoostActive = false;
    speedBoostTimer = 0;
    isSlowDownActive = false;
    slowDownTimer = 0;

    generateFood(); 
    generateAsteroids(calculateAsteroidCount()); 
    generateStars(); 

    draw();
    gameInterval = setInterval(update, gameSpeed); 
}

// ----------------------------------------------------------------------
// GESTIONE INPUT (Completa di Swipe)
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

document.addEventListener('keydown', handleKeyPress);
document.getElementById('up').addEventListener('click', () => handleButtonClick('up'));
document.getElementById('down').addEventListener('click', () => handleButtonClick('down'));
document.getElementById('left').addEventListener('click', () => handleButtonClick('left'));
document.getElementById('right').addEventListener('click', () => handleButtonClick('right'));

saveScoreButton.addEventListener('click', savePlayerScore);

restartButton.addEventListener('click', () => {
    saveScoreSection.classList.add('hidden'); 
    gameOverScreen.classList.add('hidden');
    initGame();
});

// Event Listeners per lo Swipe sul Canvas (RIPRISTINATI)
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

window.addEventListener('resize', () => {
    resizeCanvas();
    if (!gameOver) draw(); 
});

initGame();
