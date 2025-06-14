let installedApps = ['edge', 'store', 'explorer', 'settings'];
let chromeInstalled = false;
let minecraftInstalled = false;
let selectedAccentColor = '#0078d4';
let users = [];
let currentUser = null;
let userCredentials = null;
let downloadedISOs = [];
let availableWallpapers = [
  { name: 'Default', url: 'get ur sexy out.jpg' },
  { name: 'Abstract Blue', url: 'abstract_window' },
  { name: 'Windows Logo', url: 'Windows_logo_-_2012_(dark_blue).svg.png' },
  { name: 'Windows Pattern', url: 'data:image/svg+xml,' + encodeURIComponent(`
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="windows-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          <g fill="#0078D4" opacity="0.2">
            <path d="M0,0 L40,0 L40,40 L0,40 Z M45,0 L85,0 L85,40 L45,40 Z M0,45 L40,45 L40,85 L0,85 Z M45,45 L85,45 L85,85 L45,85 Z"/>
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#windows-pattern)"/>
    </svg>
  `)}
];
let currentWallpaper = 'get ur sexy out.jpg';
let isUpgradingToWindows11 = false;
let batteryLevel = 100;
let isBatteryPlugged = true;
let batteryInterval;
let chargingInterval;

// Update the updateClock function to be more defensive
function updateClock() {
  const timeDiv = document.querySelector('.time');
  if (!timeDiv) return; // Exit if element not found
  
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  timeDiv.textContent = timeStr;
}

// Update the event listener to ensure DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initial clock update
  updateClock();
  
  // Start clock updates
  setInterval(updateClock, 1000);
  
  // Initialize other components
  startBootSequence();
  initializeThemeToggle();
  initializeStartMenu();
  initializeTaskbar();
  addVMwareToStartMenu();
  initializeSetup();
  initializeLiveTiles();
});

function startBootSequence() {
  // Check if this is a restart or first boot
  const isRestart = sessionStorage.getItem('isRestart');
  document.body.dataset.theme = localStorage.getItem('theme') || 'dark';
  document.documentElement.style.setProperty('--accent-color', localStorage.getItem('accentColor') || selectedAccentColor);
  
  // Load saved wallpaper if it exists
  const savedWallpaper = localStorage.getItem('wallpaper');
  if (savedWallpaper) {
    setWallpaper(savedWallpaper);
  }
  
  if (isRestart) {
    // Clear the restart flag
    sessionStorage.removeItem('isRestart');
    // Go directly to login screen
    setTimeout(() => {
      document.getElementById('boot-screen').classList.remove('active');
      showLoginScreen();
    }, 3000);
  } else {
    // First boot - go to setup
    setTimeout(() => {
      document.getElementById('boot-screen').classList.remove('active');
      document.getElementById('setup-screen').classList.add('active');
      document.querySelector('[data-slide="1"]').classList.add('active');
    }, 3000);
  }
}

function setTheme(theme) {
  if (!document.body) return;
  document.body.dataset.theme = theme;
  localStorage.setItem('theme', theme);
  
  // Update theme previews
  const darkPreview = document.querySelector('.theme-preview.dark');
  const lightPreview = document.querySelector('.theme-preview.light');
  
  if (darkPreview && lightPreview) {
    if (theme === 'dark') {
      darkPreview.classList.add('selected');
      lightPreview.classList.remove('selected');
    } else {
      darkPreview.classList.remove('selected');
      lightPreview.classList.add('selected');
    }
  }
}

// Add this function to handle accent color changes
function setAccentColor(color) {
  selectedAccentColor = color;
  localStorage.setItem('accentColor', color);
  document.documentElement.style.setProperty('--accent-color', color);
  
  // Update color options selection state
  const colorOptions = document.querySelectorAll('.color-option');
  colorOptions.forEach(option => {
    if (option.dataset.color === color) {
      option.classList.add('selected');
    } else {
      option.classList.remove('selected');
    }
  });
}

// Add function to change wallpaper
function setWallpaper(wallpaperUrl) {
  currentWallpaper = wallpaperUrl;
  localStorage.setItem('wallpaper', wallpaperUrl);
  const desktop = document.getElementById('desktop');
  if (desktop) {
    desktop.style.backgroundImage = `url('${wallpaperUrl}')`;
  }
  
  // Update wallpaper previews if they exist
  const wallpaperPreviews = document.querySelectorAll('.wallpaper-preview');
  if (wallpaperPreviews.length > 0) {
    wallpaperPreviews.forEach(preview => {
      if (preview.dataset.wallpaper === wallpaperUrl) {
        preview.classList.add('selected');
      } else {
        preview.classList.remove('selected');
      }
    });
  }
}

// Update the event handlers for color options
document.addEventListener('DOMContentLoaded', () => {
  const colorOptions = document.querySelectorAll('.color-option');
  colorOptions.forEach(option => {
    option.addEventListener('click', () => {
      const color = option.dataset.color;
      setAccentColor(color);
    });
  });
  
  // Initialize from localStorage
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    setTheme(savedTheme);
  }
  
  const savedAccentColor = localStorage.getItem('accentColor');
  if (savedAccentColor) {
    setAccentColor(savedAccentColor);
  }
  
  // ... rest of existing initialization code ...
});

function initializeThemeToggle() {
  const themeToggle = document.querySelector('.theme-toggle');
  themeToggle.addEventListener('click', () => {
    const newTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  });
}

function showSetupSlide(slideNumber) {
  const slides = document.querySelectorAll('.setup-slide');
  slides.forEach(slide => slide.classList.remove('active'));
  const currentSlide = document.querySelector(`[data-slide="${slideNumber}"]`);
  currentSlide.classList.add('active');
  
  if (slideNumber === 6) { 
    const progressBar = currentSlide.querySelector('.progress-bar');
    progressBar.style.width = '100%';
  }
}

