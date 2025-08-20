const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game settings
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 12;
const PADDLE_MARGIN = 10;
const PLAYER_COLOR = '#0ff';
const AI_COLOR = '#f0f';
const BALL_COLOR = '#fff';

// Paddle objects
const player = {
    x: PADDLE_MARGIN,
    y: canvas.height/2 - PADDLE_HEIGHT/2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    color: PLAYER_COLOR,
    dy: 0
};

const ai = {
    x: canvas.width - PADDLE_MARGIN - PADDLE_WIDTH,
    y: canvas.height/2 - PADDLE_HEIGHT/2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    color: AI_COLOR,
    dy: 0
};

// Ball object
const ball = {
    x: canvas.width/2 - BALL_SIZE/2,
    y: canvas.height/2 - BALL_SIZE/2,
    size: BALL_SIZE,
    speed: 5,
    dx: 5,
    dy: 3,
    color: BALL_COLOR
};

// Utility draw functions
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawBall(x, y, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
    ctx.fill();
}

// Draw net
function drawNet() {
    ctx.strokeStyle = '#555';
    ctx.setLineDash([8, 16]);
    ctx.beginPath();
    ctx.moveTo(canvas.width/2, 0);
    ctx.lineTo(canvas.width/2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawNet();
    drawRect(player.x, player.y, player.width, player.height, player.color);
    drawRect(ai.x, ai.y, ai.width, ai.height, ai.color);
    drawBall(ball.x, ball.y, ball.size, ball.color);
}

// Mouse movement controls player paddle
canvas.addEventListener('mousemove', function(e) {
    const rect = canvas.getBoundingClientRect();
    let mouseY = e.clientY - rect.top;
    player.y = mouseY - player.height/2;
    // Clamp paddle inside canvas
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
});

// Touch events for mobile paddle control
canvas.addEventListener('touchstart', handleTouch, {passive: false});
canvas.addEventListener('touchmove', handleTouch, {passive: false});

function handleTouch(e) {
    e.preventDefault(); // Prevent scrolling
    const rect = canvas.getBoundingClientRect();
    let touch = e.touches[0];
    let touchY = touch.clientY - rect.top;
    player.y = touchY - player.height/2;
    // Clamp paddle inside canvas
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
}

// AI paddle movement
function aiMove() {
    let aiCenter = ai.y + ai.height/2;
    if (aiCenter < ball.y + ball.size/2 - 10) {
        ai.y += 3.5;
    } else if (aiCenter > ball.y + ball.size/2 + 10) {
        ai.y -= 3.5;
    }
    // Clamp AI paddle
    if (ai.y < 0) ai.y = 0;
    if (ai.y + ai.height > canvas.height) ai.y = canvas.height - ai.height;
}

// Ball movement and collisions
function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision (top and bottom)
    if (ball.y < 0) {
        ball.y = 0;
        ball.dy *= -1;
    }
    if (ball.y + ball.size > canvas.height) {
        ball.y = canvas.height - ball.size;
        ball.dy *= -1;
    }

    // Paddle collision (player)
    if (ball.x < player.x + player.width &&
        ball.x > player.x &&
        ball.y + ball.size > player.y &&
        ball.y < player.y + player.height) {
        ball.x = player.x + player.width;
        ball.dx *= -1;
        // Add some random "spin"
        let collidePoint = (ball.y + ball.size/2) - (player.y + player.height/2);
        ball.dy = collidePoint * 0.25;
    }

    // Paddle collision (AI)
    if (ball.x + ball.size > ai.x &&
        ball.x + ball.size < ai.x + ai.width &&
        ball.y + ball.size > ai.y &&
        ball.y < ai.y + ai.height) {
        ball.x = ai.x - ball.size;
        ball.dx *= -1;
        let collidePoint = (ball.y + ball.size/2) - (ai.y + ai.height/2);
        ball.dy = collidePoint * 0.25;
    }

    // Score (left or right wall)
    if (ball.x < 0 || ball.x + ball.size > canvas.width) {
        resetBall();
    }
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width/2 - BALL_SIZE/2;
    ball.y = canvas.height/2 - BALL_SIZE/2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
    ball.dy = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 4 + 2);
}

// Game loop
function gameLoop() {
    draw();
    aiMove();
    moveBall();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
