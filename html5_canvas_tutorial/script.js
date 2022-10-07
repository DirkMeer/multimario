//There is good canvas documentation on MDN docs
const canvas = document.getElementById('canvas');
//define ctx as a 2d context, we can now use ctx to call methods on our canvas
const ctx = canvas.getContext('2d');

// canvas.width = 200; You can set the width from here as well as the html
// canvas.width = window.innerWidth; You can also select the window object and use the whole width.
// same goes for the height naturally.

// //fillRect()
// ctx.fillStyle = '#FFFFFF';
// ctx.fillRect(20, 20, 150, 100);
// ctx.fillStyle = 'Red';
// ctx.fillRect(200, 20, 150, 100);

// //strokeRect()
// ctx.lineWidth = 5;
// ctx.strokeStyle = 'green';
// ctx.strokeRect(100, 200, 150, 100);

// //clearRect()
// ctx.clearRect(25, 25, 140, 90);

// //fillText()
// ctx.font = '20px sans-serif';
// ctx.fillStyle = 'purple';
// ctx.fillText('Hello', 400, 50);

// //strokeText()
// ctx.lineWidth = 2;
// ctx.strokeStyle = 'orange';
// ctx.strokeText('Hi there', 400, 100);

// Paths

// // Triangle
// ctx.beginPath();
// ctx.moveTo(50, 50);
// ctx.lineTo(150, 50);
// ctx.lineTo(100, 200);
// ctx.lineTo(50, 50);
// // ctx.closePath();
// ctx.fillStyle = 'coral';
// ctx.fill();

// ctx.beginPath();
// ctx.moveTo(200, 50);
// ctx.lineTo(150, 200);
// ctx.lineTo(250, 200);
// ctx.closePath();
// ctx.stroke();

// // Rectangle
// ctx.beginPath();
// ctx.rect(300, 50, 150, 100);
// ctx.fillStyle = 'teal';
// ctx.fill();

// // Arc (circles)
// ctx.beginPath();

// const centerX = canvas.width / 2;
// const centerY = canvas.height / 2;

// // Draw head
// ctx.arc(centerX, centerY, 200, 0, Math.PI * 2);

// // Move to mouth
// ctx.moveTo(centerX + 100, centerY);

// // Draw mouth
// ctx.arc(centerX, centerY, 100, 0, Math.PI, false);

// // Move left eye
// ctx.moveTo(centerX - 60, centerY - 80);

// // Draw left eye
// ctx.arc(centerX - 80, centerY - 80, 20, 0, Math.PI * 2);

// // Move to right eye
// ctx.moveTo(centerX + 100, centerY - 80);

// // Draw right eye
// ctx.arc(centerX + 80, centerY - 80, 20, 0, Math.PI * 2);

// // Quadratic curve
// ctx.moveTo(75, 25);
// ctx.quadraticCurveTo(25, 25, 25, 62.5);
// ctx.quadraticCurveTo(25, 100, 50, 100);
// ctx.quadraticCurveTo(50, 120, 30, 125);
// ctx.quadraticCurveTo(60, 120, 65, 100);
// ctx.quadraticCurveTo(125, 100, 125, 62.5);
// ctx.quadraticCurveTo(125, 25, 75, 25);

// ctx.stroke();

// Animation 1

// const circle = {
//   x: 200,
//   y: 200,
//   size: 30,
//   dx: 5,
//   dy: 4
// };

// function drawCircle() {
//   ctx.beginPath();
//   ctx.arc(circle.x, circle.y, circle.size, 0, Math.PI * 2);
//   ctx.fillStyle = 'purple';
//   ctx.fill();
// }

// function update() {
//   ctx.clearRect(0, 0, canvas.width, canvas.height);

//   drawCircle();

//   // change position
//   circle.x += circle.dx;
//   circle.y += circle.dy;

//   // Detect side walls
//   if (circle.x + circle.size > canvas.width || circle.x - circle.size < 0) {
//     circle.dx *= -1;
//   }

//   // Detect top and bottom walls
//   if (circle.y + circle.size > canvas.height || circle.y - circle.size < 0) {
//     circle.dy *= -1;
//   }

//   requestAnimationFrame(update);
// }

// update();


function drawPlayer() {
    ctx.drawImage(img, player.x, player.y, player.w, player.h);
}


const player = {
    w: 50,
    h: 70,
    x: 20,
    y: 200,
    speed: 10,
    dx: 0,
    dy: 0
}

function clear() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.height);
}

function newPos() {
    player.x += player.dx;
    player.y += player.dy;
    
    detectWalls();
}

function detectWalls() {
    //left wall
    if (player.x < 0) {
        player.x = 0;
    }
    //right wall
    if (player.x + player.w > canvas.width) {
        player.x = canvas.width - player.w;
    }
    //top wall
    if (player.y < 0) {
        player.y = 0;
    }
    //bottom wall
    if (player.y + player.h > canvas.height) {
        player.y = canvas.height - player.h;
    }
}

function update() {
    clear();
    drawPlayer();
    newPos();
    requestAnimationFrame(update);
}

function moveUp() {
    player.dy = -player.speed;
}

function moveDown() {
    player.dy = player.speed;
}

function moveRight() {
    player.dx = player.speed;
}

function moveLeft() {
    player.dx = -player.speed;
}

function keyDown(e) {
    console.log(e.keyCode)
    if (e.keyCode === 39) { moveRight() }
    else if (e.keyCode === 37) { moveLeft() }
    else if (e.keyCode === 38) { moveUp() }
    else if (e.keyCode === 40) { moveDown() }
}

function keyUp(e) {
    if (e.keyCode === 37 || e.keyCode === 38 || e.keyCode === 39 || e.keyCode === 40) {
        player.dx = 0;
        player.dy = 0;
    }
}


const img = new Image();
img.src = "https://i.ibb.co/HHBFJdH/char.png";
img.onload = () => {
    update();
} 

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);