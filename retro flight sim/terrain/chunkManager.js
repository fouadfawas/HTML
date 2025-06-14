import * as THREE from 'three';

export class ChunkManager {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.chunkSize = options.chunkSize || 200;
    this.loadDistance = options.loadDistance || 1000;
    this.activeChunks = new Map(); // Stores loaded chunks by position key
    
    // For performance monitoring
    this.lastChunkGenTime = 0;
  }
  
  update(playerPosition) {
    const chunksToProcess = [];
    
    // Only perform chunk management every few frames for better performance
    if (performance.now() - this.lastChunkGenTime > 500) { // 500ms interval
      // Get current chunk position of player
      const playerChunkX = Math.floor(playerPosition.x / this.chunkSize);
      const playerChunkZ = Math.floor(playerPosition.z / this.chunkSize);
      
      // First, identify and remove far chunks
      this.removeDistantChunks(playerPosition);
      
      // Then identify which chunks need to be created
      chunksToProcess.push(...this.getChunksToLoad(playerChunkX, playerChunkZ, playerPosition));
      
      this.lastChunkGenTime = performance.now();
    }
    
    return chunksToProcess;
  }
  
  removeDistantChunks(playerPosition) {
    for (const [key, chunk] of this.activeChunks.entries()) {
      const [chunkX, chunkZ] = key.split(',').map(Number);
      
      // Use squared distance for better performance (avoids square root)
      const dx = (chunkX * this.chunkSize + this.chunkSize / 2) - playerPosition.x;
      const dz = (chunkZ * this.chunkSize + this.chunkSize / 2) - playerPosition.z;
      const distanceSq = dx * dx + dz * dz;
      
      if (distanceSq > (this.loadDistance + this.chunkSize) * (this.loadDistance + this.chunkSize)) {
        // Remove chunk objects from scene
        chunk.terrain.forEach(mesh => this.scene.remove(mesh));
        chunk.trees.forEach(tree => {
          this.scene.remove(tree);
          // Trees should be returned to the pool by the TreeGenerator
        });
        
        // Remove from active chunks
        this.activeChunks.delete(key);
      }
    }
  }
  
  getChunksToLoad(playerChunkX, playerChunkZ, playerPosition) {
    const chunksToLoad = [];
    
    // Create a spiral pattern for chunk loading from nearest to farthest
    const spiral = this.createSpiralPattern(Math.ceil(this.loadDistance / this.chunkSize));
    
    // Process spiral pattern for chunk loading - limit chunks per frame
    let chunksIdentifiedThisFrame = 0;
    const MAX_CHUNKS_PER_FRAME = 2;
    
    for (const offset of spiral) {
      const chunkX = playerChunkX + offset.x;
      const chunkZ = playerChunkZ + offset.z;
      const key = `${chunkX},${chunkZ}`;
      
      // If chunk isn't loaded and within load distance
      if (!this.activeChunks.has(key)) {
        const chunkPos = new THREE.Vector3(
          chunkX * this.chunkSize + this.chunkSize / 2,
          0,
          chunkZ * this.chunkSize + this.chunkSize / 2
        );
        
        // Use squared distance for better performance
        const dx = chunkPos.x - playerPosition.x;
        const dz = chunkPos.z - playerPosition.z;
        const distanceSq = dx * dx + dz * dz;
        
        if (distanceSq <= this.loadDistance * this.loadDistance) {
          // Add the chunk info to the list
          chunksToLoad.push({
            x: chunkX,
            z: chunkZ,
            key: key,
            distance: distanceSq
          });
          
          chunksIdentifiedThisFrame++;
          if (chunksIdentifiedThisFrame >= MAX_CHUNKS_PER_FRAME) {
            break; // Limit chunk identification per frame
          }
        }
      }
    }
    
    // Sort chunks by distance to player for priority loading
    return chunksToLoad.sort((a, b) => a.distance - b.distance);
  }
  
  createSpiralPattern(maxDist) {
    const spiral = [];
    
    // Center point
    spiral.push({x: 0, z: 0});
    
    // Generate spiral pattern of increasing distance
    for (let currentDist = 1; currentDist <= maxDist; currentDist++) {
      // Top side (left to right)
      for (let dx = -currentDist; dx < currentDist; dx++) {
        spiral.push({x: dx, z: -currentDist});
      }
      // Right side (top to bottom)
      for (let dz = -currentDist; dz < currentDist; dz++) {
        spiral.push({x: currentDist, z: dz});
      }
      // Bottom side (right to left)
      for (let dx = currentDist; dx > -currentDist; dx--) {
        spiral.push({x: dx, z: currentDist});
      }
      // Left side (bottom to top)
      for (let dz = currentDist; dz > -currentDist; dz--) {
        spiral.push({x: -currentDist, z: dz});
      }
    }
    
    return spiral;
  }
  
  addChunk(key, chunk) {
    // Add chunk objects to scene
    chunk.terrain.forEach(mesh => this.scene.add(mesh));
    chunk.trees.forEach(tree => this.scene.add(tree));
    
    // Store chunk data
    this.activeChunks.set(key, chunk);
  }
  
  getChunk(chunkX, chunkZ) {
    const key = `${chunkX},${chunkZ}`;
    return this.activeChunks.get(key);
  }
  
  clearAllChunks() {
    for (const [key, chunk] of this.activeChunks.entries()) {
      chunk.terrain.forEach(mesh => this.scene.remove(mesh));
      chunk.trees.forEach(tree => this.scene.remove(tree));
    }
    this.activeChunks.clear();
  }
}