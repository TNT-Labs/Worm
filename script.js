const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// RIFERIMENTI DOM
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreElement = document.getElementById('finalScore');
const highScoreDisplayElement = document.getElementById('highScoreDisplay');
const restartButton = document.getElementById('restartButton');
const leaderboardList = document.getElementById('leaderboardList');
const saveScoreSection = document.getElementById('saveScoreSection');
const playerNameInput = document.getElementById('playerNameInput');
const saveScoreButton = document.getElementById('saveScoreButton');

// Riferimenti DOM per Power-up Indicator (se esistono nell'HTML)
const powerUpIndicator = document.getElementById('powerUpIndicator');
const powerUpText = document.getElementById('powerUpText');
const powerUpBarFill = document.getElementById('powerUpBarFill');

// VARIABILI PRINCIPALI DI GIOCO
let gridSize = 20; 
let worm = [{ x: 10, y: 10 }]; 
let food = {}; 
let direction = 'right'; 
let directionChanged = false;
let score = 0;
let gameOver = false;

// VARIABILI PER GLI ELEMENTI DI GIOCO
let asteroids = [];
let meteors = [];
let particles = [];
let stars = [];

// VARIABILI PER LA VELOCITÀ E IL TIMER
let gameInterval;
let gameSpeed = 150; 
const initialGameSpeed = 150; 
const speedDecrease = 5; 
const speedThreshold = 3;
const MIN_GAME_SPEED = 50;

// CLASSIFICA E HIGH SCORE
let highScore = 0; 
const HIGH_SCORE_KEY = 'wormDayHighScore'; 
const LEADERBOARD_KEY = 'wormDayLeaderboard'; 
const MAX_LEADERBOARD_ENTRIES = 5; 

// GESTIONE INPUT TOUCH
let touchStartX = 0;
let touchStartY = 0;
const minSwipeDistance = 10;

// SFONDO ANIMATO
const STAR_COUNT = 100;

// POWER-UP 
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
const MAX_PARTICLES = 200;

// LIVELLI E DIFFICOLTÀ
let currentLevel = 1;
const SCORE_TO_NEXT_LEVEL = 10;
const ASTEROIDS_PER_LEVEL = 2;
const METEORS_PER_LEVEL = 1;

// STATO CARICAMENTO
let resourcesLoaded = false;

// ----------------------------------------------------------------------
// GESTIONE SPRITE IMMAGINI
// ----------------------------------------------------------------------

let spriteImages = {};
let imagesLoaded = 0;
const totalImages = 8;
const IMAGE_PATHS = {
    wormHead: './assets/images/worm_head.png',
    wormBody: './assets/images/worm_body.png',
    starFood: './assets/images/star_food.png',
    asteroidStatic: './assets/images/asteroids_static.png',
    meteorMobile: './assets/images/meteor_mobile.png',
    powerUpShield: './assets/images/powerup_shield.png',
    powerUpSpeed: './assets/images/powerup_speed.png',
    powerUpSlow: './assets/images/powerup_slow.png'
};

// ----------------------------------------------------------------------
// GESTIONE AUDIO
// ----------------------------------------------------------------------

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let audioBuffers = {};
let bgmSource = null;

const AUDIO_PATHS = {
    eat: './assets/audio/sfx_eat.mp3',
    gameOver: './assets/audio/sfx_game_over.mp3',
    bgm: './assets/audio/bgm_loop.mp3'
};

async function loadAudio(url, key) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Status: ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        audioBuffers[key] = await audioContext.decodeAudioData(arrayBuffer);
    } catch (e) {
        console.warn(`Audio ${key} non disponibile (${url}). Il gioco continuerà senza questo suono.`);
        audioBuffers[key] = null;
    }
}

function playSound(key, loop = false, volume = 1.0) {
    if (!audioBuffers[key] || audioContext.state === 'suspended') return null;

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffers[key];
    source.loop = loop;
    
    const gainNode = audioContext.createGain();
    gainNode.gain.value = volume;

    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    source.start(0);
    return source;
}

