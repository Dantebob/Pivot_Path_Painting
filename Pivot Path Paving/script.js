
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Fixed pivot for the first arrow
const pivot_1 = {
    //pivot at center of screen (0,0)
    x: canvas.width / 2,
    y: canvas.height / 2
};

// First arrow
const arrow_1 = {
    length: 100,
    angle: 0,
    CW: 0, // 0: Counter-Clockwise, 1: Clockwise
    speed: Math.PI / 2
    //speed is radians per second
};

// Moving pivot at the end of the first arrow
// Initial position of pivot_2
const pivot_2 = {
    x: pivot_1.x + arrow_1.length,
    y: pivot_1.y
};

// Second arrow
const arrow_2 = {
    length: 100,
    angle: 0,
    CW: 0, // 0: Counter-Clockwise, 1: Clockwise
    speed: Math.PI / 2
    //speed is radians per second
};  

// CONTROLS @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
const MIN_LENGTH = 10;
const MAX_LENGTH = 300;
const LENGTH_STEP = 10;

// Mouse wheel changes arrow_2 length
canvas.addEventListener("wheel", function(event) {
    event.preventDefault();

    if (event.deltaY < 0) {
        // Scroll up: increase length
        arrow_2.length += LENGTH_STEP;
    } else {
        // Scroll down: decrease length
        arrow_2.length -= LENGTH_STEP;
    }

    // Keep the length within limits
    arrow_2.length = Math.max(
        MIN_LENGTH,
        Math.min(MAX_LENGTH, arrow_2.length)
    );
}, { passive: false });

// Keyboard controls
document.addEventListener("keydown", function(event) {
    switch (event.key.toLowerCase()) {
        case "arrowup":
        case "w":
            arrow_1.CW = 0;
            break;

        case "arrowdown":
        case "s":
            arrow_1.CW = 1;
            break;

        case "arrowleft":
        case "a":
            arrow_2.CW = 0;
            break;

        case "arrowright":
        case "d":
            arrow_2.CW = 1;
            break;
    }
});
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

function updatePivot() {
    // Calculate the endpoint of arrow_1.
    // This endpoint is the new position of pivot_2.
    pivot_2.x = pivot_1.x
        + arrow_1.length * Math.cos(arrow_1.angle);

    pivot_2.y = pivot_1.y
        + arrow_1.length * Math.sin(arrow_1.angle);
}

function drawArrow(pivot, arrow, color) {
    const tipX = pivot.x
        + arrow.length * Math.cos(arrow.angle);

    const tipY = pivot.y
        + arrow.length * Math.sin(arrow.angle);

    // Draw the shaft
    ctx.beginPath();
    ctx.moveTo(pivot.x, pivot.y);
    ctx.lineTo(tipX, tipY);
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.stroke();

    // Draw the arrowhead
    const headLength = 18;
    const headAngle = Math.PI / 6;

    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(
        tipX - headLength * Math.cos(arrow.angle - headAngle),
        tipY - headLength * Math.sin(arrow.angle - headAngle)
    );
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(
        tipX - headLength * Math.cos(arrow.angle + headAngle),
        tipY - headLength * Math.sin(arrow.angle + headAngle)
    );
    ctx.stroke();

    // Draw the pivot
    ctx.beginPath();
    ctx.arc(pivot.x, pivot.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
}

let previousTime = 0;

function animate(time) {
    const delta_t = previousTime === 0
        ? 0
        : (time - previousTime) / 1000; // milliseconds o seconds

    previousTime = time;

    // Rotate both arrows
    if (arrow_1.CW === 0) {
        arrow_1.angle -= arrow_1.speed * delta_t;
    } else {
        arrow_1.angle += arrow_1.speed * delta_t;
    }
    if (arrow_2.CW === 0) {
        arrow_2.angle -= arrow_2.speed * delta_t;
    } else {
        arrow_2.angle += arrow_2.speed * delta_t;
    }

    // Update the moving pivot after rotating arrow_1
    updatePivot();

    // Clear and redraw
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawArrow(pivot_1, arrow_1, "#00e5ff");
    drawArrow(pivot_2, arrow_2, "#ffaa55");

    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
