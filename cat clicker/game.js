// DOM Elements and Audio Setup
const cat = document.getElementById('cat');
const score = document.getElementById('score');
const cpsDisplay = document.getElementById('cps');
const upgradesList = document.getElementById('upgradesList');
const musicToggle = document.getElementById('musicToggle');
const settingsModal = document.getElementById('settings-modal');
const musicSelect = document.getElementById('music-select');
const closeSettings = document.getElementById('close-settings');
const rebirthButton = document.getElementById('rebirthButton');
const rebirthInfo = document.getElementById('rebirth-info');
const shopButton = document.getElementById('shopButton');
const shopModal = document.getElementById('shop-modal');
const closeShop = document.getElementById('close-shop');
const skinsContainer = document.getElementById('skins-container');
const splashScreen = document.getElementById('splash-screen');
const mainGame = document.getElementById('main-game');
const themeToggleCheckbox = document.getElementById('theme-toggle');
const boostInfo = document.getElementById('boost-info');
const settingsButton = document.getElementById('settingsButton'); // Get the settings button element

// Audio Initialization
let audioContext;
let clickBuffer, dingBuffer, backgroundMusicBuffer, shopMusicBuffer;
let currentBackgroundSource = null;
let currentShopSource = null;
let backgroundMusicVolume = 0.5;
let shopMusicVolume = 0.3;

async function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        // Wait for user interaction before trying to resume context
        document.body.addEventListener('click', () => {
             if (audioContext && audioContext.state === 'suspended') {
                audioContext.resume().catch(e => console.error("Failed to resume AudioContext on click:", e));
            }
        }, { once: true }); // Only need to do this once

        clickBuffer = await loadSound('Click.mp3');
        dingBuffer = await loadSound('ding.mp3');
        backgroundMusicBuffer = await loadSound('music.mp3'); // Load default music buffer
        shopMusicBuffer = await loadSound('1-23. OG (Classic).mp3');
    } catch (error) {
        console.error("Audio initialization failed:", error);
    }
}

async function loadSound(url) {
    if (!audioContext) {
        console.error("AudioContext not initialized. Cannot load sound.");
        return null;
    }
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        return audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
        console.error('Error loading sound:', url, error);
        return null;
    }
}

function playSound(buffer) {
    if (!buffer || !audioContext || audioContext.state === 'suspended') {
        // Attempt to resume audio context if suspended, but don't error out here
        if (audioContext && audioContext.state === 'suspended') {
             audioContext.resume().catch(e => console.error("Failed to resume AudioContext for sound:", e));
        }
        return;
    }

    try {
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start(0);
    } catch (error) {
         console.error("Error playing sound:", error);
    }
}

function createLoopingSource(buffer, volume) {
    if (!buffer || !audioContext || audioContext.state === 'suspended') {
        console.warn("Cannot create looping source. AudioContext state:", audioContext ? audioContext.state : 'null');
        return null;
    }
     try {
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        const gainNode = audioContext.createGain();
        gainNode.gain.value = volume;
        source.connect(gainNode).connect(audioContext.destination);
        return source;
     } catch (error) {
        console.error("Error creating looping source:", error);
        return null;
     }
}

