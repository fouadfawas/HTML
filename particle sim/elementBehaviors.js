"use strict";
import { grid, gridHeight, gridWidth, swap, setCell, colors, getRandomVariantColor } from "./simulation.js";

// Enhanced helper function for sand to glass conversion with better thickness
function convertSandToThickGlass(x, y) {
  if (x < 0 || x >= gridWidth || y < 0 || y >= gridHeight) return;
  
  const convertRadius = 2; // Larger radius for thicker glass formation
  const converted = new Set();
  
  function convertRecursive(cx, cy, depth) {
    if (depth <= 0 || cx < 0 || cx >= gridWidth || cy < 0 || cy >= gridHeight) return;
    if (converted.has(`${cx},${cy}`)) return;
    if (grid[cy][cx] !== 1) return; // Only convert sand
    
    setCell(cx, cy, 17); // Convert to glass
    converted.add(`${cx},${cy}`);
    
    // Convert neighbors with decreasing probability based on depth
    const neighbors = [
      [cx, cy + 1], [cx - 1, cy + 1], [cx + 1, cy + 1], // Below and diagonally below
      [cx - 1, cy], [cx + 1, cy] // Sides
    ];
    
    for (let [nx, ny] of neighbors) {
      if (Math.random() < 0.7 - (depth * 0.2)) {
        convertRecursive(nx, ny, depth - 1);
      }
    }
  }
  
  convertRecursive(x, y, convertRadius);
}

// Enhanced Sand behavior with better physics
function updateSand(x, y) {
  if (grid[y][x] !== 1) return;
  
  const newY = y + 1;
  if (newY < gridHeight) {
    const below = grid[newY][x];
    if (below === 0 || below === 2 || below === 3) {
      swap(x, y, x, newY);
      return;
    }
    
    // Enhanced diagonal movement with momentum
    let directions = [-1, 1];
    if (Math.random() < 0.5) directions.reverse();
    
    for (let d of directions) {
      const newX = x + d;
      if (newX >= 0 && newX < gridWidth && newY < gridHeight) {
        const diag = grid[newY][newX];
        if (diag === 0 || diag === 2 || diag === 3) {
          swap(x, y, newX, newY);
          return;
        }
      }
    }
  }
}

// Enhanced Water with better flow dynamics
function updateWater(x, y) {
  if (grid[y][x] !== 2) return;
  
  let newY = y + 1;
  if (newY < gridHeight) {
    const below = grid[newY][x];
    if (below === 0 || below === 3) {
      swap(x, y, x, newY);
      return;
    }
  }
  
  // Enhanced horizontal flow with pressure simulation
  let directions = [-1, 1];
  if (Math.random() < 0.5) directions.reverse();
  
  // Check for diagonal movement first
  for (let d of directions) {
    const newX = x + d;
    newY = y + 1;
    if (newX >= 0 && newX < gridWidth && newY < gridHeight) {
      const diag = grid[newY][newX];
      if (diag === 0 || diag === 3) {
        swap(x, y, newX, newY);
        return;
      }
    }
  }
  
  // Horizontal flow with multiple steps for better spreading
  for (let d of directions) {
    for (let step = 1; step <= 3; step++) {
      const newX = x + (d * step);
      if (newX >= 0 && newX < gridWidth && grid[y][newX] === 0) {
        if (Math.random() < 0.8 / step) { // Decreasing probability with distance
          swap(x, y, newX, y);
          return;
        }
      } else {
        break; // Stop if blocked
      }
    }
  }
}

