import * as THREE from 'three';
import { createExplosion } from './effects.js';

export class EnemyManager {
  constructor(scene, player, geometryFactory, weaponSystem, getScore, updateScore, hasGravity, groundLevel, gravity) {
    this.scene = scene;
    this.player = player;
    this.geometryFactory = geometryFactory;
    this.weaponSystem = weaponSystem;
    this.getScore = getScore;
    this.updateScore = updateScore;
    
    this.enemies = [];
    this.hasGravity = hasGravity;
    this.groundLevel = groundLevel;
    this.gravity = gravity;
  }
  
  update() {
    this.spawnEnemies();
    this.updateEnemies();
  }
  
  spawnEnemies() {
    // Reduced spawn rate - only 0.5% chance per frame
    if (Math.random() < 0.005 && this.enemies.length < 10) {
      // Determine enemy type based on score and randomness
      let enemyType, color, speed, health;
      const score = this.getScore();
      const rand = Math.random();
      
      if (score > 1000 && rand < 0.2) {
        enemyType = 'bomber';
        color = 0xff3300;
        speed = 0.3;
        health = 3;
      } else if (score > 500 && rand < 0.4) {
        enemyType = 'scout';
        color = 0xffff00;
        speed = 0.8;
        health = 1;
      } else {
        enemyType = 'fighter';
        color = 0xff0000;
        speed = 0.5;
        health = 2;
      }
      
      this.createEnemy(enemyType, color, speed, health);
    }
  }
  
  createEnemy(type, color, speed, health) {
    const geometry = this.geometryFactory.createEnemyGeometry(type);
    const material = new THREE.LineBasicMaterial({ color: color });
    const wireframe = new THREE.WireframeGeometry(geometry);
    const enemy = new THREE.LineSegments(wireframe, material);
    
    enemy.scale.set(2, 2, 2);
    enemy.type = type;
    enemy.health = health;
    enemy.maxSpeed = speed;
    enemy.attackTimer = 0;
    enemy.originalColor = color;
    
    // Spawn enemies around the player, with wider distance range
    const distance = 300 + Math.random() * 500;
    const angle = Math.random() * Math.PI * 2;
    
    enemy.position.set(
      this.player.position.x + Math.cos(angle) * distance,
      50 + Math.random() * 150, // Higher spawn altitude range
      this.player.position.z + Math.sin(angle) * distance
    );
    
    enemy.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.2,
      (Math.random() - 0.5) * 0.1,
      (Math.random() - 0.5) * 0.2
    );
    
    // Add behavior pattern
    enemy.behavior = ['approach', 'circle', 'attack'][Math.floor(Math.random() * 3)];
    enemy.behaviorTimer = 100 + Math.random() * 200;
    enemy.behaviorTarget = new THREE.Vector3();
    
    this.enemies.push(enemy);
    this.scene.add(enemy);
    