function startMusic(type) {
    if (!audioContext) return;

    if (audioContext.state === 'suspended') {
        audioContext.resume().catch(e => console.error("Failed to resume AudioContext:", e));
        // Music will attempt to start after resume if successful
        return;
    }

    let buffer;
    let currentSource;
    let otherSource;
    let volume;

    if (type === 'background') {
        buffer = backgroundMusicBuffer;
        currentSource = currentBackgroundSource;
        otherSource = currentShopSource;
        volume = backgroundMusicVolume;
        gameState.musicPlaying = true; // Assume success for now, handle errors below
    } else if (type === 'shop') {
        buffer = shopMusicBuffer;
        currentSource = currentShopSource;
        otherSource = currentBackgroundSource;
        volume = shopMusicVolume;
    } else {
        return;
    }

    if (!buffer) {
        console.warn(`Music buffer for type "${type}" is not loaded.`);
        if (type === 'background') gameState.musicPlaying = false;
        return;
    }

    if (otherSource) {
        try {
            otherSource.stop(0);
        } catch (e) {
             console.warn(`Error stopping other music source: ${e.message}`);
        } finally {
             if (type === 'background') currentShopSource = null;
             if (type === 'shop') currentBackgroundSource = null;
        }
    }

     if (currentSource) {
        try {
            currentSource.stop(0);
        } catch (e) {
             console.warn(`Error stopping current music source: ${e.message}`);
        } finally {
            if (type === 'background') currentBackgroundSource = null;
            if (type === 'shop') currentShopSource = null;
        }
    }

    const newSource = createLoopingSource(buffer, volume);
    if (newSource) {
        try {
             newSource.start(0);
             if (type === 'background') {
                 currentBackgroundSource = newSource;
             } else {
                 currentShopSource = newSource;
             }
        } catch (error) {
            console.error(`Error starting music source for type "${type}":`, error);
             if (type === 'background') currentBackgroundSource = null;
             if (type === 'shop') currentShopSource = null;
             if (type === 'background') gameState.musicPlaying = false; // Revert state on error
        }
    } else {
        console.error(`Failed to create music source for type "${type}".`);
         if (type === 'background') gameState.musicPlaying = false; // Revert state on error
    }
}


function stopMusic(type) {
    if (!audioContext) return;

    let currentSource;
    if (type === 'background') {
        currentSource = currentBackgroundSource;
        gameState.musicPlaying = false;
    } else if (type === 'shop') {
        currentSource = currentShopSource;
    } else {
        return;
    }

    if (currentSource) {
        try {
            currentSource.stop(0);
        } catch (e) {
            console.warn(`Error stopping music source for type "${type}": ${e.message}`);
        } finally {
            if (type === 'background') currentBackgroundSource = null;
            if (type === 'shop') currentShopSource = null;
        }
    }
}


let gameState = {
  cats: 0,
  clickPower: 1,
  catsPerSecond: 0,
  musicPlaying: false,
  firstClick: true,
  rebirthLevel: 0,
  rebirthMultiplier: 1,
  currentSkin: 'cat.webp',
  ownedSkins: ['cat.webp'],
  controllerConnected: false,
  selectedUpgradeIndex: -1,
  controllerMode: false,
  isDarkMode: false,
  activeBoost: null
};

