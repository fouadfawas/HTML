document.addEventListener('DOMContentLoaded', () => {
  const bgMusic = document.getElementById('bgMusic');
  const shopMusic = document.getElementById('shopMusic');
  const clickSound = document.getElementById('clickSound');
  const explodeSound = document.getElementById('explodeSound');
  const tadaSound = document.getElementById('tadaSound');
  const errorSound = document.getElementById('errorSound');
  const eatingSound = document.getElementById('eatingSound');
  
  // Add an array to keep track of all music elements
  const allMusicElements = [
    bgMusic, 
    shopMusic, 
    document.getElementById('activitiesMusic'),
    new Audio('Raise_A_Floppa_Soundtrack_[_YouConvert.net_].mp3'), // floppaMusic
    new Audio('wii sport theme.mp3') // hotPotatoMusic
  ];
  
  const noob = document.getElementById('noob');
  const explosionContainer = document.getElementById('explosionContainer');
  const robuxCounter = document.getElementById('robuxCounter');
  const shopIcon = document.getElementById('shopIcon');
  const shopOverlay = document.getElementById('shopOverlay');
  const shopScreen = document.getElementById('shopScreen');
  const exitOverlay = document.getElementById('exitOverlay');

  const hungerCounter = document.getElementById('hungerCounter');
  const feedingIcon = document.getElementById('feedingIcon');
  const feedingOverlay = document.getElementById('feedingOverlay');
  const feedingScreen = document.getElementById('feedingScreen');
  const feedingExitIcon = document.getElementById('feedingExitIcon');
  const feedingExitOverlay = document.getElementById('feedingExitOverlay');

  let robux = 0;
  let robuxMultiplier = 1;
  let clickUpgradeCost = 20;
  let autoClickerCost = 55;
  let autoClickerInterval = null;
  let autoClickerMultiplier = 1;

  // Happiness upgrades
  let hasTv = false;
  let tvCooldown = false;
  let tvCost = 300;
  let tvBoostActive = false;
  let tvBoostTimeout = null;
  
  let hasToy = false;
  let toyCooldown = false;
  let toyCost = 150;
  
  let hasRoomba = false;
  let roombaCost = 500;
  let roombaInterval = null;

  let hunger = 100;
  let inventory = [];
  let currentTableFood = null;
  let isSick = false;
  let sickTimeout = null;

  let usedCodes = {};

  const initialNoobY = window.innerHeight / 2;
  let currentNoobX = window.innerWidth / 2;
  let currentNoobY = initialNoobY;

  let gameOverTriggered = false; // Flag to prevent multiple game over triggers

  const floppaMusic = allMusicElements[3];
  floppaMusic.loop = true;
  floppaMusic.volume = 0;

  const activitiesMusic = allMusicElements[2];
  activitiesMusic.loop = true;
  activitiesMusic.volume = 0;
  
  const hotPotatoMusic = allMusicElements[4];
  hotPotatoMusic.loop = true;
  hotPotatoMusic.volume = 0;

  let happiness = 100;
  let canSelectFood = true; // Add flag to track if food can be selected

  let musicEnabled = true;
  let soundEffectsEnabled = true;
  let performanceMode = false;
  let saveSlots = [null, null, null]; // Three save slots (0 is auto-save)
  let autoSaveInterval;

  const settingsIcon = document.getElementById('settingsIcon');
  const settingsScreen = document.getElementById('settingsScreen');
  const settingsOverlay = document.querySelector('.settings-overlay');
  const settingsCloseBtn = document.getElementById('settingsCloseBtn');
  const musicToggle = document.getElementById('musicToggle');
  const soundEffectsToggle = document.getElementById('soundEffectsToggle');
  const performanceToggle = document.getElementById('performanceToggle');
  const savesTabBtn = document.getElementById('savesTabBtn');
  const settingsTabBtn = document.getElementById('settingsTabBtn');
  const savesContent = document.getElementById('savesContent');
  const settingsContent = document.getElementById('settingsContent');

  function moveNoob() {
    const noobWidth = noob.offsetWidth;
    const noobHeight = noob.offsetHeight;
    const maxX = window.innerWidth - noobWidth;
    const maxY = window.innerHeight / 2;
    const minY = window.innerHeight - noobHeight;

    // Scale movement range and speed based on happiness
    const happinessScale = Math.max(0.2, happiness / 100);
    const moveRange = maxX * happinessScale;
    const moveSpeed = 2 * happinessScale;

    const currentX = parseFloat(noob.style.left) || window.innerWidth / 2;
    const newX = currentX + (Math.random() * moveRange - moveRange / 2);
    // Ensure noob stays within bounds
    const boundedX = Math.min(Math.max(0, newX), maxX);
    
    const newY = Math.random() * (minY - maxY) + maxY;

    noob.style.transition = `left ${moveSpeed}s ease-in-out, top ${moveSpeed}s ease-in-out`;
    noob.style.left = `${boundedX}px`;
    noob.style.top = `${newY}px`;

    currentNoobX = boundedX;
    currentNoobY = newY;

    // Adjust move frequency based on happiness
    const moveDelay = 2000 + (4000 * (1 - happinessScale));
    setTimeout(moveNoob, moveDelay);
  }

  setTimeout(moveNoob, 3000);

  function updateRobuxDisplay() {
    robuxCounter.textContent = `Robux: ${robux}`;
  }

  function updateHungerDisplay() {
    hungerCounter.textContent = `Hunger: ${hunger}`;
  }

  function updateFridgeRobuxDisplay() {
    const display = document.getElementById('fridgeRobuxDisplay');
    if (display) {
      display.textContent = `Robux: ${robux}`;
    }
  }

  const originalUpdateRobuxDisplay = updateRobuxDisplay;
  updateRobuxDisplay = function() {
    originalUpdateRobuxDisplay();
    updateFridgeRobuxDisplay();
  };

  function updateHappinessDisplay() {
    document.getElementById('happinessCounter').textContent = `Happiness: ${happiness}`;
  }

  updateRobuxDisplay();
  updateHungerDisplay();
  updateHappinessDisplay();

  function fadeAudio(audioElement, targetVolume, duration) {
    const startVolume = audioElement.volume;
    const volumeDiff = targetVolume - startVolume;
    const steps = 10; // Reduced number of steps for shorter duration
    const stepTime = duration / steps;
    let currentStep = 0;

    const fadeInterval = setInterval(() => {
      currentStep++;
      if (currentStep <= steps) {
        audioElement.volume = startVolume + (volumeDiff * (currentStep / steps));
      } else {
        clearInterval(fadeInterval);
      }
    }, stepTime);
  }

  function stopAllMusic() {
    if (!musicEnabled) return;
    
    allMusicElements.forEach(audio => {
      if (audio) {
        fadeAudio(audio, 0, 300);
        setTimeout(() => {
          audio.pause();
          audio.currentTime = 0;
        }, 300);
      }
    });
  }
  
  function playMusic(audioElement) {
    if (!musicEnabled) return;
    
    stopAllMusic();
    
    setTimeout(() => {
      if (audioElement) {
        audioElement.currentTime = 0; // Reset the audio to start
        audioElement.play().catch(e => console.log('Music playback failed:', e));
        fadeAudio(audioElement, 1, 300);
      }
    }, 300);
  }

  function checkAndPlayMusic() {
    if (hunger <= 0 || !musicEnabled) {
      // If music is disabled or hunger is 0, stop all music
      stopAllMusic();
      return;
    }
    
    // Don't change music during transitions
    if (shopOverlay.style.opacity === '1' || 
        exitOverlay.style.opacity === '1' || 
        feedingOverlay.style.opacity === '1' || 
        feedingExitOverlay.style.opacity === '1' || 
        document.getElementById('activitiesOverlay').style.opacity === '1' || 
        document.getElementById('activitiesExitOverlay').style.opacity === '1') {
      return;
    }
    
    // Don't repeatedly trigger music that's already playing
    const activeMusic = allMusicElements.find(audio => !audio.paused);
    
    if (shopScreen.style.opacity !== '1' && feedingScreen.style.opacity !== '1' && document.getElementById('activitiesScreen').style.opacity !== '1') {
      if (activeMusic !== bgMusic) {
        playMusic(bgMusic);
      }
    } else if (shopScreen.style.opacity === '1') {
      if (activeMusic !== shopMusic) {
        playMusic(shopMusic);
      }
    } else if (feedingScreen.style.opacity === '1') {
      if (activeMusic !== floppaMusic) {
        playMusic(floppaMusic);
      }
    } else if (document.getElementById('activitiesScreen').style.opacity === '1') {
      // Only play activities music if we're not in the hot potato game
      if (!document.getElementById('hotPotatoGameContainer').classList.contains('visible') && activeMusic !== activitiesMusic) {
        playMusic(activitiesMusic);
      }
    }
  }

  function updateSettingsVisibility() {
    settingsIcon.style.display = 
      (shopScreen.style.opacity !== '1' && 
       feedingScreen.style.opacity !== '1' && 
       document.getElementById('activitiesScreen').style.opacity !== '1') 
      ? 'block' : 'none';
  }

  // Check music status every second
  setInterval(checkAndPlayMusic, 1000);

  // Auto-save every 30 seconds
  autoSaveInterval = setInterval(() => {
    saveGameData(0); // Save to auto-save slot (index 0)
  }, 30000);

  function enterShop() {
    updateSettingsVisibility();
    shopScreen.style.opacity = '0';  
    shopScreen.style.pointerEvents = 'none';
    shopOverlay.style.opacity = '1';
    shopOverlay.style.pointerEvents = 'auto';
    
    stopAllMusic();

    setTimeout(() => {
      shopScreen.style.opacity = '1';
      setTimeout(() => {
        shopOverlay.style.opacity = '0';
        shopOverlay.style.pointerEvents = 'none';
        shopScreen.style.pointerEvents = 'auto';
        playMusic(shopMusic);
      }, 300);
    }, 300);
  }

  function exitShopFunc() {
    updateSettingsVisibility();
    exitOverlay.style.opacity = '1';
    exitOverlay.style.pointerEvents = 'auto';
    shopScreen.style.pointerEvents = 'none';
    
    stopAllMusic();

    setTimeout(() => {
      shopScreen.style.opacity = '0';
      
      setTimeout(() => {
        exitOverlay.style.opacity = '0';
        exitOverlay.style.pointerEvents = 'none';
        playMusic(bgMusic);
        settingsIcon.style.display = 'block';
      }, 300);
    }, 300);
  }

  function enterFeeding() {
    updateSettingsVisibility();
    feedingScreen.style.opacity = '0';  
    feedingScreen.style.pointerEvents = 'none';
    feedingOverlay.style.opacity = '1';
    feedingOverlay.style.pointerEvents = 'auto';
    
    stopAllMusic();

    setTimeout(() => {
      feedingScreen.style.opacity = '1';
      setTimeout(() => {
        feedingOverlay.style.opacity = '0';
        feedingOverlay.style.pointerEvents = 'none';
        feedingScreen.style.pointerEvents = 'auto';
        playMusic(floppaMusic);
      }, 300);
    }, 300);
  }

  function exitFeeding() {
    updateSettingsVisibility();
    feedingExitOverlay.style.opacity = '1';
    feedingExitOverlay.style.pointerEvents = 'auto';
    feedingScreen.style.pointerEvents = 'none';
    
    stopAllMusic();

    const fridgeScreen = document.getElementById('fridgeScreen');
    const fridgeOverlay = document.querySelector('.fridge-overlay');
    fridgeScreen.classList.remove('visible');
    fridgeOverlay.classList.remove('visible');

    setTimeout(() => {
      feedingScreen.style.opacity = '0';
      
      setTimeout(() => {
        feedingExitOverlay.style.opacity = '0';
        feedingExitOverlay.style.pointerEvents = 'none';
        playMusic(bgMusic);
        settingsIcon.style.display = 'block';
      }, 300);
    }, 300);
  }

  function enterActivities() {
    updateSettingsVisibility();
    document.getElementById('activitiesScreen').style.opacity = '0';  
    document.getElementById('activitiesScreen').style.pointerEvents = 'none';
    document.getElementById('activitiesOverlay').style.opacity = '1';
    document.getElementById('activitiesOverlay').style.pointerEvents = 'auto';
    
    stopAllMusic();

    setTimeout(() => {
      document.getElementById('activitiesScreen').style.opacity = '1';
      setTimeout(() => {
        document.getElementById('activitiesOverlay').style.opacity = '0';
        document.getElementById('activitiesOverlay').style.pointerEvents = 'none';
        document.getElementById('activitiesScreen').style.pointerEvents = 'auto';
        // Only play activities music if we're not in a game
        if (!document.getElementById('hotPotatoGameContainer').classList.contains('visible')) {
          playMusic(activitiesMusic);
        }
      }, 300);
    }, 300);
  }

  function exitActivities() {
    updateSettingsVisibility();
    document.getElementById('activitiesExitOverlay').style.opacity = '1';
    document.getElementById('activitiesExitOverlay').style.pointerEvents = 'auto';
    document.getElementById('activitiesScreen').style.pointerEvents = 'none';
    
    stopAllMusic();

    setTimeout(() => {
      document.getElementById('activitiesScreen').style.opacity = '0';
      
      setTimeout(() => {
        document.getElementById('activitiesExitOverlay').style.opacity = '0';
        document.getElementById('activitiesExitOverlay').style.pointerEvents = 'none';
        playMusic(bgMusic);
        settingsIcon.style.display = 'block';
      }, 300);
    }, 300);
  }

  function playSound(audioElement) {
    if (soundEffectsEnabled) {
      audioElement.currentTime = 0;
      audioElement.play().catch(e => console.log('Sound playback failed:', e));
    }
  }

  document.addEventListener('click', (e) => {
    if (soundEffectsEnabled) {
      clickSound.currentTime = 0;
      clickSound.play().catch(e => console.log('Click sound failed:', e));
    }
  });

  noob.addEventListener('click', (e) => {
    e.stopPropagation();

    if (hunger > 0) { 
      for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const colors = [
          '#00ff00',  // Bright green
          '#00ffff',  // Bright cyan
          '#ffff00'   // Bright yellow
        ];
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        particle.style.left = `${e.clientX}px`;
        particle.style.top = `${e.clientY}px`;
        
        const angle = (Math.random() * 360) * (Math.PI / 180);
        const velocity = Math.random() * 150 + 100; // Increased velocity range
        const x = Math.cos(angle) * velocity;
        const y = Math.sin(angle) * velocity;
        
        particle.style.setProperty('--x', `${x}px`);
        particle.style.setProperty('--y', `${y}px`);
        
        document.body.appendChild(particle);
        
        particle.addEventListener('animationend', () => {
          particle.remove();
        });
      }
    }

    // Calculate reward based on happiness and sickness
    let effectiveMultiplier = robuxMultiplier;
    
    // Reduce reward if sick
    if (isSick) {
      effectiveMultiplier = Math.floor(effectiveMultiplier / 2);
    }
    
    // Reduce reward based on happiness
    const happinessScale = Math.max(0.1, happiness / 100);
    effectiveMultiplier = Math.floor(effectiveMultiplier * happinessScale);
    
    // Ensure at least 1 robux per click
    effectiveMultiplier = Math.max(1, effectiveMultiplier);
    
    robux += effectiveMultiplier;
    updateRobuxDisplay();
    saveGameData(); // Save after earning robux

    // Create floating robux text effect
    const robuxText = document.createElement('div');
    robuxText.className = 'floating-robux';
    robuxText.textContent = `+${effectiveMultiplier}`;
    
    // Position at click location
    robuxText.style.left = `${e.clientX}px`;
    robuxText.style.top = `${e.clientY}px`;
    
    // Random movement direction
    const angle = (Math.random() * 360) * (Math.PI / 180);
    const distance = 50 + Math.random() * 30;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    robuxText.style.setProperty('--x', `${x}px`);
    robuxText.style.setProperty('--y', `${y}px`);
    
    document.body.appendChild(robuxText);
    
    setTimeout(() => {
      robuxText.remove();
    }, 1000);

    noob.classList.remove('noob-clicked');
    void noob.offsetWidth;
    noob.classList.add('noob-clicked');

    robuxCounter.classList.remove('robux-added');
    void robuxCounter.offsetWidth;
    robuxCounter.classList.add('robux-added');

    // Only show explosion if performance mode is disabled
    if (!performanceMode) {
      const explosion = document.createElement('img');
      explosion.src = 'explode.gif';
      explosion.className = 'explosion';

      const rect = noob.getBoundingClientRect();
      explosion.style.left = `${rect.left}px`;
      explosion.style.top = `${rect.top}px`;

      explosionContainer.appendChild(explosion);

      setTimeout(() => {
        explosion.remove();
      }, 1000);
    }

    playSound(explodeSound);
  });

  shopIcon.addEventListener('click', () => {
    if (shopOverlay.style.opacity !== '1' && exitOverlay.style.opacity !== '1') {
      enterShop();
    }
  });

  document.getElementById('shopExitIcon').addEventListener('click', () => {
    if (shopOverlay.style.opacity !== '1' && exitOverlay.style.opacity !== '1') {
      exitShopFunc();
    }
  });

  feedingIcon.addEventListener('click', () => {
    if (feedingOverlay.style.opacity !== '1' && feedingExitOverlay.style.opacity !== '1') {
      enterFeeding();
    }
  });

  feedingExitIcon.addEventListener('click', () => {
    if (feedingOverlay.style.opacity !== '1' && feedingExitOverlay.style.opacity !== '1') {
      exitFeeding();
    }
  });

  document.getElementById('activitiesIcon').addEventListener('click', () => {
    if (document.getElementById('activitiesOverlay').style.opacity !== '1' && document.getElementById('activitiesExitOverlay').style.opacity !== '1') {
      enterActivities();
    }
  });

  document.getElementById('activitiesExitIcon').addEventListener('click', () => {
    if (document.getElementById('activitiesOverlay').style.opacity !== '1' && document.getElementById('activitiesExitOverlay').style.opacity !== '1') {
      exitActivities();
    }
  });

  const fridge = document.getElementById('fridge');
  const fridgeScreen = document.getElementById('fridgeScreen');
  const fridgeOverlay = document.querySelector('.fridge-overlay');
  const shopTabBtn = document.getElementById('shopTabBtn');
  const inventoryTabBtn = document.getElementById('inventoryTabBtn');
  const fridgeShopContent = document.getElementById('fridgeShopContent');
  const fridgeInventoryContent = document.getElementById('fridgeInventoryContent');

  fridge.addEventListener('click', () => {
    fridgeScreen.classList.toggle('visible');
    fridgeOverlay.classList.toggle('visible');
    updateFridgeRobuxDisplay();
  });

  document.getElementById('fridgeCloseBtn').addEventListener('click', () => {
    fridgeScreen.classList.remove('visible');
    fridgeOverlay.classList.remove('visible');
    
    // Feed noob if there's food on the table
    if (currentTableFood) {
      const tableFood = document.getElementById('table-food');
      if (tableFood) {
        tableFood.style.display = 'block';
        
        setTimeout(() => {
          playSound(eatingSound);
          
          // Calculate how much this would increase hunger without limit
          const potentialHungerIncrease = currentTableFood.hunger;
          const currentHunger = hunger;
          
          // Apply hunger increase with limit of 100
          hunger = Math.min(100, hunger + currentTableFood.hunger);
          
          // Check if noob would have gone over 100 hunger by half the food's value
          if (currentHunger + (potentialHungerIncrease / 2) > 100) {
            // 25% chance to get sick from overeating
            if (Math.random() < 0.25) {
              makeNoobSick();
            }
          } else {
            // 3% chance to get sick from normal eating
            if (Math.random() < 0.03) {
              makeNoobSick();
            }
          }
          
          updateHungerDisplay();
          happiness = Math.min(100, happiness + Math.floor(currentTableFood.hunger / 2));
          updateHappinessDisplay();
          updateNoobAppearance();
          tableFood.style.display = 'none';
          currentTableFood = null;
          canSelectFood = true; // Allow selecting food again
          saveGameData(); // Save after feeding noob
        }, 1000);
      }
    }
  });

  shopTabBtn.addEventListener('click', () => {
    shopTabBtn.classList.add('active');
    inventoryTabBtn.classList.remove('active');
    fridgeShopContent.classList.remove('hidden');
    fridgeInventoryContent.classList.add('hidden');
  });

  inventoryTabBtn.addEventListener('click', () => {
    inventoryTabBtn.classList.add('active');
    shopTabBtn.classList.remove('active');
    fridgeInventoryContent.classList.remove('hidden');
    fridgeShopContent.classList.add('hidden');
    renderInventory();
  });

  document.querySelectorAll('.food-item').forEach(item => {
    item.addEventListener('click', () => {
      const cost = parseInt(item.dataset.cost);
      if (robux >= cost) {
        robux -= cost;
        updateRobuxDisplay();
        updateFridgeRobuxDisplay();
        inventory.push({
          type: item.dataset.food,
          name: item.querySelector('h3').textContent,
          image: item.querySelector('img').src,
          hunger: item.dataset.food === 'cookie' ? 20 : 50
        });
        playSound(tadaSound);
        renderInventory();
        saveGameData(); // Save after buying food
      } else {
        playSound(errorSound);
      }
    });
  });

  function renderInventory() {
    const inventorySlots = document.getElementById('inventorySlots');
    inventorySlots.innerHTML = '';
    
    inventory.forEach((item, index) => {
      const slot = document.createElement('div');
      slot.className = 'inventory-slot';
      slot.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <p>${item.name}</p>
      `;
      
      slot.addEventListener('click', () => {
        // Only allow selection if no food is currently on the table
        if (canSelectFood) {
          currentTableFood = item;
          inventory.splice(index, 1);
          renderInventory();
          
          // Show food on the table
          const tableFood = document.getElementById('table-food');
          if (tableFood) {
            tableFood.src = item.image;
            tableFood.style.display = 'block';
          }
          
          canSelectFood = false; // Prevent selecting another food
        } else {
          // Display error notification
          const notification = document.createElement('div');
          notification.className = 'error-notification';
          notification.textContent = "Noob is already eating something!";
          document.body.appendChild(notification);
          
          // Position in the center of the fridge screen
          const fridgeRect = document.getElementById('fridgeScreen').getBoundingClientRect();
          notification.style.top = (fridgeRect.top + 100) + 'px';
          notification.style.left = (fridgeRect.left + fridgeRect.width/2) + 'px';
          notification.style.transform = 'translateX(-50%)';
          
          setTimeout(() => {
            notification.remove();
          }, 2000);
          
          playSound(errorSound);
        }
      });
      
      inventorySlots.appendChild(slot);
    });
  }

  let hungerInterval = setInterval(() => {
    if (hunger > 0) {
      // Calculate hunger depletion multiplier based on happiness thresholds and sickness
      let hungerMultiplier;
      if (happiness >= 75) {
        hungerMultiplier = 1.2; // 90-75: 1.2x faster
      } else if (happiness >= 50) {
        hungerMultiplier = 1.7; // 74-50: 1.7x faster
      } else if (happiness >= 26) {
        hungerMultiplier = 2.4; // 49-26: 2.4x faster
      } else {
        hungerMultiplier = 3.0; // 25-0: 3x faster
      }
      
      // If sick, double hunger depletion
      if (isSick) {
        hungerMultiplier *= 2;
      }
      
      hunger -= hungerMultiplier;
      hunger = Math.max(0, Math.round(hunger)); // Ensure hunger doesn't go below 0
      updateHungerDisplay();
      if (hunger <= 0 && !gameOverTriggered) {
        gameOver();
        clearInterval(hungerInterval);
      }
    }
  }, 9000);

  let happinessInterval = setInterval(() => {
    if (happiness > 0) {
      // Calculate happiness decrease multiplier based on hunger
      let happinessMultiplier = 1;
      
      // The lower the hunger, the faster happiness decreases
      if (hunger <= 25) {
        happinessMultiplier = 3; // 3x faster at 0-25 hunger
      } else if (hunger <= 50) {
        happinessMultiplier = 2; // 2x faster at 26-50 hunger
      } else if (hunger <= 75) {
        happinessMultiplier = 1.5; // 1.5x faster at 51-75 hunger
      }
      
      // If sick, happiness decreases even faster
      if (isSick) {
        happinessMultiplier *= 2;
      }
      
      happiness -= happinessMultiplier;
      happiness = Math.max(0, Math.round(happiness)); // Ensure happiness doesn't go below 0
      updateHappinessDisplay();
      updateNoobAppearance();
    }
  }, 9000);

  function updateNoobAppearance() {
    const noobImages = [noob, document.getElementById('feedingNoob'), document.getElementById('gameNoob')];
  
    noobImages.forEach(img => {
      if (img) {
        if (isSick) {
          img.src = 'Screenshot_2025-02-23-21-58-08-028-removebg-preview.png';
          img.classList.add('sick-noob');
          img.classList.remove('sad-noob');
        } else if (happiness < 35 || hunger <= 35) { 
          img.src = 'Screenshot_2025-02-23-21-58-08-028-removebg-preview.png';
          img.classList.add('sad-noob');
          img.classList.remove('sick-noob');
        } else {
          img.src = 'Dancing_noob.webp';
          img.classList.remove('sad-noob');
          img.classList.remove('sick-noob');
        }
      }
    });
  }

  function showHappinessBoost(amount) {
    const happinessBoost = document.createElement('div');
    happinessBoost.className = 'happiness-boost';
    happinessBoost.textContent = `+${amount} Happiness`;
  
    // Position near the happiness counter
    const counter = document.getElementById('happinessCounter');
    const rect = counter.getBoundingClientRect();
    happinessBoost.style.left = `${rect.left}px`;
    happinessBoost.style.top = `${rect.top}px`;
  
    document.body.appendChild(happinessBoost);
  
    setTimeout(() => {
      happinessBoost.remove();
    }, 1500);
  }

  function makeNoobSick() {
    if (!isSick) {
      isSick = true;
      
      // Show sickness notification
      const sickNotification = document.createElement('div');
      sickNotification.className = 'sick-notification';
      sickNotification.textContent = 'Noob got sick!';
      document.body.appendChild(sickNotification);
      
      setTimeout(() => {
        sickNotification.remove();
      }, 3000);
      
      // Update noob appearance
      updateNoobAppearance();
      
      // Clear any existing timeout
      if (sickTimeout) clearTimeout(sickTimeout);
      
      // Set recovery timeout (1 minute)
      sickTimeout = setTimeout(() => {
        isSick = false;
        updateNoobAppearance();
        
        // Show recovery notification
        const recoveryNotification = document.createElement('div');
        recoveryNotification.className = 'recovery-notification';
        recoveryNotification.textContent = 'Noob has recovered!';
        document.body.appendChild(recoveryNotification);
        
        setTimeout(() => {
          recoveryNotification.remove();
        }, 3000);
        
        saveGameData(); // Save when noob recovers
      }, 60000); // 1 minute
    }
  }

  document.getElementById('clickUpgrade').addEventListener('click', () => {
    if (robux >= clickUpgradeCost) {
      robux -= clickUpgradeCost;
      robuxMultiplier += 1; 
      clickUpgradeCost = Math.floor(clickUpgradeCost * 2.6); 
      updateRobuxDisplay();

      const upgradeButton = document.getElementById('clickUpgrade');
      upgradeButton.querySelector('h3').textContent = `+${robuxMultiplier} Robux Per Click`;
      upgradeButton.querySelector('p').textContent = `Cost: ${clickUpgradeCost} Robux`;

      playSound(tadaSound);
      saveGameData(); // Save after buying upgrade
    } else {
      playSound(errorSound);
    }
  });

  document.getElementById('autoClicker').addEventListener('click', () => {
    if (robux >= autoClickerCost) {
      robux -= autoClickerCost;
      autoClickerMultiplier += 1; 
      autoClickerCost = Math.floor(autoClickerCost * 2.6);
      updateRobuxDisplay();

      const upgradeButton = document.getElementById('autoClicker');
      upgradeButton.querySelector('h3').textContent = `Autoclicker | +${autoClickerMultiplier} Robux Per Second`;
      upgradeButton.querySelector('p').textContent = `Cost: ${autoClickerCost} Robux`;

      if (autoClickerInterval) {
        clearInterval(autoClickerInterval);
      }

      autoClickerInterval = setInterval(() => {
        robux += autoClickerMultiplier;
        updateRobuxDisplay();
      }, 1000);

      playSound(tadaSound);
      saveGameData(); // Save after buying autoclicker
    } else {
      playSound(errorSound);
    }
  });

  document.getElementById('inventoryTabBtn').textContent = 'Inventory';

  settingsTabBtn.addEventListener('click', () => {
    settingsTabBtn.classList.add('active');
    savesTabBtn.classList.remove('active');
    settingsContent.classList.remove('hidden');
    savesContent.classList.add('hidden');
  });

  savesTabBtn.addEventListener('click', () => {
    savesTabBtn.classList.add('active');
    settingsTabBtn.classList.remove('active');
    savesContent.classList.remove('hidden');
    settingsContent.classList.add('hidden');
    updateSaveSlots();
  });

  function updateSaveSlots() {
    for (let i = 0; i < 3; i++) {
      const slotData = saveSlots[i];
      const slotInfo = document.getElementById(`saveSlot${i}Info`);
      
      if (i === 0) {
        // Auto-save slot
        if (slotData) {
          const saveDate = new Date(slotData.timestamp);
          slotInfo.textContent = `Auto-save: ${saveDate.toLocaleString()}`;
        } else {
          slotInfo.textContent = "Auto-save: Empty";
        }
      } else {
        // Manual save slots
        if (slotData) {
          const saveDate = new Date(slotData.timestamp);
          slotInfo.textContent = `Last saved: ${saveDate.toLocaleString()}`;
        } else {
          slotInfo.textContent = "Empty slot";
        }
      }
    }
  }

  for (let i = 1; i < 3; i++) {
    document.getElementById(`saveSlot${i}Save`).addEventListener('click', () => {
      saveGameData(i);
      updateSaveSlots();
    });

    document.getElementById(`saveSlot${i}Load`).addEventListener('click', () => {
      loadGameData(i);
      updateSaveSlots();
    });

    document.getElementById(`saveSlot${i}Reset`).addEventListener('click', () => {
      if (confirm(`Are you sure you want to reset Save Slot ${i}? This cannot be undone.`)) {
        saveSlots[i] = null;
        localStorage.setItem('dancingNoobSaveSlots', JSON.stringify(saveSlots));
        updateSaveSlots();
      }
    });
  }

  document.getElementById('loadAutoSave').addEventListener('click', () => {
    loadGameData(0);
    updateSaveSlots();
  });

  const codeInput = document.getElementById('codeInput');
  const redeemButton = document.getElementById('redeemButton');
  const codeError = document.querySelector('.code-error');

  redeemButton.addEventListener('click', () => {
    const code = codeInput.value.trim();
    
    if (usedCodes[code.toLowerCase()] && code.toLowerCase() !== 'under35') {
      playSound(errorSound);
      codeInput.value = '';
      codeError.textContent = "Code already used!";
      codeError.classList.add('visible');
      return;
    }
  
    if (code.toLowerCase() === 'under35') {
      if (happiness < 35) {
        codeError.classList.add('visible');
        playSound(errorSound);
      } else {
        happiness = 34;
        updateHappinessDisplay();
        updateNoobAppearance();
        playSound(tadaSound);
        codeInput.value = '';
        codeError.classList.remove('visible');
        // Removed adding to usedCodes for under35
        saveGameData(); // Save after redeeming code
      }
    } else if (code.toLowerCase() === '5kviews') {
      const rewardAmount = 250;
      robux += rewardAmount;
      updateRobuxDisplay();
      showBigRobuxAnimation(rewardAmount);
      codeInput.value = '';
      codeError.classList.remove('visible');
      usedCodes[code.toLowerCase()] = true;
      saveGameData(); // Save after redeeming code
    } else if (code.toLowerCase() === '10kviews') {
      robux = Math.floor(robux * 1.75);
      updateRobuxDisplay();
      showBigRobuxAnimation(Math.floor(robux * 0.75)); // Show how much was added
      codeInput.value = '';
      codeError.classList.remove('visible');
      usedCodes[code.toLowerCase()] = true;
      saveGameData(); // Save after redeeming code
    } else if (code.toLowerCase() === 'deadgame') {
      happiness = Math.floor(happiness / 2);
      updateHappinessDisplay();
      updateNoobAppearance();
      playSound(tadaSound);
      codeInput.value = '';
      codeError.classList.remove('visible');
      usedCodes[code.toLowerCase()] = true;
      saveGameData(); // Save after redeeming code
    } else {
      playSound(errorSound);
      codeInput.value = '';
      codeError.textContent = "Invalid code!";
      codeError.classList.add('visible');
    }
  });

  codeInput.addEventListener('input', () => {
    codeError.classList.remove('visible');
  });

  function showBigRobuxAnimation(amount) {
    const bigRobuxText = document.createElement('div');
    bigRobuxText.className = 'big-floating-robux';
    bigRobuxText.textContent = `+${amount} ROBUX!`;
    
    // Position in center of screen
    bigRobuxText.style.left = '50%';
    bigRobuxText.style.top = '40%';
    bigRobuxText.style.zIndex = '3700'; // Higher z-index to be visible over settings
    
    document.body.appendChild(bigRobuxText);
    playSound(tadaSound);
    
    setTimeout(() => {
      bigRobuxText.remove();
    }, 2000);
  }

  let hotPotatoBoostLevel = 1;
  let hotPotatoWins = 0;
  let hotPotatoBoostCost = 1;
  let hotPotatoRobuxMultiplier = 1;

  const hotPotatoButton = document.getElementById('hotPotatoButton');
  const hotPotatoGameContainer = document.getElementById('hotPotatoGameContainer');
  const potatoButton = document.getElementById('potatoButton');
  const hotPotatoClose = document.getElementById('hotPotatoClose');
  const hotPotatoTimer = document.getElementById('hotPotatoTimer');
  const hotPotatoScore = document.getElementById('hotPotatoScore');

  let gameInterval;
  let currentTime;
  let playerScore = 0;
  let noobScore = 0;
  let isPlayerTurn = false;
  let passingTimeout;
  let playerTimeoutId;
  let isGameRunning = false;  // Add flag to track if game is already running
  let gameTransitionTimeout = null; // Track transition timeout
  let isFirstTurn = true;

  function updateScore() {
    hotPotatoScore.textContent = `Player: ${playerScore} | Noob: ${noobScore}`;
  }

  function startHotPotatoGame() {
    // Prevent multiple instances of the game from running
    if (isGameRunning) return;
    isGameRunning = true;
    
    const turnStatus = document.getElementById('turnStatus');
    currentTime = 15;
    hotPotatoTimer.textContent = currentTime;
    isPlayerTurn = false;
    potatoButton.style.display = 'none';
    turnStatus.textContent = "Game starting...";

    // Remove any existing event listeners before adding a new one
    hotPotatoGameContainer.removeEventListener('click', handleEarlyClick);
    hotPotatoGameContainer.addEventListener('click', handleEarlyClick);

    gameInterval = setInterval(() => {
      currentTime--;
      hotPotatoTimer.textContent = currentTime;
    
      if (currentTime <= 0) {
        turnStatus.textContent = `${isPlayerTurn ? "Time's up - Noob wins!" : "Time's up - You win!"}`;
        endRound(isPlayerTurn);
      }
    }, 1000);

    setTimeout(() => {
      turnStatus.textContent = "Noob's turn!";
      passPotato();
    }, 1000);
  }

  // Separate function for early click handler to allow proper removal
  function handleEarlyClick(e) {
    if (!potatoButton.contains(e.target) && potatoButton.style.display === 'none') {
      const turnStatus = document.getElementById('turnStatus');
      turnStatus.textContent = "Clicked too early - Noob wins!";
      endRound(true);
    }
  }

  function passPotato() {
    const turnStatus = document.getElementById('turnStatus');
    turnStatus.textContent = "Potato in the air...";
  
    if (currentTime <= 0.6) { 
      turnStatus.textContent = "Time's almost up - You win!";
      endRound(false);
      return;
    }

    // Prevent noob from taking too long on first turn
    const passTime = isFirstTurn ? (Math.random() * 500 + 100) : (Math.random() * 1000 + 100);
    
    if (isFirstTurn) {
      isFirstTurn = false;
    }

    passingTimeout = setTimeout(() => {
      if (passTime >= 1000) { 
        turnStatus.textContent = "Noob took too long - You win!";
        endRound(false); 
        return;
      }
      
      isPlayerTurn = true;
      potatoButton.style.display = 'block';
      potatoButton.disabled = false;
      turnStatus.textContent = "Your turn! Quick, pass it back!";

      playerTimeoutId = setTimeout(() => {
        if (isPlayerTurn) {
          turnStatus.textContent = "Too slow - Noob wins!";
          endRound(true);
        }
      }, 1000);

    }, passTime);
  }

  function endRound(playerLost) {
    clearInterval(gameInterval);
    clearTimeout(passingTimeout);
    clearTimeout(playerTimeoutId);
    
    // Remove click event listener to prevent multiple triggers
    hotPotatoGameContainer.removeEventListener('click', handleEarlyClick);
  
    const turnStatus = document.getElementById('turnStatus');
    if (currentTime <= 0) {
      if (!isPlayerTurn) {
        playerLost = false;
        turnStatus.textContent = "Time's up - You win!";
      } else {
        playerLost = true;
        turnStatus.textContent = "Time's up - Noob wins!";
      }
    }

    if (playerLost) {
      noobScore++;
    } else {
      const oldRobux = robux;
      const reward = Math.floor(25 * hotPotatoRobuxMultiplier); // Changed base reward to 25
      robux += reward;
      const robuxGained = robux - oldRobux;
      
      showBigRobuxAnimation(robuxGained);
      
      updateRobuxDisplay();
      playerScore++;
      hotPotatoWins++; // Increment wins counter
      updateHotPotatoWinsDisplay(); // Update the wins display
      happiness = Math.min(100, happiness + Math.floor(Math.random() * 13) + 19);
      updateHappinessDisplay();
      updateNoobAppearance(); 
      saveGameData(); // Save after hot potato win
    }
  
    updateScore();
    potatoButton.style.display = 'none';

    // Set a timeout to reset the game, but only if the game is still visible
    clearTimeout(gameTransitionTimeout);
    gameTransitionTimeout = setTimeout(() => {
      if (hotPotatoGameContainer.style.display === 'flex') {
        isGameRunning = false;  // Allow the game to be started again
        startHotPotatoGame();
      }
    }, 2000);
  }

  potatoButton.addEventListener('click', () => {
    if (!isPlayerTurn) return;

    clearTimeout(playerTimeoutId);
    isPlayerTurn = false;
    potatoButton.style.display = 'none';
    potatoButton.disabled = true;
  
    const turnStatus = document.getElementById('turnStatus');
    turnStatus.textContent = "Noob's turn!";
  
    passPotato();
  });

  hotPotatoButton.addEventListener('click', () => {
    // Check if noob can play hot potato based on hunger and sickness
    if (hunger <= 35) {
      // Display error notification
      const notification = document.createElement('div');
      notification.className = 'error-notification';
      notification.textContent = "Noob is too hungry to play Hot Potato!";
      document.body.appendChild(notification);
      
      // Position above the hot potato button
      const buttonRect = hotPotatoButton.getBoundingClientRect();
      notification.style.top = (buttonRect.top - 70) + 'px';
      notification.style.left = (buttonRect.left + buttonRect.width/2) + 'px';
      notification.style.transform = 'translateX(-50%)';
      
      setTimeout(() => {
        notification.remove();
      }, 2000);
      
      playSound(errorSound);
      return;
    }
    
    if (isSick) {
      // Display error notification
      const notification = document.createElement('div');
      notification.className = 'error-notification';
      notification.textContent = "Noob is sick and can't play Hot Potato!";
      document.body.appendChild(notification);
      
      // Position above the hot potato button
      const buttonRect = hotPotatoButton.getBoundingClientRect();
      notification.style.top = (buttonRect.top - 70) + 'px';
      notification.style.left = (buttonRect.left + buttonRect.width/2) + 'px';
      notification.style.transform = 'translateX(-50%)';
      
      setTimeout(() => {
        notification.remove();
      }, 2000);
      
      playSound(errorSound);
      return;
    }
    
    document.getElementById('statsDisplay').classList.add('hidden');
    hotPotatoGameContainer.style.display = 'flex';
    setTimeout(() => {
      hotPotatoGameContainer.classList.add('visible');
    }, 50);
    updateScore();
    updateHotPotatoWinsDisplay(); // Update the wins display when game opens
    
    // Stop activities music immediately and don't let it play during the game
    stopAllMusic();
    
    // Play hot potato music
    setTimeout(() => {
      if (musicEnabled) {
        playMusic(hotPotatoMusic);
      }
    }, 300);
    
    // Reset game state
    clearInterval(gameInterval);
    clearTimeout(passingTimeout);
    clearTimeout(playerTimeoutId);
    clearTimeout(gameTransitionTimeout);
    isGameRunning = false;
    startHotPotatoGame();
  });

  hotPotatoClose.addEventListener('click', () => {
    hotPotatoGameContainer.classList.remove('visible');
    
    // Switch back to activities music
    stopAllMusic();
    
    setTimeout(() => {
      hotPotatoGameContainer.style.display = 'none';
      clearInterval(gameInterval);
      clearTimeout(passingTimeout);
      clearTimeout(playerTimeoutId);
      clearTimeout(gameTransitionTimeout);
      hotPotatoGameContainer.removeEventListener('click', handleEarlyClick);
      isGameRunning = false;
      playerScore = 0;
      noobScore = 0;
      
      // Restore activities music
      setTimeout(() => {
        if (musicEnabled && document.getElementById('activitiesScreen').style.opacity === '1') {
          playMusic(activitiesMusic);
        }
      }, 300);
    }, 500);
  });

  function updateHotPotatoWinsDisplay() {
    const hotPotatoSubtitle = document.querySelector('.potato-button-subtitle');
    if (hotPotatoSubtitle) {
      hotPotatoSubtitle.textContent = `Hot Potato Wins: ${hotPotatoWins}`;
    }
  }

  document.getElementById('hotPotatoBoost').addEventListener('click', () => {
    if (hotPotatoWins >= hotPotatoBoostCost) {
      // Remove this line that was subtracting wins
      // hotPotatoWins -= hotPotatoBoostCost;
      hotPotatoRobuxMultiplier *= 2;
      hotPotatoBoostCost *= 2;
      updateHotPotatoWinsDisplay();

      const upgradeButton = document.getElementById('hotPotatoBoost');
      upgradeButton.querySelector('h3').textContent = `Hot Potato Boost | ${hotPotatoRobuxMultiplier}x Hot Potato Rewards`;
      upgradeButton.querySelector('p').textContent = `Cost: ${hotPotatoBoostCost} Hot Potato Wins`;

      playSound(tadaSound);
      saveGameData(); // Save after upgrading hot potato
    } else {
      playSound(errorSound);
    }
  });

  const hotPotatoInstructions = document.getElementById('hotPotatoInstructions');
  const instructionsModal = document.getElementById('instructionsModal');
  const closeInstructions = document.getElementById('closeInstructions');

  hotPotatoInstructions.addEventListener('click', () => {
    instructionsModal.style.display = 'block';
  });

  closeInstructions.addEventListener('click', () => {
    instructionsModal.style.display = 'none';
  });

  updateHotPotatoWinsDisplay();
  updateSettingsVisibility();
  updateNoobAppearance();

  performanceToggle.addEventListener('change', () => {
    performanceMode = performanceToggle.checked;
    saveGameData(); // Save performance mode preference
  });

  function updateTvBoostDisplay() {
    if (tvBoostActive) {
      tvBoostIndicator.style.display = 'block';
      tvScreen.style.display = 'block';
    } else {
      tvBoostIndicator.style.display = 'none';
      tvScreen.style.display = 'none';
    }
  }
  
  function updateShopItemAppearance() {
    // Update TV upgrade appearance
    const tvUpgrade = document.getElementById('tvUpgrade');
    if (hasTv) {
      tvUpgrade.classList.add('purchased');
      const cooldownText = tvUpgrade.querySelector('.cooldown-text');
      if (tvCooldown) {
        tvUpgrade.classList.add('cooldown');
        cooldownText.classList.remove('hidden');
      } else {
        tvUpgrade.classList.remove('cooldown');
        cooldownText.textContent = 'Cooldown: Ready!';
        cooldownText.classList.remove('hidden');
      }
    }
    
    // Update Toy upgrade appearance
    const toyUpgrade = document.getElementById('toyUpgrade');
    if (hasToy) {
      toyUpgrade.classList.add('purchased');
      const cooldownText = toyUpgrade.querySelector('.cooldown-text');
      if (toyCooldown) {
        toyUpgrade.classList.add('cooldown');
        cooldownText.classList.remove('hidden');
      } else {
        toyUpgrade.classList.remove('cooldown');
        cooldownText.textContent = 'Cooldown: Ready!';
        cooldownText.classList.remove('hidden');
      }
    }
    
    // Update Roomba upgrade appearance
    const roombaUpgrade = document.getElementById('roombaUpgrade');
    if (hasRoomba) {
      roombaUpgrade.classList.add('purchased');
    }
  }
  
  function startRoombaInterval() {
    if (roombaInterval) {
      clearInterval(roombaInterval);
    }
    
    roombaInterval = setInterval(() => {
      happiness = Math.min(100, happiness + 1);
      updateHappinessDisplay();
      updateNoobAppearance();
    }, 30000); // Every 30 seconds
  }
  
  // Turn on TV function
  function turnOnTV() {
    if (!tvBoostActive && !tvCooldown) {
      tvBoostActive = true;
      updateTvBoostDisplay();
      
      // Add happiness every second for 20 seconds
      let secondsLeft = 20;
      const tvInterval = setInterval(() => {
        if (secondsLeft > 0) {
          happiness = Math.min(100, happiness + 3);
          updateHappinessDisplay();
          updateNoobAppearance();
          secondsLeft--;
        } else {
          clearInterval(tvInterval);
          tvBoostActive = false;
          updateTvBoostDisplay();
          
          // Start cooldown for TV in shop
          tvCooldown = true;
          const cooldownText = document.querySelector('#tvUpgrade .cooldown-text');
          cooldownText.classList.remove('hidden');
          updateShopItemAppearance();
          
          let remainingSeconds = 50;
          const updateCooldown = () => {
            cooldownText.textContent = `Cooldown: ${remainingSeconds}s`;
            if (remainingSeconds > 0) {
              remainingSeconds--;
              setTimeout(updateCooldown, 1000);
            } else {
              tvCooldown = false;
              updateShopItemAppearance();
            }
          };
          updateCooldown();
        }
      }, 1000);
      
      tvBoostTimeout = setTimeout(() => {
        clearInterval(tvInterval);
        tvBoostActive = false;
        updateTvBoostDisplay();
      }, 20000);
      
      saveGameData();
    }
  }
  
  const tvObject = document.getElementById('tvObject');
  const tvScreen = document.getElementById('tvScreen');
  const tvConfirmBox = document.getElementById('tvConfirmBox');
  const turnOnTvBtn = document.getElementById('turnOnTv');
  const cancelTvBtn = document.getElementById('cancelTv');
  const tvBoostIndicator = document.querySelector('.tvBoostIndicator');
  
  tvObject.src = 'asset_name.png';
  
  function updateTvBoostDisplay() {
    if (tvBoostActive) {
      tvBoostIndicator.style.display = 'block';
      tvScreen.style.display = 'block';
    } else {
      tvBoostIndicator.style.display = 'none';
      tvScreen.style.display = 'none';
    }
  }
  
  tvObject.addEventListener('click', () => {
    // Only allow clicking TV if not in cooldown and not already active
    if (!tvCooldown && !tvBoostActive && 
        shopScreen.style.opacity !== '1' && 
        feedingScreen.style.opacity !== '1' && 
        document.getElementById('activitiesScreen').style.opacity !== '1') {
      
      tvConfirmBox.style.display = 'block';
    } else if (tvCooldown) {
      // Show error notification
      const notification = document.createElement('div');
      notification.className = 'error-notification';
      notification.textContent = "TV is on cooldown!";
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
      }, 2000);
      
      playSound(errorSound);
    }
  });
  
  turnOnTvBtn.addEventListener('click', () => {
    tvConfirmBox.style.display = 'none';
    turnOnTV();
    playSound(tadaSound);
  });
  
  cancelTvBtn.addEventListener('click', () => {
    tvConfirmBox.style.display = 'none';
  });
  
  updateTvBoostDisplay();
  
  function saveGameData(slotIndex = 0) {
    const gameData = {
      robux,
      robuxMultiplier,
      clickUpgradeCost,
      autoClickerCost,
      autoClickerMultiplier,
      hunger,
      inventory,
      happiness,
      hotPotatoWins,
      hotPotatoRobuxMultiplier,
      hotPotatoBoostCost,
      usedCodes,
      musicEnabled,
      soundEffectsEnabled,
      performanceMode,
      isSick,  // Save sick state
      canSelectFood,  // Save food selection state
      hasTv,          // Save TV upgrade state
      hasToy,         // Save Toy upgrade state
      hasRoomba,      // Save Roomba upgrade state
      tvBoostActive,  // Save TV boost state
      timestamp: Date.now()
    };
    
    // Save to slot
    saveSlots[slotIndex] = gameData;
    
    // Save all slots to localStorage
    localStorage.setItem('dancingNoobSaveSlots', JSON.stringify(saveSlots));
    
    if (slotIndex > 0) {
      // Show notification for manual saves
      const notification = document.createElement('div');
      notification.className = 'save-notification';
      notification.textContent = `Game saved to Slot ${slotIndex}`;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
      }, 2000);
    }
  }

  function loadGameData(slotIndex = 0) {
    // On first run, try to load slots from localStorage
    if (!saveSlots[0] && !saveSlots[1] && !saveSlots[2]) {
      const savedSlots = localStorage.getItem('dancingNoobSaveSlots');
      if (savedSlots) {
        saveSlots = JSON.parse(savedSlots);
      }
      
      // For backward compatibility - if there's an old save, put it in the auto-save slot
      const oldSave = localStorage.getItem('dancingNoobSave');
      if (oldSave && !saveSlots[0]) {
        try {
          const oldData = JSON.parse(oldSave);
          oldData.timestamp = Date.now();
          saveSlots[0] = oldData;
          localStorage.setItem('dancingNoobSaveSlots', JSON.stringify(saveSlots));
          localStorage.removeItem('dancingNoobSave'); // Remove the old save
        } catch (error) {
          console.error('Error migrating old save:', error);
        }
      }
    }
    
    const slotData = saveSlots[slotIndex];
    
    if (slotData) {
      try {
        // Restore game variables
        robux = slotData.robux || 0;
        robuxMultiplier = slotData.robuxMultiplier || 1;
        clickUpgradeCost = slotData.clickUpgradeCost || 20;
        autoClickerCost = slotData.autoClickerCost || 55;
        autoClickerMultiplier = slotData.autoClickerMultiplier || 1;
        hunger = slotData.hunger <= 0 ? 6 : slotData.hunger || 100;
        inventory = slotData.inventory || [];
        happiness = slotData.happiness || 100;
        hotPotatoWins = slotData.hotPotatoWins || 0;
        hotPotatoRobuxMultiplier = slotData.hotPotatoRobuxMultiplier || 1;
        hotPotatoBoostCost = slotData.hotPotatoBoostCost || 1;
        usedCodes = slotData.usedCodes || {};
        musicEnabled = slotData.musicEnabled !== undefined ? slotData.musicEnabled : true;
        soundEffectsEnabled = slotData.soundEffectsEnabled !== undefined ? slotData.soundEffectsEnabled : true;
        performanceMode = slotData.performanceMode !== undefined ? slotData.performanceMode : false;
        isSick = slotData.isSick || false;  // Load sick state
        canSelectFood = slotData.canSelectFood !== undefined ? slotData.canSelectFood : true;  // Load food selection state
        hasTv = slotData.hasTv || false;    // Load TV upgrade state
        hasToy = slotData.hasToy || false;  // Load Toy upgrade state
        hasRoomba = slotData.hasRoomba || false;  // Load Roomba upgrade state
        tvBoostActive = slotData.tvBoostActive || false; // Load TV boost state
        
        // Update UI to reflect loaded data
        updateRobuxDisplay();
        updateHungerDisplay();
        updateHappinessDisplay();
        updateHotPotatoWinsDisplay();
        updateNoobAppearance();
        updateTvBoostDisplay();
        
        // Set toggles
        musicToggle.checked = musicEnabled;
        soundEffectsToggle.checked = soundEffectsEnabled;
        performanceToggle.checked = performanceMode;
        
        // Update shop items display
        const clickUpgradeButton = document.getElementById('clickUpgrade');
        clickUpgradeButton.querySelector('h3').textContent = `+${robuxMultiplier} Robux Per Click`;
        clickUpgradeButton.querySelector('p').textContent = `Cost: ${clickUpgradeCost} Robux`;
        
        const autoClickerButton = document.getElementById('autoClicker');
        autoClickerButton.querySelector('h3').textContent = `Autoclicker | +${autoClickerMultiplier} Robux Per Second`;
        autoClickerButton.querySelector('p').textContent = `Cost: ${autoClickerCost} Robux`;
        
        const hotPotatoBoostButton = document.getElementById('hotPotatoBoost');
        hotPotatoBoostButton.querySelector('h3').textContent = `Hot Potato Boost | ${hotPotatoRobuxMultiplier}x Hot Potato Rewards`;
        hotPotatoBoostButton.querySelector('p').textContent = `Cost: ${hotPotatoBoostCost} Hot Potato Wins`;
        
        // Restart autoClicker if it was active
        if (autoClickerMultiplier > 1 && !autoClickerInterval) {
          autoClickerInterval = setInterval(() => {
            robux += autoClickerMultiplier;
            updateRobuxDisplay();
          }, 1000);
        }
        
        // Show notification for loads
        if (slotIndex > 0) {
          const notification = document.createElement('div');
          notification.className = 'load-notification';
          notification.textContent = `Game loaded from Slot ${slotIndex}`;
          document.body.appendChild(notification);
          
          setTimeout(() => {
            notification.remove();
          }, 2000);
        }
        
      } catch (error) {
        console.error('Error loading saved game:', error);
      }
    } else if (slotIndex > 0) {
      // Show a notification that the slot is empty
      const notification = document.createElement('div');
      notification.className = 'error-notification';
      notification.textContent = `Save Slot ${slotIndex} is empty`;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
      }, 2000);
    }
  }

  loadGameData(0);

  function gameOver() {
    gameOverTriggered = true;
    stopAllMusic();
    noob.style.pointerEvents = 'none';

    shopScreen.style.opacity = '0';
    shopScreen.style.pointerEvents = 'none';
    shopOverlay.style.opacity = '0';
    shopOverlay.style.pointerEvents = 'none';
    exitOverlay.style.opacity = '0';
    exitOverlay.style.pointerEvents = 'none';
    feedingScreen.style.opacity = '0';
    feedingScreen.style.pointerEvents = 'none';
    feedingOverlay.style.opacity = '0';
    feedingOverlay.style.pointerEvents = 'none';
    feedingExitOverlay.style.opacity = '0';
    feedingExitOverlay.style.pointerEvents = 'none';
    document.getElementById('activitiesScreen').style.opacity = '0';
    document.getElementById('activitiesScreen').style.pointerEvents = 'none';
    document.getElementById('activitiesOverlay').style.opacity = '0';
    document.getElementById('activitiesOverlay').style.pointerEvents = 'none';
    document.getElementById('activitiesExitOverlay').style.opacity = '0';
    document.getElementById('activitiesExitOverlay').style.pointerEvents = '0';
    const fridgeScreen = document.getElementById('fridgeScreen');
    const fridgeOverlay = document.querySelector('.fridge-overlay');
    if (fridgeScreen) fridgeScreen.classList.remove('visible');
    if (fridgeOverlay) fridgeOverlay.classList.remove('visible');

    setTimeout(() => {
      const explosion = document.createElement('img');
      explosion.src = 'explode.gif';
      explosion.className = 'explosion';
      const rect = noob.getBoundingClientRect();
      explosion.style.left = `${rect.left}px`;
      explosion.style.top = `${rect.top}px`;

      explosionContainer.appendChild(explosion);

      if (soundEffectsEnabled) {
        explodeSound.currentTime = 0;
        explodeSound.play().catch(e => console.log('Explosion sound failed:', e));
      }

      noob.style.display = 'none';

      setTimeout(() => {
        explosion.remove();
        const gameOverOverlay = document.getElementById('gameOverOverlay');
        gameOverOverlay.innerHTML = '<h1>Your noob starved and you failed.</h1><button id="restartButton">Restart Game</button>';
        gameOverOverlay.classList.add('visible');
        
        // Add event listener to restart button
        document.getElementById('restartButton').addEventListener('click', restartGame);
      }, 1000);
    }, 2000);
  }
  
  function restartGame() {
    // Reset game state variables
    robux = 0;
    robuxMultiplier = 1;
    clickUpgradeCost = 20;
    autoClickerCost = 55;
    autoClickerMultiplier = 1;
    hunger = 100;
    inventory = [];
    currentTableFood = null;
    isSick = false;
    happiness = 100;
    canSelectFood = true;
    hotPotatoWins = 0;
    hotPotatoRobuxMultiplier = 1;
    hotPotatoBoostCost = 1;
    gameOverTriggered = false;
    
    // Reset happiness upgrades
    hasTv = false;
    tvCooldown = false;
    tvBoostActive = false;
    if (tvBoostTimeout) {
      clearTimeout(tvBoostTimeout);
      tvBoostTimeout = null;
    }
    
    hasToy = false;
    toyCooldown = false;
    hasRoomba = false;
    
    // Clear any existing intervals
    if (autoClickerInterval) {
      clearInterval(autoClickerInterval);
      autoClickerInterval = null;
    }
    
    if (roombaInterval) {
      clearInterval(roombaInterval);
      roombaInterval = null;
    }
    
    if (sickTimeout) {
      clearTimeout(sickTimeout);
      sickTimeout = null;
    }
    
    // Reset UI
    updateRobuxDisplay();
    updateHungerDisplay();
    updateHappinessDisplay();
    
    // Reset shop items display
    const clickUpgradeButton = document.getElementById('clickUpgrade');
    clickUpgradeButton.querySelector('h3').textContent = `+${robuxMultiplier} Robux Per Click`;
    clickUpgradeButton.querySelector('p').textContent = `Cost: ${clickUpgradeCost} Robux`;
    
    const autoClickerButton = document.getElementById('autoClicker');
    autoClickerButton.querySelector('h3').textContent = `Autoclicker | +${autoClickerMultiplier} Robux Per Second`;
    autoClickerButton.querySelector('p').textContent = `Cost: ${autoClickerCost} Robux`;
    
    const hotPotatoBoostButton = document.getElementById('hotPotatoBoost');
    hotPotatoBoostButton.querySelector('h3').textContent = `Hot Potato Boost | ${hotPotatoRobuxMultiplier}x Hot Potato Rewards`;
    hotPotatoBoostButton.querySelector('p').textContent = `Cost: ${hotPotatoBoostCost} Hot Potato Wins`;
    
    // Reset noob appearance and position
    noob.src = 'Dancing_noob.webp';
    noob.classList.remove('sad-noob');
    noob.classList.remove('sick-noob');
    noob.style.display = 'block';
    noob.style.pointerEvents = 'auto';
    noob.style.left = '50%';
    noob.style.top = '50%';
    noob.style.transform = 'translate(-50%, -50%)';
    
    // Hide game over overlay
    document.getElementById('gameOverOverlay').classList.remove('visible');
    
    // Restart main audio
    if (musicEnabled) {
      playMusic(bgMusic);
    }
    
    // Restart hunger and happiness intervals
    hungerInterval = setInterval(() => {
      if (hunger > 0) {
        // Calculate hunger depletion multiplier based on happiness thresholds and sickness
        let hungerMultiplier;
        if (happiness >= 75) {
          hungerMultiplier = 1.2; // 90-75: 1.2x faster
        } else if (happiness >= 50) {
          hungerMultiplier = 1.7; // 74-50: 1.7x faster
        } else if (happiness >= 26) {
          hungerMultiplier = 2.4; // 49-26: 2.4x faster
        } else {
          hungerMultiplier = 3.0; // 25-0: 3x faster
        }
        
        // If sick, double hunger depletion
        if (isSick) {
          hungerMultiplier *= 2;
        }
        
        hunger -= hungerMultiplier;
        hunger = Math.max(0, Math.round(hunger)); // Ensure hunger doesn't go below 0
        updateHungerDisplay();
        if (hunger <= 0 && !gameOverTriggered) {
          gameOver();
          clearInterval(hungerInterval);
        }
      }
    }, 9000);
    
    happinessInterval = setInterval(() => {
      if (happiness > 0) {
        // Calculate happiness decrease multiplier based on hunger
        let happinessMultiplier = 1;
        
        // The lower the hunger, the faster happiness decreases
        if (hunger <= 25) {
          happinessMultiplier = 3; // 3x faster at 0-25 hunger
        } else if (hunger <= 50) {
          happinessMultiplier = 2; // 2x faster at 26-50 hunger
        } else if (hunger <= 75) {
          happinessMultiplier = 1.5; // 1.5x faster at 51-75 hunger
        }
        
        // If sick, happiness decreases even faster
        if (isSick) {
          happinessMultiplier *= 2;
        }
        
        happiness -= happinessMultiplier;
        happiness = Math.max(0, Math.round(happiness)); // Ensure happiness doesn't go below 0
        updateHappinessDisplay();
        updateNoobAppearance();
      }
    }, 9000);
    
    // Save the restarted game state
    saveGameData(0); // Save to auto-save slot
    
    // Restart noob movement
    setTimeout(moveNoob, 1000);
  }

  settingsIcon.addEventListener('click', () => {
    settingsScreen.classList.add('visible');
    settingsOverlay.classList.add('visible');
  });

  settingsCloseBtn.addEventListener('click', () => {
    settingsScreen.classList.remove('visible');
    settingsOverlay.classList.remove('visible');
  });

  musicToggle.addEventListener('change', () => {
    musicEnabled = musicToggle.checked;
    if (!musicEnabled) {
      stopAllMusic();
    } else {
      checkAndPlayMusic();
    }
    saveGameData(); // Save music preference
  });

  soundEffectsToggle.addEventListener('change', () => {
    soundEffectsEnabled = soundEffectsToggle.checked;
    saveGameData(); // Save sound effects preference
  });

  document.getElementById('tvUpgrade').addEventListener('click', () => {
    if (!hasTv) {
      // Purchase TV
      if (robux >= tvCost) {
        robux -= tvCost;
        hasTv = true;
        updateRobuxDisplay();
        updateShopItemAppearance();
        playSound(tadaSound);
        saveGameData();
      } else {
        playSound(errorSound);
      }
    } else if (!tvCooldown) {
      // Use TV
      happiness = Math.min(100, happiness + 30);
      updateHappinessDisplay();
      updateNoobAppearance();
      showHappinessBoost(30);
      
      // Start cooldown
      tvCooldown = true;
      const cooldownText = document.querySelector('#tvUpgrade .cooldown-text');
      cooldownText.classList.remove('hidden');
      updateShopItemAppearance();
      
      let remainingSeconds = 50;
      const updateCooldown = () => {
        cooldownText.textContent = `Cooldown: ${remainingSeconds}s`;
        if (remainingSeconds > 0) {
          remainingSeconds--;
          setTimeout(updateCooldown, 1000);
        } else {
          tvCooldown = false;
          updateShopItemAppearance();
        }
      };
      updateCooldown();
      
      playSound(tadaSound);
      saveGameData();
    }
  });

  document.getElementById('testButton').addEventListener('click', () => {
    robux += 696969;
    updateRobuxDisplay();
    showBigRobuxAnimation(696969);
    playSound(tadaSound);
  });

  document.getElementById('toyUpgrade').addEventListener('click', () => {
    if (!hasToy) {
      // Purchase Toy
      if (robux >= toyCost) {
        robux -= toyCost;
        hasToy = true;
        updateRobuxDisplay();
        updateShopItemAppearance();
        playSound(tadaSound);
        saveGameData();
      } else {
        playSound(errorSound);
      }
    } else if (!toyCooldown) {
      // Use Toy
      happiness = Math.min(100, happiness + 15);
      updateHappinessDisplay();
      updateNoobAppearance();
      showHappinessBoost(15);
      
      // Start cooldown
      toyCooldown = true;
      const cooldownText = document.querySelector('#toyUpgrade .cooldown-text');
      cooldownText.classList.remove('hidden');
      updateShopItemAppearance();
      
      let remainingSeconds = 30;
      const updateCooldown = () => {
        cooldownText.textContent = `Cooldown: ${remainingSeconds}s`;
        if (remainingSeconds > 0) {
          remainingSeconds--;
          setTimeout(updateCooldown, 1000);
        } else {
          toyCooldown = false;
          updateShopItemAppearance();
        }
      };
      updateCooldown();
      
      playSound(tadaSound);
      saveGameData();
    }
  });

  document.getElementById('roombaUpgrade').addEventListener('click', () => {
    if (!hasRoomba) {
      // Purchase Roomba
      if (robux >= roombaCost) {
        robux -= roombaCost;
        hasRoomba = true;
        updateRobuxDisplay();
        updateShopItemAppearance();
        
        // Start the roomba interval
        startRoombaInterval();
        
        playSound(tadaSound);
        saveGameData();
      } else {
        playSound(errorSound);
      }
    }
  });
});