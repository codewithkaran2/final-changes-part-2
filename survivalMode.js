// survivalMode.js
// ============================
// CHAOS KEYBOARD BATTLE - SURVIVAL MODE
// ============================

let canvas, ctx;
let paused = false;
let gameOverState = false;
let startTime = 0;
let enemySpawnInterval, powerUpSpawnInterval;
const enemyBullets = [];
const enemies = [];
const powerUps = [];

const player = {
  x: 0,
  y: 0,
  width: 50,
  height: 50,
  speed: 5,
  baseSpeed: 5,
  health: 100,
  score: 0,
  bullets: [],
  shieldActive: false,
  dashCooldown: 0,
  lastShot: 0,
  color: "blue",
};

const keys = {};

function attachEventListeners() {
  document.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
  });
  document.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
  });
}

function spawnEnemy() {
  const enemy = {
    x: Math.random() * (canvas.width - 50),
    y: -50,
    width: 50,
    height: 50,
    speed: Math.random() * 2 + 1 + getWave() * 0.3,
    health: 30 + getWave() * 10,
    lastShot: Date.now(),
  };
  enemies.push(enemy);
}

function spawnPowerUp() {
  const types = ["health", "shield", "speed", "bullet"];
  const type = types[Math.floor(Math.random() * types.length)];
  const powerUp = {
    x: Math.random() * (canvas.width - 30),
    y: Math.random() * (canvas.height - 30),
    width: 30,
    height: 30,
    type: type,
    spawnTime: Date.now(),
    color:
      type === "health" ? "lime" :
      type === "shield" ? "cyan" :
      type === "speed" ? "magenta" : "yellow",
  };
  powerUps.push(powerUp);
}

function shootBullet() {
  player.bullets.push(
    { x: player.x + player.width / 2 - 5, y: player.y, width: 10, height: 10, speedX: 0, speedY: -6 },
    { x: player.x + player.width / 2 - 5, y: player.y, width: 10, height: 10, speedX: 6, speedY: 0 },
    { x: player.x + player.width / 2 - 5, y: player.y, width: 10, height: 10, speedX: -6, speedY: 0 },
    { x: player.x + player.width / 2 - 5, y: player.y, width: 10, height: 10, speedX: 0, speedY: 6 }
  );
}

function dash() {
  if (player.dashCooldown <= 0) {
    player.speed = player.baseSpeed * 3;
    player.dashCooldown = 2000;
    setTimeout(() => {
      player.speed = player.baseSpeed;
    }, 300);
  }
}

function isColliding(obj1, obj2) {
  return (
    obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.height > obj2.y
  );
}

function getWave() {
  const elapsed = Date.now() - startTime;
  return Math.floor(elapsed / 30000) + 1;
}