// Enhanced Oil with better density behavior
function updateOil(x, y) {
  if (grid[y][x] !== 3) return;
  
  let newY = y + 1;
  if (newY < gridHeight) {
    const below = grid[newY][x];
    if (below === 0 || below === 2) {
      swap(x, y, x, newY);
      return;
    }
  }
  
  let directions = [-1, 1];
  if (Math.random() < 0.5) directions.reverse();
  
  for (let d of directions) {
    const newX = x + d;
    newY = y + 1;
    if (newX >= 0 && newX < gridWidth && newY < gridHeight) {
      const diag = grid[newY][newX];
      if (diag === 0 || diag === 2) {
        swap(x, y, newX, newY);
        return;
      }
    }
  }
  
  // Horizontal spreading (slower than water)
  for (let d of directions) {
    const newX = x + d;
    if (newX >= 0 && newX < gridWidth && grid[y][newX] === 0) {
      if (Math.random() < 0.3) {
        swap(x, y, newX, y);
        return;
      }
    }
  }
}

// Enhanced Fire with more realistic spread patterns
function updateFire(x, y) {
  if (grid[y][x] !== 4) return;
  
  const neighbors = [
    [x, y-1], [x, y+1], [x-1, y], [x+1, y],
    [x-1, y-1], [x+1, y-1], [x-1, y+1], [x+1, y+1]
  ];
  
  for (let [nx, ny] of neighbors) {
    if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
      const neighborType = grid[ny][nx];
      
      // Spread to flammable materials
      if ((neighborType === 10 || neighborType === 3 || neighborType === 12) && Math.random() < 0.08) {
         setCell(nx, ny, 4);
      }
      // Enhanced sand to glass conversion
      if (neighborType === 1 && Math.random() < 0.1) {
         convertSandToThickGlass(nx, ny);
      }
      // Melt ice
      if (neighborType === 11 && Math.random() < 0.15) {
         setCell(nx, ny, 2);
      }
    }
  }
  
  // Fire rises with some randomness
  const newY = y - 1;
  if (newY >= 0 && grid[newY][x] === 0 && Math.random() < 0.3) {
    swap(x, y, x, newY);
    return;
  }
  
  // Random horizontal movement
  if (Math.random() < 0.1) {
    const directions = [-1, 1];
    const d = directions[Math.floor(Math.random() * directions.length)];
    const newX = x + d;
    if (newX >= 0 && newX < gridWidth && grid[y][newX] === 0) {
      swap(x, y, newX, y);
      return;
    }
  }
  
  // Convert to smoke
  if (Math.random() < 0.15) {
    setCell(x, y, 5);
  }
}

// Enhanced Smoke with better dissipation
function updateSmoke(x, y) {
  if (grid[y][x] !== 5) return;
  
  let newY = y - 1;
  if (newY >= 0 && grid[newY][x] === 0) {
    swap(x, y, x, newY);
    return;
  }
  
  // Diagonal upward movement
  let directions = [-1, 1];
  if (Math.random() < 0.5) directions.reverse();
  
  for (let d of directions) {
    const newX = x + d;
    newY = y - 1;
    if (newX >= 0 && newX < gridWidth && newY >= 0 && grid[newY][newX] === 0) {
      swap(x, y, newX, newY);
      return;
    }
  }
  
  // Horizontal drift
  if (Math.random() < 0.2) {
    const d = directions[Math.floor(Math.random() * directions.length)];
    const newX = x + d;
    if (newX >= 0 && newX < gridWidth && grid[y][newX] === 0) {
      swap(x, y, newX, y);
      return;
    }
  }
  
  // Gradual dissipation
  if (Math.random() < 0.008) {
    setCell(x, y, 0);
  }
}

// Enhanced Acid with more aggressive melting
function updateAcid(x, y) {
  if (grid[y][x] !== 6) return;
  
  let newY = y + 1;
  if (newY < gridHeight) {
    const below = grid[newY][x];
    if (below === 0) {
      swap(x, y, x, newY);
      return;
    } else {
      let directions = [-1, 1];
      if (Math.random() < 0.5) directions.reverse();
      for (let d of directions) {
        const newX = x + d;
        if (newX >= 0 && newX < gridWidth && newY < gridHeight && grid[newY][newX] === 0) {
          swap(x, y, newX, newY);
          return;
        }
      }
    }
  }
  
  // Enhanced melting behavior
  const neighbors = [
    [x, y-1], [x, y+1], [x-1, y], [x+1, y],
    [x-1, y-1], [x+1, y-1], [x-1, y+1], [x+1, y+1]
  ];
  
  for (let [nx, ny] of neighbors) {
    if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
      const neighborType = grid[ny][nx];
      if ([10, 1, 12, 21].includes(neighborType) && Math.random() < 0.08) {
        setCell(nx, ny, 6);
      }
      // Acid neutralizes with metal
      if (neighborType === 8 && Math.random() < 0.05) {
        setCell(x, y, 0);
        return;
      }
    }
  }
}

