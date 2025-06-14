import * as THREE from 'three';
import { NoiseGenerator } from './terrain/noiseGenerator.js';
import { TerrainMeshGenerator } from './terrain/terrainMeshGenerator.js';
import { TreeGenerator } from './terrain/treeGenerator.js';
import { ChunkManager } from './terrain/chunkManager.js';

export class TerrainGenerator {
  constructor(scene) {
    this.scene = scene;
    this.chunkSize = 200;
    this.chunkDetail = 20;
    this.maxHeight = 150; 
    this.groundLevel = 0;
    
    this.noiseGenerator = new NoiseGenerator({
      scale: 0.01, 
      octaves: 6,  
      persistence: 0.55,
      lacunarity: 2.2,
      exponent: 2.2 
    });
    
    this.meshGenerator = new TerrainMeshGenerator(this.chunkSize, this.chunkDetail);
    
    this.treeGenerator = new TreeGenerator(this.scene, {
      maxDistance: 600,
      maxPerChunk: 15,
      enabled: true
    });
    
    this.chunkManager = new ChunkManager(this.scene, {
      chunkSize: this.chunkSize,
      loadDistance: 1000
    });
    
    this.heightCache = new Map();
    
    this.currentTheme = 'default';
    this.themes = {
      default: {
        terrainColor: 0xBA9D6F,
        treeColor: 0x00AA44,
        maxTrees: 15,
        treesEnabled: true
      },
      desert: {
        terrainColor: 0xE6B800,
        treeColor: 0x2F4F2F,
        maxTrees: 5,
        treesEnabled: true
      },
      snow: {
        terrainColor: 0xFFFFFF,
        treeColor: 0x3C8C3C,
        maxTrees: 10,
        treesEnabled: true
      },
      alien: {
        terrainColor: 0x9933FF,
        treeColor: 0xFF3366,
        maxTrees: 20,
        treesEnabled: true
      }
    };
    
    // Initialize with default theme
    this.applyTheme('default');
  }
  
  applyTheme(themeName) {
    if (!this.themes[themeName]) return;
    
    const theme = this.themes[themeName];
    this.currentTheme = themeName;
    
    // Update terrain material color
    this.meshGenerator.setTerrainColor(theme.terrainColor);
    
    // Update tree settings
    this.treeGenerator.setTreeColor(theme.treeColor);
    this.treeGenerator.setMaxTrees(theme.maxTrees);
    this.treeGenerator.setEnabled(theme.treesEnabled);
    
    // Regenerate all visible chunks with new theme
    this.clearAndRegenerateChunks();
  }
  
  clearAndRegenerateChunks() {
    // Store current chunk positions
    const activeChunks = Array.from(this.chunkManager.activeChunks.keys()).map(key => {
      const [x, z] = key.split(',').map(Number);
      return { x, z, key };
    });
    
    // Clear all chunks
    this.chunkManager.clearAllChunks();
    this.heightCache.clear();
    
    // Regenerate chunks with new theme
    activeChunks.forEach(chunk => {
      this.generateChunk(chunk.x, chunk.z, chunk.key);
    });
  }
  
  update(playerPosition) {
    const chunksToProcess = this.chunkManager.update(playerPosition);
    
    for (const chunkInfo of chunksToProcess) {
      this.generateChunk(chunkInfo.x, chunkInfo.z, chunkInfo.key);
    }
  }
  
  generateChunk(chunkX, chunkZ, key) {
    const heightMap = this.noiseGenerator.generateHeightMap(
      chunkX, chunkZ, this.chunkDetail, this.chunkSize, this.maxHeight, this.groundLevel
    );
    
    this.heightCache.set(key, heightMap);
    
    const terrain = this.meshGenerator.createTerrainMesh(heightMap, chunkX, chunkZ);
    
    const trees = this.treeGenerator.generateTrees(
      heightMap, chunkX, chunkZ, this.chunkDetail, this.chunkSize, 
      this.groundLevel, this.maxHeight
    );
    
    this.chunkManager.addChunk(key, {
      x: chunkX,
      z: chunkZ,
      terrain: [terrain],
      trees: trees
    });
  }
  
  getHeightAt(x, z) {
    const chunkX = Math.floor(x / this.chunkSize);
    const chunkZ = Math.floor(z / this.chunkSize);
    const key = `${chunkX},${chunkZ}`;
    
    if (!this.heightCache.has(key)) {
      return this.groundLevel;
    }
    
    const localX = ((x - chunkX * this.chunkSize) / this.chunkSize) * (this.chunkDetail - 1);
    const localZ = ((z - chunkZ * this.chunkSize) / this.chunkSize) * (this.chunkDetail - 1);
    
    const x1 = Math.floor(localX);
    const z1 = Math.floor(localZ);
    
    if (x1 < 0 || x1 >= this.chunkDetail - 1 || z1 < 0 || z1 >= this.chunkDetail - 1) {
      return this.groundLevel;
    }
    
    const xFrac = localX - x1;
    const zFrac = localZ - z1;
    
    const heightMap = this.heightCache.get(key);
    
    const h00 = heightMap[z1][x1];
    const h10 = heightMap[z1][x1 + 1];
    const h01 = heightMap[z1 + 1][x1];
    const h11 = heightMap[z1 + 1][x1 + 1];
    
    const h0 = h00 * (1 - xFrac) + h10 * xFrac;
    const h1 = h01 * (1 - xFrac) + h11 * xFrac;
    const height = h0 * (1 - zFrac) + h1 * zFrac;
    
    return height;
  }
  
  getGroundLevel() {
    return this.groundLevel;
  }
}