const upgrades = [
  {
    id: 'clickPower',
    name: 'sharper claws',
    description: 'cats per click +1',
    baseCost: 10,
    count: 0,
    costMultiplier: 1.5,
    effect: () => { /* Effect is applied by recalculating total click power */ }
  },
  {
    id: 'kitten',
    name: 'kitten helper',
    description: 'generates 0.1 cats per second',
    baseCost: 15,
    count: 0,
    costMultiplier: 1.15,
    cpsBonus: 0.1,
    effect: () => { /* Effect is applied by recalculating total CPS */ }
  },
  {
    id: 'catTree',
    name: 'cat tree',
    description: 'generates 1 cat per second',
    baseCost: 100,
    count: 0,
    costMultiplier: 1.2,
    cpsBonus: 1,
    effect: () => { /* Effect is applied by recalculating total CPS */ }
  },
  {
    id: 'autoFeeder',
    name: 'automatic feeder',
    description: 'generates 5 cats per second',
    baseCost: 500,
    count: 0,
    costMultiplier: 1.3,
    cpsBonus: 5,
    effect: () => { /* Effect is applied by recalculating total CPS */ }
  },
   {
    id: 'clickBoost',
    name: 'click boost ',
    description: '2x click power for 30 seconds',
    baseCost: 1000,
    count: 0,
    costMultiplier: 2,
    isBoost: true,
    effect: () => {
        const duration = 30;
        const multiplier = 2;
        if (gameState.activeBoost && gameState.activeBoost.timer) {
             clearTimeout(gameState.activeBoost.timer);
        } else if (gameState.activeBoost && !gameState.activeBoost.timer) {
             recalculateStats();
        }


        gameState.activeBoost = {
            type: 'clickMultiplier',
            multiplier: multiplier,
            duration: duration,
            endTime: Date.now() + duration * 1000,
            timer: null
        };

        recalculateStats();

        showBoostInfo();

        gameState.activeBoost.timer = setTimeout(endActiveBoost, duration * 1000);
    }
   },
  {
    id: 'catCafe',
    name: 'cat cafe',
    description: 'generates 20 cats per second',
    baseCost: 3000,
    count: 0,
    costMultiplier: 1.4,
    cpsBonus: 20,
    effect: () => { /* Effect is applied by recalculating total CPS */ }
  },
  {
    id: 'laserPointer',
    name: 'laser pointer',
    description: 'generates 50 cats per second',
    baseCost: 10000,
    count: 0,
    costMultiplier: 1.5,
    cpsBonus: 50,
    effect: () => { /* Effect is applied by recalculating total CPS */ }
  },
  {
    id: 'catShelter',
    name: 'cat shelter',
    description: 'generates 100 cats per second',
    baseCost: 50000,
    count: 0,
    costMultiplier: 1.6,
    cpsBonus: 100,
    effect: () => { /* Effect is applied by recalculating total CPS */ }
  },
  {
    id: 'catnipFarm',
    name: 'catnip farm',
    description: 'generates 250 cats per second',
    baseCost: 250000,
    count: 0,
    costMultiplier: 1.7,
    cpsBonus: 250,
    effect: () => { /* Effect is applied by recalculating total CPS */ }
  },
  {
    id: 'catTechnology',
    name: 'cat tech startup',
    description: 'generates 1000 cats per second',
    baseCost: 1000000,
    count: 0,
    costMultiplier: 1.8,
    cpsBonus: 1000,
    effect: () => { /* Effect is applied by recalculating total CPS */ }
  },
  {
    id: 'catCorporation',
    name: 'cat corporation',
    description: 'generates 5,000 cats per second',
    baseCost: 5000000,
    count: 0,
    costMultiplier: 1.9,
    cpsBonus: 5000,
    effect: () => { /* Effect is applied by recalculating total CPS */ }
  },
  {
    id: 'catGalaxy',
    name: 'cat galaxy',
    description: 'generates 25,000 cats per second',
    baseCost: 25000000,
    count: 0,
    costMultiplier: 2.0,
    cpsBonus: 25000,
    effect: () => { /* Effect is applied by recalculating total CPS */ }
  },
  {
    id: 'catUniverse',
    name: 'cat universe',
    description: 'generates 100,000 cats per second',
    baseCost: 100000000,
    count: 0,
    costMultiplier: 2.2,
    cpsBonus: 100000,
    effect: () => { /* Effect is applied by recalculating total CPS */ }
  }
];

const achievements = [
  { id: 'first10', name: 'cat collector ', requirement: 10, achieved: false },
  { id: 'first100', name: 'cat enthusiast ', requirement: 100, achieved: false },
  { id: 'first1000', name: 'cat master ', requirement: 1000, achieved: false },
  { id: 'cps10', name: 'cat factory ', requirement: 10, type: 'cps', achieved: false }
];

function endActiveBoost() {
  if (gameState.activeBoost) {
    gameState.activeBoost = null;
    recalculateStats();
    boostInfo.style.display = 'none';
    updateDisplay();
  }
}

function showBoostInfo() {
  if (gameState.activeBoost) {
    boostInfo.style.display = 'block';
    const updateBoostTimer = () => {
      if (gameState.activeBoost) {
        const remainingTime = Math.ceil((gameState.activeBoost.endTime - Date.now()) / 1000);
        if (remainingTime > 0) {
          boostInfo.textContent = `boost: ${gameState.activeBoost.multiplier}x for ${remainingTime}s`;
          requestAnimationFrame(updateBoostTimer);
        } else {
          boostInfo.style.display = 'none';
        }
      } else {
         boostInfo.style.display = 'none';
      }
    };
    updateBoostTimer();
  }
}


