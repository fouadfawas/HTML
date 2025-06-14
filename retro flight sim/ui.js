import * as THREE from 'three';

export class UIManager {
  constructor(player, enemyManager, weaponSystem, getScore, getGameActive, getGravity, camera) {
    this.player = player;
    this.enemyManager = enemyManager;
    this.weaponSystem = weaponSystem;
    this.getScore = getScore;
    this.getGameActive = getGameActive;
    this.getGravity = getGravity;
    this.camera = camera;
    
    this.radarUpdateTimer = 0;
    
    // Listen for enemy hit events
    window.addEventListener('missileHit', (e) => {
      const { enemy, index } = e.detail;
      this.enemyManager.destroyEnemy(enemy, index);
    });
  }
  
  update() {
    this.updateHUD();
    this.updateRadar(); 
    this.updateOrientationIndicator();
    this.updateTargetingUI();
    this.updateMissileUI();
  }
  
  updateHUD() {
    // Update basic HUD elements
    document.getElementById('speedValue').textContent = 
      Math.round((this.player.currentSpeed / this.player.maxSpeed) * 100);
    document.getElementById('altValue').textContent = 
      Math.round(this.player.position.y);
    document.getElementById('scoreValue').textContent = 
      this.getScore();
    document.getElementById('healthFill').style.width = `${this.player.health}%`;
  }
  
  updateRadar() {
    const radarElement = document.querySelector('.radar');
    
    // Create radar elements if they don't exist
    if (!radarElement) {
      const radar = document.createElement('div');
      radar.className = 'radar';
      
      const radarLine = document.createElement('div');
      radarLine.className = 'radar-line';
      radar.appendChild(radarLine);
      
      const playerMarker = document.createElement('div');
      playerMarker.className = 'player-marker';
      radar.appendChild(playerMarker);
      
      // Insert radar at the top left
      radar.style.position = 'absolute';
      radar.style.top = '30px';
      radar.style.left = '450px';
      document.body.appendChild(radar);
    }

    // Clear old blips
    const oldBlips = document.querySelectorAll('.radar-blip');
    oldBlips.forEach(blip => blip.remove());
    
    // Add enemy blips
    this.enemyManager.enemies.forEach(enemy => {
      // Calculate relative position
      const relX = enemy.position.x - this.player.position.x;
      const relZ = enemy.position.z - this.player.position.z;
      
      // Scale to radar size (90px is radar radius)
      const radarRange = 500; 
      const blipX = (relX / radarRange) * 90;
      const blipZ = (relZ / radarRange) * 90;
      
      // Only show if within radar range
      if (Math.abs(blipX) <= 90 && Math.abs(blipZ) <= 90) {
        const blip = document.createElement('div');
        blip.className = 'radar-blip';
        blip.style.left = `calc(50% + ${blipX}px)`;
        blip.style.top = `calc(50% + ${blipZ}px)`;
        
        // Bigger blips for different enemy types
        if (enemy.type === 'bomber') {
          blip.style.width = '8px';
          blip.style.height = '8px';
        }
        
        document.querySelector('.radar').appendChild(blip);
      }
    });
  }
  
