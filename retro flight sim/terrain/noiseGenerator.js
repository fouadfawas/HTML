export class NoiseGenerator {
  constructor(params = {}) {
    this.params = {
      scale: params.scale || 0.01,
      octaves: params.octaves || 6,
      persistence: params.persistence || 0.55,
      lacunarity: params.lacunarity || 2.2,
      exponent: params.exponent || 2.2
    };
    
    // Cache for noise calculations
    this.noiseCache = new Map();
    
    // Pre-calculate permutation table for faster noise
    this.initNoiseTable();
  }
  
  initNoiseTable() {
    // Create permutation table for faster noise calculation
    this.perm = new Uint8Array(512);
    const p = new Uint8Array(256);
    
    // Initialize with values 0...255
    for (let i = 0; i < 256; i++) p[i] = i;
    
    // Shuffle values
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [p[i], p[j]] = [p[j], p[i]]; // Swap values
    }
    
    // Duplicate values to avoid overflow later
    for (let i = 0; i < 512; i++) {
      this.perm[i] = p[i & 255];
    }
  }
  
  generateHeightMap(chunkX, chunkZ, chunkDetail, chunkSize, maxHeight, groundLevel) {
    const heightMap = [];
    const width = chunkDetail;
    const height = chunkDetail;
    
    // Offset based on chunk position to make continuous terrain
    const offsetX = chunkX * chunkSize;
    const offsetZ = chunkZ * chunkSize;
    
    // Cached noise parameters
    const { scale, octaves, persistence, lacunarity, exponent } = this.params;
    
    for (let z = 0; z < height; z++) {
      heightMap[z] = [];
      for (let x = 0; x < width; x++) {
        // World position
        const worldX = offsetX + x * (chunkSize / (width - 1));
        const worldZ = offsetZ + z * (chunkSize / (height - 1));
        
        // Generate noise for this position using cached implementation
        let amplitude = 1;
        let frequency = 1;
        let noiseHeight = 0;
        let normalization = 0;
        
        // Check noise cache first
        const cacheKey = `${Math.floor(worldX*scale)},${Math.floor(worldZ*scale)}`;
        if (this.noiseCache.has(cacheKey)) {
          noiseHeight = this.noiseCache.get(cacheKey);
        } else {
          for (let i = 0; i < octaves; i++) {
            const sampleX = worldX * scale * frequency;
            const sampleZ = worldZ * scale * frequency;
            
            // Use optimized noise function
            const noise = this.improvedNoise(sampleX, sampleZ);
            noiseHeight += noise * amplitude;
            normalization += amplitude;
            
            amplitude *= persistence;
            frequency *= lacunarity;
          }
          
          // Normalize and cache the value
          noiseHeight = (noiseHeight / normalization);
          if (this.noiseCache.size < 10000) { // Prevent memory issues with cache
            this.noiseCache.set(cacheKey, noiseHeight);
          }
        }
        
        // Enhanced height calculation with ridge formations
        const ridgeNoise = Math.abs(this.improvedNoise(worldX * scale * 0.5, worldZ * scale * 0.5)) * 0.3;
        
        // Combine regular noise with ridge noise
        noiseHeight = Math.max(0, noiseHeight) + ridgeNoise;
        
        // Apply power function to create more dramatic terrain
        noiseHeight = Math.pow(noiseHeight, exponent);
        
        // Scale to desired height range and add variance
        const baseHeight = groundLevel + noiseHeight * maxHeight;
        
        // Add small-scale detail
        const detailNoise = this.improvedNoise(worldX * scale * 4, worldZ * scale * 4) * 5;
        const finalHeight = baseHeight + detailNoise;
        
        heightMap[z][x] = finalHeight;
      }
    }
    
    return heightMap;
  }
  
  improvedNoise(x, z) {
    // Optimized noise implementation using the pre-computed permutation table
    const X = Math.floor(x) & 255;
    const Z = Math.floor(z) & 255;
    
    // Get fractional parts
    x -= Math.floor(x);
    z -= Math.floor(z);
    
    // Compute fade curves
    const u = this.fade(x);
    const v = this.fade(z);
    
    // Get hash values for the four corners
    const A = this.perm[X] + Z;
    const AA = this.perm[A];
    const AB = this.perm[A + 1];
    const B = this.perm[X + 1] + Z;
    const BA = this.perm[B];
    const BB = this.perm[B + 1];
    
    // Gradient values
    const g00 = this.grad(this.perm[AA], x, 0, z);
    const g10 = this.grad(this.perm[BA], x - 1, 0, z);
    const g01 = this.grad(this.perm[AB], x, 0, z - 1);
    const g11 = this.grad(this.perm[BB], x - 1, 0, z - 1);
    
    // Bilinear interpolation
    const v1 = this.lerp(g00, g10, u);
    const v2 = this.lerp(g01, g11, u);
    
    return this.lerp(v1, v2, v);
  }
  
  fade(t) { 
    return t * t * t * (t * (t * 6 - 15) + 10); 
  }
  
  lerp(a, b, t) { 
    return a + t * (b - a); 
  }
  
  grad(hash, x, y, z) {
    // Simple hash to create a gradient
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : (h === 12 || h === 14 ? x : z);
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }
  
  clearCache() {
    this.noiseCache.clear();
  }
}