function recalculateStats() {
    gameState.catsPerSecond = 0;
    gameState.clickPower = 1 * gameState.rebirthMultiplier;

    upgrades.forEach(u => {
        if (u.cpsBonus) {
            gameState.catsPerSecond += u.cpsBonus * u.count;
        }
        if (u.id === 'clickPower') {
            gameState.clickPower += u.count;
        }
    });

    if (gameState.activeBoost && gameState.activeBoost.type === 'clickMultiplier') {
        gameState.clickPower *= gameState.activeBoost.multiplier;
    }
}


function applyTheme() {
  if (gameState.isDarkMode) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
}

function setupThemeToggle() {
    themeToggleCheckbox.checked = gameState.isDarkMode;
    themeToggleCheckbox.addEventListener('change', () => {
        gameState.isDarkMode = themeToggleCheckbox.checked;
        applyTheme();
        saveGameState();
    });
}

setInterval(() => {
  if (gameState.catsPerSecond > 0) {
    gameState.cats += gameState.catsPerSecond / 10;
    updateDisplay();
  }
}, 100);

function saveGameState() {
  const saveData = {
    ...gameState,
    upgrades: upgrades.map(u => ({
      id: u.id,
      count: u.count
    })),
    musicTrack: musicSelect.value,
    ownedSkins: gameState.ownedSkins,
    currentSkin: gameState.currentSkin,
    isDarkMode: gameState.isDarkMode,
    activeBoost: gameState.activeBoost ? {
        type: gameState.activeBoost.type,
        multiplier: gameState.activeBoost.multiplier,
        duration: gameState.activeBoost.duration,
        endTime: gameState.activeBoost.endTime
    } : null
  };
  localStorage.setItem('catClickerSave', JSON.stringify(saveData));
}

async function loadGameState() {
  const savedState = JSON.parse(localStorage.getItem('catClickerSave') || '{}');

  gameState = {
    cats: savedState.cats || 0,
    clickPower: 1,
    catsPerSecond: 0,
    musicPlaying: savedState.musicPlaying || false,
    firstClick: savedState.firstClick !== false,
    rebirthLevel: savedState.rebirthLevel || 0,
    rebirthMultiplier: savedState.rebirthMultiplier || 1 + (savedState.rebirthLevel || 0) * 0.5,
    currentSkin: savedState.currentSkin || 'cat.webp',
    ownedSkins: savedState.ownedSkins || ['cat.webp'],
    controllerConnected: false,
    selectedUpgradeIndex: -1,
    controllerMode: false,
    isDarkMode: savedState.isDarkMode !== undefined ? savedState.isDarkMode : false,
    activeBoost: savedState.activeBoost || null
  };

  cat.src = sanitizeURL(gameState.currentSkin);

  if (savedState.ownedSkins) {
    skins.forEach(skin => {
      skin.owned = gameState.ownedSkins.includes(skin.path);
    });
  }

  if (savedState.upgrades) {
    savedState.upgrades.forEach(savedUpgrade => {
      const upgrade = upgrades.find(u => u.id === savedUpgrade.id);
      if (upgrade) {
        upgrade.count = savedUpgrade.count;
      }
    });
  }

  recalculateStats();

  if (gameState.activeBoost) {
      if (Date.now() < gameState.activeBoost.endTime) {
          const remainingDuration = (gameState.activeBoost.endTime - Date.now());
          gameState.activeBoost.timer = setTimeout(endActiveBoost, remainingDuration);
          showBoostInfo();
      } else {
          gameState.activeBoost = null;
      }
  }

  const allowedTracks = ['music.mp3', 'music2.mp3'];
  const savedTrack = savedState.musicTrack;
  const sanitizedTrack = allowedTracks.includes(savedTrack) ? savedTrack : 'music.mp3';

  // Load the saved track buffer only if it's different from the default already loaded
  if (sanitizedTrack !== 'music.mp3') {
      backgroundMusicBuffer = await loadSound(sanitizedTrack);
  }


  musicSelect.value = sanitizedTrack;

  musicToggle.innerHTML = gameState.musicPlaying ? ' music on/off' : ' music on/off';

  updateDisplay();
  renderUpgrades();
  applyTheme();
}

function sanitizeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function sanitizeURL(url) {
  if (url === '') return '';
  // Relaxed regex to allow more characters but still prevent directory traversal or schemes
  if (!/^[a-zA-Z0-9 _.\/-]+\.(mp3|webp|png|gif|otf|ttf|otf|css)$/.test(url)) {
    console.error('Invalid URL format:', url);
    return 'cat.webp'; // Fallback to default
  }
   // Explicitly check for directory traversal patterns
  if (url.includes('../') || url.includes('././') || url.includes('//')) {
      console.error('Invalid URL (potential path traversal attempt):', url);
      return 'cat.webp'; // Fallback to default
  }
   // Prevent scheme usage (e.g., http:, data:)
  if (url.includes(':') && url.indexOf(':') < url.indexOf('/')) {
      console.error('Invalid URL (scheme attempt):', url);
      return 'cat.webp'; // Fallback to default
  }
  return url;
}

function handleCatClick(event) {
  gameState.cats += gameState.clickPower;
  updateDisplay();
  playSound(clickBuffer);

   if (gameState.firstClick && !gameState.musicPlaying) {
       startMusic('background'); // Removed .catch() as startMusic doesn't return a Promise
       gameState.firstClick = false;
   }
}

async function toggleMusic() {
    if (gameState.musicPlaying) {
        stopMusic('background');
         musicToggle.innerHTML = ' music on/off';
    } else {
        const selectedTrack = sanitizeURL(musicSelect.value || 'music.mp3');
        const allowedTracks = ['music.mp3', 'music2.mp3'];
        const finalTrack = allowedTracks.includes(selectedTrack) ? selectedTrack : 'music.mp3';

        // Only load if the buffer isn't already loaded for the selected track
        // This comparison might be too simple, consider storing buffers by URL
        const newBuffer = await loadSound(finalTrack);

        if (newBuffer) {
             backgroundMusicBuffer = newBuffer; // Update the main background buffer
             startMusic('background');
             gameState.musicPlaying = true; // Set to true if startMusic proceeds
             musicToggle.innerHTML = ' music on/off';
        } else {
            console.error(`Failed to load music track: ${finalTrack}`);
            gameState.musicPlaying = false; // Ensure state is false if load fails
        }
    }
    saveGameState();
}


async function changeBackgroundMusic() {
  const sanitizedValue = sanitizeURL(musicSelect.value);
  const allowedTracks = ['music.mp3', 'music2.mp3'];
  const finalTrack = allowedTracks.includes(sanitizedValue) ? sanitizedValue : 'music.mp3';

  // Only load if the buffer isn't already loaded for the selected track
  // This might be overly simplistic, a better approach might store buffers by URL
   const newBuffer = await loadSound(finalTrack);

  if (newBuffer) {
      backgroundMusicBuffer = newBuffer; // Update the main background buffer
       if (gameState.musicPlaying) {
           startMusic('background'); // Restart music with the new buffer
      }
       saveGameState();
  } else {
      console.error(`Failed to load new music track: ${finalTrack}`);
      // Revert select value or handle error state if loading fails
      musicSelect.value = gameState.musicPlaying ? (currentBackgroundSource?.buffer === backgroundMusicBuffer ? 'music.mp3' : 'music2.mp3') : ''; // Attempt to revert to currently playing or default
  }
}

// createSettingsButton is no longer needed as the button is in the HTML

function initializeEventListeners() {
  cat.addEventListener('click', handleCatClick);
  // Removed the duplicate click listener that also calls toggleMusic

  musicToggle.addEventListener('click', toggleMusic);

  musicSelect.addEventListener('change', changeBackgroundMusic);

  // Settings button listener
  if (settingsButton) { // Check if element exists before adding listener
      settingsButton.addEventListener('click', () => {
           settingsModal.style.display = 'block';
      });
  } else {
      console.error("Settings button not found in DOM.");
  }

  closeSettings.addEventListener('click', () => {
    settingsModal.style.display = 'none';
  });

  setInterval(saveGameState, 30000);
  window.addEventListener('beforeunload', saveGameState);
}

function setupRebirthSystem() {
  rebirthButton.addEventListener('click', performRebirth);
  updateRebirthButton();
}

