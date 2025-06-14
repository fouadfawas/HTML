document.addEventListener('DOMContentLoaded', () => {
    // Initialize the Apps category with various PlayStation apps
    function initializeAppsTab() {
        const appsList = document.querySelector('.xmb-items[data-category="apps"]');
        
        // Clear any existing content
        appsList.innerHTML = '';
        
        // Add Netflix app
        const netflixOption = document.createElement('li');
        netflixOption.className = 'item active';
        netflixOption.innerHTML = `
            <div class="app-icon">
                <svg viewBox="0 0 24 24" width="64" height="64">
                    <rect width="24" height="24" rx="2" fill="#E50914"/>
                    <path d="M5,5 L10,19 M19,5 L14,19" stroke="white" stroke-width="3" stroke-linecap="round"/>
                </svg>
            </div>
            <span>Netflix</span>
        `;
        
        appsList.appendChild(netflixOption);
        
        // Create YouTube app
        const youtubeOption = document.createElement('li');
        youtubeOption.className = 'item';
        youtubeOption.innerHTML = `
            <div class="app-icon">
                <svg viewBox="0 0 24 24" width="64" height="64">
                    <rect width="24" height="24" rx="2" fill="#FF0000"/>
                    <path d="M12,7 L12,17 M7,12 L17,12" stroke="white" stroke-width="0" fill="none"/>
                    <path d="M10,9 L10,15 L15,12 Z" fill="white"/>
                </svg>
            </div>
            <span>YouTube</span>
        `;
        
        appsList.appendChild(youtubeOption);
        
        // Add PlayStation Browser
        const browserOption = document.createElement('li');
        browserOption.className = 'item';
        browserOption.innerHTML = `
            <div class="app-icon">
                <svg viewBox="0 0 24 24" width="64" height="64">
                    <rect width="24" height="24" rx="2" fill="#006FCD"/>
                    <circle cx="12" cy="12" r="6" stroke="white" stroke-width="1.5" fill="none"/>
                    <path d="M12,6 L12,18 M6,12 L18,12" stroke="white" stroke-width="1.5"/>
                </svg>
            </div>
            <span>Internet Browser</span>
        `;
        
        appsList.appendChild(browserOption);
        
        // Add PlayStation TV app
        const tvOption = document.createElement('li');
        tvOption.className = 'item';
        tvOption.innerHTML = `
            <div class="app-icon">
                <svg viewBox="0 0 24 24" width="64" height="64">
                    <rect width="24" height="24" rx="2" fill="#006FCD"/>
                    <rect x="4" y="6" width="16" height="10" rx="1" stroke="white" stroke-width="1.5" fill="none"/>
                    <path d="M8,18 L16,18" stroke="white" stroke-width="1.5"/>
                </svg>
            </div>
            <span>PlayStation TV</span>
        `;
        
        appsList.appendChild(tvOption);
        
        // Add Spotify app
        const spotifyOption = document.createElement('li');
        spotifyOption.className = 'item';
        spotifyOption.innerHTML = `
            <div class="app-icon">
                <svg viewBox="0 0 24 24" width="64" height="64">
                    <rect width="24" height="24" rx="2" fill="#1DB954"/>
                    <circle cx="12" cy="12" r="6" fill="none" stroke="white" stroke-width="1.5"/>
                    <path d="M9,10 C11,9 14,9.5 15,10.5 M9,12 C11,11 13,11.5 14,12.5 M9,14 C10.5,13 12,13.5 13,14.5" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
            </div>
            <span>Spotify</span>
        `;
        
        appsList.appendChild(spotifyOption);
        
        // Setup event handlers for apps
        setupAppHandlers();
    }
    
    // Set up event handlers for app interactions
    function setupAppHandlers() {
        // Add click handlers for each app
        const appItems = document.querySelectorAll('.xmb-items[data-category="apps"] .item');
        
        appItems.forEach(item => {
            item.addEventListener('click', () => {
                if (item.classList.contains('active')) {
                    const appName = item.querySelector('span').textContent;
                    launchApp(appName);
                }
            });
        });
        
        // Add keyboard handler
        document.addEventListener('keydown', (e) => {
            if (document.querySelector('.category.active')?.dataset.category === 'apps') {
                if (e.key === 'Enter' || e.key === 'x' || e.key === 'X') {
                    const activeItem = document.querySelector('.xmb-items[data-category="apps"] .item.active');
                    if (activeItem) {
                        const appName = activeItem.querySelector('span').textContent;
                        launchApp(appName);
                        e.preventDefault();
                    }
                }
            }
        });
    }
    
    // Launch the selected app
    function launchApp(appName) {
        // Create app launch overlay with app-specific content
        const overlay = document.createElement('div');
        overlay.className = 'game-launch-overlay';
        document.querySelector('.container').appendChild(overlay);
        
        // Make the overlay visible immediately (black screen)
        setTimeout(() => {
            overlay.classList.add('visible');
            PS3XMB.playSelectSound();
            
            // After a short delay, show app content
            setTimeout(() => {
                const content = document.createElement('div');
                content.className = 'game-launch-content';
                
                // Content varies based on the app
                switch(appName) {
                    case 'Netflix':
                        content.innerHTML = `
                            <h1 style="color: #E50914;">Netflix</h1>
                            <div style="background: #000; padding: 20px; border-radius: 5px; margin-top: 20px;">
                                <p style="color: #CCC; margin-bottom: 15px;">Loading Netflix application...</p>
                                <div class="loading-bar">
                                    <div class="loading-progress"></div>
                                </div>
                            </div>
                            <p style="margin-top: 30px; font-size: 14px; opacity: 0.7;">Press ESC or O to return to XMB.</p>
                        `;
                        
                        // Add loading bar animation
                        setTimeout(() => {
                            const loadingBar = content.querySelector('.loading-progress');
                            if (loadingBar) {
                                loadingBar.style.width = '100%';
                            }
                        }, 100);
                        
                        break;
                        
                    case 'YouTube':
                        content.innerHTML = `
                            <h1 style="color: #FF0000;">YouTube</h1>
                            <div style="background: #222; padding: 20px; border-radius: 5px; margin-top: 20px;">
                                <p style="color: #FFF; margin-bottom: 15px;">Connecting to YouTube...</p>
                                <div class="video-thumbnails" style="display: flex; justify-content: space-between; margin-top: 20px;">
                                    <div class="video-thumb" style="width: 30%; background: #333; height: 80px; border-radius: 3px;"></div>
                                    <div class="video-thumb" style="width: 30%; background: #333; height: 80px; border-radius: 3px;"></div>
                                    <div class="video-thumb" style="width: 30%; background: #333; height: 80px; border-radius: 3px;"></div>
                                </div>
                            </div>
                            <p style="margin-top: 30px; font-size: 14px; opacity: 0.7;">Press ESC or O to return to XMB.</p>
                        `;
                        break;
                        
                    case 'Internet Browser':
                        content.innerHTML = `
                            <h1 style="color: #006FCD;">PlayStation Browser</h1>
                            <div style="background: #FFF; padding: 20px; border-radius: 5px; margin-top: 20px; color: #333;">
                                <div style="background: #EEE; padding: 10px; border-radius: 5px; display: flex; align-items: center;">
                                    <span style="margin-right: 10px;">🔍</span>
                                    <div style="flex: 1; background: #FFF; padding: 5px; border-radius: 3px; border: 1px solid #DDD;">
                                        google.com
                                    </div>
                                </div>
                                <div style="margin-top: 20px; text-align: center; color: #777;">
                                    Browser functionality is limited in this simulation
                                </div>
                            </div>
                            <p style="margin-top: 30px; font-size: 14px; opacity: 0.7;">Press ESC or O to return to XMB.</p>
                        `;
                        break;
                        
                    default:
                        content.innerHTML = `
                            <h1>${appName}</h1>
                            <p style="margin-top: 20px;">This is where ${appName} would be running right now.</p>
                            <p style="margin-top: 30px; font-size: 14px; opacity: 0.7;">Press ESC or O to return to XMB.</p>
                        `;
                }
                
                overlay.appendChild(content);
                
                // Add CSS for loading bar if needed
                const style = document.createElement('style');
                style.textContent = `
                    .loading-bar {
                        background: #333;
                        height: 6px;
                        border-radius: 3px;
                        overflow: hidden;
                    }
                    .loading-progress {
                        background: #E50914;
                        height: 6px;
                        width: 0%;
                        transition: width 3s ease-in-out;
                    }
                `;
                document.head.appendChild(style);
                
            }, 1000);
        }, 50);
        
        // Add event listener to exit app
        const exitAppHandler = (e) => {
            if (e.key === 'Escape' || e.key === 'o' || e.key === 'O') {
                overlay.classList.remove('visible');
                setTimeout(() => {
                    overlay.remove();
                    document.removeEventListener('keydown', exitAppHandler);
                }, 1000);
            }
        };
        
        document.addEventListener('keydown', exitAppHandler);
    }
    
    // Initialize the Apps tab
    initializeAppsTab();
    
    // Export apps functionality to window object
    window.AppsSystem = {
        launchApp: launchApp
    };
});