"use strict";
import { elementUpdates } from "./elementBehaviors.js";

// Canvas and simulation state.
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

export let cellSize = 3;
export let grid = [];
export let variantGrid = [];
export let velocityGrid = [];
export let temperatureGrid = [];
export let gridWidth = Math.floor(window.innerWidth / cellSize);
export let gridHeight = Math.floor(window.innerHeight / cellSize);

export let isPaused = false;
export let updatesPerFrame = 2;
export let wind = 0;
export let brushRadius = 3;
let _currentElement = 1;
export function getCurrentElement() {
  return _currentElement;
}
export function setCurrentElement(val) {
  _currentElement = val;
}

export function setBrushRadius(radius) {
  brushRadius = radius;
}

// Enhanced color palette with gradients and lighting effects
export const colors = {
  1: "#E6D7B8",  // Sand - warmer
  2: "#4A90E2",  // Water - more vibrant blue
  3: "#2C1810",  // Oil - darker brown
  4: "#FF4500",  // Fire - orange-red
  5: "#A0A0A0",  // Smoke - lighter gray
  6: "#00FF7F",  // Acid - bright green
  7: "#FF6347",  // Lava - tomato red
  8: "#C0C0C0",  // Metal - silver
  9: "#696969",  // Stone - dim gray
  10: "#8B4513", // Wood - saddle brown
  11: "#B0E0E6", // Ice - powder blue
  12: "#228B22", // Plant - forest green
  13: "#9370DB", // Virus - medium purple
  14: "#FFD700", // Electricity - gold
  15: "#FF1493", // Plasma - deep pink
  16: "#DC143C", // Bomb - crimson
  17: "#87CEEB", // Glass - sky blue
  18: "#A0522D", // Mud - sienna
  19: "#F0F8FF", // Snow - alice blue
  20: "#F5F5DC", // Steam - beige
  21: "#CD853F", // Clay - peru
  22: "#191970", // Rubber - midnight blue
  23: "#00CED1", // Glass Shard - dark turquoise
  24: "#FFD700", // Nitro - gold
  25: "#ADFF2F", // Slime - green yellow
  26: "#2F4F4F", // Carbon - dark slate gray
  27: "#4169E1"  // Magnet - royal blue
};

export const elementNames = {
  1: "Sand", 2: "Water", 3: "Oil", 4: "Fire", 5: "Smoke",
  6: "Acid", 7: "Lava", 8: "Metal", 9: "Stone", 10: "Wood",
  11: "Ice", 12: "Plant", 13: "Virus", 14: "Electricity",
  15: "Plasma", 16: "Bomb", 17: "Glass", 18: "Mud", 19: "Snow",
  20: "Steam", 21: "Clay", 22: "Rubber", 23: "Shard", 24: "Nitro",
  25: "Slime", 26: "Carbon", 27: "Magnet"
};

// Enhanced color variation with better lighting
export function getRandomVariantColor(type) {
  const base = colors[type];
  if (!base) return "#000000";
  
  const r = parseInt(base.slice(1, 3), 16);
  const g = parseInt(base.slice(3, 5), 16);
  const b = parseInt(base.slice(5, 7), 16);
  
  // Different variation amounts for different elements
  let variation = 20;
  if ([4, 7, 15].includes(type)) variation = 40; // Fire-like elements get more variation
  if ([2, 3, 6].includes(type)) variation = 15; // Liquids get less variation
  if ([8, 9].includes(type)) variation = 10; // Metals/stones get minimal variation
  
  const brightness = (Math.random() - 0.5) * 30;
  const vr = Math.max(0, Math.min(255, r + (Math.random() * 2 * variation - variation) + brightness));
  const vg = Math.max(0, Math.min(255, g + (Math.random() * 2 * variation - variation) + brightness));
  const vb = Math.max(0, Math.min(255, b + (Math.random() * 2 * variation - variation) + brightness));
  
  function toHex(c) {
    let hex = Math.floor(c).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }
  return "#" + toHex(vr) + toHex(vg) + toHex(vb);
}

export function setCell(x, y, newType) {
  if (x < 0 || x >= gridWidth || y < 0 || y >= gridHeight) return;
  grid[y][x] = newType;
  variantGrid[y][x] = newType === 0 ? null : getRandomVariantColor(newType);
  if (velocityGrid[y]) {
    velocityGrid[y][x] = { vx: 0, vy: 0 };
  }
  if (temperatureGrid[y]) {
    temperatureGrid[y][x] = getBaseTemperature(newType);
  }
}

function getBaseTemperature(type) {
  const temps = {
    4: 800, 7: 1000, 15: 1200, // Hot elements
    2: 20, 11: -10, 19: -5,    // Cold elements
    0: 20  // Default room temperature
  };
  return temps[type] || 20;
}

