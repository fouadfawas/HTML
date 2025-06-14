import * as THREE from 'three';

export class Player {
  constructor(scene, geometryFactory) {
    this.scene = scene;
    
    // Create player aircraft
    const geometry = geometryFactory.createShipGeometry();
    const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
    const wireframe = new THREE.WireframeGeometry(geometry);
    this.mesh = new THREE.LineSegments(wireframe, material);
    this.mesh.scale.set(2, 2, 2);
    
    // Set initial position and rotation
    this.mesh.position.y = 50;
    this.mesh.velocity = new THREE.Vector3();
    this.mesh.rotation.x = 0;
    
    // Add to scene
    scene.add(this.mesh);
    
    // Control parameters
    this.setupParameters();
    
    // Health
    this.health = 100;
    
    // Add target rotation for smoother mobile controls
    this.targetRotation = new THREE.Euler();
    this.rotationSmoothing = 0.1;
    this.movementDirection = new THREE.Vector3();
    
    // Adjust parameters for mobile
    this.turnSpeedMobile = 0.02;  // Slightly faster turning for mobile
    this.pitchSpeedMobile = 0.02;
  }
  
  setupParameters() {
    this.maxSpeed = 1.5;
    this.minSpeed = 0.15;
    this.currentSpeed = 0.3;
    this.turnSpeed = 0.015;
    this.rollSpeed = 0.025;
    this.pitchSpeed = 0.015;
    this.acceleration = 0.02;
    this.deceleration = 0.02;
    this.crashThreshold = 0.3;
    this.mobileMaxTilt = Math.PI * 0.25; // Maximum rotation angle for mobile
  }
  
  update(keys, hasGravity, gravity, groundLevel) {
    const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    
    // Speed control (same for both mobile and desktop)
    if (keys['ShiftLeft'] || keys['ShiftRight']) {
      this.currentSpeed = Math.min(this.maxSpeed, this.currentSpeed + this.acceleration);
    }
    if (keys['ControlLeft'] || keys['ControlRight']) {
      this.currentSpeed = Math.max(this.minSpeed, this.currentSpeed - this.deceleration);
    }

    // Rotation controls
    if (keys['KeyQ']) {
      this.mesh.rotateZ(-this.rollSpeed * (isMobile ? 0.7 : 1));
    }
    if (keys['KeyE']) {
      this.mesh.rotateZ(this.rollSpeed * (isMobile ? 0.7 : 1));
    }
    if (keys['KeyA']) {
      this.mesh.rotateY(this.turnSpeed * (isMobile ? 1.5 : 1));
    }
    if (keys['KeyD']) {
      this.mesh.rotateY(-this.turnSpeed * (isMobile ? 1.5 : 1));
    }
    if (keys['KeyW']) {
      this.mesh.rotateX(-this.pitchSpeed * (isMobile ? 1.5 : 1));
    }
    if (keys['KeyS']) {
      this.mesh.rotateX(this.pitchSpeed * (isMobile ? 1.5 : 1));
    }

    // Calculate forward direction based on player's rotation
    const forward = new THREE.Vector3(0, 0, 1);
    forward.applyQuaternion(this.mesh.quaternion);
    
    // Update velocity based on current speed
    this.mesh.velocity.copy(forward.multiplyScalar(this.currentSpeed));

    // Apply gravity if enabled
    if (hasGravity && this.mesh.position.y > groundLevel) {
      this.mesh.velocity.y -= gravity;
    }

    // Update position
    this.mesh.position.add(this.mesh.velocity);

    // Ground collision check
    if (this.mesh.position.y < groundLevel) {
      this.mesh.position.y = groundLevel;
      
      if (this.mesh.velocity.y < -this.crashThreshold) {
        const damage = Math.round(Math.abs(this.mesh.velocity.y) * 50);
        this.takeDamage(damage);
      }
      
      if (this.mesh.velocity.y < 0) {
        this.mesh.velocity.y = 0;
      }
    }
  }
  
  get position() {
    return this.mesh.position;
  }
  
  takeDamage(amount) {
    this.health -= amount;
    if (this.health < 0) this.health = 0;
    
    // Add camera shake when taking damage
    if (window.game && window.game.cameraController) {
      window.game.cameraController.addShake(amount / 100);
    }
  }
  
  reset() {
    this.health = 100;
    this.currentSpeed = 0.3;
    this.mesh.position.set(0, 50, 0);
    this.mesh.quaternion.set(0, 0, 0, 1);
    this.mesh.velocity = new THREE.Vector3();
    this.targetRotation.set(0, 0, 0);
    this.movementDirection.set(0, 0, 0);
  }
}