import * as THREE from 'three';
import { createExplosion } from './effects.js';

export class WeaponSystem {
  constructor(scene, player, geometryFactory) {
    this.scene = scene;
    this.player = player;
    this.geometryFactory = geometryFactory;
    
    this.missiles = [];
    this.missileCount = 5;
    this.maxMissiles = 5;
    this.missileRechargeTime = 0;
    this.missileRechargeRate = 120; // frames until next missile (about 2 seconds)
    
    this.spacePressed = false;
    this.tabKeyPressed = false;
    this.targetSwapTimer = 0;
    this.currentTarget = null;
    this.targetLockRange = 500;
    this.targetedEnemies = new Map(); // Store targeted enemies
  }
  
  update(keys, enemies) {
    // Update missile recharging
    this.updateMissileRecharge();
    
    // Handle inputs
    this.handleInputs(keys, enemies);
    
    // Update all projectiles
    this.updateProjectiles(enemies);
  }
  
  handleInputs(keys, enemies) {
    // TAB to cycle targets
    if (keys['Tab'] && !this.tabKeyPressed && this.targetSwapTimer <= 0) {
      this.cycleTargets(enemies);
      this.tabKeyPressed = true;
      this.targetSwapTimer = 15; // ~250ms cooldown
    }
    if (!keys['Tab']) {
      this.tabKeyPressed = false;
    }
    
    // Update target swap timer
    if (this.targetSwapTimer > 0) {
      this.targetSwapTimer--;
    }

    // Space to fire missiles
    if (keys['Space'] && !this.spacePressed) {
      this.launchMissile(enemies);
      this.spacePressed = true;
    }
    if (!keys['Space']) {
      this.spacePressed = false;
    }
  }
  
  updateMissileRecharge() {
    if (this.missileCount < this.maxMissiles) {
      this.missileRechargeTime++;
      
      if (this.missileRechargeTime >= this.missileRechargeRate) {
        this.missileCount++;
        this.missileRechargeTime = 0;
      }
    }
  }
  
  cycleTargets(enemies) {
    // Get all enemies in range
    const inRangeEnemies = enemies.filter(enemy => 
      this.player.position.distanceTo(enemy.position) < this.targetLockRange
    );
    
    if (inRangeEnemies.length === 0) {
      this.currentTarget = null;
      return;
    }
    
    // If no current target, select closest
    if (!this.currentTarget) {
      this.currentTarget = this.findBestTarget(this.player.position, this.player.mesh.quaternion, enemies);
      return;
    }
    
    // Find current target index
    const currentIndex = inRangeEnemies.indexOf(this.currentTarget);
    
    // Move to next target (or first if at end or not found)
    const nextIndex = (currentIndex === -1 || currentIndex === inRangeEnemies.length - 1) 
                      ? 0 : currentIndex + 1;
    
    this.currentTarget = inRangeEnemies[nextIndex];
  }
  
  launchMissile(enemies) {
    if (this.missileCount <= 0) {
      return;
    }
    
    // Reduce missile count
    this.missileCount--;
    
    // Create missile
    const missileGeometry = new THREE.ConeGeometry(0.3, 1.5, 8);
    const missileMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
    const wireframe = new THREE.WireframeGeometry(missileGeometry);
    const missile = new THREE.LineSegments(wireframe, missileMaterial);
    
    // Position missile in front of player
    const missileOffset = new THREE.Vector3(0, 0, 3);
    missileOffset.applyQuaternion(this.player.mesh.quaternion);
    missile.position.copy(this.player.position).add(missileOffset);
    
    // Set initial velocity and rotation
    missile.quaternion.copy(this.player.mesh.quaternion);
    missile.velocity = new THREE.Vector3(0, 0, 1)
      .applyQuaternion(this.player.mesh.quaternion)
      .multiplyScalar(2);
    
    missile.acceleration = 0.05;
    missile.maxSpeed = 3.0;
    missile.lifetime = 300; // frames ~ 5 seconds
    missile.target = null;
    missile.turnSpeed = 0.03;
    missile.missileId = Date.now() + Math.random();
    
    // Target selection logic
    if (this.currentTarget && this.isEnemyInRange(this.currentTarget)) {
      // Use currently selected target if in range
      missile.target = this.currentTarget;
    } else {
      // Find best target based on angle and distance
      let bestTarget = this.findBestTarget(missile.position, this.player.mesh.quaternion, enemies);
      
      if (bestTarget) {
        missile.target = bestTarget;
      }
    }
    
    // Add to targeted enemies map if we have a target
    if (missile.target) {
      this.targetedEnemies.set(missile.missileId, {
        missile: missile,
        enemy: missile.target
      });
    }
    
    // Visual trails for missile
    missile.trail = [];
    missile.maxTrailLength = 10;
    
    this.missiles.push(missile);
    this.scene.add(missile);
    
    // Add exhaust effect
    this.createMissileExhaust(missile);
  }
  
