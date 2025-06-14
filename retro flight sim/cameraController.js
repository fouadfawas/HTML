import * as THREE from 'three';

export class CameraController {
  constructor(camera, player) {
    this.camera = camera;
    this.player = player;
    
    this.setupModes();
    this.currentMode = 'chase';
    this.transitionSpeed = 0.08;
    
    // Camera state
    this.currentFOV = 75;
    this.targetFOV = 75;
    this.fovTransitionSpeed = 0.05;
    
    // Orbit mode properties
    this.orbitAngle = 0;
    this.orbitHeight = 50;
    this.orbitRadius = 80;
    this.orbitSpeed = 0.005;
    
    // Dynamic properties
    this.shake = 0;
    this.shakeDecay = 0.9;
    this.lookAhead = 0;
    
    // Initialize cinematic timer
    this.cinematicTimer = 0;
    this.cinematicSequence = 0;
  }
  
  setupModes() {
    this.modes = {
      // Standard chase camera
      chase: {
        offset: new THREE.Vector3(0, 8, -25),
        lookOffset: new THREE.Vector3(0, 2, 10),
        fov: 75,
        dynamicDistance: true,
        speedInfluence: 0.1,
        bankInfluence: 0.6,
        heightInfluence: 0.4,
        smoothing: 0.08
      },
      
      // First-person cockpit view
      cockpit: {
        offset: new THREE.Vector3(0, 1.8, 0),
        lookOffset: new THREE.Vector3(0, 1.8, 20),
        fov: 85,
        dynamicDistance: false,
        bankInfluence: 0.95,
        heightInfluence: 0,
        smoothing: 0.2
      },
      
      // Tactical overhead view
      tactical: {
        offset: new THREE.Vector3(0, 40, -25),
        lookOffset: new THREE.Vector3(0, 0, 30),
        fov: 70,
        dynamicDistance: true,
        speedInfluence: 0.15,
        bankInfluence: 0.3,
        heightInfluence: 0.2,
        smoothing: 0.06
      },
      
      // Cinematic orbit camera
      orbit: {
        offset: new THREE.Vector3(0, 0, 0), // Dynamic positioning
        lookOffset: new THREE.Vector3(0, 0, 0), // Always look at player
        fov: 65,
        dynamicDistance: false,
        smoothing: 0.04
      },
      
      // Cinematic sequence camera
      cinematic: {
        offset: new THREE.Vector3(0, 0, 0), // Dynamic
        lookOffset: new THREE.Vector3(0, 0, 0), // Dynamic
        fov: 60,
        dynamicDistance: false,
        smoothing: 0.03
      }
    };
  }
  
