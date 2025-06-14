import * as THREE from 'three';

export class TreeGenerator {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.maxDistance = options.maxDistance || 600;
    this.maxTreesPerChunk = options.maxPerChunk || 15;
    this.enabled = options.enabled !== false;
    
    // Tree material
    this.treeMaterial = new THREE.LineBasicMaterial({ color: 0x00AA44 });
    
    // Use object pooling for trees to reduce GC
    this.treePool = [];
    
    this.setTreeColor(0x00AA44);  // Default color
  }
  
  generateTrees(heightMap, chunkX, chunkZ, chunkDetail, chunkSize, groundLevel, maxHeight) {
    if (!this.enabled) return [];
    
    const trees = [];
    const treeDensity = 0.015; 
    const chunkSizeFactor = chunkSize / (chunkDetail - 1);
    
    // Pseudo-random number generator with seed
    let randomSeed = chunkX * 10000 + chunkZ;
    const random = () => {
      randomSeed = (randomSeed * 9301 + 49297) % 233280;
      return randomSeed / 233280;
    };
    
    // Get player position for distance check
    const playerPos = new THREE.Vector3();
    if (window.game && window.game.player) {
      playerPos.copy(window.game.player.position);
    }
    
    const chunkCenterX = chunkX * chunkSize + chunkSize / 2;
    const chunkCenterZ = chunkZ * chunkSize + chunkSize / 2;
    const chunkDistSq = (chunkCenterX - playerPos.x) * (chunkCenterX - playerPos.x) + 
                      (chunkCenterZ - playerPos.z) * (chunkCenterZ - playerPos.z);
    
    // Skip tree generation if too far from player
    if (chunkDistSq > this.maxDistance * this.maxDistance) {
      return [];
    }
    
    // Limit the number of trees per chunk
    let treeCount = 0;
    
    // Create a noise-based distribution for more natural clusters
    const createTreeNoise = (x, z) => {
      return Math.sin(x * 0.05) * Math.cos(z * 0.05) * 0.5 + 0.5;
    };
    
    for (let z = 0; z < chunkDetail; z += 2) { 
      for (let x = 0; x < chunkDetail; x += 2) {
        // Get world position
        const worldX = chunkX * chunkSize + x * chunkSizeFactor;
        const worldZ = chunkZ * chunkSize + z * chunkSizeFactor;
        const height = heightMap[z][x];
        
        // Use noise-based distribution combined with randomness
        const treeNoise = createTreeNoise(worldX, worldZ);
        if (random() * treeNoise < treeDensity && treeCount < this.maxTreesPerChunk) {
          // Don't add trees in very low areas (water) or very high areas (mountains)
          const relativeHeight = (height - groundLevel) / maxHeight;
          if (relativeHeight > 0.15 && relativeHeight < 0.75) {
            // Trees grow better at mid elevations - vary height based on elevation
            const treeHeight = 2 + random() * 3 * (1 - Math.abs(relativeHeight - 0.5));
            
            // Use tree from pool if available
            let tree;
            if (this.treePool.length > 0) {
              tree = this.treePool.pop();
              this.repositionTree(tree, worldX, height, worldZ, treeHeight);
            } else {
              tree = this.createTree(worldX, height, worldZ, treeHeight);
            }
            
            trees.push(tree);
            treeCount++;
          }
        }
      }
    }
    
    return trees;
  }
  
  setTreeColor(color) {
    this.treeMaterial.color.setHex(color);
  }
  
  setMaxTrees(count) {
    this.maxTreesPerChunk = count;
  }
  
  setEnabled(enabled) {
    this.enabled = enabled;
  }
  
  repositionTree(tree, x, y, z, height) {
    // Update the position of an existing tree (from the pool)
    tree.position.set(x, y, z);
    tree.scale.set(1, height / 3, 1); 
    
    return tree;
  }
  
  createTree(x, y, z, height) {
    // Create a more interesting tree model
    const geometry = new THREE.BufferGeometry();
    const branchCount = 5;
    
    const vertices = [];
    const treeTop = height;
    
    // Tree trunk (single line)
    vertices.push(
      0, 0, 0,
      0, treeTop, 0
    );
    
    // Tree branches with Y variation for more natural look
    const branchLength = height * 0.6;
    const angleStep = (Math.PI * 2) / branchCount;
    
    // Create branches at different heights for a more natural look
    for (let i = 0; i < branchCount; i++) {
      const branchHeight = treeTop - height * (0.3 + Math.random() * 0.4);
      const angle = i * angleStep + Math.random() * 0.3; 
      const bx = Math.cos(angle) * branchLength;
      const bz = Math.sin(angle) * branchLength;
      
      vertices.push(
        0, branchHeight, 0,
        bx, branchHeight - height * 0.2, bz
      );
      
      // Add some smaller twigs at the branch ends
      if (Math.random() > 0.5) {
        const twigAngle = angle + (Math.random() - 0.5) * 0.5;
        const twigLength = branchLength * 0.4;
        const twigX = bx + Math.cos(twigAngle) * twigLength;
        const twigZ = bz + Math.sin(twigAngle) * twigLength;
        
        vertices.push(
          bx, branchHeight - height * 0.2, bz,
          twigX, branchHeight - height * 0.3, twigZ
        );
      }
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    
    const tree = new THREE.LineSegments(geometry, this.treeMaterial);
    tree.position.set(x, y, z);
    
    return tree;
  }
}