function updateRebirthButton() {
  const rebirthCost = calculateRebirthCost();
  rebirthButton.textContent = `rebirth: ${formatNumber(rebirthCost)} cats`;
  rebirthButton.disabled = gameState.cats < rebirthCost;
  rebirthInfo.textContent = `rebirth level: ${gameState.rebirthLevel} (×${gameState.rebirthMultiplier.toFixed(1)} bonus)`;
}

function calculateRebirthCost() {
  return 1000000 * Math.pow(10, gameState.rebirthLevel);
}

function performRebirth() {
  const rebirthCost = calculateRebirthCost();

  if (gameState.cats >= rebirthCost) {
    const rebirthEffect = document.createElement('div');
    rebirthEffect.classList.add('rebirth-effect');
    document.body.appendChild(rebirthEffect);

    setTimeout(() => {
      rebirthEffect.style.opacity = '1';
    }, 10);

    setTimeout(() => {
      gameState.rebirthLevel++;
      gameState.rebirthMultiplier = 1 + (gameState.rebirthLevel * 0.5);

      gameState.cats = 0;
      gameState.catsPerSecond = 0;

      upgrades.forEach(upgrade => {
         upgrade.count = 0;
      });

      recalculateStats();

      updateDisplay();
      renderUpgrades();
      updateRebirthButton();

      rebirthEffect.style.opacity = '0';
      setTimeout(() => {
        rebirthEffect.remove();
      }, 1000);

      saveGameState();

    }, 1500);
  }
}

function formatNumber(num) {
  if (num < 1000) return Math.floor(num);
  if (num < 1000000) return (num / 1000).toFixed(1) + 'k';
  if (num < 1000000000) return (num / 1000000).toFixed(1) + 'm';
  return (num / 1000000000).toFixed(1) + 'b';
}

function checkAchievements() {
  achievements.forEach(achievement => {
    if (!achievement.achieved) {
      if (achievement.type === 'cps' && gameState.catsPerSecond >= achievement.requirement) {
        showAchievement(achievement.name);
        achievement.achieved = true;
      } else if (gameState.cats >= achievement.requirement && !achievement.type) { // Check for total cats if type is not specified
          showAchievement(achievement.name);
          achievement.achieved = true;
      }
    }
  });
}

function showAchievement(name) {
  const achievement = document.createElement('div');
  achievement.classList.add('achievement');
  achievement.textContent = `achievement unlocked: ${sanitizeHTML(name)}!`;
  document.body.appendChild(achievement);

  setTimeout(() => {
    achievement.remove();
  }, 4000);
}

function updateDisplay() {
  score.textContent = `cats: ${formatNumber(gameState.cats)}`;
  cpsDisplay.textContent = `per second: ${formatNumber(gameState.catsPerSecond * 10)}`;
  renderUpgrades();
  updateRebirthButton();
  checkAchievements(); // Check for achievements on display update
  if (shopModal.style.display === 'block') {
      document.getElementById('shop-cats-count').textContent = formatNumber(gameState.cats);
  }
  // Update boost info if active
  if (gameState.activeBoost && boostInfo.style.display !== 'block') {
      showBoostInfo();
  } else if (!gameState.activeBoost && boostInfo.style.display === 'block') {
      boostInfo.style.display = 'none';
  }
}

function renderUpgrades() {
  upgradesList.innerHTML = '';
  upgrades.forEach(upgrade => {
    const upgradeElement = document.createElement('div');
    upgradeElement.classList.add('upgrade');

    const currentCost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.count));
    const canAfford = gameState.cats >= currentCost;

    if (!canAfford) {
      upgradeElement.classList.add('disabled');
    }

    const sanitizedName = sanitizeHTML(upgrade.name);
    const sanitizedDescription = sanitizeHTML(upgrade.description);
    const sanitizedCost = sanitizeHTML(formatNumber(currentCost));
    const sanitizedCount = sanitizeHTML(upgrade.count);

    upgradeElement.innerHTML = `
      <div class="upgrade-name">${sanitizedName}</div>
      <div class="upgrade-description">${sanitizedDescription}</div>
      <div class="upgrade-cost">cost: ${sanitizedCost} cats</div>
      <div class="upgrade-count">owned: ${sanitizedCount}</div>
    `;

    upgradeElement.addEventListener('click', () => {
      if (canAfford) {
        if (!upgrade.isBoost) {
          gameState.cats -= currentCost;
          upgrade.count++;
        } else {
           // Boosts don't increase count, just trigger effect if affordable
            gameState.cats -= currentCost;
        }

        recalculateStats();
        updateDisplay();
        if (upgrade.effect && upgrade.isBoost) {
            upgrade.effect();
        }
        playSound(clickBuffer);
        saveGameState();
      }
    });

    upgradesList.appendChild(upgradeElement);
  });
}

