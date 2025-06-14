document.addEventListener('DOMContentLoaded', () => {
    // Setup XMB Navigation
    const categories = document.querySelectorAll('.category');
    
    // Create intro overlay
    const introOverlay = document.createElement('div');
    introOverlay.className = 'intro-overlay';
    document.body.appendChild(introOverlay);

    // Get audio elements with preloaded in HTML
    const startupSoundElements = {
        startup: document.getElementById('startupSound'),
        achievement: document.getElementById('achievementSound'),
        notification: document.getElementById('systemNotificationSound'),
        nav: document.getElementById('navSound')
    };

    // Set up audio system
    window.audioSystem = {
        sounds: {
            startup: new Audio('/Playstation 3 (PS3) StartUp - Sound Effect for editing 0.mp3'),
            achievement: new Audio('/achievement-unlock.mp3'),
            notification: new Audio('/notification-sounds.mp3'),
            nav: new Audio('/03 - SND Cursor.mp3')
        },
        
        // Ensure all audio elements are properly initialized
        init: function() {
            // Preload and set volume for all sounds
            Object.values(this.sounds).forEach(sound => {
                sound.pause();
                sound.currentTime = 0;
                sound.volume = 0.7;
                sound.preload = 'auto';
                sound.load();
            });
        },
        
        playSound: function(type) {
            try {
                const sound = this.sounds[type];
                if (sound) {
                    sound.currentTime = 0;
                    sound.play().catch(e => console.log(`Sound error ${type}`));
                } else {
                    console.error(`Sound not found: ${type}`);
                }
            } catch (error) {
                console.error(`Error playing sound: ${error}`);
            }
        },
        
        playDelayed: function(soundName, delay) {
            setTimeout(() => this.playSound(soundName), delay);
        }
    };

    // Initialize audio system early
    audioSystem.init();
    
    // Current positions
    let currentCategoryIndex = 0; // Start on Users
    let currentItemIndex = 0;
    let loggedIn = false;

    // Create PS3XMB global object early to avoid reference errors
    window.PS3XMB = {
        currentTheme: 'default',
        currentWaveStyle: 'default'
    };

    // First ensure audio elements are fully loaded before playing
    async function loadAudio() {
        try {
            // Load each sound        
            await loadSound(audioSystem.sounds.startup);
            await loadSound(audioSystem.sounds.achievement);
            await loadSound(audioSystem.sounds.notification);
            await loadSound(audioSystem.sounds.nav);
            console.log("Sounds loaded successfully");
        } catch (error) {
            console.error("Error loading sounds:", error);
        }
    }

    // Helper function to load a single sound
    function loadSound(audio) {
        return new Promise((resolve) => {
            audio.addEventListener('canplaythrough', resolve, { once: true });
            audio.load();
            audio.play().catch(error => {
                console.error('Audio load error:', error);
                resolve(); // Still resolve so others can try
            });
        });
    }

    loadAudio().then(() => {
        // Hide UI elements initially
        document.querySelector('.xmb-container').style.visibility = 'hidden';
        document.querySelector('.status-bar').style.visibility = 'hidden';
        document.querySelector('.controls-help').style.visibility = 'hidden';
        document.querySelector('.error-notice').style.visibility = 'hidden';

        // Start intro sequence
        setTimeout(() => {
            // Play the startup sound with a delay
            audioSystem.playDelayed('startup', 300);

            // Fade out the black overlay
            introOverlay.style.opacity = 0;

            // Fade in the container
            document.querySelector('.container').style.opacity = 1;

            // Load new notification sounds
            const notificationSound = new Audio('/03 - SND Cursor.mp3');

            // Add PS3 logo that fades in after 1 second
            setTimeout(() => {
                const ps3Logo = document.createElement('div');
                ps3Logo.className = 'ps3-logo';
                ps3Logo.innerHTML = `
                    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700&display=swap" rel="stylesheet">
                    <div class="logo-container">
                        <img src="PlayStation_logo.svg.png" class="playstation-logo" alt="PlayStation Logo">
                        <img src="PlayStation_3_logo_(2009).svg.png" class="ps3-logo-image" alt="PS3 Logo">
                    </div>
                `;
                ps3Logo.style.top = '50%';
                ps3Logo.style.left = '80%';
                ps3Logo.style.transform = 'translate(-50%, -50%)';
                document.querySelector('.container').appendChild(ps3Logo);

                // Improved fade in with a delay
                setTimeout(() => {
                    ps3Logo.style.opacity = 1;

                    // Longer fade out after 4 seconds with smoother transition
                    setTimeout(() => {
                        ps3Logo.style.opacity = 0;

                        // Remove logo after fade out
                        setTimeout(() => {
                            ps3Logo.remove();
                        }, 1500);
                    }, 4000);
                }, 300);
            }, 1000);

            // Remove overlay after transition
            setTimeout(() => {
                introOverlay.remove();

                // Show UI elements with a quick fade-in immediately after logo sequence
                setTimeout(() => {
                    // Add CSS transition for quick fade-in effect
                    const elements = [
                        document.querySelector('.xmb-container'),
                    ];

                    const delayedElements = [
                        document.querySelector('.status-bar'),
                        document.querySelector('.controls-help'),
                        document.querySelector('.error-notice')
                    ];

                    elements.forEach(el => {
                        if (el) {
                            el.style.transition = 'opacity 0.5s ease';
                            el.style.opacity = '0';
                            el.style.visibility = 'visible';

                            // Trigger reflow
                            void el.offsetWidth;

                            // Fade in
                            el.style.opacity = '1';
                        }
                    });

                    // Delayed fade in for status bar and controls
                    setTimeout(() => {
                        delayedElements.forEach(el => {
                            if (el) {
                                el.style.transition = 'opacity 0.5s ease';
                                el.style.opacity = '0';
                                el.style.visibility = 'visible';

                                // Trigger reflow
                                void el.offsetWidth;

                                // Fade in
                                el.style.opacity = '1';
                            }
                        });
                    }, 1000); // 1 second delay for these elements
                }, 5000);
            }, 3000);
        }, 1000);

        // Initial setting
        updateSelection();
        updateTopStatusBar();
        initWaveBackground();
        updateClock();
        initializeDevlog();

        // Show trophy notification after a delay as a demo
        setTimeout(() => {
            if (loggedIn) {
                audioSystem.playSound('achievement');
                showTrophyNotification("Welcome Back", "Bronze");
            }
        }, 15000); // Show after 15 seconds

        // Event listeners for keyboard navigation - modified to check if settings panel is active
        document.addEventListener('keydown', handleKeyPress);

        // Also add click handlers for mouse navigation
        categories.forEach((category, index) => {
            category.addEventListener('click', () => {
                currentCategoryIndex = index;
                currentItemIndex = 0;
                updateSelection();
                updateTopStatusBar();
                audioSystem.playSound('nav');
            });
        });

        // Add additional XMB sound files
        const selectSound = new Audio('/03 - SND Cursor.mp3');
        const notificationSound = new Audio('/03 - SND Cursor.mp3');
        const errorSound = new Audio('/03 - SND Cursor.mp3');
        const successSound = new Audio('/03 - SND Cursor.mp3');

        // Sound volume settings - make sounds louder
        notificationSound.volume = 1.0;
        errorSound.volume = 1.0;
        successSound.volume = 1.0;

        // Functions
        function handleKeyPress(e) {
            // Skip XMB navigation if settings panel is active
            if (window.settingsPanelControls && window.settingsPanelControls.isActive()) {
                return;
            }

            // Skip XMB navigation if context menu is active
            if (window.ContextMenuSystem && window.ContextMenuSystem.isActive()) {
                return;
            }

            let updated = false;

            switch (e.key) {
                case 'ArrowLeft':
                    if (currentCategoryIndex > 0) {
                        currentCategoryIndex--;
                        currentItemIndex = 0;
                        updated = true;
                        audioSystem.playSound('nav');
                    }
                    break;
                case 'ArrowRight':
                    if (currentCategoryIndex < categories.length - 1) {
                        currentCategoryIndex++;
                        currentItemIndex = 0;
                        updated = true;
                        audioSystem.playSound('nav');
                    }
                    break;
                case 'ArrowUp':
                    if (currentItemIndex > 0) {
                        currentItemIndex--;
                        updated = true;
                        audioSystem.playSound('nav');
                    }
                    break;
                case 'ArrowDown':
                    const activeItems = document.querySelectorAll(`.xmb-items[data-category="${categories[currentCategoryIndex].dataset.category}"] .item`);
                    if (currentItemIndex < activeItems.length - 1) {
                        currentItemIndex++;
                        updated = true;
                        audioSystem.playSound('nav');
                    }
                    break;
                case 'Enter':
                case 'x':
                case 'X':
                    if (categories[currentCategoryIndex].dataset.category === 'users') {
                        loginUser();
                    } else if (categories[currentCategoryIndex].dataset.category === 'settings') {
                        handleSettings();
                    } else if (categories[currentCategoryIndex].dataset.category === 'games') {
                        // Launch the selected game using external GameSystem
                        const activeItemsList = document.querySelector('.xmb-items[data-category="games"]');
                        const activeItem = activeItemsList.querySelector('.item.active');
                        if (activeItem) {
                            const gameTitle = activeItem.querySelector('span').textContent;
                            window.GameSystem.launchGame(gameTitle);
                        }
                    } else {
                        audioSystem.playSound('nav');
                    }
                    break;
            }

            if (updated) {
                updateSelection();
                updateTopStatusBar();
            }
        }

        function loginUser() {
            if (!loggedIn && categories[currentCategoryIndex].dataset.category === 'users') {
                loggedIn = true;
                audioSystem.playSound('nav');

                // Create login message
                const activeUserItem = document.querySelector('.xmb-items[data-category="users"] .item.active');
                const userName = activeUserItem.querySelector('span').textContent;

                let loginMessage = document.createElement('div');
                loginMessage.className = 'login-message';
                loginMessage.textContent = 'Logging in...';

                // Position next to the user item
                const itemRect = activeUserItem.getBoundingClientRect();
                loginMessage.style.left = `${itemRect.right + 20}px`;
                loginMessage.style.top = `${itemRect.top + itemRect.height / 2 - 15}px`;

                document.querySelector('.container').appendChild(loginMessage);

                // Show the message
                setTimeout(() => {
                    loginMessage.classList.add('show');
                }, 50);

                // Simulate login process for 3 seconds
                setTimeout(() => {
                    // Remove login message
                    loginMessage.classList.remove('show');
                    setTimeout(() => loginMessage.remove(), 300);

                    // Update the selection and status bar
                    updateSelection();
                    updateTopStatusBar();

                    // Show login success message
                    showNotification(`Logged in as ${userName}`, 'success');

                    // Add welcome back system notification with trophy icon
                    setTimeout(() => {
                        showSystemNotification('Welcome back to PlayStation Network', 'trophy');
                    }, 1500);
                }, 3000);
            }
        }

        function showNotification(message, type = 'info') {
            // Create notification element if it doesn't exist
            let notification = document.querySelector('.notification');
            if (!notification) {
                notification = document.createElement('div');
                notification.className = 'notification';
                document.querySelector('.container').appendChild(notification);
            }

            // Apply different styling based on notification type
            notification.className = 'notification';
            if (type === 'error') {
                notification.classList.add('notification-error');
                errorSound.play().catch(err => console.log('Audio error:', err));
            } else if (type === 'success') {
                notification.classList.add('notification-success');
                notificationSound.play().catch(err => console.log('Audio error:', err));
            } else {
                notificationSound.play().catch(err => console.log('Audio error:', err));
            }

            notification.textContent = message;
            notification.classList.add('show');

            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }

        function showTrophyNotification(trophyName, trophyType) {
            // Create trophy notification
            const notification = document.createElement('div');
            notification.className = 'trophy-notification';

            // Determine trophy icon and color
            let trophyColor = "#cd7f32"; // Bronze default
            if (trophyType === "Silver") trophyColor = "#c0c0c0";
            if (trophyType === "Gold") trophyColor = "#ffd700";
            if (trophyType === "Platinum") trophyColor = "#e5e4e2";

            notification.innerHTML = `
                <div class="trophy-icon" style="background: ${trophyColor}">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                        <path fill="white" d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
                    </svg>
                </div>
                <div class="trophy-info">
                    <div class="trophy-title">${trophyType} Trophy Unlocked</div>
                    <div class="trophy-name">${trophyName}</div>
                </div>
            `;

            // Add to container
            document.querySelector('.container').appendChild(notification);

            // Show with animation
            setTimeout(() => {
                notification.classList.add('show');

                // Auto remove after 5 seconds
                setTimeout(() => {
                    notification.classList.remove('show');
                    setTimeout(() => notification.remove(), 500);
                }, 5000);
            }, 100);
        }

        function handleSettings() {
            const activeCategory = categories[currentCategoryIndex];
            const activeItemsList = document.querySelector(`.xmb-items[data-category="${activeCategory.dataset.category}"]`);

            if (activeItemsList) {
                const activeItems = activeItemsList.querySelectorAll('.item');
                if (activeItems.length > 0 && activeItems[currentItemIndex]) {
                    const itemName = activeItems[currentItemIndex].querySelector('span').textContent;

                    if (itemName === "Themes") {
                        // Open settings panel instead of modal
                        openSettingsPanel("themes");
                    } else if (itemName === "System Information") {
                        openSettingsPanel("system");
                    } else if (itemName === "Power Settings") {
                        openSettingsPanel("power");
                    }
                }
            }
        }

        function initWaveBackground() {
            const waveGroup = document.querySelector('.waves');
            const numWaves = 5;

            // Clear any existing waves
            while (waveGroup.firstChild) {
                waveGroup.removeChild(waveGroup.firstChild);
            }

            // Add horizontal waves
            for (let i = 0; i < numWaves; i++) {
                const wavePath = document.createElementNS("http://www.w3.org/2000/svg", "path");

                const waveWidth = window.innerWidth * 4;
                const amplitude = 20 + Math.random() * 15;
                const yPos = window.innerHeight / 2 + (i - numWaves / 2) * 20;

                // Generate wavy path with more complex sinusoidal pattern
                let d = `M${-waveWidth / 2},${yPos}`;

                // Use multiple sine waves with different frequencies for more organic look
                for (let x = -waveWidth / 2; x <= waveWidth / 2; x += 10) {
                    const primaryWave = Math.sin(x / 200) * amplitude;
                    const secondaryWave = Math.sin(x / 100) * (amplitude * 0.3);
                    const tertiaryWave = Math.sin(x / 400) * (amplitude * 0.15);
                    const y = primaryWave + secondaryWave + tertiaryWave;

                    d += ` L${x},${yPos + y}`;
                }

                wavePath.setAttribute("d", d);
                wavePath.setAttribute("fill", "none");

                // Assign different colors with glowing effect
                const opacity = 0.2 + (i * 0.1);
                if (i === 1) {
                    wavePath.setAttribute("stroke", `rgba(255, 255, 255, ${opacity})`); // White wave
                    wavePath.setAttribute("filter", "blur(2px)");
                } else if (i === 3) {
                    wavePath.setAttribute("stroke", `rgba(128, 128, 255, ${opacity})`); // Light blue wave
                    wavePath.setAttribute("filter", "blur(1px)");
                } else {
                    wavePath.setAttribute("stroke", `rgba(30, 144, 255, ${opacity})`); // Blue waves
                }

                wavePath.setAttribute("stroke-width", "2");

                // Animate the wave with varying speeds
                const duration = 20 - (i * 2);
                wavePath.style.animation = `wave ${duration}s linear infinite`;
                wavePath.style.transformOrigin = "center";

                waveGroup.appendChild(wavePath);
            }

            // Add some floating particles only if not in classic mode
            if (window.PS3XMB.currentWaveStyle !== 'classic') {
                for (let i = 0; i < 25; i++) {
                    const particle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    const size = 1 + Math.random() * 3;

                    particle.setAttribute("cx", Math.random() * window.innerWidth);
                    particle.setAttribute("cy", (window.innerHeight / 2) + (Math.random() * 300 - 150));
                    particle.setAttribute("r", size);

                    // Vary particle colors
                    const hue = 210 + (Math.random() * 40 - 20); // Blue-ish hues
                    const opacity = 0.3 + (Math.random() * 0.4);
                    particle.setAttribute("fill", `hsla(${hue}, 80%, 70%, ${opacity})`);

                    // Add glow effect to some particles
                    if (Math.random() > 0.7) {
                        particle.setAttribute("filter", "blur(2px)");
                    }

                    // Random animation duration and delay
                    const duration = 15 + Math.random() * 30;
                    const delay = Math.random() * -30;

                    particle.style.animation = `wave ${duration}s linear ${delay}s infinite`;

                    waveGroup.appendChild(particle);
                }
            }
        }

        function updateSelection() {
            // Update categories
            categories.forEach((category, index) => {
                if (index === currentCategoryIndex) {
                    category.classList.add('active');
                } else {
                    category.classList.remove('active');
                }
            });

            // Hide all item lists
            document.querySelectorAll('.xmb-items').forEach(itemList => {
                itemList.style.display = 'none';
            });

            // Show the active category's items
            const activeCategory = categories[currentCategoryIndex];
            const activeItemsList = document.querySelector(`.xmb-items[data-category="${activeCategory.dataset.category}"]`);
            if (activeItemsList) {
                activeItemsList.style.display = 'flex';

                // Update active item
                const activeItems = activeItemsList.querySelectorAll('.item');
                activeItems.forEach((item, index) => {
                    if (index === currentItemIndex) {
                        item.classList.add('active');
                    } else {
                        item.classList.remove('active');
                    }
                });
            }

            // Animate the XMB interface
            animateInterface();
            updateTopStatusBar();
        }

        function animateInterface() {
            // Animate categories - center the active category
            categories.forEach((category, index) => {
                const xOffset = (index - currentCategoryIndex) * 100;
                category.style.transform = index === currentCategoryIndex ?
                    'scale(1.2) translateX(0)' :
                    `scale(0.8) translateX(${xOffset}px)`;
            });

            // Shift the entire category container
            const categoryContainer = document.querySelector('.xmb-categories');
            const centerOffset = window.innerWidth / 2 - 100;
            categoryContainer.style.transform = `translateY(-50%) translateX(${centerOffset - (currentCategoryIndex * 100)}px)`;

            // Animate the active items - center the active item vertically under the active category
            const activeCategory = categories[currentCategoryIndex];
            const activeItemsList = document.querySelector(`.xmb-items[data-category="${activeCategory.dataset.category}"]`);

            if (activeItemsList) {
                const activeItems = activeItemsList.querySelectorAll('.item');
                activeItems.forEach((item, index) => {
                    const yOffset = (index - currentItemIndex) * 80;
                    item.style.transform = index === currentItemIndex ?
                        'scale(1) translateY(0)' :
                        `scale(0.9) translateY(${yOffset}px)`;
                });

                // Position the items list to always be in the center horizontally
                const windowCenter = window.innerWidth / 2;
                activeItemsList.style.left = `${windowCenter}px`;
                activeItemsList.style.transform = 'translateX(-50%)';

                // Fixed vertical position with offset for current item
                const verticalOffset = currentItemIndex * -80; // Negative to move up
                activeItemsList.style.top = '34%';
                activeItemsList.style.marginTop = `${verticalOffset}px`;
            }
        }

        function updateTopStatusBar() {
            const statusUser = document.querySelector('.status-user');
            const statusTime = document.querySelector('.status-time');
            const statusDate = document.querySelector('.status-date');

            // Set the user name, only show if logged in
            if (loggedIn) {
                const userName = document.querySelector('.xmb-items[data-category="users"] .item.active span').textContent;
                statusUser.textContent = userName;
            } else {
                statusUser.textContent = '';
            }

            // Update date
            const now = new Date();
            const options = { weekday: 'short', month: 'short', day: 'numeric' };
            statusDate.textContent = now.toLocaleDateString('en-US', options);

            // Update time (already handled by updateClock, but initialize it here)
            updateClock(statusTime);
        }

        function updateClock(timeElement = document.querySelector('.status-time')) {
            const updateTime = () => {
                const now = new Date();
                const hours = now.getHours().toString().padStart(2, '0');
                const minutes = now.getMinutes().toString().padStart(2, '0');
                timeElement.textContent = `${hours}:${minutes}`;
            };

            updateTime();
            setInterval(updateTime, 60000); // Update every minute
        }

        function playNavSound(type, delay = 50) {
            audioSystem.playSound('nav');
        }

        function playSelectSound() {
            audioSystem.playSound('nav');
        }

        function playAchievementSound() {
            audioSystem.playSound('achievement');
        }

        function initializeDevlog() {

        }

        function showSystemNotification(message, icon = 'info') {
            audioSystem.playSound('notification');
            // Create notification element
            const notification = document.createElement('div');
            notification.className = 'system-notification';

            // Create icon based on type
            let iconSvg = '';
            switch (icon) {
                case 'trophy':
                    iconSvg = `<svg width="24" height="24" viewBox="0 0 24 24">
                        <path fill="gold" d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
                    </svg>`;
                    break;
                case 'message':
                    iconSvg = `<svg width="24" height="24" viewBox="0 0 24 24">
                        <path fill="white" d="M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4A2,2 0 0,0 20,2M20,16H6L4,18V4H20" />
                    </svg>`;
                    break;
                default:
                    iconSvg = `<svg width="24" height="24" viewBox="0 0 24 24">
                        <path fill="white" d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                    </svg>`;
            }

            // Set notification content
            notification.innerHTML = `
                <div class="system-notification-icon">${iconSvg}</div>
                <div class="system-notification-message">${message}</div>
            `;

            // Add to container
            document.querySelector('.container').appendChild(notification);

            // Show with animation
            setTimeout(() => {
                notification.classList.add('show');

                // Auto remove after 4 seconds
                setTimeout(() => {
                    notification.classList.remove('show');
                    setTimeout(() => notification.remove(), 500);
                }, 4000);
            }, 100);
        }

        // Initialize controller support
        function initControllerSupport() {
            // Initialize controllerState object
            let controllerState = {
                connected: false,
                controllerType: '',
                lastButtonPressed: ''
            };

            // Initialize controller support logic here
            // This function should update the controllerState object accordingly
        }

        // Update the PS3XMB object with all methods at the end
        window.PS3XMB = {
            showNotification,
            showSystemNotification,
            showTrophyNotification,
            playSelectSound,
            playNavSound,
            playAchievementSound,
            initWaveBackground,
            initializeDevlog,
            handleSettings,
            currentTheme: window.PS3XMB.currentTheme,
            currentWaveStyle: window.PS3XMB.currentWaveStyle
        };

        // Initialize controller support
        initControllerSupport();

        // Export controller functions to window object
        window.ControllerSystem = {
            getState: () => ({ /* implement */ }),
            isConnected: () => false,
            getControllerType: () => '',
            getLastButtonPressed: () => ''
        };
    });
});