  cycleMode() {
    const modes = ['chase', 'cockpit', 'tactical', 'orbit', 'cinematic'];
    const currentIndex = modes.indexOf(this.currentMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    this.currentMode = modes[nextIndex];
    
    // Reset cinematic timers when switching to cinematic mode
    if (this.currentMode === 'cinematic') {
      this.cinematicTimer = 0;
      this.cinematicSequence = 0;
    }
    
    // Update FOV
    this.targetFOV = this.modes[this.currentMode].fov;
  }
  
  update(keys, missileData) {
    // Get current mode settings
    const mode = this.modes[this.currentMode];
    
    // Update FOV with smooth transition
    this.updateFOV();
    
    // Reduce camera shake
    this.shake *= this.shakeDecay;
    
    // Mode-specific updates
    switch (this.currentMode) {
      case 'chase':
      case 'tactical':
        this.updateChaseCamera(mode);
        break;
        
      case 'cockpit':
        this.updateCockpitCamera(mode);
        break;
        
      case 'orbit':
        this.updateOrbitCamera(mode);
        break;
        
      case 'cinematic':
        this.updateCinematicCamera(mode);
        break;
    }
    
    // Apply camera shake
    if (this.shake > 0.01) {
      this.camera.position.x += (Math.random() - 0.5) * this.shake;
      this.camera.position.y += (Math.random() - 0.5) * this.shake;
      this.camera.position.z += (Math.random() - 0.5) * this.shake;
    }
  }
  
  updateChaseCamera(mode) {
    // Calculate base offset
    const offset = mode.offset.clone();
    
    // Adjust distance based on speed if enabled
    if (mode.dynamicDistance && this.player.currentSpeed) {
      const speedFactor = this.player.currentSpeed / this.player.maxSpeed;
      offset.z -= speedFactor * 10 * (mode.speedInfluence || 0);
      offset.y += speedFactor * 5 * (mode.speedInfluence || 0);
    }
    
    // Get player's orientation quaternion
    const playerQuat = this.player.mesh.quaternion;
    
    // Calculate look-ahead offset (camera looks ahead in direction of travel)
    const lookAheadOffset = new THREE.Vector3();
    if (mode.heightInfluence > 0) {
      // Get terrain height below player for height-based adjustment
      let terrainHeight = 0;
      if (window.game && window.game.terrainGenerator) {
        terrainHeight = window.game.terrainGenerator.getHeightAt(
          this.player.position.x, 
          this.player.position.z
        );
      }
      
      // Adjust camera angle based on height above terrain
      const heightAboveTerrain = this.player.position.y - terrainHeight;
      const heightFactor = Math.max(0, Math.min(1, heightAboveTerrain / 100));
      offset.y += (1 - heightFactor) * 15 * mode.heightInfluence;
      offset.z += (1 - heightFactor) * 10 * mode.heightInfluence;
    }
    
    // Adjust for banking (roll)
    if (mode.bankInfluence > 0) {
      // Extract roll angle from player quaternion
      const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(playerQuat);
      const up = new THREE.Vector3(0, 1, 0).applyQuaternion(playerQuat);
      const right = new THREE.Vector3().crossVectors(forward, up).normalize();
      
      // How much is the player banking?
      const worldUp = new THREE.Vector3(0, 1, 0);
      const bankAmount = 1 - Math.abs(up.dot(worldUp));
      
      // Add bank influence to offset
      const bankOffset = right.multiplyScalar(bankAmount * 15 * mode.bankInfluence);
      offset.add(bankOffset);
    }
    
    // Apply player orientation to offset
    offset.applyQuaternion(playerQuat);
    
    // Calculate target camera position
    const targetPos = new THREE.Vector3().copy(this.player.position).add(offset);
    
    // Calculate look target with offset
    const lookOffset = mode.lookOffset.clone().applyQuaternion(playerQuat);
    const lookTarget = new THREE.Vector3().copy(this.player.position).add(lookOffset);
    
    // Smooth camera movement
    this.camera.position.lerp(targetPos, mode.smoothing);
    
    // Look at target
    this.camera.lookAt(lookTarget);
  }
  
  updateCockpitCamera(mode) {
    // Calculate position inside cockpit
    const offset = mode.offset.clone();
    offset.applyQuaternion(this.player.mesh.quaternion);
    
    const targetPos = new THREE.Vector3().copy(this.player.position).add(offset);
    
    // Calculate look direction - ahead of the plane
    const lookOffset = mode.lookOffset.clone().applyQuaternion(this.player.mesh.quaternion);
    const lookTarget = new THREE.Vector3().copy(this.player.position).add(lookOffset);
    
    // Apply position with smoothing
    this.camera.position.lerp(targetPos, mode.smoothing);
    
    // Look direction
    this.camera.lookAt(lookTarget);
    
    // Add subtle movement for more realism
    if (this.player.currentSpeed > this.player.minSpeed) {
      const intensity = 0.03 * (this.player.currentSpeed / this.player.maxSpeed);
      this.camera.position.y += Math.sin(Date.now() * 0.003) * intensity;
      this.camera.position.x += Math.sin(Date.now() * 0.005) * intensity * 0.5;
    }
  }
  
  updateOrbitCamera(mode) {
    // Update orbit angle
    this.orbitAngle += this.orbitSpeed;
    
    // Calculate orbit position
    const x = Math.cos(this.orbitAngle) * this.orbitRadius;
    const z = Math.sin(this.orbitAngle) * this.orbitRadius;
    
    // Calculate target position
    const targetPos = new THREE.Vector3(
      this.player.position.x + x,
      this.player.position.y + this.orbitHeight,
      this.player.position.z + z
    );
    
    // Smooth movement
    this.camera.position.lerp(targetPos, mode.smoothing);
    
    // Always look at player
    this.camera.lookAt(this.player.position);
  }
  
  updateCinematicCamera(mode) {
    // Increase timer
    this.cinematicTimer++;
    
    // Change sequence every ~7 seconds
    if (this.cinematicTimer > 420) {
      this.cinematicTimer = 0;
      this.cinematicSequence = (this.cinematicSequence + 1) % 5;
    }
    
    let targetPos = new THREE.Vector3();
    let lookTarget = new THREE.Vector3();
    
    // Different cinematic sequence based on timer
    switch (this.cinematicSequence) {
      case 0: // Side tracking shot
        const sideOffset = new THREE.Vector3(30, 5, 0);
        sideOffset.applyQuaternion(this.player.mesh.quaternion);
        targetPos.copy(this.player.position).add(sideOffset);
        
        // Look slightly ahead of player
        const lookAhead = new THREE.Vector3(0, 0, 30);
        lookAhead.applyQuaternion(this.player.mesh.quaternion);
        lookTarget.copy(this.player.position).add(lookAhead);
        break;
        
      case 1: // Low angle dramatic shot
        const lowAngle = new THREE.Vector3(
          -15 + Math.sin(this.cinematicTimer * 0.01) * 10, 
          -5, 
          -10 + Math.cos(this.cinematicTimer * 0.01) * 10
        );
        lowAngle.applyQuaternion(this.player.mesh.quaternion);
        targetPos.copy(this.player.position).add(lowAngle);
        
        // Look at player's front
        const frontOffset = new THREE.Vector3(0, 3, 5);
        frontOffset.applyQuaternion(this.player.mesh.quaternion);
        lookTarget.copy(this.player.position).add(frontOffset);
        break;
        
      case 2: // Sweeping arc
        const angle = this.cinematicTimer * 0.005;
        const radius = 50;
        const arcX = Math.cos(angle) * radius;
        const arcZ = Math.sin(angle) * radius;
        const arcY = 20 + Math.sin(angle * 0.5) * 10;
        
        const arcOffset = new THREE.Vector3(arcX, arcY, arcZ);
        targetPos.copy(this.player.position).add(arcOffset);
        lookTarget.copy(this.player.position);
        break;
        
      case 3: // Top-down tracking
        const topOffset = new THREE.Vector3(
          0,
          50 + Math.sin(this.cinematicTimer * 0.01) * 10, 
          -30
        );
        topOffset.applyQuaternion(this.player.mesh.quaternion);
        targetPos.copy(this.player.position).add(topOffset);
        lookTarget.copy(this.player.position);
        break;
        
      case 4: // Distant landscape shot looking at player
        // Calculate position based on player's orientation but from distance
        const distantOffset = new THREE.Vector3(
          -100 + Math.sin(this.cinematicTimer * 0.003) * 50,
          30 + Math.cos(this.cinematicTimer * 0.005) * 20,
          -80 + Math.sin(this.cinematicTimer * 0.004) * 30
        );
        targetPos.copy(this.player.position).add(distantOffset);
        lookTarget.copy(this.player.position);
        break;
    }
    
    // Smooth camera movement
    this.camera.position.lerp(targetPos, mode.smoothing);
    
    // Set look target
    const currentLookDir = new THREE.Vector3(0, 0, 1).applyQuaternion(this.camera.quaternion);
    const targetLookDir = new THREE.Vector3().subVectors(lookTarget, this.camera.position).normalize();
    
    // Smoothly interpolate the look direction
    const lookDir = new THREE.Vector3().copy(currentLookDir)
      .lerp(targetLookDir, mode.smoothing * 2);
    
    // Calculate the look target point
    const newLookTarget = new THREE.Vector3().copy(this.camera.position).add(
      lookDir.multiplyScalar(100)
    );
    
    this.camera.lookAt(newLookTarget);
  }
  
  updateFOV() {
    // Dynamic FOV based on speed - only in chase mode
    if (this.currentMode === 'chase' && this.player.currentSpeed) {
      const speedFactor = this.player.currentSpeed / this.player.maxSpeed;
      const dynamicFOV = this.modes.chase.fov + speedFactor * 10;
      this.targetFOV = dynamicFOV;
    } else {
      this.targetFOV = this.modes[this.currentMode].fov;
    }
    
    // Smooth transition for FOV changes
    if (Math.abs(this.currentFOV - this.targetFOV) > 0.1) {
      this.currentFOV += (this.targetFOV - this.currentFOV) * this.fovTransitionSpeed;
      this.camera.fov = this.currentFOV;
      this.camera.updateProjectionMatrix();
    }
  }
  
  addShake(amount) {
    this.shake = Math.min(this.shake + amount, 1.0);
  }
  
  reset() {
    // Reset to chase camera
    this.currentMode = 'chase';
    this.targetFOV = this.modes.chase.fov;
    this.currentFOV = this.targetFOV;
    
    // Reset cinematic properties
    this.cinematicTimer = 0;
    this.cinematicSequence = 0;
    
    // Update camera FOV
    this.camera.fov = this.currentFOV;
    this.camera.updateProjectionMatrix();
    
    // Reset position
    this.camera.position.set(0, 155, -10);
    this.camera.lookAt(this.player.position);
  }
}