let skins = [
  {
    id: 'default',
    name: 'default cat',
    path: 'cat.webp',
    cost: 0,
    owned: true
  },
  {
    id: 'glorp',
    name: 'alien cat',
    path: 'glorp.png',
    cost: 5000,
    owned: false
  },
  {
    id: 'maxwell',
    name: 'dancing maxwell',
    path: 'maxwell-cat.gif',
    cost: 25000,
    owned: false
  },
  {
    id: 'suitcat',
    name: 'business cat',
    path: 'suitcat.gif',
    cost: 100000,
    owned: false
  },
  {
    id: 'vibingcat',
    name: 'vibing kitten',
    path: 'vibingcat.png',
    cost: 250000,
    owned: false
  },
  {
    id: 'sillycat',
    name: 'silly cat',
    path: 'silly cat.webp',
    cost: 500000,
    owned: false
  },
  {
    id: 'thumbsupcat',
    name: 'approving cat',
    path: 'thumbsupcat.webp',
    cost: 1000000,
    owned: false
  },
  {
    id: 'scratchcat',
    name: 'scratch cat',
    path: 'scratchcat.png',
    cost: 2500000,
    owned: false
  },
  {
    id: 'blehcat',
    name: 'bleh cat',
    path: 'blehcat.webp',
    cost: 5000000,
    owned: false
  },
  {
    id: 'oiiacat',
    name: 'rainbow cat',
    path: 'oiiacat.gif',
    cost: 10000000,
    owned: false
  },
  {
    id: 'goldcat',
    name: 'golden cat',
    path: 'goldcat.png',
    cost: 50000000,
    owned: false
  }
];

function initializeShop() {
  renderSkins();

  shopButton.addEventListener('click', () => {
    shopModal.style.display = 'block';
    document.querySelector('.shop-tab[data-tab="locker"]').classList.add('active');
    document.querySelector('.shop-tab[data-tab="shop"]').classList.remove('active');
    document.querySelector('.shop-tab[data-tab="battlepass"]').classList.remove('active');
    renderSkins('locker');

    startMusic('shop');
  });

  document.querySelectorAll('.shop-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderSkins(tab.getAttribute('data-tab'));
    });
  });

  closeShop.addEventListener('click', () => {
    shopModal.style.display = 'none';
    stopMusic('shop');
    if (gameState.musicPlaying) {
      startMusic('background');
    }
  });
}