  updateProjectiles(enemies) {
    for (let i = this.missiles.length - 1; i >= 0; i--) {
      const missile = this.missiles[i];
      
      // Check if it's an enemy bullet
      if (missile.isEnemyBullet) {
        this.updateEnemyBullet(missile, i);
      } else {
        this.updatePlayerMissile(missile, i, enemies);
      }
    }
  }
  
  updateEnemyBullet(bullet, index) {
    // Update enemy bullet position
    bullet.position.add(bullet.velocity);
    
    // Check for player collision
    if (bullet.position.distanceTo(this.player.position) < 3) {
      // Player hit by enemy bullet
      this.player.takeDamage(10);
      createExplosion(this.scene, bullet.position, new THREE.Color(0xff0000), 0.3);
      this.scene.remove(bullet);
      this.missiles.splice(index, 1);
      return;
    }
    
    // Remove bullet if it's too far away or lifetime expired
    bullet.lifetime--;
    if (bullet.lifetime <= 0 || bullet.position.distanceTo(this.player.position) > 500) {
      this.scene.remove(bullet);
      this.missiles.splice(index, 1);
    }
  }
  
  updatePlayerMissile(missile, index, enemies) {
    // Decrease lifetime
    missile.lifetime--;
    if (missile.lifetime <= 0) {
      // Create small explosion when missile expires
      createExplosion(this.scene, missile.position, new THREE.Color(0x00ff00), 0.5);
      
      // Remove target tracking
      if (missile.missileId && this.targetedEnemies.has(missile.missileId)) {
        this.targetedEnemies.delete(missile.missileId);
      }
      
      // Remove missile and its exhaust
      if (missile.exhaust) this.scene.remove(missile.exhaust);
      this.scene.remove(missile);
      this.missiles.splice(index, 1);
      return;
    }
    
    // Update missile tracking
    if (missile.target) {
      // Check if target still exists
      if (!enemies.includes(missile.target)) {
        // If this was our current target, clear it
        if (this.currentTarget === missile.target) {
          this.currentTarget = null;
        }
        
        // Target destroyed, find new one
        let newTarget = this.findBestTarget(missile.position, missile.quaternion, enemies);
        
        // Update target in tracking map
        if (missile.missileId && this.targetedEnemies.has(missile.missileId)) {
          if (newTarget) {
            this.targetedEnemies.get(missile.missileId).enemy = newTarget;
          } else {
            this.targetedEnemies.delete(missile.missileId);
          }
        }
        
        missile.target = newTarget;
      }
      
      if (missile.target) {
        // Calculate direction to target
        const targetDir = new THREE.Vector3().subVectors(
          missile.target.position,
          missile.position
        ).normalize();
        
        // Calculate current direction
        const currentDir = new THREE.Vector3(0, 0, 1).applyQuaternion(missile.quaternion);
        
        // Gradually turn toward target
        const angle = currentDir.angleTo(targetDir);
        if (angle > 0.01) {
          const axis = new THREE.Vector3().crossVectors(currentDir, targetDir).normalize();
          const rotationAmount = Math.min(missile.turnSpeed, angle);
          const rotationQuaternion = new THREE.Quaternion().setFromAxisAngle(axis, rotationAmount);
          missile.quaternion.premultiply(rotationQuaternion);
        }
      }
    }
    
    // Update velocity direction based on missile's orientation
    const direction = new THREE.Vector3(0, 0, 1).applyQuaternion(missile.quaternion);
    missile.velocity.lerp(direction.multiplyScalar(missile.maxSpeed), 0.1);
    
    // Accelerate missile
    const currentSpeed = missile.velocity.length();
    if (currentSpeed < missile.maxSpeed) {
      missile.velocity.normalize().multiplyScalar(currentSpeed + missile.acceleration);
    }
    
    // Update position
    missile.position.add(missile.velocity);
    
    // Update exhaust position
    if (missile.exhaust) {
      missile.exhaust.position.copy(missile.position);
      missile.exhaust.quaternion.copy(missile.quaternion);
      
      // Add random movement to exhaust particles
      missile.exhaust.children.forEach(particle => {
        particle.position.set(
          (Math.random() - 0.5) * 0.2 - 0.5,
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2 - 0.5
        );
      });
    }
    
    // Check for enemy hits
    for (let j = enemies.length - 1; j >= 0; j--) {
      const enemy = enemies[j];
      if (missile.position.distanceTo(enemy.position) < 3) {
        // Create explosion
        createExplosion(this.scene, enemy.position, enemy.material.color, 
          enemy.type === 'bomber' ? 1.5 : enemy.type === 'scout' ? 0.8 : 1.0);
        
        // Score points based on enemy type (handled by EnemyManager)
        
        // Remove target tracking
        if (missile.missileId && this.targetedEnemies.has(missile.missileId)) {
          this.targetedEnemies.delete(missile.missileId);
        }
        
        // Remove missile and its exhaust
        if (missile.exhaust) this.scene.remove(missile.exhaust);
        this.scene.remove(missile);
        this.missiles.splice(index, 1);
        
        // Remove enemy (handled by EnemyManager)
        // Using a separate call to avoid modifying the array during iteration
        const targetEvent = new CustomEvent('missileHit', { 
          detail: { enemy, index: j } 
        });
        window.dispatchEvent(targetEvent);
        break;
      }
    }
  }
  
