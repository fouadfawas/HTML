// Constants
let G = 9.81; // Acceleration due to gravity (now variable)
let L = 100; // Length of each pendulum segment (now variable)
let M = 10; // Mass of each bob (now variable)
const R = 10; // Radius of bobs (pixels)
let DT = 0.002; // Time step for simulation (seconds) - now variable
const BASE_DT = 0.002; // Base time step
const ORIGIN_Y_OFFSET = 100; // Offset from top for pivot point

// Simulation speed multiplier
let SIMULATION_STEPS_PER_FRAME = 500;

// Trail settings
let MAX_TRAIL_LENGTH = 1000; // Now variable
const TRAIL_COLORS = ['#ff0000', '#0000ff', '#00ff00', '#ffff00', '#ff00ff', '#00ffff', '#ff8000', '#8000ff', '#0080ff', '#80ff00'];
const TRAIL_WIDTH = 1;
const TRAIL_FALL_RATE = 0.1;
const MAX_TRAIL_FALL = 50;

// Damping factor
let DAMPING = 0; // Air resistance/damping factor

// Canvas setup
const canvas = document.getElementById('pendulumCanvas');
const ctx = canvas.getContext('2d');
let width, height;

// Dynamic pendulum system
let N = 3; // Number of pendulums (default)
let thetas = []; // Array of angles
let omegas = []; // Array of angular velocities
let trails = []; // Array of trail arrays

// Camera controls
let cameraX = 0;
let cameraY = 0;
let cameraZoom = 1;
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;

// UI Controls
const pendulumCountSlider = document.getElementById('pendulumCount');
const countDisplay = document.getElementById('countDisplay');
const countInput = document.getElementById('countInput');
const speedSlider = document.getElementById('speedSlider');
const speedDisplay = document.getElementById('speedDisplay');
const speedInput = document.getElementById('speedInput');
const gravitySlider = document.getElementById('gravitySlider');
const gravityDisplay = document.getElementById('gravityDisplay');
const gravityInput = document.getElementById('gravityInput');
const lengthSlider = document.getElementById('lengthSlider');
const lengthDisplay = document.getElementById('lengthDisplay');
const lengthInput = document.getElementById('lengthInput');
const massSlider = document.getElementById('massSlider');
const massDisplay = document.getElementById('massDisplay');
const massInput = document.getElementById('massInput');
const dampingSlider = document.getElementById('dampingSlider');
const dampingDisplay = document.getElementById('dampingDisplay');
const dampingInput = document.getElementById('dampingInput');
const trailLengthSlider = document.getElementById('trailLengthSlider');
const trailLengthDisplay = document.getElementById('trailLengthDisplay');
const trailLengthInput = document.getElementById('trailLengthInput');
const resetBtn = document.getElementById('resetBtn');
const randomizeBtn = document.getElementById('randomizeBtn');
const resetDefaultsBtn = document.getElementById('resetDefaultsBtn');
const toggleControlsBtn = document.getElementById('toggleControls');
const controlsContent = document.getElementById('controlsContent');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');

let controlsVisible = true;

pendulumCountSlider.addEventListener('input', (e) => {
    N = parseInt(e.target.value);
    countDisplay.textContent = N;
    countInput.value = N;
    resetSimulation();
});

countInput.addEventListener('input', (e) => {
    const value = Math.max(1, parseInt(e.target.value) || 1);
    N = value;
    countDisplay.textContent = N;
    pendulumCountSlider.value = Math.min(Math.max(value, 1), 10);
    resetSimulation();
});

speedSlider.addEventListener('input', (e) => {
    SIMULATION_STEPS_PER_FRAME = parseInt(e.target.value);
    speedDisplay.textContent = SIMULATION_STEPS_PER_FRAME;
    speedInput.value = SIMULATION_STEPS_PER_FRAME;
});

speedInput.addEventListener('input', (e) => {
    const value = Math.max(1, parseInt(e.target.value) || 1);
    SIMULATION_STEPS_PER_FRAME = value;
    speedDisplay.textContent = SIMULATION_STEPS_PER_FRAME;
    speedSlider.value = Math.min(Math.max(value, 1), 1000);
});

