// Core game class, significantly reduced from original
import * as THREE from 'three';
import { Player } from './player.js';
import { EnemyManager } from './enemies.js';
import { WeaponSystem } from './weapons.js';
import { UIManager } from './ui.js';
import { GeometryFactory } from './geometryFactory.js';
import { TerrainGenerator } from './terrainGenerator.js';
import { CameraController } from './cameraController.js';
import { MobileControls } from './mobileControls.js';

export class Game {
  constructor() {
    this.setupEngine();
    this.setupGameState();
    this.setupSubsystems();
    
    // Add mobile controls
    this.mobileControls = new MobileControls();
    this.keys = this.mobileControls.keys;
    
    this.bindEvents();
    this.setupThemeControls();
    
    this.animate();
  }

  setupEngine() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    this.renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById('gameCanvas'),
      antialias: true
    });
    
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // The terrain generator replaces the simple grid
    this.terrainGenerator = new TerrainGenerator(this.scene);
  }

  setupGameState() {
    this.score = 0;
    this.gameActive = true;
    this.gravity = 0.01;
    this.hasGravity = true;
    this.groundLevel = this.terrainGenerator.getGroundLevel(); // Get ground level from terrain
    this.gKeyPressed = false;
    this.cKeyPressed = false;
  }

  setupSubsystems() {
    this.geometryFactory = new GeometryFactory();
    
    this.player = new Player(this.scene, this.geometryFactory);
    this.player.mesh.position.y = 100; // Start higher above terrain
    
    this.weaponSystem = new WeaponSystem(this.scene, this.player, this.geometryFactory);
    
    this.enemyManager = new EnemyManager(
      this.scene, 
      this.player, 
      this.geometryFactory, 
      this.weaponSystem,
      () => this.score,
      (points) => { this.score += points; },
      this.hasGravity,
      this.groundLevel,
      this.gravity
    );
    
    this.ui = new UIManager(
      this.player,
      this.enemyManager,
      this.weaponSystem,
      () => this.score,
      () => this.gameActive,
      () => this.hasGravity,
      this.camera
    );
    
    // Initialize camera controller
    this.cameraController = new CameraController(this.camera, this.player);
    
    // Initialize camera behind player
    this.camera.position.set(0, 155, -10);
    this.camera.lookAt(this.player.mesh.position);
  }

  setupThemeControls() {
    document.querySelectorAll('.theme-button').forEach(button => {
      button.addEventListener('click', () => {
        // Remove active class from all buttons
        document.querySelectorAll('.theme-button').forEach(b => 
          b.classList.remove('active'));
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Apply theme
        const theme = button.dataset.theme;
        this.terrainGenerator.applyTheme(theme);
      });
    });
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    
    if (this.gameActive) {
      // Update mobile controls
      this.mobileControls.update();
      
      // Toggle gravity
      if (this.keys['KeyG'] && !this.gKeyPressed) {
        this.hasGravity = !this.hasGravity;
        this.gKeyPressed = true;
        this.ui.showMessage(this.hasGravity ? "GRAVITY ON" : "GRAVITY OFF", 1500);
        this.enemyManager.setGravity(this.hasGravity);
      }
      if (!this.keys['KeyG']) {
        this.gKeyPressed = false;
      }
      
      // Toggle camera mode
      if (this.keys['KeyC'] && !this.cKeyPressed) {
        this.cameraController.cycleMode();
        this.cKeyPressed = true;
        
        const modes = {
          'chase': 'CHASE CAMERA',
          'cockpit': 'COCKPIT VIEW',
          'tactical': 'TACTICAL VIEW',
          'orbit': 'ORBIT CAMERA',
          'cinematic': 'CINEMATIC CAMERA'
        };
        this.ui.showMessage(modes[this.cameraController.currentMode], 1500);
      }
      if (!this.keys['KeyC']) {
        this.cKeyPressed = false;
      }
      
      // Update terrain chunks around player
      this.terrainGenerator.update(this.player.position);
      
      // Get height at player position for ground collision
      const terrainHeight = this.terrainGenerator.getHeightAt(
        this.player.position.x, 
        this.player.position.z
      );
      
      // Update subsystems
      this.player.update(this.keys, this.hasGravity, this.gravity, terrainHeight);
      this.weaponSystem.update(this.keys, this.enemyManager.enemies);
      this.enemyManager.update();
      
      // Check if player died
      if (this.player.health <= 0) {
        this.gameActive = false;
        this.ui.showGameOver(this.score, () => this.restartGame());
      }
    }
    
    // Update camera using the camera controller
    this.cameraController.update(this.keys, this.weaponSystem.getMissileData());
    
    // Update UI elements
    this.ui.update();
    
    // Render scene
    this.renderer.render(this.scene, this.camera);
  }

  restartGame() {
    // Remove the game over menu
    const gameOverMenu = document.querySelector('.game-over-menu');
    if (gameOverMenu) {
      gameOverMenu.remove();
    }
    
    // Reset game state
    this.gameActive = true;
    this.score = 0;
    
    // Reset subsystems
    this.player.reset();
    this.weaponSystem.reset();
    this.enemyManager.reset();
    
    // Reset camera position and mode
    this.cameraController.reset();
    
    // Clear any active messages
    const messageEl = document.getElementById('gameMessage');
    if (messageEl) {
      messageEl.style.opacity = 0;
    }
    
    // Show restart message
    this.ui.showMessage("SYSTEM REBOOTED", 3000);
  }
}