  createMissileExhaust(missile) {
    const exhaustParticles = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const particle = new THREE.LineSegments(
        new THREE.WireframeGeometry(new THREE.SphereGeometry(0.1)),
        new THREE.LineBasicMaterial({ color: 0x00ffff })
      );
      exhaustParticles.add(particle);
    }
    missile.exhaust = exhaustParticles;
    this.scene.add(exhaustParticles);
  }
  
  findBestTarget(position, playerQuaternion, enemies) {
    if (enemies.length === 0) return null;
    
    // Get player's forward direction
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(playerQuaternion);
    
    // Score each enemy based on angle and distance
    const targetScores = enemies.map(enemy => {
      const toEnemy = new THREE.Vector3().subVectors(enemy.position, position).normalize();
      const distance = position.distanceTo(enemy.position);
      
      // Calculate angle between forward vector and direction to enemy
      const angle = forward.angleTo(toEnemy);
      
      // Score: lower is better, prioritize enemies in front (smaller angle)
      // and closer enemies (smaller distance), but angle is more important
      const angleWeight = 2.0; // Higher weight makes angle more important than distance
      const score = (angle * angleWeight) + (distance / this.targetLockRange);
      
      return { enemy, score, angle, distance };
    });
    
    // Filter those in range and sort by score
    const validTargets = targetScores
      .filter(t => t.distance < this.targetLockRange)
      .sort((a, b) => a.score - b.score);
    
    return validTargets.length > 0 ? validTargets[0].enemy : null;
  }
  
  isEnemyInRange(enemy) {
    if (!enemy) return false;
    
    const distance = this.player.position.distanceTo(enemy.position);
    if (distance > this.targetLockRange) return false;
    
    // Optionally, check if in field of view
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(this.player.mesh.quaternion);
    const toEnemy = new THREE.Vector3().subVectors(enemy.position, this.player.position).normalize();
    const angle = forward.angleTo(toEnemy);
    
    // Field of view angle in radians (roughly 60 degrees)
    return angle < Math.PI / 3;
  }
  
  addEnemyBullet(bullet) {
    this.missiles.push(bullet);
    this.scene.add(bullet);
  }
  
  reset() {
    // Clear all missiles
    this.missiles.forEach(missile => {
      if (missile.exhaust) this.scene.remove(missile.exhaust);
      this.scene.remove(missile);
    });
    this.missiles = [];
    
    // Reset missile count
    this.missileCount = 5;
    this.missileRechargeTime = 0;
    
    // Clear targeting data
    this.targetedEnemies.clear();
    this.currentTarget = null;
  }
  
  getMissileData() {
    return {
      count: this.missileCount,
      maxMissiles: this.maxMissiles,
      targetedEnemies: this.targetedEnemies,
      currentTarget: this.currentTarget
    };
  }
}