function stopBGM() {
    if (bgmSource) {
        try {
            bgmSource.stop();
        } catch(e) {
            // Ignora errori se già fermato
        }
        bgmSource = null;
    }
}

function resumeAudioContext() {
    if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
            console.log('AudioContext ripristinato.');
        });
    }
}

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
    const name = playerNameInput.value.trim().substring(0, 3).toUpperCase() || 'AAA';
    
    if (score === 0) return; 

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
// FUNZIONI GENERAZIONE OGGETTI
// ----------------------------------------------------------------------

function generateRandomSafePosition(ignoreList = []) {
    const gridWidth = canvas.width / gridSize;
    const gridHeight = canvas.height / gridSize;
    let safePos = {};
    let collision = true;
    let attempts = 0;
    const maxAttempts = 1000;

    while (collision && attempts < maxAttempts) {
        attempts++;
        safePos = {
            x: Math.floor(Math.random() * gridWidth),
            y: Math.floor(Math.random() * gridHeight)
        };

        collision = false;
        
        for (let segment of worm) {
            if (segment.x === safePos.x && segment.y === safePos.y) {
                collision = true;
                break;
            }
        }

        if (!collision) {
            for (let asteroid of asteroids) {
                if (asteroid.x === safePos.x && asteroid.y === safePos.y) {
                    collision = true;
                    break;
                }
            }
        }
        
        if (!collision) {
            for (let meteor of meteors) {
                if (Math.floor(meteor.x) === safePos.x && Math.floor(meteor.y) === safePos.y) {
                    collision = true;
                    break;
                }
            }
        }
        
        if (!collision) {
            for (let item of ignoreList) {
                if (item && item.x === safePos.x && item.y === safePos.y) {
                    collision = true;
                    break;
                }
            }
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

function generateMeteor() {
    const entrySide = Math.floor(Math.random() * 4);
    const gridWidth = canvas.width / gridSize;
    const gridHeight = canvas.height / gridSize;
    
    let meteor = {};

    if (entrySide === 0) {
        meteor.x = Math.floor(Math.random() * gridWidth);
        meteor.y = -1; 
        meteor.dx = Math.random() * 0.2 - 0.1; 
        meteor.dy = Math.random() * 0.1 + 0.1; 
    } else if (entrySide === 1) {
        meteor.x = Math.floor(Math.random() * gridWidth);
        meteor.y = gridHeight; 
        meteor.dx = Math.random() * 0.2 - 0.1; 
        meteor.dy = -(Math.random() * 0.1 + 0.1); 
    } else if (entrySide === 2) {
        meteor.x = -1; 
        meteor.y = Math.floor(Math.random() * gridHeight);
        meteor.dx = Math.random() * 0.1 + 0.1; 
        meteor.dy = Math.random() * 0.2 - 0.1;
    } else {
        meteor.x = gridWidth; 
        meteor.y = Math.floor(Math.random() * gridHeight);
        meteor.dx = -(Math.random() * 0.1 + 0.1); 
        meteor.dy = Math.random() * 0.2 - 0.1;
    }

    meteor.x = meteor.x + 0.5; 
    meteor.y = meteor.y + 0.5; 
    
    return meteor;
}

function generateMeteors(level) {
    meteors = [];
    const count = (level - 1) * METEORS_PER_LEVEL;
    for (let i = 0; i < count; i++) {
        meteors.push(generateMeteor());
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

// ----------------------------------------------------------------------
// FUNZIONI PARTICELLE
// ----------------------------------------------------------------------

function createParticles(x, y, count, color, type) {
    if (particles.length > MAX_PARTICLES) {
        particles.splice(0, particles.length - MAX_PARTICLES);
    }

    for (let i = 0; i < count; i++) {
        const particle = {
            x: x + 0.5, 
            y: y + 0.5,
            color: color,
            dx: (Math.random() - 0.5) * (type === 'explosion' ? 0.3 : 0.6), 
            dy: (Math.random() - 0.5) * (type === 'explosion' ? 0.3 : 0.6),
            size: Math.random() * 3 + 1, 
            life: type === 'explosion' ? 60 : 30, 
            originalLife: type === 'explosion' ? 60 : 30,
            type: type 
        };
        particles.push(particle);
    }
}

// ----------------------------------------------------------------------
// AGGIORNAMENTO INDICATORE POWER-UP
// ----------------------------------------------------------------------

function updatePowerUpIndicator() {
    if (!powerUpIndicator) return;

    let active = false;
    let percentage = 0;
    let text = '';
    let maxTimer = 0;
    let currentTimer = 0;

    if (isShieldActive) {
        active = true;
        text = '🛡️ Scudo Attivo';
        currentTimer = shieldTimer;
        maxTimer = SHIELD_DURATION;
    } else if (isSpeedBoostActive) {
        active = true;
        text = '⚡ Turbo Attivo';
        currentTimer = speedBoostTimer;
        maxTimer = SPEED_BOOST_DURATION;
    } else if (isSlowDownActive) {
        active = true;
        text = '🐌 Rallentamento';
        currentTimer = slowDownTimer;
        maxTimer = SLOW_DOWN_DURATION;
    }

    if (active) {
        powerUpIndicator.classList.add('active');
        if (powerUpText) powerUpText.textContent = text;
        percentage = (currentTimer / maxTimer) * 100;
        if (powerUpBarFill) powerUpBarFill.style.width = percentage + '%';
    } else {
        powerUpIndicator.classList.remove('active');
    }
}

// ----------------------------------------------------------------------
// NOTIFICA LEVEL UP
// ----------------------------------------------------------------------

function showLevelUpNotification() {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 30px 50px;
        border-radius: 15px;
        font-size: 24px;
        font-weight: bold;
        z-index: 1000;
        box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        animation: fadeInOut 2s ease-in-out;
    `;
    notification.textContent = `🎉 Livello ${currentLevel}! Nuovi pericoli!`;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
            20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
            80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
        }
    `;
    
    if (!document.querySelector('style[data-levelup]')) {
        style.setAttribute('data-levelup', 'true');
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

// ----------------------------------------------------------------------
// FUNZIONE DRAW() - DISEGNO
// ----------------------------------------------------------------------

function draw() {
    if (!resourcesLoaded) {
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Caricamento risorse...', canvas.width / 2, canvas.height / 2);
        ctx.textAlign = 'left';
        return;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height); 

    // 1. Disegna le Stelle
    ctx.fillStyle = 'white';
    for (let star of stars) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size / 2, 0, Math.PI * 2); 
        ctx.fill();
    }
    
    // 2. Disegna il Cibo
    const foodImg = spriteImages.starFood;
    if (foodImg) {
        ctx.drawImage(foodImg, food.x * gridSize, food.y * gridSize, gridSize, gridSize);
    } else {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
    }

    // 3. Disegna gli Asteroidi Fissi
    const asteroidImg = spriteImages.asteroidStatic;
    for (let asteroid of asteroids) {
        if (asteroidImg) {
            ctx.drawImage(asteroidImg, asteroid.x * gridSize, asteroid.y * gridSize, gridSize, gridSize);
        } else {
            ctx.fillStyle = '#444';
            ctx.fillRect(asteroid.x * gridSize, asteroid.y * gridSize, gridSize, gridSize);
        }
    }
    
    // 4. Disegna le Meteore Mobili
    const meteorImg = spriteImages.meteorMobile;
    for (let meteor of meteors) {
        const renderX = meteor.x * gridSize - gridSize / 2;
        const renderY = meteor.y * gridSize - gridSize / 2;
        if (meteorImg) {
            ctx.drawImage(meteorImg, renderX, renderY, gridSize, gridSize);
        } else {
            ctx.fillStyle = 'orange';
            ctx.fillRect(renderX, renderY, gridSize, gridSize);
        }
    }

    // 5. Disegna il Power-up
    if (powerUp) {
        let powerUpImg;
        switch (powerUp.type) {
            case 'shield': powerUpImg = spriteImages.powerUpShield; break;
            case 'speed': powerUpImg = spriteImages.powerUpSpeed; break;
            case 'slow': powerUpImg = spriteImages.powerUpSlow; break;
        }
        if (powerUpImg) {
            ctx.drawImage(powerUpImg, powerUp.x * gridSize, powerUp.y * gridSize, gridSize, gridSize);
        } else {
            ctx.fillStyle = powerUp.type === 'shield' ? 'cyan' : powerUp.type === 'speed' ? 'red' : 'green';
            ctx.fillRect(powerUp.x * gridSize, powerUp.y * gridSize, gridSize, gridSize);
        }
    }
    
    // 6. DISEGNO DEL VERME
    const bodyImg = spriteImages.wormBody;
    for (let i = 1; i < worm.length; i++) {
        if (bodyImg) {
            ctx.drawImage(bodyImg, worm[i].x * gridSize, worm[i].y * gridSize, gridSize, gridSize);
        } else {
            ctx.fillStyle = 'lime';
            ctx.fillRect(worm[i].x * gridSize, worm[i].y * gridSize, gridSize, gridSize);
        }
    }

    const head = worm[0];
    const headX = head.x * gridSize;
    const headY = head.y * gridSize;
    const headImg = spriteImages.wormHead;
    
    if (headImg) {
        ctx.drawImage(headImg, headX, headY, gridSize, gridSize);
    } else {
        ctx.fillStyle = 'white';
        ctx.fillRect(headX, headY, gridSize, gridSize);
    }
    
    // 7. Effetto Scudo Attivo
    if (isShieldActive) {
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 3;
        
        for (let segment of worm) {
            ctx.strokeRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        }
        ctx.lineWidth = 1; 
    }
    
    // 8. Disegna le Particelle 
    for (const p of particles) {
        const opacity = p.life / p.originalLife; 
        ctx.fillStyle = `rgba(${p.color}, ${opacity})`;
        const renderX = p.x * gridSize;
        const renderY = p.y * gridSize;
        ctx.beginPath();
        ctx.arc(renderX, renderY, p.size / 2, 0, Math.PI * 2); 
        ctx.fill();
    }
    
    // 9. Disegna i Punteggi
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Punti: ' + score, 10, 30);
    
    const highScoreText = 'Record: ' + highScore;
    const textWidth = ctx.measureText(highScoreText).width;
    ctx.fillText(highScoreText, canvas.width - textWidth - 10, 30);
    
    // 10. Disegna Livello
    ctx.fillText('Livello: ' + currentLevel, 10, 60);
}

// ----------------------------------------------------------------------
// FUNZIONE UPDATE() - LOGICA DI GIOCO
// ----------------------------------------------------------------------

function update() {
    if (gameOver) return;
    
    directionChanged = false; 

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

    updatePowerUpIndicator();
    
    // 2. Muovi e gestisci la vita delle particelle
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.x += p.dx;
        p.y += p.dy;
        
        p.dx *= 0.95;
        p.dy *= 0.95;

        p.life--;

        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }

    const gridWidth = canvas.width / gridSize;
    const gridHeight = canvas.height / gridSize;

    // 3. Muovi le stelle
    for (let star of stars) {
        star.x += star.speed;
        star.y += star.speed / 2;

        if (star.x > canvas.width) { star.x = 0; star.y = Math.random() * canvas.height; }
        if (star.y > canvas.height) { star.y = 0; star.x = Math.random() * canvas.width; }
    }
    
    // 4. Muovi e gestisci le meteore
    for (let i = meteors.length - 1; i >= 0; i--) {
        let m = meteors[i];
        
        m.x += m.dx;
        m.y += m.dy;
        
        if (m.x < -1 || m.x > gridWidth + 1 || m.y < -1 || m.y > gridHeight + 1) {
            meteors.splice(i, 1); 
            
            if (currentLevel > 1) { 
                meteors.push(generateMeteor());
            }
        }
    }

    // 5. Muovi il verme
    const head = { x: worm[0].x, y: worm[0].y };

    switch (direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }

    // 6. Controlla i bordi (Teletrasporto)
    if (head.x < 0) head.x = gridWidth - 1;
    if (head.x >= gridWidth) head.x = 0;
    if (head.y < 0) head.y = gridHeight - 1;
    if (head.y >= gridHeight) head.y = 0;

    // 7. Collisioni
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
    
    for (let i = meteors.length - 1; i >= 0; i--) {
        let m = meteors[i];
        if (head.x === Math.floor(m.x) && head.y === Math.floor(m.y)) {
            if (!isShieldActive) {
                gameOver = true;
                break; 
            } else {
                meteors.splice(i, 1); 
            }
        }
    }

    for (let i = 1; i < worm.length; i++) {
        if (head.x === worm[i].x && head.y === worm[i].y) {
            if (!isShieldActive) { gameOver = true; }
        }
    }

    // GESTIONE GAME OVER
    if (gameOver) {
        const crashX = worm[0].x;
        const crashY = worm[0].y;
        
        createParticles(crashX, crashY, 80, '0, 170, 255', 'explosion'); 
        createParticles(crashX, crashY, 40, '100, 100, 100', 'explosion'); 
        
        clearInterval(gameInterval);
        stopBGM();
        playSound('gameOver');
        
        let leaderboard = loadLeaderboard();
        const isHighEnough = leaderboard.length < MAX_LEADERBOARD_ENTRIES || score > leaderboard[leaderboard.length - 1].score;

        let isNewRecord = false;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem(HIGH_SCORE_KEY, highScore);
            isNewRecord = true;
        }

        finalScoreElement.textContent = score;
        highScoreDisplayElement.textContent = isNewRecord ? `${highScore} (Nuovo Record!)` : highScore;
        
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

    // 8. Controlla raccolta Power-up
    if (powerUp && head.x === powerUp.x && head.y === powerUp.y) {
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
        updatePowerUpIndicator();
    }

    worm.unshift(head); 

    // 9. Controlla se il verme ha mangiato il cibo 
    if (head.x === food.x && head.y === food.y) {
        score++;
        
        playSound('eat', false, 0.5);
        
        createParticles(food.x, food.y, 40, '255, 255, 0', 'eat'); 
        
        if (score % SCORE_TO_NEXT_LEVEL === 0 && score > 0) {
            currentLevel++;
            showLevelUpNotification();
            partialGameRestart();
            return; 
        }

        generateFood(); 
        maybeGeneratePowerUp(); 

        if (score % speedThreshold === 0) {
            if (gameSpeed > MIN_GAME_SPEED) {
                gameSpeed -= speedDecrease;
                if (gameSpeed < MIN_GAME_SPEED) gameSpeed = MIN_GAME_SPEED; 
                
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
// FUNZIONE INIT/RESTART E CARICAMENTO RISORSE
// ----------------------------------------------------------------------

function resizeCanvas() {
    const MAX_SIZE = 400; 
    let size = Math.min(window.innerWidth, window.innerHeight * 0.8);
    
    size = Math.min(MAX_SIZE, size);
    
    const BLOCKS = 20; 
    let newCanvasSize = Math.floor(size / BLOCKS) * BLOCKS;
    
    if (newCanvasSize < 200) newCanvasSize = 200; 

    canvas.width = newCanvasSize;
    canvas.height = newCanvasSize;
    
    gridSize = newCanvasSize / BLOCKS; 
    
    if (!gameOver && resourcesLoaded) draw();
}

function partialGameRestart() {
    gameOver = false;
    clearInterval(gameInterval);
    worm = [{ x: 10, y: 10 }];
    direction = 'right';
    directionChanged = false;
    powerUp = null;
    isShieldActive = false;
    shieldTimer = 0;
    isSpeedBoostActive = false;
    speedBoostTimer = 0;
    isSlowDownActive = false;
    slowDownTimer = 0;
    particles = []; 
    generateFood(); 
    generateAsteroids(calculateAsteroidCount()); 
    generateMeteors(currentLevel); 
    
    updatePowerUpIndicator();
    
    stopBGM();
    bgmSource = playSound('bgm', true, 0.4);
    
    draw();
    gameInterval = setInterval(update, gameSpeed); 
}

function preloadImages() {
    return new Promise(resolve => {
        const keys = Object.keys(IMAGE_PATHS);
        
        if (keys.length === 0) {
            resolve();
            return;
        }

        let loadedCount = 0;
        let errorCount = 0;

        keys.forEach(key => {
            const img = new Image();
            
            img.onload = () => {
                loadedCount++;
                spriteImages[key] = img;
                imagesLoaded = loadedCount;
                
                if (loadedCount + errorCount === totalImages) { 
                    resolve(); 
                }
            };
            
            img.onerror = () => {
                console.warn(`Immagine ${IMAGE_PATHS[key]} non disponibile. Verrà usato un fallback.`);
                errorCount++;
                spriteImages[key] = null;
                
                if (loadedCount + errorCount === totalImages) { 
                    resolve(); 
                }
            };
            
            img.src = IMAGE_PATHS[key];
        });
    });
}

async function initGame() {
    resumeAudioContext();
    resizeCanvas(); 
    
    resourcesLoaded = false;
    draw();
    
    try {
        const loadAudioPromises = Object.keys(AUDIO_PATHS).map(key => loadAudio(AUDIO_PATHS[key], key));
        await Promise.all([preloadImages(), ...loadAudioPromises]); 
        resourcesLoaded = true;
    } catch (error) {
        console.error('Errore nel caricamento delle risorse:', error);
        resourcesLoaded = true;
    }

    loadHighScore(); 
    displayLeaderboard(); 

    stopBGM(); 
    bgmSource = playSound('bgm', true, 0.4); 

    currentLevel = 1;
    gameSpeed = initialGameSpeed; 
    worm = [{ x: 10, y: 10 }];
    direction = 'right';
    directionChanged = false;
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
    particles = []; 

    generateFood(); 
    generateAsteroids(calculateAsteroidCount()); 
    generateMeteors(currentLevel); 
    generateStars(); 

    updatePowerUpIndicator();

    draw();
    gameInterval = setInterval(update, gameSpeed); 
}

// ----------------------------------------------------------------------
// GESTIONE INPUT E LISTENER
// ----------------------------------------------------------------------

function handleKeyPress(event) {
    if (gameOver || directionChanged) return;
    
    const keyPressed = event.key;
    let newDirection = null;

    switch (keyPressed) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (direction !== 'down') newDirection = 'up';
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (direction !== 'up') newDirection = 'down';
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (direction !== 'right') newDirection = 'left';
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (direction !== 'left') newDirection = 'right';
            break;
    }
    
    if (newDirection) {
        direction = newDirection;
        directionChanged = true; 
        event.preventDefault();
    }
    
    resumeAudioContext(); 
}

function handleButtonClick(newDirection) {
    if (gameOver || directionChanged) return;
    let changed = false;

    if (newDirection === 'up' && direction !== 'down') {
        direction = 'up'; changed = true;
    }
    else if (newDirection === 'down' && direction !== 'up') {
        direction = 'down'; changed = true;
    }
    else if (newDirection === 'left' && direction !== 'right') {
        direction = 'left'; changed = true;
    }
    else if (newDirection === 'right' && direction !== 'left') {
        direction = 'right'; changed = true;
    }

    if (changed) {
        directionChanged = true; 
    }
    resumeAudioContext(); 
}

function handleSwipe(event) {
    if (gameOver) return;
    resumeAudioContext(); 

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

canvas.addEventListener('touchstart', event => {
    if (gameOver) return;
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
    event.preventDefault(); 
}, { passive: false }); 

canvas.addEventListener('touchmove', event => {
    event.preventDefault(); 
}, { passive: false });

canvas.addEventListener('touchend', handleSwipe, { passive: false });

window.addEventListener('resize', () => {
    resizeCanvas();
});

document.body.addEventListener('touchmove', (e) => {
    if (e.target === canvas) {
        e.preventDefault();
    }
}, { passive: false });

initGame();