export function swap(x1, y1, x2, y2) {
  if (x1 < 0 || x1 >= gridWidth || y1 < 0 || y1 >= gridHeight ||
      x2 < 0 || x2 >= gridWidth || y2 < 0 || y2 >= gridHeight) return;
      
  const temp = grid[y1][x1];
  grid[y1][x1] = grid[y2][x2];
  grid[y2][x2] = temp;
  
  const tempColor = variantGrid[y1][x1];
  variantGrid[y1][x1] = variantGrid[y2][x2];
  variantGrid[y2][x2] = tempColor;
  
  if (velocityGrid[y1] && velocityGrid[y2]) {
    const tempVel = velocityGrid[y1][x1];
    velocityGrid[y1][x1] = velocityGrid[y2][x2];
    velocityGrid[y2][x2] = tempVel;
  }
  
  if (temperatureGrid[y1] && temperatureGrid[y2]) {
    const tempTemp = temperatureGrid[y1][x1];
    temperatureGrid[y1][x1] = temperatureGrid[y2][x2];
    temperatureGrid[y2][x2] = tempTemp;
  }
}

export function initGrid() {
  grid = [];
  variantGrid = [];
  velocityGrid = [];
  temperatureGrid = [];
  for (let y = 0; y < gridHeight; y++) {
    grid[y] = new Array(gridWidth).fill(0);
    variantGrid[y] = new Array(gridWidth).fill(null);
    velocityGrid[y] = new Array(gridWidth).fill(null).map(() => ({ vx: 0, vy: 0 }));
    temperatureGrid[y] = new Array(gridWidth).fill(20);
  }
}

// Smooth mouse tracking
let mouseTrail = [];
let smoothMouseX = 0;
let smoothMouseY = 0;

function handleTouchStart(evt) {
  evt.preventDefault();
  const touch = evt.touches[0];
  const rect = canvas.getBoundingClientRect();
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;
  smoothMouseX = x;
  smoothMouseY = y;
  isMouseDown = true;
  addElementSmooth(x, y);
}

function handleTouchMove(evt) {
  evt.preventDefault();
  if (isMouseDown) {
    const touch = evt.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // Smooth interpolation
    smoothMouseX = smoothMouseX * 0.7 + x * 0.3;
    smoothMouseY = smoothMouseY * 0.7 + y * 0.3;
    
    addElementSmooth(smoothMouseX, smoothMouseY);
  }
}

function handleTouchEnd(evt) {
  evt.preventDefault();
  isMouseDown = false;
  mouseTrail = [];
}

canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });

export function updateCellSize() {
  const baseSize = window.innerWidth < 768 ? 2 : 3;
  cellSize = Math.max(2, Math.min(4, baseSize));
  setupCanvas();
}

function setupCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.scale(dpr, dpr);
  
  gridWidth = Math.floor(window.innerWidth / cellSize);
  gridHeight = Math.floor(window.innerHeight / cellSize);
  initGrid();
}

updateCellSize();
window.addEventListener('resize', updateCellSize);

let isMouseDown = false;

function getMousePos(evt) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

canvas.addEventListener('mousedown', (evt) => {
  isMouseDown = true;
  const pos = getMousePos(evt);
  smoothMouseX = pos.x;
  smoothMouseY = pos.y;
  addElementSmooth(pos.x, pos.y);
});

canvas.addEventListener('mousemove', (evt) => {
  if (isMouseDown) {
    const pos = getMousePos(evt);
    smoothMouseX = smoothMouseX * 0.7 + pos.x * 0.3;
    smoothMouseY = smoothMouseY * 0.7 + pos.y * 0.3;
    addElementSmooth(smoothMouseX, smoothMouseY);
  }
});

canvas.addEventListener('mouseup', () => {
  isMouseDown = false;
  mouseTrail = [];
});

canvas.addEventListener('mouseleave', () => {
  isMouseDown = false;
  mouseTrail = [];
});

// Enhanced element placement with smooth distribution
function addElementSmooth(mouseX, mouseY) {
  const currentElement = getCurrentElement();
  const gridX = Math.floor(mouseX / cellSize);
  const gridY = Math.floor(mouseY / cellSize);
  
  // Add to trail for smooth painting
  mouseTrail.push({ x: mouseX, y: mouseY });
  if (mouseTrail.length > 5) mouseTrail.shift();
  
  // Paint along the trail for smoother lines
  for (let i = 0; i < mouseTrail.length; i++) {
    const trailX = Math.floor(mouseTrail[i].x / cellSize);
    const trailY = Math.floor(mouseTrail[i].y / cellSize);
    const intensity = (i + 1) / mouseTrail.length;
    
    for (let dy = -brushRadius; dy <= brushRadius; dy++) {
      for (let dx = -brushRadius; dx <= brushRadius; dx++) {
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= brushRadius * intensity) {
          const x = trailX + dx;
          const y = trailY + dy;
          if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
            // Probability-based placement for more natural edges
            const probability = 1 - (distance / (brushRadius * intensity));
            if (Math.random() < probability) {
              setCell(x, y, currentElement);
            }
          }
        }
      }
    }
  }
}