// Enhanced Lava with better cooling and heating effects
function updateLava(x, y) {
  if (grid[y][x] !== 7) return;
  
  let newY = y + 1;
  if (newY < gridHeight) {
    const below = grid[newY][x];
    if (below === 0) {
      swap(x, y, x, newY);
      return;
    }
    // Cool to stone when touching water
    if (below === 2) {
      setCell(x, y, 9);
      setCell(x, newY, 20); // Create steam
      return;
    }
    // Enhanced sand burning
    if (below === 1 && Math.random() < 0.1) {
      convertSandToThickGlass(x, newY);
      return;
    }
  }
  
  let directions = [-1, 1];
  if (Math.random() < 0.5) directions.reverse();
  
  for (let d of directions) {
    const newX = x + d;
    newY = y + 1;
    if (newX >= 0 && newX < gridWidth && newY < gridHeight) {
      const diag = grid[newY][newX];
      if (diag === 0) {
        swap(x, y, newX, newY);
        return;
      }
      if (diag === 2) {
        setCell(x, y, 9);
        setCell(newX, newY, 20);
        return;
      }
      if (diag === 1 && Math.random() < 0.1) {
        convertSandToThickGlass(newX, newY);
        return;
      }
    }
  }
  
  // Horizontal flow
  for (let d of directions) {
    const newX = x + d;
    if (newX >= 0 && newX < gridWidth && grid[y][newX] === 0) {
      if (Math.random() < 0.4) {
        swap(x, y, newX, y);
        return;
      }
    }
  }
  
  // Ignite flammable neighbors
  const neighbors = [
    [x-1, y], [x+1, y], [x, y-1], [x, y+1]
  ];
  for (let [nx, ny] of neighbors) {
    if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
      if (grid[ny][nx] === 10) {
        setCell(nx, ny, 4);
      }
    }
  }
  
  // Slow cooling
  if (Math.random() < 0.002) {
    setCell(x, y, 9);
  }
}

// Static elements with enhanced behaviors
function updateMetal(x, y) {
  // Metal conducts heat and electricity
  const neighbors = [
    [x, y-1], [x, y+1], [x-1, y], [x+1, y]
  ];
  for (let [nx, ny] of neighbors) {
    if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
      if (grid[ny][nx] === 14 && Math.random() < 0.3) {
        setCell(nx, ny, 4); // Electricity creates sparks
      }
    }
  }
}

function updateStone(x, y) {
  // Stone can be slowly eroded by acid
  const neighbors = [
    [x, y-1], [x, y+1], [x-1, y], [x+1, y]
  ];
  for (let [nx, ny] of neighbors) {
    if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
      if (grid[ny][nx] === 6 && Math.random() < 0.01) {
        setCell(x, y, 0);
        return;
      }
    }
  }
}

// Continue with existing functions but with enhancements...
function updateWood(x, y) {
  if (grid[y][x] !== 10) return;
  const neighbors = [
    [x-1, y], [x+1, y], [x, y-1], [x, y+1],
    [x-1, y-1], [x+1, y-1], [x-1, y+1], [x+1, y+1]
  ];
  for (let [nx, ny] of neighbors) {
    if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
      if ((grid[ny][nx] === 4 || grid[ny][nx] === 7) && Math.random() < 0.08) {
        setCell(x, y, 4);
        return;
      }
    }
  }
}

