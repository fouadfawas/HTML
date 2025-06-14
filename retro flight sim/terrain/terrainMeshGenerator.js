import * as THREE from 'three';

export class TerrainMeshGenerator {
  constructor(chunkSize, chunkDetail) {
    this.chunkSize = chunkSize;
    this.chunkDetail = chunkDetail;
    this.terrainMaterial = new THREE.LineBasicMaterial({ color: 0xBA9D6F });
  }
  
  setTerrainColor(color) {
    this.terrainMaterial.color.setHex(color);
  }

  createTerrainMesh(heightMap, chunkX, chunkZ) {
    // Optimize terrain mesh by only creating necessary vertices and lines
    const geometry = new THREE.BufferGeometry();
    const cellSize = this.chunkSize / (this.chunkDetail - 1);
    
    const positions = [];
    const indices = [];
    let vertexIndex = 0;
    
    // Create vertex positions map for index reference
    const vertexMap = new Map();
    
    // Generate grid vertices and track their indices
    for (let z = 0; z < this.chunkDetail; z++) {
      for (let x = 0; x < this.chunkDetail; x++) {
        const worldX = chunkX * this.chunkSize + x * cellSize;
        const worldZ = chunkZ * this.chunkSize + z * cellSize;
        const height = heightMap[z][x];
        
        positions.push(worldX, height, worldZ);
        vertexMap.set(`${x},${z}`, vertexIndex++);
      }
    }
    
    // Generate grid index connections (lines) only where needed
    for (let z = 0; z < this.chunkDetail; z++) {
      for (let x = 0; x < this.chunkDetail; x++) {
        // Connect horizontally if not at the right edge
        if (x < this.chunkDetail - 1) {
          const currentIndex = vertexMap.get(`${x},${z}`);
          const rightIndex = vertexMap.get(`${x+1},${z}`);
          indices.push(currentIndex, rightIndex);
        }
        
        // Connect vertically if not at the bottom edge
        if (z < this.chunkDetail - 1) {
          const currentIndex = vertexMap.get(`${x},${z}`);
          const bottomIndex = vertexMap.get(`${x},${z+1}`);
          indices.push(currentIndex, bottomIndex);
        }
        
        // Add diagonal lines for more visual detail at significant elevation changes
        if (x < this.chunkDetail - 1 && z < this.chunkDetail - 1) {
          const h1 = heightMap[z][x];
          const h2 = heightMap[z][x+1];
          const h3 = heightMap[z+1][x];
          const h4 = heightMap[z+1][x+1];
          
          // If there's a significant height difference, add a diagonal line
          const maxDiff = Math.max(
            Math.abs(h1 - h2),
            Math.abs(h1 - h3),
            Math.abs(h1 - h4),
            Math.abs(h2 - h3),
            Math.abs(h2 - h4),
            Math.abs(h3 - h4)
          );
          
          if (maxDiff > 10) { // Only add diagonals for significant elevation changes
            const currentIndex = vertexMap.get(`${x},${z}`);
            const diagonalIndex = vertexMap.get(`${x+1},${z+1}`);
            indices.push(currentIndex, diagonalIndex);
          }
        }
      }
    }
    
    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    
    return new THREE.LineSegments(geometry, this.terrainMaterial);
  }
}