    return enemy;
  }
  
  updateEnemies() {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      
      // Behavior timer
      enemy.behaviorTimer--;
      if (enemy.behaviorTimer <= 0) {
        // Change behavior
        const behaviors = ['approach', 'circle', 'attack'];
        enemy.behavior = behaviors[Math.floor(Math.random() * behaviors.length)];
        enemy.behaviorTimer = 100 + Math.random() * 200;
        
        // Set new target for circling
        if (enemy.behavior === 'circle') {
          this.setCirclingTarget(enemy);
        }
      }
      
      // Execute behavior
      this.executeEnemyBehavior(enemy, i);
      
      // Apply gravity to enemies if enabled
      if (this.hasGravity && enemy.position.y > this.groundLevel) {
        enemy.velocity.y -= this.gravity * 0.5; // Half the gravity effect of player
      }
      
      // Apply velocity
      enemy.position.add(enemy.velocity);
      
      // Keep enemies above ground - now using dynamic ground level
      const terrainHeight = Math.max(this.groundLevel, window.game.terrainGenerator.getHeightAt(
        enemy.position.x, enemy.position.z
      ));
      
      if (enemy.position.y < terrainHeight) {
        enemy.position.y = terrainHeight;
        enemy.velocity.y = Math.max(0, enemy.velocity.y);
      }
      
      // Check for collision with player
      if (enemy.position.distanceTo(this.player.position) < 5) {
        // Damage based on enemy type and relative speed
        const relativeVelocity = new THREE.Vector3().subVectors(
          this.player.mesh.velocity,
          enemy.velocity
        ).length();
        
        const damage = Math.round(20 + relativeVelocity * 10);
        this.player.takeDamage(damage);
        
        // Create explosion at collision point
        const collisionPoint = new THREE.Vector3().addVectors(
          this.player.position,
          enemy.position
        ).multiplyScalar(0.5);
        
        createExplosion(this.scene, collisionPoint, new THREE.Color(0xff5500), 1.5);
        
        // Remove enemy
        this.scene.remove(enemy);
        this.enemies.splice(i, 1);
        
        continue;
      }
      
      // Rotate enemy to face direction of travel
      if (enemy.velocity.lengthSq() > 0.01) {
        const lookPoint = new THREE.Vector3().copy(enemy.position).add(enemy.velocity);
        enemy.lookAt(lookPoint);
      }
    }
  }
  
  executeEnemyBehavior(enemy, index) {
    let targetVelocity = new THREE.Vector3();
    
    switch(enemy.behavior) {
      case 'approach':
        // Move toward player but maintain distance
        targetVelocity.subVectors(this.player.position, enemy.position)
          .normalize()
          .multiplyScalar(enemy.maxSpeed * 0.5);
        break;
        
      case 'circle':
        // Circle around the player
        const toTarget = new THREE.Vector3().subVectors(enemy.behaviorTarget, enemy.position);
        
        if (toTarget.length() < 10) {
          this.setCirclingTarget(enemy);
        }
        
        targetVelocity.copy(toTarget).normalize().multiplyScalar(enemy.maxSpeed);
        break;
        
      case 'attack':
        // Move directly toward player at full speed
        targetVelocity.subVectors(this.player.position, enemy.position)
          .normalize()
          .multiplyScalar(enemy.maxSpeed);
        
        // Occasionally shoot at player if close enough
        enemy.attackTimer--;
        if (enemy.attackTimer <= 0 && 
            enemy.position.distanceTo(this.player.position) < 100) {
          this.enemyShoot(enemy);
          enemy.attackTimer = enemy.type === 'bomber' ? 30 : 
                             enemy.type === 'scout' ? 60 : 45;
        }
        break;
    }
    
    // Apply velocity changes with smoothing
    enemy.velocity.lerp(targetVelocity, 0.05);
  }
  
  setCirclingTarget(enemy) {
    const circleCenter = new THREE.Vector3().copy(this.player.position);
    const circleRadius = 50 + Math.random() * 50;
    const angle = Math.random() * Math.PI * 2;
    
    enemy.behaviorTarget.copy(circleCenter).add(
      new THREE.Vector3(
        Math.cos(angle) * circleRadius,
        (Math.random() - 0.5) * 30,
        Math.sin(angle) * circleRadius
      )
    );
  }
  
  enemyShoot(enemy) {
    // Different bullet appearance based on enemy type
    const bulletColor = enemy.type === 'bomber' ? 0xff5500 : 
                        enemy.type === 'scout' ? 0xffff00 : 0xff0000;
    
    const bulletGeometry = new THREE.SphereGeometry(0.2);
    const bulletMaterial = new THREE.LineBasicMaterial({ color: bulletColor });
    const wireframe = new THREE.WireframeGeometry(bulletGeometry);
    const bullet = new THREE.LineSegments(wireframe, bulletMaterial);
    
    bullet.position.copy(enemy.position);
    
    // Direction toward player with some inaccuracy
    const direction = new THREE.Vector3()
      .subVectors(this.player.position, enemy.position)
      .normalize();
    
    // Add some inaccuracy based on enemy type
    const inaccuracy = enemy.type === 'bomber' ? 0.2 : 
                      enemy.type === 'scout' ? 0.05 : 0.1;
    
    direction.x += (Math.random() - 0.5) * inaccuracy;
    direction.y += (Math.random() - 0.5) * inaccuracy;
    direction.z += (Math.random() - 0.5) * inaccuracy;
    direction.normalize();
    
    bullet.velocity = direction.multiplyScalar(
      enemy.type === 'bomber' ? 1.5 : 
      enemy.type === 'scout' ? 2.5 : 2.0
    );
    
    bullet.isEnemyBullet = true;
    bullet.lifetime = 300;
    
    this.weaponSystem.addEnemyBullet(bullet);
  }
  
  destroyEnemy(enemy, index) {
    // Score based on enemy type
    const points = enemy.type === 'bomber' ? 300 : 
                  enemy.type === 'scout' ? 100 : 200;
    this.updateScore(points);
    
    // Create explosion based on enemy size
    const explosionScale = enemy.type === 'bomber' ? 1.5 : 
                         enemy.type === 'scout' ? 0.8 : 1.0;
    createExplosion(this.scene, enemy.position, new THREE.Color(enemy.originalColor), explosionScale);
    
    // Remove enemy
    this.scene.remove(enemy);
    this.enemies.splice(index, 1);
  }
  
  setGravity(enabled) {
    this.hasGravity = enabled;
  }
  
  reset() {
    // Remove all enemies
    this.enemies.forEach(enemy => this.scene.remove(enemy));
    this.enemies = [];
  }
}