function updateIce(x, y) {
  if (grid[y][x] !== 11) return;
  
  // Ice falls slowly
  let newY = y + 1;
  if (newY < gridHeight && grid[newY][x] === 0 && Math.random() < 0.3) {
    swap(x, y, x, newY);
    return;
  }
  
  const neighbors = [
    [x, y-1], [x, y+1], [x-1, y], [x+1, y],
    [x-1, y-1], [x+1, y-1], [x-1, y+1], [x+1, y+1]
  ];
  for (let [nx, ny] of neighbors) {
    if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
      if ((grid[ny][nx] === 4 || grid[ny][nx] === 7) && Math.random() < 0.2) {
         setCell(x, y, 2);
         return;
      }
    }
  }
}

function updatePlant(x, y) {
  if (grid[y][x] !== 12) return;
  const neighbors = [
    [x, y-1], [x, y+1], [x-1, y], [x+1, y],
    [x-1, y-1], [x+1, y-1], [x-1, y+1], [x+1, y+1]
  ];
  for (let [nx, ny] of neighbors) {
    if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
      if ((grid[ny][nx] === 4 || grid[ny][nx] === 7) && Math.random() < 0.12) {
         setCell(x, y, 4);
         return;
      }
    }
  }
  
  // Enhanced growth with water dependency
  let hasWater = false;
  for (let [nx, ny] of neighbors) {
    if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
      if (grid[ny][nx] === 2) hasWater = true;
    }
  }
  
  if (hasWater) {
    const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
    const [nx, ny] = randomNeighbor;
    if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight && grid[ny][nx] === 0 && Math.random() < 0.08) {
         setCell(nx, ny, 12);
    }
  }
}

function updateVirus(x, y) {
  if (grid[y][x] !== 13) return;
  const neighbors = [
    [x, y-1], [x, y+1], [x-1, y], [x+1, y],
    [x-1, y-1], [x+1, y-1], [x-1, y+1], [x+1, y+1]
  ];
  for (let [nx, ny] of neighbors) {
    if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
      if ((grid[ny][nx] === 10 || grid[ny][nx] === 12) && Math.random() < 0.12) {
         setCell(nx, ny, 13);
      }
    }
  }
  const emptyNeighbors = neighbors.filter(([nx, ny]) =>
    nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight && grid[ny][nx] === 0
  );
  if (emptyNeighbors.length && Math.random() < 0.25) {
    const [nx, ny] = emptyNeighbors[Math.floor(Math.random() * emptyNeighbors.length)];
    swap(x, y, nx, ny);
  }
}

function updateElectricity(x, y) {
  if (grid[y][x] !== 14) return;
  const directions = [
    [0, -1], [0, 1], [-1, 0], [1, 0],
    [-1, -1], [1, -1], [-1, 1], [1, 1]
  ];
  const [dx, dy] = directions[Math.floor(Math.random() * directions.length)];
  const newX = x + dx;
  const newY = y + dy;
  if (newX >= 0 && newX < gridWidth && newY >= 0 && newY < gridHeight && grid[newY][newX] === 0) {
    swap(x, y, newX, newY);
    return;
  }
  const neighbors = [
    [x, y-1], [x, y+1], [x-1, y], [x+1, y],
    [x-1, y-1], [x+1, y-1], [x-1, y+1], [x+1, y+1]
  ];
  for (let [nx, ny] of neighbors) {
    if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
      if (grid[ny][nx] === 8 && Math.random() < 0.25) {
         setCell(nx, ny, 4);
      }
    }
  }
  if (Math.random() < 0.6) {
    setCell(x, y, 0);
  }
}

function updatePlasma(x, y) {
  if (grid[y][x] !== 15) return;
  let newY = y + 1;
  if (newY < gridHeight) {
    const below = grid[newY][x];
    if (below === 0) {
      swap(x, y, x, newY);
      return;
    }
    if (below === 2 && Math.random() < 0.4) {
      setCell(x, y, 4);
      setCell(x, newY, 20);
      return;
    }
  }
  let directions = [-1, 1];
  if (Math.random() < 0.5) directions.reverse();
  for (let d of directions) {
    const newX = x + d;
    if (newX >= 0 && newX < gridWidth && grid[y][newX] === 0) {
       swap(x, y, newX, y);
       return;
    }
  }
  if (Math.random() < 0.02) {
    setCell(x, y, 0);
  }
}