function renderSkins(tabType = 'locker') {
  skinsContainer.innerHTML = '';
  skinsContainer.classList.add('vertical-layout');

  const previewSection = document.createElement('div');
  previewSection.classList.add('skin-preview-section');
  previewSection.innerHTML = `
    <div class="skin-preview-container">
      <img id="skin-large-preview" src="${sanitizeURL('cat.webp')}" alt="Skin Preview">
      <div class="skin-preview-details">
        <h2 id="skin-preview-name">Select a Skin</h2>
        <p id="skin-preview-cost">Cost: N/A</p>
      </div>
    </div>
  `;
  skinsContainer.appendChild(previewSection);

  const skinsGridSection = document.createElement('div');
  skinsGridSection.classList.add('skins-grid-section');

  document.getElementById('shop-cats-count').textContent = sanitizeHTML(formatNumber(gameState.cats));

  const shopTitle = document.getElementById('shop-title');
  const sanitizedTabType = sanitizeHTML(tabType);
  if (sanitizedTabType === 'locker') {
    shopTitle.textContent = 'Cat Skins Locker';
  } else if (sanitizedTabType === 'shop') {
    shopTitle.textContent = 'Cat Skins Shop';
  } else {
    shopTitle.textContent = 'Cat Battle Pass';
  }

  const filteredSkins = skins.filter(skin => {
    if (sanitizedTabType === 'locker') return skin.owned;
    if (sanitizedTabType === 'shop') return !skin.owned;
    if (sanitizedTabType === 'battlepass') return false;
  });

  if (filteredSkins.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.classList.add('empty-tab-message');
    if (sanitizedTabType === 'locker') {
      emptyMessage.textContent = 'You don\'t own any skins yet. Visit the shop to purchase some!';
    } else if (sanitizedTabType === 'shop') {
      emptyMessage.textContent = 'You own all available skins!';
    } else {
      emptyMessage.textContent = 'Battle Pass coming soon!';
    }
    skinsGridSection.appendChild(emptyMessage);
  } else {
    filteredSkins.forEach(skin => {
      const skinElement = document.createElement('div');
      skinElement.classList.add('skin-grid-item');
      
      if (skin.owned) {
        skinElement.classList.add('owned');
      }
      
      if (gameState.currentSkin === skin.path) {
        skinElement.classList.add('selected');
      }
      
      const sanitizedSkinPath = sanitizeURL(skin.path);
      const sanitizedSkinName = sanitizeHTML(skin.name);
      const sanitizedSkinStatus = skin.owned ? 
        (gameState.currentSkin === skin.path ? 'EQUIPPED' : 'OWNED') : 
        `${sanitizeHTML(formatNumber(skin.cost))} CATS`;
      
      skinElement.innerHTML = `
        <img src="${sanitizedSkinPath}" alt="${sanitizedSkinName}" class="skin-grid-thumbnail">
        <div class="skin-grid-details">
          <div class="skin-name">${sanitizedSkinName}</div>
          <div class="skin-status">${sanitizedSkinStatus}</div>
        </div>
      `;
      
      skinElement.addEventListener('mouseover', () => {
        const previewImg = document.getElementById('skin-large-preview');
        const previewName = document.getElementById('skin-preview-name');
        const previewCost = document.getElementById('skin-preview-cost');
        
        previewImg.src = sanitizedSkinPath;
        previewName.textContent = sanitizedSkinName;
        previewCost.textContent = skin.owned ? 'OWNED' : `Cost: ${sanitizeHTML(formatNumber(skin.cost))} cats`;
      });
      
      skinElement.addEventListener('click', () => {
        if (skin.owned) {
          gameState.currentSkin = sanitizedSkinPath; 
          cat.src = sanitizedSkinPath; 
          renderSkins(tabType);
          saveGameState();
        } else if (gameState.cats >= skin.cost) {
          gameState.cats -= skin.cost;
          skin.owned = true;
          gameState.ownedSkins.push(sanitizedSkinPath); 
          gameState.currentSkin = sanitizedSkinPath; 
          cat.src = sanitizedSkinPath; 
          updateDisplay();
          renderSkins(tabType);
          saveGameState();
          
          playSound(dingBuffer);
          
          const notification = document.createElement('div');
          notification.classList.add('achievement');
          notification.textContent = `New skin unlocked: ${sanitizedSkinName}!`; 
          document.body.appendChild(notification);
          
          setTimeout(() => {
            notification.remove();
          }, 4000);
        }
      });
      
      skinsGridSection.appendChild(skinElement);
    });
  }
  
  skinsContainer.appendChild(skinsGridSection);
}

document.addEventListener('DOMContentLoaded', async () => {
  await initAudio();
  
  splashScreen.addEventListener('animationend', () => {
    mainGame.style.display = 'block'; 
    splashScreen.style.display = 'none'; 
  });

  loadGameState();
  renderUpgrades();
  updateDisplay();
  initializeEventListeners();
  setupRebirthSystem();
  initializeShop();
  
  backgroundMusicBuffer = await loadSound('music.mp3');
  musicSelect.value = 'music.mp3';
  
  gameState.musicPlaying = false;
  gameState.firstClick = true;  
  musicToggle.innerHTML = ' music on/off';
  setupThemeToggle();
});