function initializeSetup() {
  const setupSlides = document.querySelectorAll('.setup-slide');
  const nextButtons = document.querySelectorAll('.setup-next');
  let currentSlide = 1;

  // Initialize the first slide
  const firstSlide = document.querySelector('[data-slide="1"]');
  if (firstSlide) {
    firstSlide.classList.add('active');
  }

  nextButtons.forEach(button => {
    button.addEventListener('click', () => {
      const currentSlideElement = document.querySelector(`.setup-slide[data-slide="${currentSlide}"]`);
      if (currentSlideElement) {
        currentSlideElement.classList.remove('active');
      }
      
      currentSlide++;
      const nextSlideElement = document.querySelector(`.setup-slide[data-slide="${currentSlide}"]`);
      
      if (nextSlideElement) {
        nextSlideElement.classList.add('active');
        
        // If it's the final slide, start the progress animation
        if (currentSlide === 6) {
          const progressBar = nextSlideElement.querySelector('.progress-bar');
          if (progressBar) {
            progressBar.style.width = '100%';
            
            // After progress completes, proceed to login screen
            setTimeout(() => {
              const setupScreen = document.getElementById('setup-screen');
              if (setupScreen) {
                setupScreen.classList.remove('active');
                showLoginScreen();
              }
            }, 2000);
          }
        }
      }
    });
  });

  // Initialize setup buttons with proper null checks
  const setupButtons = document.querySelectorAll('.setup-next');
  setupButtons.forEach(button => {
    button.addEventListener('click', () => {
      const currentSlide = button.closest('.setup-slide');
      if (!currentSlide) return;
      
      const currentSlideNumber = parseInt(currentSlide.dataset.slide);
      
      if (currentSlideNumber === 2) {
        // Save user credentials with null checks
        const username = document.getElementById('username-input')?.value || '';
        const password = document.getElementById('password-input')?.value || null;
        const securityQuestion = document.getElementById('security-question')?.value || null;
        const securityAnswer = document.getElementById('security-answer')?.value || null;
        const msEmail = document.getElementById('ms-email-setup')?.value || null;
        const msPassword = document.getElementById('ms-password-setup')?.value || null;
        
        userCredentials = {
          username: username || 'User',
          password,
          securityQuestion,
          securityAnswer,
          microsoftAccount: msEmail,
          profilePicture: currentSlide.querySelector('.profile-picture img')?.src
        };
      }
      
      if (currentSlideNumber === 3) {
        // Save Windows version with null check
        const versionSelect = currentSlide.querySelector('.version-select');
        if (versionSelect) {
          userCredentials = {
            ...userCredentials,
            windowsVersion: versionSelect.value
          };
        }
      }
    });
  });
}

function finishSetup() {
  document.getElementById('setup-screen').classList.remove('active');
  showLoginScreen();
}