function updateBomb(x, y) {
  if (grid[y][x] !== 16) return;
  let triggered = false;
  const neighbors = [
    [x, y-1], [x, y+1], [x-1, y], [x+1, y],
    [x-1, y-1], [x+1, y-1], [x-1, y+1], [x+1, y+1]
  ];
  for (let [nx, ny] of neighbors) {
    if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
      if ([4, 15, 14, 7].includes(grid[ny][nx])) {
        triggered = true;
        break;
      }
    }
  }
  if (triggered || Math.random() < 0.0005) {
    const radius = 4;
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (Math.sqrt(dx * dx + dy * dy) <= radius) {
          const ex = x + dx;
          const ey = y + dy;
          if (ex >= 0 && ex < gridWidth && ey >= 0 && ey < gridHeight) {
            setCell(ex, ey, 4);
          }
        }
      }
    }
  }
}

// All the remaining update functions stay the same but with small enhancements...
function updateMud(x, y) {
  if (grid[y][x] !== 18) return;
  let newY = y + 1;
  if (newY < gridHeight && grid[newY][x] === 0 && Math.random() < 0.4) {
    swap(x, y, x, newY);
    return;
  }
  const neighbors = [
    [x, y-1], [x, y+1], [x-1, y], [x+1, y]
  ];
  for (let [nx, ny] of neighbors) {
    if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
      if (grid[ny][nx] === 2 && Math.random() < 0.12) {
        setCell(nx, ny, 21);
      }
    }
  }
}

function updateSnow(x, y) {
  if (grid[y][x] !== 19) return;
  let newY = y + 1;
  if (newY < gridHeight && grid[newY][x] === 0 && Math.random() < 0.2) {
    swap(x, y, x, newY);
  }
  const neighbors = [
    [x, y-1], [x, y+1], [x-1, y], [x+1, y]
  ];
  for (let [nx, ny] of neighbors) {
    if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
      if ((grid[ny][nx] === 4 || grid[ny][nx] === 7) && Math.random() < 0.08) {
        setCell(x, y, 2);
        return;
      }
    }
  }
}

function updateSteam(x, y) {
  if (grid[y][x] !== 20) return;
  if (y > 0 && grid[y-1][x] === 0) {
    swap(x, y, x, y-1);
    return;
  }
  if (y < gridHeight - 1 && grid[y+1][x] === 2) {
    setCell(x, y, 2);
    return;
  }
  if (Math.random() < 0.25) {
    setCell(x, y, 0);
  }
}

function updateClay(x, y) {
  if (grid[y][x] !== 21) return;
  const neighbors = [
    [x, y-1], [x, y+1], [x-1, y], [x+1, y],
    [x-1, y-1], [x+1, y-1], [x-1, y+1], [x+1, y+1]
  ];
  for (let [nx, ny] of neighbors) {
    if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
      if ((grid[ny][nx] === 4 || grid[ny][nx] === 7) && Math.random() < 0.08) {
        setCell(x, y, 9);
        return;
      }
    }
  }
}

function updateRubber(x, y) {
  if (grid[y][x] !== 22) return;
  if (y < gridHeight - 1 && grid[y+1][x] === 0) {
    if (Math.random() < 0.15 && y > 0 && grid[y-1][x] === 0) {
      swap(x, y, x, y-1);
    } else {
      swap(x, y, x, y+1);
    }
  }
  const neighbors = [
    [x, y-1], [x, y+1], [x-1, y], [x+1, y]
  ];
  for (let [nx, ny] of neighbors) {
    if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
      if ((grid[ny][nx] === 4 || grid[ny][nx] === 7) && Math.random() < 0.08) {
        setCell(x, y, 5);
        return;
      }
    }
  }
}

