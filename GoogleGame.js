const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const ship = {
    x: canvas.width / 2,
    y: canvas.height - 40,
    width: 40,
    height: 40,
    speed: 3
};

const bullets = [];
const asteroids = [];
const explosions = [];
const keys = {};

const MAX_ASTEROIDS = 4;
const ASTEROID_SPEED = 0.5;
const BULLET_COOLDOWN = 500; // 0.5 seconds
let lastBulletTime = 0;
let gameOver = false;
let gameOverAnimation = 0;
let score = 0;
let highScore = 0;

// Load the asteroid image
const asteroidImage = new Image();
asteroidImage.src = 'asteroid.png';

// Load the ship image
const shipImage = new Image();
shipImage.src = 'ship.png';

function drawShip() {
    ctx.drawImage(shipImage, 
                  ship.x - ship.width / 2, 
                  ship.y - ship.height / 2, 
                  ship.width, 
                  ship.height);
}

function moveShip() {
    if (keys.ArrowLeft && ship.x > ship.width / 2) {
        ship.x -= ship.speed;
    }
    if (keys.ArrowRight && ship.x < canvas.width - ship.width / 2) {
        ship.x += ship.speed;
    }
}

function shootBullet(currentTime) {
    if (keys[' '] && currentTime - lastBulletTime >= BULLET_COOLDOWN) {
        bullets.push({
            x: ship.x,
            y: ship.y - ship.height / 2,
            width: 4,
            height: 12,
            speed: 8
        });
        lastBulletTime = currentTime;
    }
}

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bullets[i].speed;
        if (bullets[i].y + bullets[i].height < 0) {
            bullets.splice(i, 1);
        }
    }
}

function drawBullets() {
    ctx.fillStyle = '#e8eaed';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x - bullet.width / 2, bullet.y, bullet.width, bullet.height);
    });
}

function createAsteroid() {
    const width = 40;
    const height = 40;
    return {
        x: Math.random() * (canvas.width - width) + width / 2,
        y: -height / 2,
        width: width,
        height: height,
        speed: ASTEROID_SPEED
    };
}

function updateAsteroids() {
    if (Math.random() < 0.02 && asteroids.length < MAX_ASTEROIDS) {
        asteroids.push(createAsteroid());
    }

    for (let i = asteroids.length - 1; i >= 0; i--) {
        asteroids[i].y += asteroids[i].speed;
        if (asteroids[i].y - asteroids[i].height / 2 > canvas.height) {
            gameOver = true;
            return;
        }
    }
}

function drawAsteroids() {
    asteroids.forEach(asteroid => {
        ctx.drawImage(asteroidImage, 
                      asteroid.x - asteroid.width / 2, 
                      asteroid.y - asteroid.height / 2, 
                      asteroid.width, 
                      asteroid.height);
    });
}

function checkCollisions() {
    for (let i = asteroids.length - 1; i >= 0; i--) {
        for (let j = bullets.length - 1; j >= 0; j--) {
            if (isColliding(bullets[j], asteroids[i])) {
                explosions.push({
                    x: asteroids[i].x,
                    y: asteroids[i].y,
                    radius: asteroids[i].width / 2,
                    life: 30
                });
                asteroids.splice(i, 1);
                bullets.splice(j, 1);
                score += 100;
                break;
            }
        }
    }
}

function isColliding(bullet, asteroid) {
    return (bullet.x >= asteroid.x - asteroid.width / 2 &&
            bullet.x <= asteroid.x + asteroid.width / 2 &&
            bullet.y >= asteroid.y - asteroid.height / 2 &&
            bullet.y <= asteroid.y + asteroid.height / 2);
}

function updateExplosions() {
    for (let i = explosions.length - 1; i >= 0; i--) {
        explosions[i].life--;
        if (explosions[i].life <= 0) {
            explosions.splice(i, 1);
        }
    }
}

function drawExplosions() {
    explosions.forEach(explosion => {
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, explosion.radius * (1 - explosion.life / 30), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 165, 0, ${explosion.life / 30})`;
        ctx.fill();
    });
}

function drawScore() {
    ctx.fillStyle = '#e8eaed';
    ctx.font = '16px "Press Start 2P"';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE ${score}`, 10, 30);
}

function drawGameOver() {
    ctx.fillStyle = `rgba(32, 33, 36, ${gameOverAnimation})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = `rgba(232, 234, 237, ${gameOverAnimation})`;
    ctx.font = '32px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 50);
    
    ctx.font = '16px "Press Start 2P"';
    ctx.fillText(`FINAL SCORE ${score}`, canvas.width / 2, canvas.height / 2);
    
    if (gameOverAnimation >= 0.8) {  // Only show blinking text when animation is nearly complete
        ctx.fillStyle = `rgba(255, 255, 0, ${Math.sin(Date.now() / 250) * 0.5 + 0.5})`;
        ctx.fillText('PRESS SPACE TO RESTART', canvas.width / 2, canvas.height / 2 + 50);
    }
}

function updateScoreDisplay() {
    const highScoreElement = document.getElementById('highScore');
    const currentScoreElement = document.getElementById('currentScore');
    
    highScoreElement.textContent = highScore.toString().padStart(5, '0');
    currentScoreElement.textContent = score.toString().padStart(5, '0');
}

function resetGame() {
    ship.x = canvas.width / 2;
    ship.y = canvas.height - 40;
    bullets.length = 0;
    asteroids.length = 0;
    explosions.length = 0;
    gameOver = false;
    if (score > highScore) {
        highScore = score;
    }
    score = 0;
    updateScoreDisplay();
}

function updateGame(currentTime) {
    ctx.fillStyle = '#202124';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!gameOver) {
        moveShip();
        shootBullet(currentTime);
        updateBullets();
        updateAsteroids();
        checkCollisions();
        updateExplosions();

        drawShip();
        drawBullets();
        drawAsteroids();
        drawExplosions();
        drawScore();
        updateScoreDisplay();
    } else {
        // Continue drawing the game in the background
        drawShip();
        drawBullets();
        drawAsteroids();
        drawExplosions();
        drawScore();

        // Animate game over screen
        if (gameOverAnimation < 1) {
            gameOverAnimation += 0.02;  // Adjust this value to change animation speed
        }
        drawGameOver();

        if (keys[' '] && gameOverAnimation >= 1) {
            resetGame();
            gameOverAnimation = 0;
        }
    }

    requestAnimationFrame(updateGame);
}

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

requestAnimationFrame(updateGame);