function showLoginScreen() {
  const existingLoginScreen = document.getElementById('login-screen');
  if (existingLoginScreen) {
    existingLoginScreen.remove();
  }

  const loginScreen = document.createElement('div');
  loginScreen.className = 'screen active';
  loginScreen.id = 'login-screen';
  
  loginScreen.innerHTML = `
    <div class="lockscreen">
      <div class="time-display"></div>
      <div class="date-display"></div>
      <div class="lockscreen-click">Click anywhere to unlock</div>
    </div>
    <div class="login-screen" style="display: none;">
      <div class="login-container">
        <div class="profile-picture">
          ${userCredentials?.profilePicture ? 
            `<img src="${userCredentials.profilePicture}" alt="${userCredentials?.username || 'User'}">` :
            `<span>${(userCredentials?.username || 'User').charAt(0).toUpperCase()}</span>`}
        </div>
        <h2>${userCredentials?.username || 'User'}</h2>
        
        ${userCredentials?.password ? `
          <div class="login-options">
            <div class="login-option active" onclick="toggleLoginOption('password')">Password</div>
            <div class="login-option" onclick="toggleLoginOption('security')">Security Question</div>
          </div>
          
          <input type="password" class="login-input" placeholder="Enter password" id="password-input">
          
          <div class="security-questions" style="display: none;">
            <select class="login-input" id="security-question" ${userCredentials?.securityQuestion ? `value="${userCredentials.securityQuestion}"` : ''}>
              <option value="pet">What was your first pet's name?</option>
              <option value="school">What elementary school did you attend?</option>
              <option value="city">In what city were you born?</option>
            </select>
            <input type="text" class="login-input" placeholder="Answer" id="security-answer">
          </div>
        ` : ''}
        
        <button class="login-button" onclick="login()">${userCredentials?.password ? 'Sign in' : 'Continue'}</button>
        
        <div style="margin-top: 20px;">
          <a href="#" onclick="toggleMicrosoftAccount()">Sign in with Microsoft account</a>
        </div>
        
        <div class="microsoft-account" style="display: none;">
          <input type="email" class="login-input" placeholder="Email" id="ms-email">
          <input type="password" class="login-input" placeholder="Password" id="ms-password">
          <button class="login-button" onclick="loginWithMicrosoft()">Sign in</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(loginScreen);

  // Add time and date update functionality
  function updateLockscreen() {
    const timeDisplay = loginScreen.querySelector('.time-display');
    const dateDisplay = loginScreen.querySelector('.date-display');
    if (timeDisplay && dateDisplay) {
      const now = new Date();
      timeDisplay.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      dateDisplay.textContent = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
    }
  }
  
  updateLockscreen();
  setInterval(updateLockscreen, 1000);

  // Add click handler to show login screen
  const lockscreen = loginScreen.querySelector('.lockscreen');
  const loginScreenContent = loginScreen.querySelector('.login-screen');
  
  if (lockscreen && loginScreenContent) {
    lockscreen.addEventListener('click', () => {
      lockscreen.style.transform = 'translateY(-100%)';
      loginScreenContent.style.display = 'flex';
    });
  }
}

function login() {
  // Safely get elements with null checks
  const passwordInput = document.getElementById('password-input');
  const securityAnswer = document.getElementById('security-answer');
  const securityQuestions = document.querySelector('.security-questions');
  
  // If userCredentials is null/undefined, just log in
  if (!userCredentials || !userCredentials.password) {
    loginSuccess();
    return;
  }
  
  // Check if using security questions (if element exists and is visible)
  if (securityQuestions && securityQuestions.style.display === 'block') {
    if (securityAnswer && 
        userCredentials.securityAnswer && 
        securityAnswer.value.toLowerCase() === userCredentials.securityAnswer.toLowerCase()) {
      loginSuccess();
    } else if (securityAnswer) {
      securityAnswer.value = '';
      securityAnswer.placeholder = 'Incorrect answer';
      securityAnswer.style.borderColor = 'red';
    }
  } else {
    // Password check
    if (passwordInput && 
        userCredentials.password && 
        passwordInput.value === userCredentials.password) {
      loginSuccess();
    } else if (passwordInput) {
      passwordInput.value = '';
      passwordInput.placeholder = 'Incorrect password';
      passwordInput.style.borderColor = 'red';
    }
  }
}

function loginSuccess() {
  currentUser = userCredentials;
  const loginScreen = document.getElementById('login-screen');
  if (loginScreen) {
    loginScreen.remove();
  }
  const desktop = document.getElementById('desktop');
  if (desktop) {
    desktop.classList.add('active');
  }
}

function toggleLoginOption(option) {
  const options = document.querySelectorAll('.login-option');
  const securityQuestions = document.querySelector('.security-questions');
  const passwordInput = document.getElementById('password-input');
  
  if (!options || !securityQuestions || !passwordInput) return;
  
  options.forEach(opt => opt.classList.remove('active'));
  
  if (option === 'security') {
    options[1].classList.add('active');
    securityQuestions.style.display = 'block';
    passwordInput.style.display = 'none';
  } else {
    options[0].classList.add('active');
    securityQuestions.style.display = 'none';
    passwordInput.style.display = 'block';
  }
}

function toggleMicrosoftAccount() {
  const msAccount = document.querySelector('.microsoft-account');
  if (!msAccount) return;
  
  msAccount.style.display = msAccount.style.display === 'none' ? 'block' : 'none';
}

// Add a Microsoft account login function
function loginWithMicrosoft() {
  const msEmail = document.getElementById('ms-email');
  const msPassword = document.getElementById('ms-password');
  
  if (!msEmail || !msPassword) return;
  
  // For demo purposes, just log in
  loginSuccess();
}

function initializeStartMenu() {
  const startButton = document.getElementById('start-button');
  const startMenu = document.getElementById('start-menu');
  const searchBar = document.querySelector('.search-bar');
  
  // Remove any existing event listeners using clone/replace
  const newStartButton = startButton.cloneNode(true);
  startButton.parentNode.replaceChild(newStartButton, startButton);
  
  // Toggle start menu visibility with new click handler
  newStartButton.addEventListener('click', (e) => {
    e.stopPropagation();
    startMenu.style.display = startMenu.style.display === 'none' ? 'grid' : 'none';
    
    if (startMenu.style.display !== 'none') {
      // Update live tiles when start menu opens
      updateWeather();
      updateCalendar();
      updateNews();
      updateMail();
    }
    
    // Reset search when opening start menu
    if (searchBar) {
      searchBar.value = '';
      const allAppTiles = document.querySelectorAll('.app-tile');
      allAppTiles.forEach(tile => tile.style.display = 'flex');
    }
  });

  // Close start menu when clicking anywhere else
  document.addEventListener('click', (e) => {
    if (startMenu && !startMenu.contains(e.target) && !newStartButton.contains(e.target)) {
      startMenu.style.display = 'none';
    }
  });

  // Update search functionality
  if (searchBar) {
    searchBar.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      const allAppTiles = document.querySelectorAll('.app-tile');
      
      if (searchTerm) {
        startMenu.style.display = 'grid';
      }
      
      allAppTiles.forEach(tile => {
        const appName = tile.textContent.trim().toLowerCase();
        tile.style.display = appName.includes(searchTerm) ? 'flex' : 'none';
      });
    });
  }
}

function initializeTaskbar() {
  const systemTray = document.querySelector('.system-tray');
  if (!systemTray) return;
  
  // Update system tray HTML
  systemTray.innerHTML = `
    <div class="wifi-indicator">
      <svg class="wifi-icon" viewBox="0 0 24 24">
        <path fill="currentColor" d="M12,21L15.6,16.2C14.6,15.45 13.35,15 12,15C10.65,15 9.4,15.45 8.4,16.2L12,21M12,3C7.95,3 4.21,4.34 1.2,6.6L3,9C5.5,7.12 8.62,6 12,6C15.38,6 18.5,7.12 21,9L22.8,6.6C19.79,4.34 16.05,3 12,3M12,9C9.3,9 6.81,9.89 4.8,11.4L6.6,13.8C8.1,12.67 9.97,12 12,12C14.03,12 15.9,12.67 17.4,13.8L19.2,11.4C17.19,9.89 14.7,9 12,9Z"/>
      </svg>
    </div>
    <div class="battery-indicator" onclick="toggleBatteryPlug()">
      <div class="battery-icon">
        <div class="battery-level" style="width: 100%"></div>
      </div>
      <span class="battery-text">100%</span>
    </div>
    <div class="theme-toggle">🌓</div>
    <div class="time"></div>
  `;
  
  initializeBattery();
}

function createWindow(title, content, icon = null) {
  // Check if window already exists
  const existingWindows = document.querySelectorAll('.window');
  for (let window of existingWindows) {
    const windowTitle = window.querySelector('.window-header span')?.textContent;
    if (windowTitle === title) {
      // If window exists, just focus it
      window.style.zIndex = '10';
      document.querySelectorAll('.taskbar-app').forEach(app => {
        app.classList.toggle('active', app.dataset.windowId === window.id);
      });
      return;
    }
  }

  // If window doesn't exist, create it
  const windowId = 'window-' + Date.now();
  const window = document.createElement('div');
  window.className = 'window loading';
  window.id = windowId;
  window.style.top = '50px';
  window.style.left = '50px';
  window.style.width = '800px';  
  window.style.height = '600px'; 
  
  window.innerHTML = `
    <div class="window-header">
      <span>${title}</span>
      <div class="window-controls">
        <button class="window-button minimize-button">−</button>
        <button class="window-button maximize-button">□</button>
        <button class="window-button close-button">×</button>
      </div>
    </div>
    <div class="window-content">
      <div class="loading-screen">
        <div class="spinner"></div>
        <div class="loading-text">Loading ${title}...</div>
      </div>
      <div class="actual-content" style="display: none;">
        ${content}
      </div>
    </div>
    <div class="resize-handle"></div>
  `;
  
  document.getElementById('desktop').appendChild(window);

  // Show loading animation for 2.5 seconds
  setTimeout(() => {
    window.querySelector('.loading-screen').style.display = 'none';
    window.querySelector('.actual-content').style.display = 'block';
  }, 2500);

  // Add taskbar entry
  const taskbarApp = document.createElement('div');
  taskbarApp.className = 'taskbar-app active';
  taskbarApp.dataset.windowId = windowId;
  taskbarApp.innerHTML = icon ? 
    `<img src="${icon}" alt="${title}"><span>${title}</span>` :
    `<span>${title}</span>`;
  
  document.querySelector('.taskbar-apps').appendChild(taskbarApp);

  // Add resize functionality
  const resizeHandle = window.querySelector('.resize-handle');
  let isResizing = false;
  let originalWidth;
  let originalHeight;
  let originalX;
  let originalY;

  resizeHandle.addEventListener('mousedown', (e) => {
    isResizing = true;
    originalWidth = window.offsetWidth;
    originalHeight = window.offsetHeight;
    originalX = e.clientX;
    originalY = e.clientY;
    
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
  });

  function resize(e) {
    if (!isResizing) return;
    
    const width = originalWidth + (e.clientX - originalX);
    const height = originalHeight + (e.clientY - originalY);
    
    if (width > 400) { 
      window.style.width = width + 'px';
    }
    if (height > 300) { 
      window.style.height = height + 'px';
    }
  }

  function stopResize() {
    isResizing = false;
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResize);
  }

  // Event listeners
  window.querySelector('.close-button').addEventListener('click', () => {
    window.classList.add('closing');
    taskbarApp.remove();
    setTimeout(() => window.remove(), 200);
  });
  
  window.querySelector('.minimize-button').addEventListener('click', () => {
    window.classList.add('minimized');
    document.querySelectorAll('.taskbar-app').forEach(app => app.classList.remove('active'));
  });
  
  window.querySelector('.maximize-button').addEventListener('click', () => {
    window.classList.toggle('maximized');
  });
  
  taskbarApp.addEventListener('click', () => {
    if (window.classList.contains('minimized')) {
      window.classList.remove('minimized');
      document.querySelectorAll('.taskbar-app').forEach(app => app.classList.remove('active'));
      taskbarApp.classList.add('active');
    } else {
      document.querySelectorAll('.window').forEach(w => {
        if (w.id === windowId) {
          w.style.zIndex = '10';
        } else {
          w.style.zIndex = '1';
        }
      });
      document.querySelectorAll('.taskbar-app').forEach(app => app.classList.remove('active'));
      taskbarApp.classList.add('active');
    }
  });
  
  window.addEventListener('mousedown', () => {
    document.querySelectorAll('.window').forEach(w => w.style.zIndex = '1');
    document.querySelectorAll('.taskbar-app').forEach(app => app.classList.remove('active'));
    window.style.zIndex = '10';
    taskbarApp.classList.add('active');
  });
  
  makeDraggable(window);
}

function makeDraggable(element) {
  const header = element.querySelector('.window-header');
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;
  let xOffset = 0;
  let yOffset = 0;

  header.addEventListener('mousedown', startDragging);

  function startDragging(e) {
    if (element.classList.contains('maximized')) return;
    
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;

    if (e.target === header) {
      isDragging = true;
      document.addEventListener('mousemove', drag);
      document.addEventListener('mouseup', stopDragging);
    }
  }

  function drag(e) {
    if (isDragging) {
      e.preventDefault();
      
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;

      xOffset = currentX;
      yOffset = currentY;

      element.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
    }
  }

  function stopDragging() {
    initialX = currentX;
    initialY = currentY;
    isDragging = false;
    
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDragging);
  }
}

// App handlers
document.addEventListener('click', (e) => {
  const appTile = e.target.closest('.app-tile');
  if (!appTile) return;

  const app = appTile.dataset.app;
  switch(app) {
    case 'edge':
      openEdge();
      break;
    case 'store':
      openStore();
      break;
    case 'explorer':
      openExplorer();
      break;
    case 'settings':
      openSettings();
      break;
    case 'minecraft':
      openMinecraft();
      break;
    case 'chrome':
      openChrome();
      break;
    case 'vmware':
      openVMware();
      break;
  }
});

function openEdge() {
  const content = `
    <div class="browser-window">
      <div class="browser-toolbar">
        <button class="browser-back">←</button>
        <button class="browser-forward">→</button>
        <button class="browser-reload">↻</button>
        <input type="text" class="url-bar" value="https://www.bing.com">
        <button class="browser-go">Go</button>
      </div>
      <div class="browser-content">
        ${!chromeInstalled ? `
          <button id="install-chrome-btn" class="install-chrome" onclick="installChrome()">Install Chrome</button>
        ` : ''}
        <iframe src="https://www.bing.com" sandbox="allow-same-origin allow-scripts allow-popups allow-forms"></iframe>
      </div>
    </div>
  `;
  
  createWindow('Microsoft Edge', content, 'Microsoft_Edge_logo_(2019).svg.png');
  initializeBrowser(document.querySelector('.window:last-child'));
  
  // Add click handler for Chrome installation
  const installButton = document.querySelector('#install-chrome-btn');
  if (installButton) {
    installButton.onclick = installChrome;
  }
}

function installChrome() {
  chromeInstalled = true;
  const appsGrid = document.querySelector('.apps-grid');
  
  // Remove existing Chrome tile if it exists
  const existingChromeTile = appsGrid.querySelector('[data-app="chrome"]');
  if (existingChromeTile) {
    existingChromeTile.remove();
  }
  
  // Create and add Chrome tile to Start menu
  const chromeTile = document.createElement('div');
  chromeTile.className = 'app-tile';
  chromeTile.dataset.app = 'chrome';
  chromeTile.innerHTML = `
    <img src="Google_Chrome_icon_(February_2022).svg.png" alt="Google Chrome" class="app-icon">
    Chrome
  `;
  appsGrid.appendChild(chromeTile);
  
  // Add click handler directly to the new Chrome tile
  chromeTile.addEventListener('click', () => {
    document.getElementById('start-menu').style.display = 'none';
    openChrome();
  });
  
  // Update Edge windows to remove install button
  const edgeWindows = document.querySelectorAll('.window');
  edgeWindows.forEach(window => {
    if (window.querySelector('.window-header span').textContent === 'Microsoft Edge') {
      const installButton = window.querySelector('#install-chrome-btn');
      if (installButton) {
        installButton.remove();
      }
    }
  });
}

function openStore() {
  const minecraftContent = `
    <div class="store-grid">
      <div class="store-item">
        <svg class="app-icon" style="width: 100px; height: 100px;" viewBox="0 0 24 24">
          <path d="M4 2h16c1.1 0 2 .9 2 2v16c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2zm2 4v12h12V6H6z"/>
        </svg>
        <h3>Minecraft</h3>
        <p>Build, create, and explore infinite worlds</p>
        <p>$26.99</p>
        ${minecraftInstalled ? 
          '<button disabled>Installed</button>' : 
          '<button onclick="installMinecraft()">Install</button>'}
      </div>
    </div>
  `;
  
  createWindow('Microsoft Store', minecraftContent, 'Microsoft_Store.svg.png');
}

function installMinecraft() {
  minecraftInstalled = true;
  installedApps.push('minecraft');
  
  // Add Minecraft tile to Start menu
  const minecraftTile = document.createElement('div');
  minecraftTile.className = 'app-tile';
  minecraftTile.dataset.app = 'minecraft';
  minecraftTile.innerHTML = `
    <svg class="app-icon" viewBox="0 0 24 24">
      <path d="M4 2h16c1.1 0 2 .9 2 2v16c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2zm2 4v12h12V6H6z"/>
    </svg>
    Minecraft
  `;
  document.querySelector('.apps-grid').appendChild(minecraftTile);
  
  // Update the store window
  const storeWindow = document.querySelector('.window');
  if (storeWindow) {
    openStore();
  }
}

function openExplorer() {
  createWindow('File Explorer', `
    <div>
      <h3>Quick access</h3>
      <ul>
        <li>Desktop</li>
        <li>Downloads</li>
        <li>Documents</li>
        <li>Pictures</li>
      </ul>
    </div>
  `, 'FREE_NITRO!.png');
}

function openMinecraft() {
  createWindow('Minecraft Launcher', `
    <div style="text-align: center; padding: 20px;">
      <h2>Minecraft Launcher</h2>
      <p>Welcome to Minecraft!</p>
      <button style="margin-top: 20px; padding: 10px 20px;">Play</button>
    </div>
  `);
}

function openSettings() {
  const systemSection = `
    <div class="settings-section active" id="system-section">
      <h2>System</h2>
      <div class="settings-option">
        <img src="Windows_logo_-_2012_(dark_blue).svg.png" alt="Windows Logo" style="width: 50px; height: 50px; margin-bottom: 20px;">
        <label>Display Resolution</label>
        <select id="resolution-select" onchange="changeResolution(this.value)">
          <option value="1920x1080">1920 x 1080</option>
          <option value="1600x900">1600 x 900</option>
          <option value="1366x768">1366 x 768</option>
          <option value="1280x720">1280 x 720</option>
        </select>
      </div>
      <div class="settings-option">
        <h3>Windows 11 Upgrade</h3>
        <p>Your PC meets the requirements for Windows 11</p>
        ${isUpgradingToWindows11 ? `
          <div class="upgrade-progress">
            <div class="progress-text">Downloading Windows 11...</div>
            <div class="setup-progress" style="margin: 10px 0;">
              <div class="progress-bar" style="width: 0%"></div>
            </div>
          </div>
        ` : `
          <button onclick="startWindows11Upgrade()" class="setup-next" style="margin-top: 10px;">
            Download and Install Windows 11
          </button>
        `}
      </div>
    </div>
  `;

  createWindow('Settings', `
    <div class="settings-grid">
      <div class="settings-nav">
        <div class="settings-nav-item active" data-section="system">System</div>
        <div class="settings-nav-item" data-section="personalization">Personalization</div>
        <div class="settings-nav-item" data-section="accounts">Accounts</div>
        <div class="settings-nav-item" data-section="apps">Apps</div>
      </div>
      <div class="settings-content">
        ${systemSection}
        <div class="settings-section" id="personalization-section">
          <h2>Personalization</h2>
          <div class="settings-option">
            <label>Theme</label>
            <select id="theme-select" onchange="document.body.dataset.theme = this.value">
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>
          <div class="settings-option">
            <label>Accent Color</label>
            <div class="color-grid">
              <div class="color-option selected" style="background: #0078d4" data-color="#0078d4"></div>
              <div class="color-option" style="background: #00b294" data-color="#00b294"></div>
              <div class="color-option" style="background: #f7630c" data-color="#f7630c"></div>
              <div class="color-option" style="background: #e74856" data-color="#e74856"></div>
              <div class="color-option" style="background: #0099bc" data-color="#0099bc"></div>
              <div class="color-option" style="background: #7a7574" data-color="#7a7574"></div>
              <div class="color-option" style="background: #767676" data-color="#767676"></div>
              <div class="color-option" style="background: #ff8c00" data-color="#ff8c00"></div>
            </div>
          </div>
          <div class="settings-option">
            <label>Desktop Background</label>
            <div class="wallpaper-grid">
              ${availableWallpapers.map(wallpaper => `
                <div class="wallpaper-preview ${wallpaper.url === currentWallpaper ? 'selected' : ''}" 
                     data-wallpaper="${wallpaper.url}" 
                     onclick="setWallpaper('${wallpaper.url}')">
                  <img src="${wallpaper.url}" alt="${wallpaper.name}">
                  <p>${wallpaper.name}</p>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
        <div class="settings-section" id="accounts-section">
          <h2>Accounts</h2>
          <div class="accounts-list">
            ${users.map(user => `
              <div class="account-item">
                <div class="account-info">
                  <div class="profile-picture">
                    ${user.profilePicture ? 
                      `<img src="${user.profilePicture}" alt="${user.username}">` :
                      `<span>${user.username.charAt(0).toUpperCase()}</span>`}
                  </div>
                  <div>
                    <h3>${user.username}</h3>
                    <p>${user.microsoftAccount || 'Local account'}</p>
                  </div>
                </div>
                <button onclick="removeUser('${user.username}')" 
                  ${user.username === currentUser?.username ? 'disabled' : ''}>
                  Remove
                </button>
              </div>
            `).join('') || '<p>No other users</p>'}
            <button onclick="addNewUser()" class="add-user-btn">Add new user</button>
          </div>
        </div>
        <div class="settings-section" id="apps-section">
          <h2>Apps & features</h2>
          <div class="settings-option">
            <p>Installed apps:</p>
            <ul>
              ${installedApps.map(app => `<li>${app}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    </div>
  `);
  
  // Add event listeners for settings navigation
  const settingsWindow = document.querySelector('.window:last-child');
  if (settingsWindow) {
    const navItems = settingsWindow.querySelectorAll('.settings-nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        // Update active nav item
        navItems.forEach(ni => ni.classList.remove('active'));
        item.classList.add('active');
        
        // Show the corresponding section
        const sectionId = item.dataset.section + '-section';
        const sections = settingsWindow.querySelectorAll('.settings-section');
        sections.forEach(section => {
          section.classList.remove('active');
          if (section.id === sectionId) {
            section.classList.add('active');
          }
        });
      });
    });
    
    // Initialize color options
    const colorOptions = settingsWindow.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
      option.addEventListener('click', () => {
        setAccentColor(option.dataset.color);
      });
    });
  }
}

function addNewUser() {
  createWindow('Add New User', `
    <div class="new-user-form">
      <h2>Create a new user</h2>
      <input type="text" id="new-username" placeholder="Username" class="login-input">
      <div class="setup-option" onclick="togglePasswordSetup(this)">
        Add a password
      </div>
      <div class="password-setup" style="display: none;">
        <input type="password" id="new-password" placeholder="Password" class="login-input">
        <select id="new-security-question" class="login-input">
          <option value="pet">What was your first pet's name?</option>
          <option value="school">What elementary school did you attend?</option>
          <option value="city">In what city were you born?</option>
        </select>
        <input type="text" id="new-security-answer" placeholder="Security answer" class="login-input">
      </div>
      <div class="setup-option" onclick="toggleMicrosoftSetup(this)">
        Add Microsoft account
      </div>
      <div class="microsoft-setup" style="display: none;">
        <input type="email" id="new-ms-email" placeholder="Email" class="login-input">
        <input type="password" id="new-ms-password" placeholder="Password" class="login-input">
      </div>
      <button onclick="createNewUser()" class="login-button">Create User</button>
    </div>
  `);
}

function togglePasswordSetup(element) {
  const passwordSetup = document.querySelector('.password-setup');
  if (passwordSetup) {
    passwordSetup.style.display = passwordSetup.style.display === 'none' ? 'block' : 'none';
    element.classList.toggle('selected');
  }
}

function toggleMicrosoftSetup(element) {
  const microsoftSetup = document.querySelector('.microsoft-setup');
  if (microsoftSetup) {
    microsoftSetup.style.display = microsoftSetup.style.display === 'none' ? 'block' : 'none';
    element.classList.toggle('selected');
  }
}

function createNewUser() {
  const username = document.getElementById('new-username').value;
  const password = document.getElementById('new-password')?.value;
  const securityQuestion = document.getElementById('new-security-question')?.value;
  const securityAnswer = document.getElementById('new-security-answer')?.value;
  const msEmail = document.getElementById('new-ms-email')?.value;
  const msPassword = document.getElementById('new-ms-password')?.value;

  if (!username) {
    alert('Username is required');
    return;
  }

  if (users.some(user => user.username === username)) {
    alert('Username already exists');
    return;
  }

  const newUser = {
    username,
    password,
    securityQuestion,
    securityAnswer,
    microsoftAccount: msEmail,
    microsoftPassword: msPassword
  };

  users.push(newUser);
  
  // Close the window and refresh settings
  const window = document.querySelector('.window:last-child');
  if (window) {
    window.remove();
  }
  openSettings();
}

function removeUser(username) {
  if (confirm(`Are you sure you want to remove ${username}?`)) {
    users = users.filter(user => user.username !== username);
    openSettings();
  }
}

function shutdown() {
  document.body.innerHTML = '<div class="shutdown-screen">Shutting down...</div>';
  setTimeout(() => {
    window.close();
  }, 2000);
}

function restart() {
  // Set restart flag
  sessionStorage.setItem('isRestart', 'true');
  
  document.body.innerHTML = '<div class="shutdown-screen">Restarting...</div>';
  setTimeout(() => {
    location.reload();
  }, 2000);
}

function logoff() {
  currentUser = null;
  document.getElementById('desktop').classList.remove('active');
  showLoginScreen();
}

function openChrome() {
  const content = `
    <div class="browser-window">
      <div class="browser-toolbar">
        <button class="browser-back">←</button>
        <button class="browser-forward">→</button>
        <button class="browser-reload">↻</button>
        <input type="text" class="url-bar" value="https://www.google.com">
        <button class="browser-go">Go</button>
      </div>
      <div class="browser-content">
        <iframe src="https://www.google.com" sandbox="allow-same-origin allow-scripts allow-popups allow-forms"></iframe>
      </div>
    </div>
  `;
  
  createWindow('Google Chrome', content, 'Google_Chrome_icon_(February_2022).svg.png');
  initializeBrowser(document.querySelector('.window:last-child'));
}

function initializeBrowser(windowElement) {
  if (!windowElement) return; // Guard against null windowElement

  const toolbar = windowElement.querySelector('.browser-toolbar');
  const urlBar = windowElement.querySelector('.url-bar');
  const iframe = windowElement.querySelector('iframe');
  const goButton = windowElement.querySelector('.browser-go');
  const backButton = windowElement.querySelector('.browser-back');
  const forwardButton = windowElement.querySelector('.browser-forward');
  const reloadButton = windowElement.querySelector('.browser-reload');

  // Guard against any null elements
  if (!toolbar || !urlBar || !iframe || !goButton || !backButton || !forwardButton || !reloadButton) {
    console.error('Browser elements not found');
    return;
  }

  // Navigation functions with error handling
  function navigate(url) {
    try {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      if (urlBar) urlBar.value = url;
      if (iframe) iframe.src = url;
    } catch (err) {
      console.error('Navigation error:', err);
    }
  }

  // Event listeners with null checks
  urlBar.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      navigate(urlBar.value);
    }
  });

  goButton.addEventListener('click', () => {
    navigate(urlBar.value);
  });

  // Handle navigation buttons with try-catch
  backButton.addEventListener('click', () => {
    try {
      const currentUrl = urlBar.value;
      if (iframe) iframe.src = currentUrl;
    } catch (err) {
      console.error('Back navigation error:', err);
    }
  });

  forwardButton.addEventListener('click', () => {
    try {
      const currentUrl = urlBar.value;
      if (iframe) iframe.src = currentUrl;
    } catch (err) {
      console.error('Forward navigation error:', err);
    }
  });

  reloadButton.addEventListener('click', () => {
    try {
      const currentUrl = urlBar.value;
      if (iframe) iframe.src = currentUrl;
    } catch (err) {
      console.error('Reload error:', err);
    }
  });

  // Add load event listener to handle navigation state
  if (iframe) {
    iframe.addEventListener('load', () => {
      try {
        if (urlBar && iframe.src) {
          urlBar.value = iframe.src;
        }
      } catch (err) {
        console.error('URL update error:', err);
      }
    });
  }
}

function openVMware() {
  const content = `
    <div style="padding: 20px;">
      <h2>VMware Workstation</h2>
      <div style="display: flex; gap: 20px; margin-top: 20px;">
        <div style="flex: 1; border-right: 1px solid var(--window-border); padding-right: 20px;">
          <h3>Available Virtual Machines</h3>
          <div id="vm-list" style="margin-top: 10px;">
            ${downloadedISOs.map(iso => `
              <div class="vm-item" style="padding: 10px; margin: 5px 0; border: 1px solid var(--window-border); border-radius: 4px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span>${iso.name}</span>
                  <button onclick="startVM('${iso.name}')" style="padding: 5px 10px;">Start</button>
                </div>
              </div>
            `).join('') || '<p>No VMs created yet</p>'}
          </div>
        </div>
        <div style="flex: 1;">
          <h3>Download ISO Files</h3>
          <div class="iso-list" style="margin-top: 10px;">
            <div class="iso-item" style="padding: 10px; margin: 5px 0; border: 1px solid var(--window-border); border-radius: 4px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>Windows 11 Pro</span>
                <button onclick="downloadISO('Windows 11 Pro')"
                  ${downloadedISOs.some(iso => iso.name === 'Windows 11 Pro') ? 'disabled' : ''}>
                  ${downloadedISOs.some(iso => iso.name === 'Windows 11 Pro') ? 'Downloaded' : 'Download'}
                </button>
              </div>
            </div>
            <div class="iso-item" style="padding: 10px; margin: 5px 0; border: 1px solid var(--window-border); border-radius: 4px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>Windows 10 Pro</span>
                <button onclick="downloadISO('Windows 10 Pro')"
                  ${downloadedISOs.some(iso => iso.name === 'Windows 10 Pro') ? 'disabled' : ''}>
                  ${downloadedISOs.some(iso => iso.name === 'Windows 10 Pro') ? 'Downloaded' : 'Download'}
                </button>
              </div>
            </div>
            <div class="iso-item" style="padding: 10px; margin: 5px 0; border: 1px solid var(--window-border); border-radius: 4px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>Windows 7 Ultimate</span>
                <button onclick="downloadISO('Windows 7 Ultimate')" 
                  ${downloadedISOs.some(iso => iso.name === 'Windows 7 Ultimate') ? 'disabled' : ''}>
                  ${downloadedISOs.some(iso => iso.name === 'Windows 7 Ultimate') ? 'Downloaded' : 'Download'}
                </button>
              </div>
            </div>
            <div class="iso-item" style="padding: 10px; margin: 5px 0; border: 1px solid var(--window-border); border-radius: 4px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>Windows Vista Business</span>
                <button onclick="downloadISO('Windows Vista Business')"
                  ${downloadedISOs.some(iso => iso.name === 'Windows Vista Business') ? 'disabled' : ''}>
                  ${downloadedISOs.some(iso => iso.name === 'Windows Vista Business') ? 'Downloaded' : 'Download'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  createWindow('VMware Workstation', content);

  // Add the download and start VM functions to window scope
  window.downloadISO = downloadISO;
  window.startVM = startVM;
}

function downloadISO(isoName) {
  const vmWindow = document.querySelector('.window:last-child');
  if (!vmWindow) return;
  
  // Find the ISO item with the matching name
  const isoItems = vmWindow.querySelectorAll('.iso-item');
  let targetIsoItem = null;
  
  for (let item of isoItems) {
    const spanText = item.querySelector('span')?.textContent;
    if (spanText === isoName) {
      targetIsoItem = item;
      break;
    }
  }
  
  if (!targetIsoItem) return;
  
  const progressBar = document.createElement('div');
  progressBar.style.width = '100%';
  progressBar.style.height = '4px';
  progressBar.style.background = 'rgba(255,255,255,0.1)';
  progressBar.style.marginTop = '10px';
  
  const progress = document.createElement('div');
  progress.style.width = '0%';
  progress.style.height = '100%';
  progress.style.background = 'var(--accent-color)';
  progress.style.transition = 'width 0.5s';
  
  progressBar.appendChild(progress);
  targetIsoItem.appendChild(progressBar);
  
  let downloaded = 0;
  const interval = setInterval(() => {
    downloaded += Math.random() * 10;
    if (downloaded >= 100) {
      downloaded = 100;
      clearInterval(interval);
      downloadedISOs.push({
        name: isoName,
        size: Math.floor(Math.random() * 3000) + 2000 + 'MB'
      });
      openVMware(); // Refresh the VMware window
    }
    progress.style.width = downloaded + '%';
  }, 200);
}

function startVM(isoName) {
  const isWindows11 = isoName === 'Windows 11 Pro';
  const vmContent = `
    <div style="height: 100%; display: flex; flex-direction: column;">
      <div style="background: var(--taskbar-color); padding: 10px; display: flex; gap: 10px;">
        <button onclick="powerVM('${isoName}', 'start')">Power On</button>
        <button onclick="powerVM('${isoName}', 'stop')">Power Off</button>
        <button onclick="powerVM('${isoName}', 'restart')">Restart</button>
      </div>
      <div style="flex: 1; background: #000; color: #fff; padding: 10px; font-family: monospace; overflow-y: auto;">
        <p>VMware Workstation</p>
        <p>Loading ${isoName}...</p>
        ${isWindows11 ? `
          <p style="color: yellow;">[System] Checking system requirements for Windows 11...</p>
          <p>[System] CPU: Compatible</p>
          <p>[System] RAM: 4GB Available</p>
          <p>[System] TPM 2.0: Enabled</p>
          <p>[System] Secure Boot: Supported</p>
        ` : ''}
        <div id="vm-console-${isoName.replace(/\s+/g, '-')}"></div>
      </div>
    </div>
  `;
  
  createWindow(`${isoName} - VMware`, vmContent);
  
  // Add the power VM function to window scope
  window.powerVM = powerVM;
}

function powerVM(isoName, action) {
  const consoleElement = document.getElementById(`vm-console-${isoName.replace(/\s+/g, '-')}`);
  const isWindows11 = isoName === 'Windows 11 Pro';
  
  switch(action) {
    case 'start':
      consoleElement.innerHTML += `<p>[System] Starting ${isoName}...</p>`;
      setTimeout(() => {
        consoleElement.innerHTML += `<p>[System] BIOS initialized</p>`;
        if(isWindows11) {
          consoleElement.innerHTML += `<p>[System] Secure Boot verified</p>`;
          consoleElement.innerHTML += `<p>[System] TPM 2.0 check passed</p>`;
        }
        setTimeout(() => {
          consoleElement.innerHTML += `<p>[System] Loading operating system...</p>`;
          if(isWindows11) {
            consoleElement.innerHTML += `<p>[System] Preparing Windows 11 installation environment...</p>`;
          }
        }, 1000);
      }, 1000);
      break;
    case 'stop':
      consoleElement.innerHTML += `<p>[System] Shutting down ${isoName}...</p>`;
      setTimeout(() => {
        consoleElement.innerHTML += `<p>[System] System powered off</p>`;
      }, 1000);
      break;
    case 'restart':
      consoleElement.innerHTML += `<p>[System] Restarting ${isoName}...</p>`;
      setTimeout(() => {
        consoleElement.innerHTML += `<p>[System] System restarting...</p>`;
        setTimeout(() => {
          consoleElement.innerHTML += `<p>[System] BIOS initialized</p>`;
          if(isWindows11) {
            consoleElement.innerHTML += `<p>[System] Secure Boot verified</p>`;
            consoleElement.innerHTML += `<p>[System] TPM 2.0 check passed</p>`;
          }
          setTimeout(() => {
            consoleElement.innerHTML += `<p>[System] Loading operating system...</p>`;
            if(isWindows11) {
              consoleElement.innerHTML += `<p>[System] Preparing Windows 11 installation environment...</p>`;
            }
          }, 1000);
        }, 1000);
      }, 1000);
      break;
  }
}

// Add VMware to the start menu
function addVMwareToStartMenu() {
  const appsGrid = document.querySelector('.apps-grid');
  const vmwareTile = document.createElement('div');
  vmwareTile.className = 'app-tile';
  vmwareTile.dataset.app = 'vmware';
  vmwareTile.innerHTML = `
    <svg class="app-icon" viewBox="0 0 24 24">
      <path fill="currentColor" d="M21,3H3A2,2 0 0,0 1,5V19A2,2 0 0,0 3,21H21A2,2 0 0,0 23,19V5A2,2 0 0,0 21,3M21,19H3V5H21V19M9,11H7V13H9V11M13,11H11V13H13V11M17,11H15V13H17V11Z"/>
    </svg>
    VMware
  `;
  appsGrid.appendChild(vmwareTile);
}

// New functions
function initializeLiveTiles() {
  updateWeather();
  updateCalendar();
  updateNews();
  updateMail();
  
  // Update tiles periodically
  setInterval(updateWeather, 300000); // 5 minutes
  setInterval(updateCalendar, 60000); // 1 minute
  setInterval(updateNews, 300000); // 5 minutes
  setInterval(updateMail, 180000); // 3 minutes
}

function updateWeather() {
  const weatherIcons = ['⛅', '☀️', '🌧️', '⛈️', '🌨️'];
  const temperatures = [68, 72, 75, 70, 65];
  const conditions = ['Partly Cloudy', 'Sunny', 'Rain', 'Thunderstorm', 'Snow'];
  
  const randomIndex = Math.floor(Math.random() * weatherIcons.length);
  
  const weatherTile = document.querySelector('.live-tile[data-app="weather"] .live-tile-weather');
  if (weatherTile) {
    weatherTile.innerHTML = `
      <div class="weather-icon">${weatherIcons[randomIndex]}</div>
      <div class="weather-temp">${temperatures[randomIndex]}°F</div>
      <div>${conditions[randomIndex]}</div>
    `;
  }
}

function updateCalendar() {
  const calendarTile = document.querySelector('.live-tile[data-app="calendar"] .live-tile-body');
  if (calendarTile) {
    const now = new Date();
    calendarTile.innerHTML = `
      <div style="font-size: 1.2em; font-weight: bold;">${now.toLocaleDateString('en-US', { weekday: 'short' })}</div>
      <div style="font-size: 2em;">${now.getDate()}</div>
      <div>${now.toLocaleDateString('en-US', { month: 'short' })}</div>
    `;
  }
}

function updateNews() {
  const headlines = [
    'New Windows Update Released',
    'Tech Giants Announce Collaboration',
    'AI Breakthrough in Computing',
    'Latest Gaming News',
    'Digital Privacy Concerns Rise'
  ];
  
  const newsFeed = document.getElementById('news-feed');
  if (newsFeed) {
    newsFeed.innerHTML = '';
    headlines.slice(0, 3).forEach((headline, index) => {
      const newsItem = document.createElement('div');
      newsItem.className = 'news-item';
      newsItem.style.animationDelay = `${index * 0.2}s`;
      newsItem.textContent = headline;
      newsFeed.appendChild(newsItem);
    });
  }
}

function updateMail() {
  const mailCount = Math.floor(Math.random() * 5);
  const mailTile = document.querySelector('.live-tile[data-app="mail"] #mail-count');
  if (mailTile) {
    mailTile.textContent = `${mailCount} unread`;
  }
}

function changeResolution(resolution) {
  const [width, height] = resolution.split('x').map(Number);
  const scale = Math.min(
    window.innerWidth / width,
    window.innerHeight / height
  );
  
  const desktop = document.getElementById('desktop');
  if (desktop) {
    desktop.style.transform = `scale(${scale})`;
    desktop.style.width = `${width}px`;
    desktop.style.height = `${height}px`;
  }
  
  // Update the select element to reflect current resolution
  const resolutionSelect = document.getElementById('resolution-select');
  if (resolutionSelect) {
    resolutionSelect.value = resolution;
  }
}

function startWindows11Upgrade() {
  isUpgradingToWindows11 = true;
  
  // Refresh settings window to show progress
  openSettings();
  
  const progressBar = document.querySelector('.upgrade-progress .progress-bar');
  const progressText = document.querySelector('.upgrade-progress .progress-text');
  
  // Guard against null elements
  if (!progressBar || !progressText) {
    console.error('Progress elements not found');
    return;
  }

  let progress = 0;
  const interval = setInterval(() => {
    progress += 1;
    progressBar.style.width = progress + '%';
    
    // Update status text at different stages
    if (progress === 25) {
      progressText.textContent = 'Downloading Windows 11 Setup...';
    } else if (progress === 50) {
      progressText.textContent = 'Verifying download...';
    } else if (progress === 75) {
      progressText.textContent = 'Preparing for installation...';
    } else if (progress === 100) {
      clearInterval(interval);
      progressText.textContent = 'Ready to upgrade';
      
      setTimeout(() => {
        // Show restart prompt
        if (confirm('Windows 11 is ready to install. Your PC needs to restart to begin the upgrade. Restart now?')) {
          document.body.innerHTML = `
            <div id="upgrade-screen" style="background: #000; color: #fff; height: 100vh; width: 100vw; display: flex; flex-direction: column; justify-content: center; align-items: center;">
              <img src="Windows_logo_-_2012_(dark_blue).svg.png" alt="Windows Logo" style="width: 100px; height: 100px; margin-bottom: 30px;">
              <div style="text-align: center; max-width: 600px;">
                <h2 style="margin-bottom: 20px;">Working on updates</h2>
                <p style="margin-bottom: 30px;">Installing Windows 11</p>
                <div style="width: 300px; height: 4px; background: #333; border-radius: 2px; margin: 0 auto;">
                  <div id="win11-progress" style="width: 0%; height: 100%; background: #0078D4; border-radius: 2px; transition: width 0.5s;"></div>
                </div>
                <p style="margin-top: 20px;"><span id="progress-percent">0</span>% complete</p>
                <p style="margin-top: 10px;">Your PC will restart several times</p>
                <p style="margin-top: 30px; color: #666;">Don't turn off your PC</p>
              </div>
            </div>
          `;

          // Simulate the Windows 11 installation process
          let installProgress = 0;
          const installInterval = setInterval(() => {
            installProgress += 1;
            const progressElement = document.getElementById('win11-progress');
            const percentElement = document.getElementById('progress-percent');
            
            if (progressElement && percentElement) {
              progressElement.style.width = installProgress + '%';
              percentElement.textContent = installProgress;
              
              if (installProgress >= 100) {
                clearInterval(installInterval);
                setTimeout(() => {
                  // Show the final restart screen
                  document.body.innerHTML = `
                    <div style="background: #000; color: #fff; height: 100vh; width: 100vw; display: flex; justify-content: center; align-items: center;">
                      <div style="text-align: center;">
                        <div class="spinner" style="display: inline-block; width: 40px; height: 40px; border: 4px solid #fff; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                        <p style="margin-top: 20px;">Restarting...</p>
                      </div>
                    </div>
                    <style>
                      @keyframes spin {
                        to { transform: rotate(360deg); }
                      }
                    </style>
                  `;
                  
                  // After a short delay, redirect to Windows 11
                  setTimeout(() => {
                    window.location.href = 'windows11.html';
                  }, 3000);
                }, 2000);
              }
            }
          }, 100);
        }
      }, 1000);
    }
  }, 100);
}

function initializeBattery() {
  updateBatteryStatus();
  
  if (isBatteryPlugged) {
    clearInterval(batteryInterval);
  } else {
    startBatteryDrain();
  }
}

function updateBatteryStatus() {
  const batteryIndicator = document.querySelector('.battery-indicator');
  if (!batteryIndicator) return;
  
  const levelEl = batteryIndicator.querySelector('.battery-level');
  const textEl = batteryIndicator.querySelector('.battery-text');
  const icon = batteryIndicator.querySelector('.battery-icon');
  
  if (levelEl) levelEl.style.width = batteryLevel + '%';
  if (textEl) textEl.textContent = batteryLevel + '%';
  
  if (icon) {
    if (isBatteryPlugged) {
      icon.classList.add('charging');
    } else {
      icon.classList.remove('charging');
    }
  }
}

function toggleBatteryPlug() {
  isBatteryPlugged = !isBatteryPlugged;
  
  if (isBatteryPlugged) {
    startCharging();
    clearInterval(batteryInterval);
  } else {
    clearInterval(chargingInterval);
    startBatteryDrain();
  }
  
  updateBatteryStatus();
}

function startBatteryDrain() {
  // 15 minutes = 900000ms
  // We'll update every second (1000ms)
  // So we need to drain 100% in 900 steps
  const drainPerStep = 100 / 900;
  
  batteryInterval = setInterval(() => {
    batteryLevel = Math.max(0, batteryLevel - drainPerStep);
    updateBatteryStatus();
    
    if (batteryLevel <= 0) {
      clearInterval(batteryInterval);
      shutdown();
    }
  }, 1000);
}

function startCharging() {
  // 2 minutes = 120000ms
  // We'll update every second (1000ms)
  // So we need to charge from current level to 100% in 120 steps
  const chargePerStep = (100 - batteryLevel) / 120;
  
  chargingInterval = setInterval(() => {
    batteryLevel = Math.min(100, batteryLevel + chargePerStep);
    updateBatteryStatus();
    
    if (batteryLevel >= 100) {
      clearInterval(chargingInterval);
    }
  }, 1000);
}