function updateGlassShard(x, y) {
  if (grid[y][x] !== 23) return;
  if (y < gridHeight - 1 && grid[y+1][x] === 0 && Math.random() < 0.8) {
    swap(x, y, x, y+1);
  }
  const neighbors = [
    [x, y-1], [x, y+1], [x-1, y], [x+1, y]
  ];
  for (let [nx, ny] of neighbors) {
    if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
      if (grid[ny][nx] === 10 && Math.random() < 0.15) {
        setCell(nx, ny, 4);
      }
    }
  }
}

function updateNitro(x, y) {
  if (grid[y][x] !== 24) return;
  let triggered = false;
  const neighbors = [
    [x, y-1], [x, y+1], [x-1, y], [x+1, y],
    [x-1, y-1], [x+1, y-1], [x-1, y+1], [x+1, y+1]
  ];
  for (let [nx, ny] of neighbors) {
    if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
      if ([4, 14, 15, 7].includes(grid[ny][nx])) {
        triggered = true;
        break;
      }
    }
  }
  if (triggered || Math.random() < 0.001) {
    const radius = 5;
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy <= radius * radius) {
          const ex = x + dx;
          const ey = y + dy;
          if (ex >= 0 && ex < gridWidth && ey >= 0 && ey < gridHeight) {
            setCell(ex, ey, 4);
          }
        }
      }
    }
    setCell(x, y, 0);
  }
}

function updateSlime(x, y) {
  if (grid[y][x] !== 25) return;
  if (y < gridHeight - 1 && grid[y+1][x] === 0) {
    if (Math.random() < 0.2) swap(x, y, x, y+1);
  }
  const neighbors = [
    [x, y-1], [x, y+1], [x-1, y], [x+1, y]
  ];
  for (let [nx, ny] of neighbors) {
    if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
      if ([4, 7].includes(grid[ny][nx]) && Math.random() < 0.08) {
        setCell(x, y, 2);
        return;
      }
    }
  }
}

function updateCarbon(x, y) {
  if (grid[y][x] !== 26) return;
  const neighbors = [
    [x, y-1], [x, y+1], [x-1, y], [x+1, y],
    [x-1, y-1], [x+1, y-1], [x-1, y+1], [x+1, y+1]
  ];
  for (let [nx, ny] of neighbors) {
    if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
      if ((grid[ny][nx] === 4 || grid[ny][nx] === 7) && Math.random() < 0.08) {
        setCell(x, y, 5);
        return;
      }
    }
  }
}

function updateMagnet(x, y) {
  if (grid[y][x] !== 27) return;
  for (let j = Math.max(0, y-3); j <= Math.min(gridHeight-1, y+3); j++) {
    for (let i = Math.max(0, x-3); i <= Math.min(gridWidth-1, x+3); i++) {
      if (grid[j][i] === 8) {
        let dx = x - i;
        let dy = y - j;
        let newX = i + Math.sign(dx);
        let newY = j + Math.sign(dy);
        if (newX >= 0 && newX < gridWidth && newY >= 0 && newY < gridHeight && grid[newY][newX] === 0) {
          if (Math.random() < 0.3) {
            swap(i, j, newX, newY);
          }
        }
      }
    }
  }
}

export const elementUpdates = {
  1: updateSand,
  2: updateWater,
  3: updateOil,
  4: updateFire,
  5: updateSmoke,
  6: updateAcid,
  7: updateLava,
  8: updateMetal,
  9: updateStone,
  10: updateWood,
  11: updateIce,
  12: updatePlant,
  13: updateVirus,
  14: updateElectricity,
  15: updatePlasma,
  16: updateBomb,
  18: updateMud,
  19: updateSnow,
  20: updateSteam,
  21: updateClay,
  22: updateRubber,
  23: updateGlassShard,
  24: updateNitro,
  25: updateSlime,
  26: updateCarbon,
  27: updateMagnet
};