  updateOrientationIndicator() {
    // Calculate the horizon line rotation based on player roll
    const playerQuaternion = this.player.mesh.quaternion;
    const worldUp = new THREE.Vector3(0, 1, 0);
    
    // Calculate roll angle
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(playerQuaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(playerQuaternion);
    const playerUp = new THREE.Vector3(0, 1, 0).applyQuaternion(playerQuaternion);
    
    // Calculate roll (rotation around forward axis)
    const rollAngle = Math.atan2(
      right.dot(worldUp),
      playerUp.dot(worldUp)
    ) * (180 / Math.PI);
    
    // Calculate pitch (rotation around right axis)
    const pitchAngle = Math.asin(forward.dot(worldUp)) * (180 / Math.PI);
    
    // Apply rotation to orientation indicator
    document.querySelector('.orientation-horizon').style.transform = `rotate(${-rollAngle}deg)`;
    
    // Move the marker to show pitch
    const markerOffset = Math.min(Math.max(pitchAngle * 1.5, -40), 40);
    document.querySelector('.orientation-marker').style.transform = `translateY(${markerOffset}px)`;
    
    // Color coding for orientation (green above horizon, blue below)
    const orientationMarker = document.querySelector('.orientation-marker');
    if (pitchAngle < -10) {
      orientationMarker.style.backgroundColor = "#00c0ff"; 
    } else if (pitchAngle > 10) {
      orientationMarker.style.backgroundColor = "#00ff00"; 
    } else {
      orientationMarker.style.backgroundColor = "#ffff00"; 
    }
  }
  
  updateTargetingUI() {
    // Clear all previous target indicators
    document.querySelectorAll('.target-indicator, .target-lock, .trajectory-line, .target-distance').forEach(el => el.remove());
    
    const missileData = this.weaponSystem.getMissileData();
    
    // Display current selected target
    if (missileData.currentTarget && this.weaponSystem.isEnemyInRange(missileData.currentTarget)) {
      const targetPos = missileData.currentTarget.position.clone().project(this.camera);
      
      // Only show if target is in front of camera
      if (targetPos.z <= 1) {
        const x = (targetPos.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-(targetPos.y * 0.5) + 0.5) * window.innerHeight;
        
        const targetIndicator = document.createElement('div');
        targetIndicator.className = 'target-indicator';
        targetIndicator.style.left = `${x - 15}px`; 
        targetIndicator.style.top = `${y - 15}px`;  
        targetIndicator.style.borderColor = '#ff0';
        document.body.appendChild(targetIndicator);
        
        // Add distance text
        const distance = Math.round(this.player.position.distanceTo(missileData.currentTarget.position));
        const distanceTag = document.createElement('div');
        distanceTag.className = 'target-distance';
        distanceTag.textContent = `${distance}m`;
        distanceTag.style.left = `${x}px`;
        distanceTag.style.top = `${y + 20}px`;
        document.body.appendChild(distanceTag);
      }
    }
    
    // Update missile target UI
    missileData.targetedEnemies.forEach((targetData, missileId) => {
      const missile = targetData.missile;
      const enemy = targetData.enemy;
      
      if (!missile || !enemy || !this.weaponSystem.missiles.includes(missile) || 
          !this.enemyManager.enemies.includes(enemy)) {
        this.weaponSystem.targetedEnemies.delete(missileId);
        return;
      }
      
      this.updateTargetUI(missile, enemy);
    });
  }
  
  updateTargetUI(missile, enemy) {
    // Project enemy position to screen coordinates
    const enemyPosition = enemy.position.clone();
    const tempV = enemyPosition.project(this.camera);
    const x = (tempV.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-(tempV.y * 0.5) + 0.5) * window.innerHeight;
    
    // Only show if enemy is in front of camera
    if (tempV.z > 1) return;
    
    // Create target lock indicator
    const targetLock = document.createElement('div');
    targetLock.className = 'target-lock';
    
    // Size based on distance (closer = bigger)
    const distance = missile.position.distanceTo(enemy.position);
    const size = Math.max(20, Math.min(60, 1000 / distance));
    targetLock.style.width = `${size}px`;
    targetLock.style.height = `${size}px`;
    
    // Position
    targetLock.style.left = `${x}px`;
    targetLock.style.top = `${y}px`;
    
    // Calculate missile speed
    const missileSpeed = missile.velocity.length().toFixed(1);
    
    // Add information text
    targetLock.innerHTML = `
      <span>${distance.toFixed(0)}m</span>
      <span>${missileSpeed}m/s</span>
    `;
    
    document.body.appendChild(targetLock);
    
    // Add trajectory line from missile to target
    const missilePos = missile.position.clone().project(this.camera);
    const missileX = (missilePos.x * 0.5 + 0.5) * window.innerWidth;
    const missileY = (-(missilePos.y * 0.5) + 0.5) * window.innerHeight;
    
    // Only draw if missile is in view
    if (missilePos.z <= 1) {
      const trajectory = document.createElement('div');
      trajectory.className = 'trajectory-line';
      
      // Calculate line length and angle
      const dx = x - missileX;
      const dy = y - missileY;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      
      // Set line properties
      trajectory.style.width = `${length}px`;
      trajectory.style.left = `${missileX}px`;
      trajectory.style.top = `${missileY}px`;
      trajectory.style.transform = `rotate(${angle}deg)`;
      
      document.body.appendChild(trajectory);
    }
  }
  
  updateMissileUI() {
    const missileData = this.weaponSystem.getMissileData();
    const missileContainer = document.getElementById('missileContainer');
    if (!missileContainer) return;
    
    // Clear existing missile icons
    missileContainer.innerHTML = '';
    
    // Add missile icons based on current count
    for (let i = 0; i < missileData.count; i++) {
      const missileIcon = document.createElement('div');
      missileIcon.className = 'missile-icon';
      missileContainer.appendChild(missileIcon);
    }
    
    // Add empty missile icons for remaining slots
    for (let i = missileData.count; i < missileData.maxMissiles; i++) {
      const emptyIcon = document.createElement('div');
      emptyIcon.className = 'missile-icon';
      emptyIcon.style.opacity = '0.3';
      missileContainer.appendChild(emptyIcon);
    }
  }
  
  showMessage(text, duration = 2000) {
    const messageEl = document.getElementById('gameMessage');
    messageEl.textContent = text;
    messageEl.style.opacity = 1;
    
    setTimeout(() => {
      messageEl.style.opacity = 0;
    }, duration);
  }
  
  showGameOver(score, restartCallback) {
    // Remove any existing game over menu first
    const existingMenu = document.querySelector('.game-over-menu');
    if (existingMenu) {
      existingMenu.remove();
    }
    
    const gameOverMenu = document.createElement('div');
    gameOverMenu.className = 'game-over-menu';
    gameOverMenu.innerHTML = `
      <div class="game-over-content">
        <h2>SYSTEM FAILURE</h2>
        <p>Final Score: ${score}</p>
        <button id="restartButton">RESTART MISSION</button>
      </div>
    `;
    document.body.appendChild(gameOverMenu);
    
    // Add event listener to restart button with a one-time event listener
    // to prevent multiple restarts if button is clicked multiple times
    const restartButton = document.getElementById('restartButton');
    if (restartButton) {
      restartButton.addEventListener('click', function handleRestart() {
        // Remove the event listener to prevent multiple calls
        restartButton.removeEventListener('click', handleRestart);
        // Call the restart callback
        restartCallback();
      });
    }
  }
}