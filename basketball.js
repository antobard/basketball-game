// VARIABLES
const refPlayPauseButton = document.getElementById("playPause");
const refPauseMenu = document.getElementById("pauseMenu");
const refScore = document.getElementById("score");
const refCanvas = document.getElementById("canvas");
const ctx = refCanvas.getContext("2d");
const canvasBounds = refCanvas.getBoundingClientRect();

// Variables used for handle a stable framerate.
const framerate = 60;
var frameCount = 0;
var fps, fpsInterval, startTime, now, then, elapsed;

var isPaused = false;

var mouseDown = false;
var mouse = {x: 0, y: 0};

var difference = {x: 0, y: 0}
const drag = .65
const strength = .8

const gravity = 4;

var score = 0;

var ball;
var backboard;

// CLASSES & OBJECTS
class Ball {
    constructor() {
        this.x = 100;
        this.y = 100;

        this.size = 30;

        this.bounciness = .7; // Affect the y velocity
        this.friction = .5; // Affect the x velocity

        this.velocityX = 0;
        this.velocityY = 0;

        this.strength = 1.2; // Strength is the multiplied factor of a throw
        this.isGrabbed = false;
    }

    get draw() {
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.fillStyle = "orange";
        ctx.arc(this.x, this.y, this.size, 0, 360);
        ctx.fill();
    }

    get update() {
        this.draw;

        this.x += this.velocityX;
        this.y += this.velocityY;

        if (this.isGrabbed) {}
        // Collisions with the edges and the bottom
        if (this.x + this.velocityX <= this.size ||
                this.x + this.velocityX >= refCanvas.width - this.size) {
            this.velocityX = Math.round(-this.velocityX * this.friction);
        }
        if (this.y + this.velocityY >= refCanvas.height - this.size) {
            this.velocityY = Math.round(-this.velocityY * this.bounciness);
        } else if (this.y + this.velocityY < refCanvas.height - this.size) {
            this.velocityY += gravity;
        }

        // Backboard left collision
        var distanceX = Math.abs(this.x - (backboard.x + backboard.width / 2));
        var distanceY = Math.abs(this.y - (backboard.y + backboard.height / 2));
        if (distanceX <= this.size && distanceY <= backboard.height / 2 + this.size) {
            this.velocityX = -this.velocityX * 0.6;
        }

        // Basket left collision
        distanceX = Math.abs(this.x - (backboard.basket.x + 8));
        distanceY = Math.abs(this.y - (backboard.basket.y + 8));
        if (distanceX <= this.size && distanceY <= 8 + this.size) {
            this.velocityX = -this.velocityX;
        }

        if (!this.isGrabbed) {
        // Check if the ball pass through the basket
        distanceX = Math.abs(this.x - (backboard.basket.x + 60));
        distanceY = Math.abs(this.y - (backboard.basket.y + 8));
        if (distanceX < this.size && distanceY < this.size) {
            score += 1;
            console.clear()
            console.log(`dist x: ${distanceX}, dist y: ${distanceY}`)
        }}
    }
}

class Backboard {
    constructor() {
        this.x = 900;
        this.y = 30;

        this.width = 15;
        this.height = 150;

        this.basket = {x: this.x - 120, y: this.y + 120};
    }

    get draw() {
        ctx.fillStyle = "white";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = "red";
        ctx.fillRect(this.basket.x, this.basket.y, 120, 16);
        ctx.fillStyle = "grey";
        ctx.fillRect(this.x + this.width, this.y + 50, 100, 50);
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(this.basket.x + 10, this.y + 136);
        ctx.lineTo(this.basket.x + 25, this.y + 210);
        ctx.lineTo(this.x - 25, this.y + 210);
        ctx.lineTo(this.x - 10, this.y + 136);
        ctx.fill();
    }

    get update() {
        this.draw;
    }
}


// FUNCTIONS
init();
startAnimating(framerate);

function init() {
    // Store all resetable variables here.
    ball = new Ball();
    backboard = new Backboard();

    frameCount = 0;
    score = 0;
}

function playPause() {
    isPaused = !isPaused; // Invert the state of the pause boolean.

    if (isPaused) {
        refPlayPauseButton.childNodes[0].textContent = "Play";
        refPauseMenu.style.display = "flex";
    } else if (!isPaused) {
        refPlayPauseButton.childNodes[0].textContent = "Pause";
        refPauseMenu.style.display = "none";
        startAnimating(framerate);
    }
}

function resetGame() {
    isPaused = true; // For starting unpaused (the pause function invert the bool).
    playPause();

    init();
}

function startAnimating(fps) {
    // The animation loop calculates time elapsed since the last loop
    // and only draws if your specified fps interval is achieved.
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    loop();
}

function loop() {
    requestAnimationFrame(loop);

    if (!isPaused) {
        // Calc elapsed time since last loop.
        now = Date.now();
        elapsed = now - then;

        // If enough time has elapsed, draw the next frame.
        if (elapsed > fpsInterval) {
            // Get ready for next frame by setting then=now, but also adjust for your
            // specified fpsInterval not being a multiple of RAF's interval (16.7ms).
            then = now - (elapsed % fpsInterval);
            frameCount++;
            
            // ctx.globalCompositeOperation = "destination-over"; // New shapes are drawn behind the existing canvas content.
            ctx.clearRect(0, 0, refCanvas.width, refCanvas.height); // Clean the canvas.

            // Update and draw here :
            ball.update;
            backboard.update;

            if (ball.isGrabbed) {
                ball.x = mouse.x;
                ball.y = mouse.y;
            }

            refScore.textContent = "Score: " + score;
            
        }
    }
}


// EVENTS LISTENERS
document.addEventListener("mousedown", () => {
    mouseDown = true;
    // Grab the ball
    const distanceX = ball.x - mouse.x;
    const distanceY = ball.y - mouse.y;
    // If "absolute" distance between ball and mouse is around ball center * 10, grab it
    if (distanceX * distanceX + distanceY * distanceY <= ball.size * ball.size * 10) {
        ball.isGrabbed = true;
        refCanvas.style.cursor = "grabbing";
    }
});

document.addEventListener("mousemove", function(e) {
    mouse.x = e.clientX - canvasBounds.x;
    mouse.y = e.clientY - canvasBounds.y;
});

document.addEventListener("mouseup", () => {
    mouseDown = false;

    if (ball.isGrabbed) {
        ball.isGrabbed = false;
        refCanvas.style.cursor = "grab";

        // Add velocity based on mouse movement
        ball.velocityY = 0;
        ball.velocityX = 0;

        var differenceX = mouse.x - ball.x;
        differenceX *= ball.strength;
        ball.velocityX += differenceX;

        var differenceY = mouse.y - ball.y;
        differenceY *= ball.strength;
        ball.velocityY += differenceY;

        // console.log(`vel x: ${ball.velocityX}, vel y: ${ball.velocityY}`)
    }
});

document.addEventListener("keydown", (e) => {
    switch (e.code) {
        case "Escape":
            playPause();
            break

        case "KeyR":
            resetGame();
            break
    }
});