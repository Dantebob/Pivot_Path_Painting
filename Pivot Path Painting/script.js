
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let paused = false;

 // Trail settings
const trailCanvas = document.createElement("canvas");
trailCanvas.width = canvas.width;
trailCanvas.height = canvas.height;

const trailCtx = trailCanvas.getContext("2d");

const trailColor = "#ff4fd8";
const trailWidth = 8;

// Clear the trail after this many full rotations of arrow_1
let Rotations_til_refresh = 3
const trailLifetime = () =>
    Rotations_til_refresh * 2 * Math.PI / Math.abs(arrow_1.speed);

const trailSegments = [];
let previousTip = null;

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

/* ARROW SPEED AND TRAIL CONTROLS */ //@@@@@@@@@@@@@@@@@@@@@@@@@@@@
const speedPanel = document.getElementById("speedPanel");

function createSlider(name, min, max, step, initialValue, onChange) {
    const container = document.createElement("div");
    container.className = "speed-control";

    const label = document.createElement("label");
    const valueDisplay = document.createElement("span");

    valueDisplay.textContent =
        step < 1 ? initialValue.toFixed(2) : initialValue;

    label.textContent = name + ": ";
    label.appendChild(valueDisplay);

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = min;
    slider.max = max;
    slider.step = step;
    slider.value = initialValue;

    slider.addEventListener("input", () => {
        const value = Number(slider.value);

        valueDisplay.textContent =
            step < 1 ? value.toFixed(2) : value;

        onChange(value);
    });

    container.appendChild(label);
    container.appendChild(slider);
    speedPanel.appendChild(container);
}

createSlider("Arrow 1 speed (rad/s)", 0, 5, 0.01,
    arrow_1.speed, value => {
        arrow_1.speed = value;
    }
);

createSlider("Arrow 2 speed (rad/s)", 0, 5, 0.01,
    arrow_2.speed, value => {
        arrow_2.speed = value;
    }
);

createSlider("Trail refresh (rotations)", 1, 10, 1,
    Rotations_til_refresh, value => {
        Rotations_til_refresh = value;
    }
);

// CONTROLS @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
const MIN_LENGTH = 10;
const MAX_LENGTH = 300;
const LENGTH_STEP = 5;

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
        
        case "p":
            paused = !paused;
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

// Draw pause symbol
function drawPauseSymbol() {
    const barWidth = 6;
    const barHeight = 20;
    const gap = 5;
    const margin = 15;

    const x = canvas.width - margin - (barWidth * 2 + gap);
    const y = margin;

    ctx.fillStyle = "white";

    // Left vertical bar
    ctx.fillRect(x, y, barWidth, barHeight);

    // Right vertical bar
    ctx.fillRect(x + barWidth + gap, y, barWidth, barHeight);
}

function drawTrail(time) {
    const tipX = pivot_2.x
        + arrow_2.length * Math.cos(arrow_2.angle);

    const tipY = pivot_2.y
        + arrow_2.length * Math.sin(arrow_2.angle);

    if (previousTip !== null) {
        trailSegments.push({
            x1: previousTip.x,
            y1: previousTip.y,
            x2: tipX,
            y2: tipY,
            time: time
        });
    }

    previousTip = { x: tipX, y: tipY };

    // Remove segments older than one rotation
    const cutoff = time - trailLifetime() * 1000;

    while (
        trailSegments.length > 0 &&
        trailSegments[0].time < cutoff
    ) {
        trailSegments.shift();
    }

    // Redraw all remaining trail segments
    trailCtx.clearRect(
        0, 0, trailCanvas.width, trailCanvas.height
    );

    trailCtx.beginPath();

    for (const segment of trailSegments) {
        trailCtx.moveTo(segment.x1, segment.y1);
        trailCtx.lineTo(segment.x2, segment.y2);
    }

    trailCtx.strokeStyle = trailColor;
    trailCtx.lineWidth = trailWidth;
    trailCtx.lineCap = "round";
    trailCtx.lineJoin = "round";
    trailCtx.stroke();
}

let previousTime = 0;

function animate(time) {
    const delta_t = previousTime === 0
        ? 0
        : (time - previousTime) / 1000; // milliseconds o seconds

    previousTime = time;

    // Show the pause symbol only while paused
    if (paused) {
        requestAnimationFrame(animate);
        drawPauseSymbol();
        return;
    }
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

    // Paint the trail before drawing the arrows
    drawTrail(time);

    // Clear the main canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the persistent trail
    ctx.drawImage(trailCanvas, 0, 0);

    drawArrow(pivot_1, arrow_1, "#00e5ff");
    drawArrow(pivot_2, arrow_2, "#ffaa55");

    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