gravitySlider.addEventListener('input', (e) => {
    G = parseFloat(e.target.value);
    gravityDisplay.textContent = G.toFixed(1);
    gravityInput.value = G;
});

gravityInput.addEventListener('input', (e) => {
    const value = Math.max(0, parseFloat(e.target.value) || 0);
    G = value;
    gravityDisplay.textContent = G.toFixed(1);
    gravitySlider.value = Math.min(Math.max(value, 1), 50);
});

lengthSlider.addEventListener('input', (e) => {
    L = parseInt(e.target.value);
    lengthDisplay.textContent = L;
    lengthInput.value = L;
});

lengthInput.addEventListener('input', (e) => {
    const value = Math.max(1, parseInt(e.target.value) || 1);
    L = value;
    lengthDisplay.textContent = L;
    lengthSlider.value = Math.min(Math.max(value, 50), 200);
});

massSlider.addEventListener('input', (e) => {
    M = parseInt(e.target.value);
    massDisplay.textContent = M;
    massInput.value = M;
});

massInput.addEventListener('input', (e) => {
    const value = Math.max(0.1, parseFloat(e.target.value) || 0.1);
    M = value;
    massDisplay.textContent = M;
    massSlider.value = Math.min(Math.max(value, 1), 50);
});

dampingSlider.addEventListener('input', (e) => {
    DAMPING = parseFloat(e.target.value) / 1000; // Convert to small decimal
    dampingDisplay.textContent = e.target.value;
    dampingInput.value = e.target.value;
});

dampingInput.addEventListener('input', (e) => {
    const value = Math.max(0, parseInt(e.target.value) || 0);
    DAMPING = value / 1000;
    dampingDisplay.textContent = value;
    dampingSlider.value = Math.min(Math.max(value, 0), 10);
});

trailLengthSlider.addEventListener('input', (e) => {
    MAX_TRAIL_LENGTH = parseInt(e.target.value);
    trailLengthDisplay.textContent = MAX_TRAIL_LENGTH;
    trailLengthInput.value = MAX_TRAIL_LENGTH;
});

trailLengthInput.addEventListener('input', (e) => {
    const value = Math.max(0, parseInt(e.target.value) || 0);
    MAX_TRAIL_LENGTH = value;
    trailLengthDisplay.textContent = MAX_TRAIL_LENGTH;
    trailLengthSlider.value = Math.min(Math.max(value, 0), 5000);
});

resetBtn.addEventListener('click', resetSimulation);

randomizeBtn.addEventListener('click', () => {
    // Randomize initial angles
    for (let i = 0; i < N; i++) {
        thetas[i] = Math.random() * Math.PI * 2;
        omegas[i] = (Math.random() - 0.5) * 0.2; // Reduced from 2 to 0.2 for gentler initial velocity
    }
    // Clear trails
    trails = [];
    for (let i = 0; i < N; i++) {
        trails[i] = [];
    }
});

resetDefaultsBtn.addEventListener('click', () => {
    // Reset all values to defaults
    N = 3;
    SIMULATION_STEPS_PER_FRAME = 500;
    G = 10;
    L = 100;
    M = 10;
    DAMPING = 0;
    MAX_TRAIL_LENGTH = 1000;
    
    // Update all UI elements
    pendulumCountSlider.value = 3;
    countDisplay.textContent = 3;
    countInput.value = 3;
    
    speedSlider.value = 500;
    speedDisplay.textContent = 500;
    speedInput.value = 500;
    
    gravitySlider.value = 10;
    gravityDisplay.textContent = "10.0";
    gravityInput.value = 10;
    
    lengthSlider.value = 100;
    lengthDisplay.textContent = 100;
    lengthInput.value = 100;
    
    massSlider.value = 10;
    massDisplay.textContent = 10;
    massInput.value = 10;
    
    dampingSlider.value = 0;
    dampingDisplay.textContent = 0;
    dampingInput.value = 0;
    
    trailLengthSlider.value = 1000;
    trailLengthDisplay.textContent = 1000;
    trailLengthInput.value = 1000;
    
    // Reset camera
    cameraX = 0;
    cameraY = 0;
    cameraZoom = 1;
    
    // Reset simulation
    resetSimulation();
});