export function addElementAt(gridX, gridY) {
  addElementSmooth(gridX * cellSize, gridY * cellSize);
}

export function updateCell(x, y) {
  const type = grid[y][x];
  if (type === 0) return;
  if (elementUpdates[type]) {
    elementUpdates[type](x, y);
  }
}

export function applyWindEffect() {
  if (wind === 0) return;
  const direction = Math.sign(wind);
  for (let y = 0; y < gridHeight; y++) {
    if (direction > 0) {
      for (let x = gridWidth - 1; x >= 0; x--) {
        if ([1,2,3,5,6,7,19,20].includes(grid[y][x])) {
          const targetX = x + direction;
          if (targetX >= 0 && targetX < gridWidth && grid[y][targetX] === 0) {
            if (Math.random() < Math.abs(wind) * 2.5) {
              swap(x, y, targetX, y);
            }
          }
        }
      }
    } else {
      for (let x = 0; x < gridWidth; x++) {
        if ([1,2,3,5,6,7,19,20].includes(grid[y][x])) {
          const targetX = x + direction;
          if (targetX >= 0 && targetX < gridWidth && grid[y][targetX] === 0) {
            if (Math.random() < Math.abs(wind) * 2.5) {
              swap(x, y, targetX, y);
            }
          }
        }
      }
    }
  }
}

export function clearGrid() {
  for (let y = 0; y < gridHeight; y++) {
    grid[y].fill(0);
    variantGrid[y].fill(null);
    if (velocityGrid[y]) velocityGrid[y].fill({ vx: 0, vy: 0 });
    if (temperatureGrid[y]) temperatureGrid[y].fill(20);
  }
}

// Enhanced rendering with lighting effects
export function draw() {
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw background grid subtly
  if (cellSize >= 3) {
    ctx.strokeStyle = 'rgba(20, 20, 20, 0.3)';
    ctx.lineWidth = 0.1;
    for (let x = 0; x < gridWidth * cellSize; x += cellSize * 10) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, gridHeight * cellSize);
      ctx.stroke();
    }
    for (let y = 0; y < gridHeight * cellSize; y += cellSize * 10) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(gridWidth * cellSize, y);
      ctx.stroke();
    }
  }
  
  // Draw elements with enhanced rendering
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const cell = grid[y][x];
      if (cell !== 0) {
        const baseColor = variantGrid[y][x] || colors[cell] || '#000';
        
        // Add lighting effects for certain elements
        if ([4, 7, 15].includes(cell)) {
          // Glowing effect for hot elements
          const glowSize = cellSize + 1;
          const gradient = ctx.createRadialGradient(
            x * cellSize + cellSize/2, y * cellSize + cellSize/2, 0,
            x * cellSize + cellSize/2, y * cellSize + cellSize/2, glowSize
          );
          gradient.addColorStop(0, baseColor);
          gradient.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = gradient;
          ctx.fillRect(x * cellSize - 1, y * cellSize - 1, glowSize, glowSize);
        } else if ([2, 3, 6].includes(cell)) {
          // Subtle shine for liquids
          ctx.fillStyle = baseColor;
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
          if (y > 0 && grid[y-1][x] === 0) {
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, 1);
          }
        } else {
          ctx.fillStyle = baseColor;
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }
  }
  
  // Draw brush preview
  if (isMouseDown && smoothMouseX !== undefined && smoothMouseY !== undefined) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(smoothMouseX, smoothMouseY, brushRadius * cellSize, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  if (isPaused) {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "48px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
  }
}

export function startSimulation() {
  let frameCount = 0;
  let lastTime = performance.now();
  
  function update() {
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTime;
    
    if (!isPaused) {
      for (let i = 0; i < updatesPerFrame; i++) {
        // Alternating update patterns for more natural behavior
        if ((frameCount % 3) === 0) {
          for (let y = gridHeight - 1; y >= 0; y--) {
            for (let x = 0; x < gridWidth; x++) {
              updateCell(x, y);
            }
          }
        } else if ((frameCount % 3) === 1) {
          for (let y = gridHeight - 1; y >= 0; y--) {
            for (let x = gridWidth - 1; x >= 0; x--) {
              updateCell(x, y);
            }
          }
        } else {
          // Random order update for some elements to prevent artifacts
          const shuffledCells = [];
          for (let y = 0; y < gridHeight; y++) {
            for (let x = 0; x < gridWidth; x++) {
              if (grid[y][x] !== 0) shuffledCells.push({x, y});
            }
          }
          shuffledCells.sort(() => Math.random() - 0.5);
          for (let i = 0; i < Math.min(shuffledCells.length, 1000); i++) {
            const {x, y} = shuffledCells[i];
            updateCell(x, y);
          }
        }
        
        frameCount++;
        applyWindEffect();
      }
    }
    
    draw();
    lastTime = currentTime;
    requestAnimationFrame(update);
  }
  
  update();
}