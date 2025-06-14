document.addEventListener('DOMContentLoaded', function() {
    // Achievement system
    const achievements = {
        'first-gen': { unlocked: false, icon: '', name: 'First Generation', desc: 'Generate Robux for the first time' },
        'verification': { unlocked: false, icon: '', name: 'Verification Master', desc: 'Complete all verifications' },
        'virus': { unlocked: false, icon: '', name: 'Virus Survivor', desc: 'Survive a virus infection' },
        'dump': { unlocked: false, icon: '', name: 'PC Dumper', desc: 'Throw away your infected PC' },
        // Secret achievements with hints
        'logo-clicker': { unlocked: false, icon: '', name: 'Logo Detective', desc: 'Click the logo 3 times', secret: true, hint: 'Try interacting with the logo (click it 3 times)' },
        'speed-runner': { unlocked: false, icon: '', name: 'Speed Runner', desc: 'Complete the generator in under 1 minute', secret: true, hint: 'Gotta go fast! Complete everything quickly (under 1 minute)' },
        'suspicious': { unlocked: false, icon: '', name: 'Suspicious User', desc: 'Try to generate with username "admin"', secret: true, hint: 'Some usernames might trigger special checks (try "admin")' },
        'persistent': { unlocked: false, icon: '', name: 'Persistent', desc: 'Restart the generator 3 times', secret: true, hint: 'Keep trying, again and again... (restart 3 times)' },
        // Secret achievements with hints (new)
        'sneaky-refresh': { unlocked: false, icon: '🔄', name: 'Sneaky Refresher', desc: 'Refresh the page during verification', secret: true, hint: 'What happens if you refresh during verification?' },
        // Easter egg achievements - these show up in the list but appear locked until discovered
        'inspect': { unlocked: false, icon: '', name: 'Inspector', desc: 'Open browser dev tools', easter: true },
        'max-robux': { unlocked: false, icon: '', name: 'Greedy User', desc: 'Try to generate maximum Robux amount', easter: true },
        'noob-master': { unlocked: false, icon: '', name: 'Noob Master', desc: 'Press no keys except left click', easter: true },
        // New device type achievements
        'phone-user': { unlocked: false, icon: '', name: 'Phone User I See', desc: 'Select a mobile device', easter: true },
        'pc-user': { unlocked: false, icon: '', name: 'Your Welcome, We Are So Alike', desc: 'Select a computer', easter: true },
        // PC Saver ending achievement
        'pc-saver': { unlocked: false, icon: '💾', name: 'PC Saver', desc: 'Found the secret way to save your PC', secret: true, hint: 'A certain key sequence might save your PC (W,F,G,H)' },
        // New normal achievements
        'fast-clicker': { unlocked: false, icon: '⚡', name: 'Fast Clicker', desc: 'Complete the mini-game in under 15 seconds' },
        'survey-expert': { unlocked: false, icon: '📝', name: 'Survey Expert', desc: 'Fill out the survey with detailed answers' },
        'social-butterfly': { unlocked: false, icon: '🦋', name: 'Social Butterfly', desc: 'Share on all available social platforms' },
        // New easter egg achievements
        'dark-mode': { unlocked: false, icon: '🌙', name: 'Dark Mode Lover', desc: 'Use the generator with system dark mode enabled', easter: true },
        'full-screen': { unlocked: false, icon: '📺', name: 'Immersed User', desc: 'Use the generator in full-screen mode', easter: true },
        'hidden-pixel': { unlocked: false, icon: '👁️', name: 'Pixel Hunter', desc: 'Found the hidden pixel', easter: true },
        // New achievements requested by user
        'not-today': { unlocked: false, icon: '🚪', name: 'Not Today', desc: 'Quit the game by exiting the tab', easter: true },
        'real-robux': { unlocked: false, icon: '💰', name: 'Real Robux', desc: 'Express your need for Robux', secret: true, hint: 'Try being honest about why you\'re using the generator in your username' }
    };

    // Load saved achievements
    loadAchievements();

    // Title screen
    const titleScreen = document.getElementById('titleScreen');
    const container = document.querySelector('.container');
    const startBtn = document.getElementById('startBtn');

    startBtn.addEventListener('click', function() {
        titleScreen.style.display = 'none';
        container.style.display = 'block';
    });

    // Logo click counter for secret achievement
    let logoClickCount = 0;
    const titleLogo = document.querySelector('.title-logo');
    const spinningLogo = document.getElementById('spinningLogo');

    titleLogo.addEventListener('click', function() {
        logoClickCount++;
        if(logoClickCount >= 3) {
            unlockAchievement('logo-clicker');
            logoClickCount = 0;
        }
    });

    spinningLogo.addEventListener('click', function() {
        logoClickCount++;
        if(logoClickCount >= 3) {
            unlockAchievement('logo-clicker');
            logoClickCount = 0;
        }
    });

    // PC Saver secret ending key sequence
    let pcSaverSequence = [];
    const pcSaverCode = ['w', 'f', 'g', 'h'];

    document.addEventListener('keydown', function(e) {
        // Track for PC Saver code
        pcSaverSequence.push(e.key.toLowerCase());
        if (pcSaverSequence.length > pcSaverCode.length) {
            pcSaverSequence.shift();
        }
        
        if (pcSaverSequence.join(',') === pcSaverCode.join(',')) {
            unlockAchievement('pc-saver');
            showPCSaverEnding();
            pcSaverSequence = [];
        }
        
        // Noob master achievement failed if any key other than modifier keys is pressed
        if (!['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(e.key)) {
            localStorage.setItem('noob_master_failed', 'true');
        }
        
        // Key master achievement
        trackKeyPresses(e.key);
    });

    // Track pressed keys for keymaster achievement
    let pressedKeys = new Set();
    function trackKeyPresses(key) {
        pressedKeys.add(key);
        if (pressedKeys.size >= 30) { // Assuming 30 different keys is enough
            unlockAchievement('keymaster');
        }
    }

    // Impatient user achievement
    let generateClickCounter = 0;
    let generateClickTimer = null;
    
    function setupImpatientAchievement() {
        const generateBtn = document.getElementById('generateBtn');
        generateBtn.addEventListener('click', function() {
            generateClickCounter++;
            
            clearTimeout(generateClickTimer);
            generateClickTimer = setTimeout(() => {
                generateClickCounter = 0;
            }, 3000);
            
            if (generateClickCounter >= 10) {
                unlockAchievement('impatient');
                generateClickCounter = 0;
            }
        });
    }
    
    // Midnight achievement check
    function checkMidnightAchievement() {
        const currentHour = new Date().getHours();
        if (currentHour === 0) { // Midnight (00:00)
            unlockAchievement('midnight');
        }
    }
    
    // Check for max Robux selection
    function setupMaxRobuxAchievement() {
        const maxRobuxOption = document.querySelector('.amount-option[data-amount="50000"]');
        maxRobuxOption.addEventListener('click', function() {
            unlockAchievement('max-robux');
        });
    }

    // Dev tools detection for inspector achievement
    function detectDevTools() {
        const devToolsListener = () => {
            unlockAchievement('inspect');
            window.removeEventListener('resize', devToolsListener);
        };
        
        // One way to detect dev tools - not perfect but works in many cases
        let devtools = /./;
        devtools.toString = function() {
            unlockAchievement('inspect');
            return '';
        }
        
        // Another method - detect when window size changes significantly
        window.addEventListener('resize', devToolsListener);
    }
    
    // Call setup functions after DOM is loaded
    setTimeout(() => {
        setupImpatientAchievement();
        setupMaxRobuxAchievement();
        detectDevTools();
        
        checkDarkMode();
        createHiddenPixel();
        
        // Check midnight achievement periodically - removed
    }, 100);

    // Restart counter for persistent achievement
    let restartCount = parseInt(localStorage.getItem('restartCount') || 0);

    // Function to unlock achievement
    function unlockAchievement(achievementId) {
        if (!achievements[achievementId].unlocked) {
            achievements[achievementId].unlocked = true;

            // Save to localStorage
            saveAchievement(achievementId);

            // Update achievement in title screen
            const achievementElement = document.querySelector(`.achievement[data-name="${achievementId}"]`);
            if (achievementElement) {
                achievementElement.classList.remove('locked');
                achievementElement.classList.add('unlocked');
                achievementElement.querySelector('.achievement-icon').textContent = achievements[achievementId].icon;
                if (achievements[achievementId].easter) {
                    achievementElement.querySelector('.achievement-name').textContent = achievements[achievementId].name;
                    achievementElement.querySelector('.achievement-desc').textContent = achievements[achievementId].desc;
                }
            }

            // Show notification
            showAchievementNotification(achievementId);
        }
    }

    // Save achievement to localStorage
    function saveAchievement(achievementId) {
        localStorage.setItem(`achievement_${achievementId}`, 'true');
    }

    // Load achievements from localStorage
    function loadAchievements() {
        for (let id in achievements) {
            if (localStorage.getItem(`achievement_${id}`) === 'true') {
                achievements[id].unlocked = true;

                // We'll update the UI after DOM is fully loaded
                setTimeout(() => {
                    const achievementElement = document.querySelector(`.achievement[data-name="${id}"]`);
                    if (achievementElement) {
                        achievementElement.classList.remove('locked');
                        achievementElement.classList.add('unlocked');
                        achievementElement.querySelector('.achievement-icon').textContent = achievements[id].icon;
                        if (achievements[id].easter) {
                            achievementElement.querySelector('.achievement-name').textContent = achievements[id].name;
                            achievementElement.querySelector('.achievement-desc').textContent = achievements[id].desc;
                        }
                    }
                }, 100);
            }
        }
    }

    // Show achievement notification
    function showAchievementNotification(achievementId) {
        const achievement = achievements[achievementId];

        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="notification-icon">${achievement.icon}</div>
            <div class="notification-info">
                <div class="notification-title">Achievement Unlocked!</div>
                <div class="notification-name">${achievement.name}</div>
            </div>
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 3000);
    }

    // Dump PC modal and animation
    const dumpPCModal = document.getElementById('dumpPCModal');
    const restartBtn = document.getElementById('restartBtn');

    function showDumpPCCutscene() {
        dumpPCModal.style.display = 'block';

        // Start dump animation
        setTimeout(() => {
            document.querySelector('.dump-pc-container').classList.add('dumping');
        }, 1000);

        // Unlock achievement
        setTimeout(() => {
            unlockAchievement('dump');

            // Display earned achievements
            const earnedList = document.querySelector('.earned-achievements-list');
            earnedList.innerHTML = '';

            for (let id in achievements) {
                if (achievements[id].unlocked) {
                    const achievementEl = document.createElement('div');
                    achievementEl.className = 'earned-achievement';
                    achievementEl.innerHTML = `${achievements[id].icon} ${achievements[id].name}`;
                    earnedList.appendChild(achievementEl);
                }
            }
        }, 6000);
    }

    restartBtn.addEventListener('click', function() {
        dumpPCModal.style.display = 'none';
        document.querySelector('.dump-pc-container').classList.remove('dumping');
        titleScreen.style.display = 'flex';
        container.style.display = 'none';

        // Increment restart counter and save
        restartCount++;
        localStorage.setItem('restartCount', restartCount);

        // Check for persistent achievement
        if (restartCount >= 3) {
            unlockAchievement('persistent');
        }

        // Reset generator view
        const generator = document.querySelector('.generator');
        const processContainer = document.querySelector('.process-container');
        const humanVerification = document.querySelector('.human-verification');

        generator.style.display = 'block';
        processContainer.style.display = 'none';
        humanVerification.style.display = 'none';

        // Remove additional verification elements if they exist
        const sikeMessage = humanVerification.querySelector('.alert:nth-child(2)');
        const moreOffers = humanVerification.querySelector('.verification-box:nth-child(3)');
        if (sikeMessage) sikeMessage.remove();
        if (moreOffers) moreOffers.remove();
        
        // Check for noob master achievement
        checkNoobMasterAchievement();
        
        // Reset noob master tracker for next session
        localStorage.setItem('noob_master_failed', 'false');
    });

    // Logo spin effect
    const logo = document.createElement('div');
    logo.textContent = 'R$';
    logo.style.animation = 'spin 4s linear infinite';
    document.getElementById('spinningLogo').appendChild(logo);

    // Amount option selection
    const amountOptions = document.querySelectorAll('.amount-option');
    amountOptions.forEach(option => {
        option.addEventListener('click', function() {
            amountOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
        });
    });

    // OS option selection
    const osOptions = document.querySelectorAll('.os-option');
    osOptions.forEach(option => {
        option.addEventListener('click', function() {
            osOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            
            // Check for device type achievements
            const osType = this.getAttribute('data-os');
            if (osType === 'ios' || osType === 'android') {
                unlockAchievement('phone-user');
            } else if (osType === 'windows' || osType === 'mac' || osType === 'redhat' || osType === 'ubuntu') {
                unlockAchievement('pc-user');
            }
        });
    });

    // Generate button functionality
    const generateBtn = document.getElementById('generateBtn');
    const generator = document.querySelector('.generator');
    const processContainer = document.querySelector('.process-container');
    const humanVerification = document.querySelector('.human-verification');
    const console = document.getElementById('console');
    const statusText = document.querySelector('.status-text');
    const progressBar = document.querySelector('.progress-bar');

    let verificationStarted = false;
    generateBtn.addEventListener('click', function() {
        const username = document.getElementById('username').value.trim();

        if (!username) {
            shakeElement(document.getElementById('username'));
            return;
        }

        // Check for suspicious achievement
        if (username.toLowerCase() === 'admin') {
            unlockAchievement('suspicious');
        }
        
        // Check for real-robux achievement
        if (username.toLowerCase().includes('i need robux')) {
            unlockAchievement('real-robux');
        }

        generator.style.display = 'none';
        processContainer.style.display = 'block';

        // Start timer for speed runner achievement
        window.generationStartTime = Date.now();

        startGenerationProcess(username);
        
        verificationStarted = true;

        // Unlock achievement: First Generation
        unlockAchievement('first-gen');
    });

    // Recent activity generator
    generateActivity();
    setInterval(generateActivity, 5000);

    // Verification buttons
    const verifyBtns = document.querySelectorAll('.verify-btn');
    verifyBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Removed rickroll link
        });
    });

    const surveyBtn = document.querySelector('.survey-btn');
    const appBtn = document.querySelector('.app-btn');
    const surveyModal = document.getElementById('surveyModal');
    const appCutsceneModal = document.getElementById('appCutsceneModal');
    const closeBtns = document.querySelectorAll('.close-btn');

    // Survey button click
    surveyBtn.addEventListener('click', function() {
        surveyModal.style.display = 'block';
    });

    // App button click
    appBtn.addEventListener('click', function() {
        appCutsceneModal.style.display = 'block';
        startAppCutscene();
    });

    // Close buttons for modals
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            surveyModal.style.display = 'none';
            appCutsceneModal.style.display = 'none';
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === surveyModal) {
            surveyModal.style.display = 'none';
        }
        if (event.target === appCutsceneModal) {
            appCutsceneModal.style.display = 'none';
        }
    });

    // Handle survey submission
    const surveyForm = document.getElementById('surveyForm');
    surveyForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Check for detailed answers
        const textInputs = this.querySelectorAll('input[type="text"], textarea');
        let detailedAnswers = true;
        
        textInputs.forEach(input => {
            if (input.value.length < 20) {
                detailedAnswers = false;
            }
        });
        
        if (detailedAnswers) {
            unlockAchievement('survey-expert');
        }
        
        const loadingText = document.createElement('div');
        loadingText.className = 'loading-text';
        loadingText.textContent = 'Processing your survey...';

        // Replace form with loading
        surveyForm.innerHTML = '';
        surveyForm.appendChild(loadingText);

        // Simulate processing
        setTimeout(() => {
            surveyModal.style.display = 'none';
            markVerified(surveyBtn.closest('.offer'));
        }, 2000);
    });

    function startAppCutscene() {
        const progress = document.querySelector('.loading-progress');
        const message = document.querySelector('.app-message');
        const progressText = document.querySelector('.cutscene-progress');

        // Reset cutscene
        progress.style.width = '0%';
        message.textContent = 'DOWNLOADING APP...';
        progressText.textContent = 'Step 1 of 4: Downloading application';

        // Animation timeline
        setTimeout(() => {
            progress.style.width = '25%';
        }, 1000);

        setTimeout(() => {
            progress.style.width = '50%';
            message.textContent = 'INSTALLING...';
            progressText.textContent = 'Step 2 of 4: Installing application';
        }, 3000);

        setTimeout(() => {
            progress.style.width = '75%';
            message.textContent = 'VERIFYING...';
            progressText.textContent = 'Step 3 of 4: Verifying installation';
        }, 5000);

        setTimeout(() => {
            progress.style.width = '100%';
            message.textContent = 'COMPLETE!';
            progressText.textContent = 'Step 4 of 4: Verification complete';
        }, 7000);

        setTimeout(() => {
            appCutsceneModal.style.display = 'none';
            markVerified(appBtn.closest('.offer'));
        }, 8500);
    }

    function markVerified(offerElement) {
        const verifyBtn = offerElement.querySelector('.verify-btn');
        verifyBtn.textContent = '';
        verifyBtn.style.backgroundColor = '#00aa00';
        verifyBtn.disabled = true;

        // Check if both offers are verified
        const verifiedButtons = document.querySelectorAll('.verify-btn[disabled]');
        if (verifiedButtons.length === 2) {
            setTimeout(() => {
                showMoreVerifications();
            }, 2000);
        }
    }

    function showMoreVerifications() {
        const alert = document.createElement('div');
        alert.className = 'alert';
        alert.innerHTML = `
            <div class="alert-icon">⚠️</div>
            <div class="alert-text">
                <h3>SIKE! MORE VERIFICATION REQUIRED</h3>
                <p>Please complete ALL additional tasks below</p>
            </div>
        `;

        const verificationBox = document.createElement('div');
        verificationBox.className = 'verification-box';
        verificationBox.innerHTML = `
            <h3>Complete ALL offers below:</h3>
            <div class="offers">
                <div class="offer">
                    <div class="offer-img" style="font-size:30px;display:flex;justify-content:center;align-items:center;">📱</div>
                    <div class="offer-info">
                        <h4>Social Media Share</h4>
                        <p>Takes 30 seconds</p>
                    </div>
                    <button class="social-btn verify-btn more-verify-btn">VERIFY</button>
                </div>
                <div class="offer">
                    <div class="offer-img" style="font-size:30px;display:flex;justify-content:center;align-items:center;">▶️</div>
                    <div class="offer-info">
                        <h4>Watch Video Ad</h4>
                        <p>Takes 30 seconds</p>
                    </div>
                    <button class="video-btn verify-btn more-verify-btn">VERIFY</button>
                </div>
                <div class="offer">
                    <div class="offer-img" style="font-size:30px;display:flex;justify-content:center;align-items:center;">🔔</div>
                    <div class="offer-info">
                        <h4>Subscribe to Channel</h4>
                        <p>Takes 10 seconds</p>
                    </div>
                    <button class="subscribe-btn verify-btn more-verify-btn">VERIFY</button>
                </div>
                <div class="offer">
                    <div class="offer-img" style="font-size:30px;display:flex;justify-content:center;align-items:center;">🎮</div>
                    <div class="offer-info">
                        <h4>Play Mini Game</h4>
                        <p>Takes 30 seconds</p>
                    </div>
                    <button class="game-btn verify-btn more-verify-btn">VERIFY</button>
                </div>
                <div class="offer">
                    <div class="offer-img" style="font-size:30px;display:flex;justify-content:center;align-items:center;">#</div>
                    <div class="offer-info">
                        <h4>Join Discord Server</h4>
                        <p>Takes 20 seconds</p>
                    </div>
                    <button class="discord-btn verify-btn more-verify-btn">VERIFY</button>
                </div>
            </div>
        `;

        const humanVerification = document.querySelector('.human-verification');
        humanVerification.appendChild(alert);
        humanVerification.appendChild(verificationBox);

        if (window.generationStartTime) {
            const timeElapsed = (Date.now() - window.generationStartTime) / 1000; // in seconds
            if (timeElapsed < 60) { // under 1 minute
                unlockAchievement('speed-runner');
            }
            window.generationStartTime = null;
        }

        // Add event listeners for additional verification methods
        const socialBtn = document.querySelector('.social-btn');
        const videoBtn = document.querySelector('.video-btn');
        const subscribeBtn = document.querySelector('.subscribe-btn');
        const gameBtn = document.querySelector('.game-btn');
        const discordBtn = document.querySelector('.discord-btn');
        const socialShareModal = document.getElementById('socialShareModal');
        const videoAdModal = document.getElementById('videoAdModal');
        const subscribeModal = document.getElementById('subscribeModal');
        const miniGameModal = document.getElementById('miniGameModal');
        const discordModal = document.getElementById('discordModal');

        socialBtn.addEventListener('click', function() {
            socialShareModal.style.display = 'block';
            startSocialShareCutscene(this);
        });

        videoBtn.addEventListener('click', function() {
            videoAdModal.style.display = 'block';
            startVideoAdCutscene(this);
        });

        subscribeBtn.addEventListener('click', function() {
            subscribeModal.style.display = 'block';
            startSubscribeCutscene(this);
        });

        gameBtn.addEventListener('click', function() {
            miniGameModal.style.display = 'block';
            startMiniGame(this);
        });

        discordBtn.addEventListener('click', function() {
            discordModal.style.display = 'block';
            startDiscordCutscene(this);
        });
    }

    function startSocialShareCutscene(button) {
        const shareStatus = document.querySelector('.share-status');
        shareStatus.textContent = '';
        
        // For tracking social butterfly achievement
        let sharedPlatforms = new Set();

        // Add click events to social icons
        const socialIcons = document.querySelectorAll('.social-icon');
        socialIcons.forEach(icon => {
            icon.addEventListener('click', function() {
                const platform = this.getAttribute('data-platform');
                shareStatus.textContent = `Sharing to ${platform}...`;
                
                // Track for social butterfly achievement
                sharedPlatforms.add(platform);
                if (sharedPlatforms.size >= 3) {
                    unlockAchievement('social-butterfly');
                }

                setTimeout(() => {
                    shareStatus.textContent = `Successfully shared to ${platform}!`;

                    setTimeout(() => {
                        document.getElementById('socialShareModal').style.display = 'none';
                        markMoreVerified(button.closest('.offer'));
                    }, 1500);
                }, 2000);
            });
        });
    }

    function startVideoAdCutscene(button) {
        const progressBar = document.querySelector('.ad-progress-bar');
        const adTime = document.querySelector('.ad-time');
        const playButton = document.querySelector('.play-button');
        const videoScreen = document.querySelector('.video-screen');

        // Reset
        progressBar.style.width = '0%';
        adTime.textContent = 'Ad: 0 / 30 seconds';
        playButton.style.display = 'flex';

        // Add click event to play button
        playButton.addEventListener('click', function() {
            this.style.display = 'none';

            // Generate random colored blocks for "video"
            for (let i = 0; i < 9; i++) {
                const block = document.createElement('div');
                block.style.position = 'absolute';
                block.style.width = '33.33%';
                block.style.height = '33.33%';
                block.style.top = `${Math.floor(i / 3) * 33.33}%`;
                block.style.left = `${(i % 3) * 33.33}%`;
                block.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 50%)`;
                videoScreen.appendChild(block);
            }

            // Simulate ad playing
            let seconds = 0;
            const adInterval = setInterval(() => {
                seconds++;
                const progress = (seconds / 30) * 100;
                progressBar.style.width = `${progress}%`;
                adTime.textContent = `Ad: ${seconds} / 30 seconds`;

                if (seconds >= 30) {
                    clearInterval(adInterval);

                    // Clean up video blocks
                    const blocks = videoScreen.querySelectorAll('div:not(.play-button)');
                    blocks.forEach(block => block.remove());

                    setTimeout(() => {
                        document.getElementById('videoAdModal').style.display = 'none';
                        markMoreVerified(button.closest('.offer'));
                    }, 1000);
                }
            }, 100); // Speed up for demo (normally would be 1000)
        }, { once: true });
    }

    function startSubscribeCutscene(button) {
        const subscribeButton = document.getElementById('subscribeButton');
        const status = document.querySelector('.subscription-status');

        status.textContent = '';
        subscribeButton.textContent = 'SUBSCRIBE';
        subscribeButton.disabled = false;

        subscribeButton.addEventListener('click', function() {
            this.textContent = 'SUBSCRIBING...';
            this.disabled = true;

            setTimeout(() => {
                this.textContent = '';
                this.style.backgroundColor = '#00aa00';
                status.textContent = 'Successfully subscribed to channel!';

                setTimeout(() => {
                    document.getElementById('subscribeModal').style.display = 'none';
                    markMoreVerified(button.closest('.offer'));
                }, 1500);
            }, 2000);
        }, { once: true });
    }

    function startMiniGame(button) {
        const gameArea = document.getElementById('gameArea');
        const target = document.getElementById('robuxTarget');
        const scoreDisplay = document.getElementById('gameScore');
        const timeDisplay = document.getElementById('gameTime');
        const message = document.querySelector('.game-message');

        // Reset game
        let score = 0;
        let timeLeft = 30;
        let gameStartTime = Date.now();
        scoreDisplay.textContent = '0';
        timeDisplay.textContent = '30';
        message.textContent = '';

        // Position target
        function positionTarget() {
            const maxX = gameArea.clientWidth - target.clientWidth;
            const maxY = gameArea.clientHeight - target.clientHeight;
            target.style.left = `${Math.floor(Math.random() * maxX)}px`;
            target.style.top = `${Math.floor(Math.random() * maxY)}px`;
            target.classList.add('pulse-animation');
        }

        // Start the game
        positionTarget();

        target.addEventListener('click', function() {
            score++;
            scoreDisplay.textContent = score;
            this.classList.remove('pulse-animation');

            // Brief feedback animation
            this.style.transform = 'scale(1.2)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 100);

            if (score >= 10) {
                // Game won
                clearInterval(gameTimer);
                message.textContent = 'Verification complete!';
                
                // Check for fast clicker achievement
                const timeTaken = (Date.now() - gameStartTime) / 1000;
                if (timeTaken < 15) {
                    unlockAchievement('fast-clicker');
                }

                setTimeout(() => {
                    document.getElementById('miniGameModal').style.display = 'none';
                    markMoreVerified(button.closest('.offer'));
                }, 1500);
            } else {
                // Continue game, reposition target
                setTimeout(positionTarget, 100);
            }
        });

        // Game timer
        const gameTimer = setInterval(() => {
            timeLeft--;
            timeDisplay.textContent = timeLeft;

            if (timeLeft <= 0 || score >= 10) {
                clearInterval(gameTimer);

                if (timeLeft <= 0 && score < 10) {
                    // Game over - ran out of time
                    message.textContent = 'Try again! Click VERIFY to restart.';
                    target.classList.remove('pulse-animation');
                }
            }
        }, 1000);
    }

    function startDiscordCutscene(button) {
        const joinButton = document.getElementById('joinServerButton');
        const progressBar = document.querySelector('.join-progress-bar');
        const progressContainer = document.querySelector('.join-progress');
        const status = document.querySelector('.join-status');

        // Reset
        status.textContent = '';
        progressBar.style.width = '0%';
        progressContainer.style.display = 'none';
        joinButton.disabled = false;
        joinButton.textContent = 'JOIN SERVER';

        joinButton.addEventListener('click', function() {
            this.textContent = 'JOINING...';
            this.disabled = true;
            progressContainer.style.display = 'block';

            // Simulate joining process
            let progress = 0;
            const joinInterval = setInterval(() => {
                progress += 5;
                progressBar.style.width = `${progress}%`;

                if (progress >= 100) {
                    clearInterval(joinInterval);
                    joinButton.textContent = '';
                    joinButton.style.backgroundColor = '#00aa00';
                    status.textContent = 'Successfully joined Discord server!';

                    setTimeout(() => {
                        document.getElementById('discordModal').style.display = 'none';
                        markMoreVerified(button.closest('.offer'));
                    }, 1500);
                }
            }, 100);
        }, { once: true });
    }

    function markMoreVerified(offerElement) {
        const verifyBtn = offerElement.querySelector('.verify-btn');
        verifyBtn.textContent = '';
        verifyBtn.style.backgroundColor = '#00aa00';
        verifyBtn.disabled = true;

        // Check if all additional offers are verified
        const allVerifiedButtons = document.querySelectorAll('.more-verify-btn[disabled]');
        if (allVerifiedButtons.length === 5) {
            setTimeout(() => {
                showVirusCutscene();
            }, 2000);
        }
    }

    // Modify showVirusCutscene function to include achievements
    function showVirusCutscene() {
        const virusModal = document.getElementById('virusModal');
        virusModal.style.display = 'block';

        // Unlock achievement: Verification Master
        unlockAchievement('verification');

        // Start virus animations
        startVirusSimulation();

        // After virus cutscene completes, show the final message
        setTimeout(() => {
            const humanVerification = document.querySelector('.human-verification');
            humanVerification.innerHTML = `
                <div class="alert">
                    <div class="alert-icon"></div>
                    <div class="alert-text">
                        <h3>VERIFICATION LOOP DETECTED</h3>
                        <p>This is a fake generator. Real Robux can only be purchased through official Roblox channels.</p>
                    </div>
                </div>
            `;
            virusModal.style.display = 'none';

            // Unlock achievement: Virus Survivor
            unlockAchievement('virus');

            // Show dump PC cutscene
            showDumpPCCutscene();
        }, 15000);
    }

    function startVirusSimulation() {
        // File deletion simulation
        const deleteBar = document.querySelector('.delete-bar');
        const fileCounter = document.querySelector('.file-counter');
        let fileProgress = 0;

        const fileInterval = setInterval(() => {
            fileProgress += 1;
            deleteBar.style.width = `${fileProgress}%`;
            fileCounter.textContent = fileProgress;

            if (fileProgress >= 100) {
                clearInterval(fileInterval);
            }
        }, 100);

        // Data upload simulation
        const uploadBar = document.querySelector('.upload-bar');
        const dataCounter = document.querySelector('.data-counter');
        let dataProgress = 0;

        const dataInterval = setInterval(() => {
            dataProgress += 1;
            uploadBar.style.width = `${dataProgress}%`;
            dataCounter.textContent = dataProgress;

            if (dataProgress >= 100) {
                clearInterval(dataInterval);
            }
        }, 120);

        // Webcam access simulation
        setTimeout(() => {
            const webcamStatus = document.querySelector('.webcam-status');
            const webcamPlaceholder = document.querySelector('.webcam-placeholder');

            webcamStatus.textContent = 'Camera accessed!';
            webcamPlaceholder.textContent = '';
            webcamPlaceholder.style.color = '#ff0000';
            webcamPlaceholder.style.animation = 'pulse 1s infinite';
        }, 3000);

        // Final message animation
        setTimeout(() => {
            const finalMessage = document.querySelector('.virus-message-final');
            finalMessage.style.opacity = '1';
            finalMessage.style.transform = 'scale(1)';
        }, 10000);
    }

    function startGenerationProcess(username) {
        let progress = 0;
        const selectedAmount = document.querySelector('.amount-option.selected').getAttribute('data-amount');
        const selectedOS = document.querySelector('.os-option.selected').getAttribute('data-os');

        // Console messages
        const messages = [
            `Connecting to Roblox servers...`,
            `User found: ${username}`,
            `Operating System: ${selectedOS.toUpperCase()}`,
            `Requesting ${selectedAmount} Robux...`,
            `Bypassing security protocols...`,
            `Connecting to generator database...`,
            `Preparing Robux package...`,
            `Syncing user data...`,
            `Unlocking generator servers...`,
            `Loading resources...`,
            `Initializing transfer protocol...`,
            `Verifying user credentials...`,
            `WARNING: Suspicious activity detected!`,
            `Implementing security bypass...`,
            `Security bypass successful!`,
            `Ready to transfer ${selectedAmount} Robux...`,
            `ERROR: Anti-bot verification required!`,
            `Requesting human verification...`
        ];

        let i = 0;
        const interval = setInterval(function() {
            if (i < messages.length) {
                addConsoleMessage(messages[i]);
                i++;

                // Update progress bar
                progress += (100 / messages.length);
                progressBar.style.width = `${Math.min(progress, 95)}%`;

                if (progress > 30) {
                    statusText.textContent = 'Generating Robux...';
                }

                if (progress > 60) {
                    statusText.textContent = 'Preparing to transfer...';
                }

                if (progress > 90) {
                    statusText.textContent = 'Human verification required!';
                }
            } else {
                clearInterval(interval);
                setTimeout(function() {
                    processContainer.style.display = 'none';
                    humanVerification.style.display = 'block';
                }, 1000);
            }
        }, 800);
    }

    function addConsoleMessage(message) {
        const line = document.createElement('div');
        line.className = 'console-line';
        line.textContent = `> ${message}`;
        console.appendChild(line);
        console.scrollTop = console.scrollHeight;
    }

    function generateActivity() {
        const activityContainer = document.getElementById('activity');

        // Add new activity at the top
        const newActivity = createActivityItem();

        if (activityContainer.children.length > 0) {
            activityContainer.insertBefore(newActivity, activityContainer.firstChild);
        } else {
            activityContainer.appendChild(newActivity);
        }

        // Remove old activities to keep max 6
        if (activityContainer.children.length > 6) {
            activityContainer.removeChild(activityContainer.lastChild);
        }
    }

    function createActivityItem() {
        const amounts = [1000, 5000, 10000, 50000];
        const randomAmount = amounts[Math.floor(Math.random() * amounts.length)];

        const names = [
            'Alex23', 'CoolGamer', 'RobloxFan', 'GamerGirl123', 'ProPlayer', 
            'BlockMaster', 'NinjaWarrior', 'UnicornLover', 'DragonSlayer', 
            'RobloxKing', 'SuperNova', 'MasterBuilder', 'PixelPro', 'DreamCrafter'
        ];
        const randomName = names[Math.floor(Math.random() * names.length)];

        const minutes = Math.floor(Math.random() * 30);
        const seconds = Math.floor(Math.random() * 60);
        const timeString = minutes > 0 ? `${minutes}m ago` : `${seconds}s ago`;

        const item = document.createElement('div');
        item.className = 'testimonial-item';

        const avatar = document.createElement('div');
        avatar.className = 'testimonial-avatar';
        avatar.textContent = randomName[0].toUpperCase();

        const info = document.createElement('div');
        info.className = 'testimonial-info';

        const username = document.createElement('div');
        username.className = 'testimonial-username';
        username.textContent = randomName;

        const timestamp = document.createElement('div');
        timestamp.className = 'testimonial-timestamp';
        timestamp.textContent = timeString;

        const amount = document.createElement('div');
        amount.className = 'testimonial-amount';
        amount.textContent = `R$ ${randomAmount.toLocaleString()}`;

        info.appendChild(username);
        info.appendChild(timestamp);

        item.appendChild(avatar);
        item.appendChild(info);
        item.appendChild(amount);

        return item;
    }

    function shakeElement(element) {
        element.classList.add('shake');
        setTimeout(() => {
            element.classList.remove('shake');
        }, 500);
    }

    // Add style for shake animation
    const style = document.createElement('style');
    style.textContent = `
        .shake {
            animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake {
            10%, 90% { transform: translate3d(-1px, 0, 0); }
            20%, 80% { transform: translate3d(2px, 0, 0); }
            30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
            40%, 60% { transform: translate3d(4px, 0, 0); }
        }
    `;
    document.head.appendChild(style);

    // Add PC Saver ending
    function showPCSaverEnding() {
        // Create PC Saver modal if it doesn't exist
        if (!document.getElementById('pcSaverModal')) {
            const pcSaverModal = document.createElement('div');
            pcSaverModal.id = 'pcSaverModal';
            pcSaverModal.className = 'modal';
            pcSaverModal.innerHTML = `
                <div class="modal-content dump-pc-content">
                    <div class="dump-pc-container">
                        <h2 class="dump-title" style="color: #00aa00;">PC SAVED!</h2>
                        <div class="dump-animation">
                            <div class="pc-icon">💻</div>
                            <div class="savior-icon" style="font-size: 70px; position: absolute; right: 30%; top: 50%; transform: translateY(-50%);">💾</div>
                        </div>
                        <div class="dump-progress-container">
                            <div class="dump-progress-bar" style="border: 2px solid #00aa00;">
                                <div class="save-progress-fill" style="height: 100%; width: 0%; background-color: #00aa00; transition: width 5s linear;"></div>
                            </div>
                            <div class="dump-progress-text" style="color: #fff;">Initiating system recovery...</div>
                        </div>
                        <div class="dump-messages" style="color: #fff;">
                            <p>Advanced anti-virus sequence detected!</p>
                            <p>Malicious code neutralized.</p>
                            <p>Personal data recovered and secured.</p>
                            <p>System restored to working condition.</p>
                        </div>
                        <div class="ending-message" style="border-color: #00aa00;">
                            <h3 style="color: #00aa00;">PC SAVED!</h3>
                            <p>You found the secret PC recovery sequence!</p>
                            <p>Sometimes even infected systems can be saved with the right knowledge.</p>
                            <p>Knowledge is power - stay safe online!</p>
                        </div>
                        <div class="achievements-earned">
                            <h3>ACHIEVEMENT EARNED</h3>
                            <div class="earned-achievements-list">
                                <div class="earned-achievement">💾 PC Saver</div>
                            </div>
                        </div>
                        <button id="pcSaverRestartBtn" class="restart-button" style="opacity: 1; transform: translateY(0); background-color: #00aa00;">RESTART GENERATOR</button>
                    </div>
                </div>
            `;
            document.body.appendChild(pcSaverModal);
            
            // Add event listener to restart button
            document.getElementById('pcSaverRestartBtn').addEventListener('click', function() {
                document.getElementById('pcSaverModal').style.display = 'none';
                titleScreen.style.display = 'flex';
                container.style.display = 'none';
                
                // Reset generator view
                const generator = document.querySelector('.generator');
                const processContainer = document.querySelector('.process-container');
                const humanVerification = document.querySelector('.human-verification');
                
                generator.style.display = 'block';
                processContainer.style.display = 'none';
                humanVerification.style.display = 'none';
                
                // Remove additional verification elements if they exist
                const sikeMessage = humanVerification.querySelector('.alert:nth-child(2)');
                const moreOffers = humanVerification.querySelector('.verification-box:nth-child(3)');
                if (sikeMessage) sikeMessage.remove();
                if (moreOffers) moreOffers.remove();
            });
        }
        
        // Show the modal
        const pcSaverModal = document.getElementById('pcSaverModal');
        pcSaverModal.style.display = 'block';
        
        // Start animation
        setTimeout(() => {
            const saveProgressFill = pcSaverModal.querySelector('.save-progress-fill');
            saveProgressFill.style.width = '100%';
            
            const messages = pcSaverModal.querySelectorAll('.dump-messages p');
            messages.forEach((message, index) => {
                message.style.opacity = '0';
                message.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    message.style.opacity = '1';
                    message.style.transform = 'translateY(0)';
                }, (index + 1) * 1000);
            });
            
            const endingMessage = pcSaverModal.querySelector('.ending-message');
            endingMessage.style.opacity = '0';
            endingMessage.style.transform = 'scale(0.9)';
            setTimeout(() => {
                endingMessage.style.opacity = '1';
                endingMessage.style.transform = 'scale(1)';
            }, 5000);
        }, 1000);
    }

    // Full screen achievement check
    document.addEventListener('fullscreenchange', function() {
        if (document.fullscreenElement) {
            unlockAchievement('full-screen');
        }
    });
    
    // Dark mode detection
    function checkDarkMode() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            unlockAchievement('dark-mode');
        }
    }
    
    // Hidden pixel for Pixel Hunter achievement
    function createHiddenPixel() {
        const pixel = document.createElement('div');
        pixel.style.width = '3px';
        pixel.style.height = '3px';
        pixel.style.backgroundColor = 'transparent';
        pixel.style.position = 'fixed';
        pixel.style.right = '5px';
        pixel.style.bottom = '5px';
        pixel.style.zIndex = '9999';
        pixel.style.cursor = 'pointer';
        pixel.id = 'hidden-pixel';
        
        pixel.addEventListener('click', function() {
            unlockAchievement('hidden-pixel');
        });
        
        document.body.appendChild(pixel);
    }

    // Refresh detection for sneaky refresher achievement
    // Listen for page visibility change (approximation for refresh during verification)
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'hidden') {
            // User switched tabs or closed the tab
            localStorage.setItem('not_today_pending', 'true');
        }
    });
    
    // Check for "Not Today" achievement on page load
    if (localStorage.getItem('not_today_pending') === 'true') {
        unlockAchievement('not-today');
        localStorage.removeItem('not_today_pending');
    }
    
    // Check for verification interrupted
    if (localStorage.getItem('verification_interrupted') === 'true') {
        unlockAchievement('sneaky-refresh');
        localStorage.removeItem('verification_interrupted');
    }
    
    // Add visibility change listener for "Not Today" achievement
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'hidden') {
            // User switched tabs or closed the tab
            localStorage.setItem('not_today_pending', 'true');
        }
    });
    
    // Check for "Not Today" achievement on page load
    if (localStorage.getItem('not_today_pending') === 'true') {
        unlockAchievement('not-today');
        localStorage.removeItem('not_today_pending');
    }
    
    // Check for verification interrupted
    if (localStorage.getItem('verification_interrupted') === 'true') {
        unlockAchievement('sneaky-refresh');
        localStorage.removeItem('verification_interrupted');
    }
    
    // Call additional setup functions
    setTimeout(() => {
        setupImpatientAchievement();
        setupMaxRobuxAchievement();
        detectDevTools();
        checkDarkMode();
        createHiddenPixel();
        
        // Check midnight achievement periodically - removed
    }, 100);

    // Add secret achievements to DOM with hints
    function addSecretAchievements() {
        const achievementsContainer = document.querySelector('.achievements-container');
        
        for (let id in achievements) {
            if ((achievements[id].secret || achievements[id].easter) && !document.querySelector(`.achievement[data-name="${id}"]`)) {
                const achievementElement = document.createElement('div');
                achievementElement.className = 'achievement locked';
                achievementElement.setAttribute('data-name', id);
                
                if (achievements[id].secret) {
                    achievementElement.setAttribute('data-hint', achievements[id].hint);
                }
                
                achievementElement.innerHTML = `
                    <div class="achievement-icon"></div>
                    <div class="achievement-info">
                        <div class="achievement-name">${achievements[id].easter ? achievements[id].name : '???'}</div>
                        <div class="achievement-desc">${achievements[id].easter ? achievements[id].desc : 'Secret achievement - Hint: Hover me!'}</div>
                    </div>
                `;
                
                // Add click event to secret achievements
                if (achievements[id].secret) {
                    achievementElement.style.cursor = 'pointer';
                    achievementElement.addEventListener('click', function() {
                        const hintText = achievements[id].hint || 'No hint available';
                        const hintWindow = window.open('', '_blank');
                        hintWindow.document.write(`
                            <html>
                                <head>
                                    <title>Achievement Hint</title>
                                    <style>
                                        body {
                                            font-family: Arial, sans-serif;
                                            background-color: #1a1a2e;
                                            color: white;
                                            display: flex;
                                            justify-content: center;
                                            align-items: center;
                                            height: 100vh;
                                            margin: 0;
                                        }
                                        .hint-container {
                                            background-color: #16213e;
                                            padding: 20px;
                                            border-radius: 10px;
                                            box-shadow: 0 0 20px rgba(233, 69, 96, 0.5);
                                            max-width: 500px;
                                            text-align: center;
                                        }
                                        h1 {
                                            color: #e94560;
                                        }
                                        p {
                                            font-size: 18px;
                                            line-height: 1.5;
                                        }
                                    </style>
                                </head>
                                <body>
                                    <div class="hint-container">
                                        <h1>Achievement Hint</h1>
                                        <p>${hintText}</p>
                                    </div>
                                </body>
                            </html>
                        `);
                    });
                }
                
                if (achievements[id].unlocked) {
                    achievementElement.classList.remove('locked');
                    achievementElement.classList.add('unlocked');
                    achievementElement.querySelector('.achievement-icon').textContent = achievements[id].icon;
                    if (achievements[id].easter) {
                        achievementElement.querySelector('.achievement-name').textContent = achievements[id].name;
                        achievementElement.querySelector('.achievement-desc').textContent = achievements[id].desc;
                    }
                }
                
                achievementsContainer.appendChild(achievementElement);
            }
        }
    }
    
    addSecretAchievements();

    // Check if user qualifies for noob master achievement
    function checkNoobMasterAchievement() {
        if (localStorage.getItem('noob_master_failed') !== 'true') {
            unlockAchievement('noob-master');
        }
    }
    
    // Initialize noob master tracker
    if (!localStorage.getItem('noob_master_failed')) {
        localStorage.setItem('noob_master_failed', 'false');
    }
});