toggleControlsBtn.addEventListener('click', () => {
    controlsVisible = !controlsVisible;
    controlsContent.style.display = controlsVisible ? 'block' : 'none';
    toggleControlsBtn.textContent = controlsVisible ? 'Hide Controls' : 'Show Controls';
});

zoomInBtn.addEventListener('click', () => {
    cameraZoom *= 1.2;
    cameraZoom = Math.min(10, cameraZoom);
});

zoomOutBtn.addEventListener('click', () => {
    cameraZoom *= 0.8;
    cameraZoom = Math.max(0.1, cameraZoom);
});

// Camera controls
canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const deltaX = e.clientX - lastMouseX;
        const deltaY = e.clientY - lastMouseY;
        cameraX += deltaX / cameraZoom;
        cameraY += deltaY / cameraZoom;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

canvas.addEventListener('mouseleave', () => {
    isDragging = false;
});

canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    cameraZoom *= zoomFactor;
    cameraZoom = Math.max(0.1, Math.min(10, cameraZoom)); // Clamp zoom between 0.1x and 10x
});

// Touch controls for mobile
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (e.touches.length === 1) {
        isDragging = true;
        lastMouseX = e.touches[0].clientX;
        lastMouseY = e.touches[0].clientY;
    }
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - lastMouseX;
        const deltaY = e.touches[0].clientY - lastMouseY;
        cameraX += deltaX / cameraZoom;
        cameraY += deltaY / cameraZoom;
        lastMouseX = e.touches[0].clientX;
        lastMouseY = e.touches[0].clientY;
    }
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    isDragging = false;
});

// Set canvas size and handle resize
function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    // Reset simulation on resize to avoid issues with scaling
    resetSimulation();
}

function resetSimulation() {
    // Initialize arrays for N pendulums
    thetas = [];
    omegas = [];
    trails = [];
    
    // Adjust physics time step based on pendulum count for performance
    if (N > 12) {
        DT = BASE_DT * (1 + (N - 12) * 0.2); // Increase DT for more pendulums
    } else {
        DT = BASE_DT;
    }
    
    for (let i = 0; i < N; i++) {
        thetas[i] = Math.PI / 2 + 0.1 * (i + 1);
        omegas[i] = 0;
        trails[i] = [];
    }
}

// Update the pendulum state using generalized equations for N pendulums
function update() {
    const g = G / 100; // Scale gravity for pixel units
    const l = L; // All segments have same length
    const m = M; // All masses are equal
    
    // Build mass matrix M and force vector F for N-pendulum system
    const massMatrix = [];
    const forces = [];
    
    for (let i = 0; i < N; i++) {
        massMatrix[i] = [];
        for (let j = 0; j < N; j++) {
            if (i <= j) {
                // Upper triangle and diagonal
                massMatrix[i][j] = (N - j) * m * l * l * Math.cos(thetas[i] - thetas[j]);
            } else {
                // Lower triangle (symmetric)
                massMatrix[i][j] = massMatrix[j][i];
            }
        }
    }
    
    // Calculate force vector (Coriolis + gravity terms)
    for (let i = 0; i < N; i++) {
        let force = 0;
        
        // Coriolis terms
        for (let j = 0; j < N; j++) {
            if (j !== i) {
                force -= (N - Math.max(i, j)) * m * l * l * omegas[j] * omegas[j] * Math.sin(thetas[i] - thetas[j]);
            }
        }
        
        // Gravity term
        force -= (N - i) * m * g * l * Math.sin(thetas[i]);
        
        // Damping term
        force -= DAMPING * (N - i) * m * l * l * omegas[i];
        
        forces[i] = force;
    }
    
    // Solve linear system using Gaussian elimination
    const alphas = solveLinearSystem(massMatrix, forces);
    
    if (alphas) {
        // Update velocities and angles
        for (let i = 0; i < N; i++) {
            omegas[i] += alphas[i] * DT;
            thetas[i] += omegas[i] * DT;
        }
    }
}