function update() {
  if (paused) {
    requestAnimationFrame(update);
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const wave = getWave();

  if (keys["a"] && player.x > 0) player.x -= player.speed;
  if (keys["d"] && player.x + player.width < canvas.width) player.x += player.speed;
  if (keys["w"] && player.y > 0) player.y -= player.speed;
  if (keys["s"] && player.y + player.height < canvas.height) player.y += player.speed;

  if (keys[" "] && Date.now() - player.lastShot > 300) {
    shootBullet();
    player.lastShot = Date.now();
  }

  player.shieldActive = !!keys["q"];
  if (keys["e"]) dash();
  if (player.dashCooldown > 0) player.dashCooldown -= 16;

  player.bullets.forEach((bullet, index) => {
    bullet.x += bullet.speedX;
    bullet.y += bullet.speedY;
    if (
      bullet.x < 0 || bullet.x > canvas.width ||
      bullet.y < 0 || bullet.y > canvas.height
    ) {
      player.bullets.splice(index, 1);
    }
  });

  enemies.forEach((enemy, eIndex) => {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const angle = Math.atan2(dy, dx);
    enemy.x += Math.cos(angle) * enemy.speed;
    enemy.y += Math.sin(angle) * enemy.speed;

    if (Date.now() - enemy.lastShot > 2000) {
      enemy.lastShot = Date.now();
      enemyBullets.push({
        x: enemy.x + enemy.width / 2 - 5,
        y: enemy.y + enemy.height,
        width: 10,
        height: 10,
        speed: 4,
      });
    }

    if (isColliding(player, enemy)) {
      if (!player.shieldActive) {
        player.health -= 10;
        document.body.style.backgroundColor = "red";
        setTimeout(() => (document.body.style.backgroundColor = ""), 100);
      }
      enemies.splice(eIndex, 1);
      return;
    }

    player.bullets.forEach((bullet, bIndex) => {
      if (isColliding(bullet, enemy)) {
        enemy.health -= 20;
        player.bullets.splice(bIndex, 1);
        if (enemy.health <= 0) {
          player.score += 10;
          enemies.splice(eIndex, 1);
          document.body.style.backgroundColor = "lightgreen";
          setTimeout(() => (document.body.style.backgroundColor = ""), 100);
        }
      }
    });
  });

  enemyBullets.forEach((bullet, index) => {
    bullet.y += bullet.speed;
    if (bullet.y > canvas.height) {
      enemyBullets.splice(index, 1);
      return;
    }
    if (isColliding(bullet, player)) {
      if (!player.shieldActive) {
        player.health -= 10;
        document.body.style.backgroundColor = "red";
        setTimeout(() => (document.body.style.backgroundColor = ""), 100);
      }
      enemyBullets.splice(index, 1);
    }
  });

  powerUps.forEach((powerUp, index) => {
    if (isColliding(player, powerUp)) {
      if (powerUp.type === "health") player.health = Math.min(100, player.health + 20);
      if (powerUp.type === "shield") player.shieldActive = true;
      if (powerUp.type === "speed") player.speed += 2;
      if (powerUp.type === "bullet") {
        player.bullets.forEach((b) => (b.speedX *= 1.5, b.speedY *= 1.5));
      }
      powerUps.splice(index, 1);
    } else if (Date.now() - powerUp.spawnTime > 8000) {
      powerUps.splice(index, 1);
    }
  });

  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
  if (player.shieldActive) {
    ctx.strokeStyle = "cyan";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = "red";
  player.bullets.forEach((bullet) => {
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  });

  ctx.fillStyle = "green";
  enemies.forEach((enemy) => {
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
  });

  ctx.fillStyle = "orange";
  enemyBullets.forEach((bullet) => {
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  });

  powerUps.forEach((powerUp) => {
    ctx.fillStyle = powerUp.color;
    ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
    ctx.fillStyle = "black";
    ctx.font = "12px Arial";
    ctx.fillText(powerUp.type.toUpperCase(), powerUp.x + 2, powerUp.y + 20);
  });

  ctx.fillStyle = "white";
  ctx.font = "18px Arial";
  ctx.fillText(`Health: ${player.health}%`, 10, 30);
  ctx.fillText(`Score: ${player.score}`, 10, 60);
  ctx.fillText(`Wave: ${wave}`, 10, 90);
  const timerSeconds = Math.floor((Date.now() - startTime) / 1000);
  ctx.fillText(`Time: ${timerSeconds}s`, 10, 120);

  if (player.health <= 0) {
    gameOver();
    return;
  }

  requestAnimationFrame(update);
}

function gameOver() {
  gameOverState = true;
  localStorage.setItem("survivalHighScore", Math.max(player.score, getHighScore()));
  ctx.fillStyle = "red";
  ctx.font = "40px Arial";
  ctx.fillText("Game Over", canvas.width / 2 - 100, canvas.height / 2);
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${player.score}`, canvas.width / 2 - 40, canvas.height / 2 + 40);
  ctx.fillText(`High Score: ${getHighScore()}`, canvas.width / 2 - 60, canvas.height / 2 + 70);
  const gameOverScreen = document.getElementById("gameOverScreen");
  if (gameOverScreen) gameOverScreen.classList.remove("hidden");
}

function getHighScore() {
  return parseInt(localStorage.getItem("survivalHighScore")) || 0;
}

function survivalStartGame() {
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");
  attachEventListeners();

  player.x = canvas.width / 2 - 25;
  player.y = canvas.height - 100;
  player.health = 100;
  player.score = 0;
  player.bullets = [];
  player.shieldActive = false;
  player.speed = player.baseSpeed;
  player.lastShot = 0;
  player.dashCooldown = 0;

  const colorPicker = document.getElementById("playerColor");
  if (colorPicker) {
    player.color = colorPicker.value || "blue";
  }

  enemies.length = 0;
  enemyBullets.length = 0;
  powerUps.length = 0;
  gameOverState = false;
  paused = false;
  startTime = Date.now();

  enemySpawnInterval = setInterval(spawnEnemy, 2000);
  powerUpSpawnInterval = setInterval(spawnPowerUp, 10000);

  update();
}

function togglePause() {
  paused = !paused;
  const pauseScreen = document.getElementById("pauseScreen");
  if (pauseScreen) {
    if (paused) pauseScreen.classList.remove("hidden");
    else pauseScreen.classList.add("hidden");
  }
  if (!paused && !gameOverState) {
    requestAnimationFrame(update);
  }
}

function restartGame() {
  location.reload();
}

function playAgain() {
  const gameOverScreen = document.getElementById("gameOverScreen");
  if (gameOverScreen) gameOverScreen.classList.add("hidden");
  survivalStartGame();
}

window.survivalStartGame = survivalStartGame;
window.togglePause = togglePause;
window.restartGame = restartGame;
window.playAgain = playAgain;