// Gaussian elimination solver for linear system Ax = b
function solveLinearSystem(A, b) {
    const n = A.length;
    const augmented = A.map((row, i) => [...row, b[i]]);
    
    // Forward elimination
    for (let i = 0; i < n; i++) {
        // Find pivot
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
                maxRow = k;
            }
        }
        
        // Swap rows
        [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
        
        // Check for singular matrix
        if (Math.abs(augmented[i][i]) < 1e-10) {
            return null;
        }
        
        // Eliminate
        for (let k = i + 1; k < n; k++) {
            const factor = augmented[k][i] / augmented[i][i];
            for (let j = i; j <= n; j++) {
                augmented[k][j] -= factor * augmented[i][j];
            }
        }
    }
    
    // Back substitution
    const x = new Array(n);
    for (let i = n - 1; i >= 0; i--) {
        x[i] = augmented[i][n];
        for (let j = i + 1; j < n; j++) {
            x[i] -= augmented[i][j] * x[j];
        }
        x[i] /= augmented[i][i];
    }
    
    return x;
}

// Function to draw the pendulum
function draw() {
    // Clear the entire canvas
    ctx.clearRect(0, 0, width, height);

    // Draw solid background
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, width, height);

    // Apply camera transformations
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(cameraZoom, cameraZoom);
    ctx.translate(-width / 2 + cameraX, -height / 2 + cameraY);

    const originX = width / 2;
    const originY = ORIGIN_Y_OFFSET;

    // Calculate all bob positions
    const positions = [{x: originX, y: originY}];
    for (let i = 0; i < N; i++) {
        const prevPos = positions[i];
        const x = prevPos.x + L * Math.sin(thetas[i]);
        const y = prevPos.y + L * Math.cos(thetas[i]);
        positions.push({x, y});
        
        // Store position in trail
        trails[i].push({x, y});
        while (trails[i].length > MAX_TRAIL_LENGTH) {
            trails[i].shift();
        }
    }

    // Draw trails
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineWidth = TRAIL_WIDTH;
    ctx.globalAlpha = 1.0;

    for (let i = 0; i < N; i++) {
        drawTrail(trails[i], TRAIL_COLORS[i % TRAIL_COLORS.length]);
    }

    // Reset rendering settings
    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = 'source-over';

    // Draw pivot
    ctx.beginPath();
    ctx.arc(originX, originY, R / 2, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Draw rods first (so they appear behind bobs)
    for (let i = 0; i < N; i++) {
        const startPos = positions[i];
        const endPos = positions[i + 1];
        
        // Draw rod
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(endPos.x, endPos.y);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // Draw bobs second (so they appear on top of rods)
    for (let i = 0; i < N; i++) {
        const endPos = positions[i + 1];
        
        // Draw bob
        ctx.beginPath();
        ctx.arc(endPos.x, endPos.y, R, 0, 2 * Math.PI);
        ctx.fillStyle = TRAIL_COLORS[i % TRAIL_COLORS.length];
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

function drawTrail(trail, color) {
    if (trail.length < 2) return;

    ctx.strokeStyle = color;

    for (let i = 1; i < trail.length; i++) {
        ctx.beginPath();
        ctx.moveTo(trail[i-1].x, trail[i-1].y);
        ctx.lineTo(trail[i].x, trail[i].y);
        ctx.stroke();
    }
}

// Animation loop
function animate() {
    // Calculate adjusted steps based on pendulum count to maintain consistent speed
    let adjustedSteps = SIMULATION_STEPS_PER_FRAME;
    if (N > 12) {
        // Reduce steps proportionally to compensate for increased DT
        adjustedSteps = Math.max(1, Math.floor(SIMULATION_STEPS_PER_FRAME / (1 + (N - 12) * 0.2)));
    }
    
    // Update simulation multiple times per frame for faster visual speed
    for (let i = 0; i < adjustedSteps; i++) {
        update();
    }
    draw();
    
    // Restore canvas transform
    ctx.restore();
    
    requestAnimationFrame(animate);
}

// Initial setup and start animation
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Set initial canvas size and reset simulation
animate();