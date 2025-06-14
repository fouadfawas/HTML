document.addEventListener('DOMContentLoaded', () => {
    // Initialize the PSN category with entries
    function initializePSNTab() {
        const psnList = document.querySelector('.xmb-items[data-category="psn"]');

        // Clear any existing content
        psnList.innerHTML = '';

        // Add PlayStation Store option with new styling
        const storeOption = document.createElement('li');
        storeOption.className = 'item active';
        storeOption.innerHTML = `
            <div class="psn-icon">
                <svg viewBox="0 0 24 24" width="64" height="64">
                    <rect width="24" height="24" rx="2" fill="#006FCD"/>
                    <path d="M6,7 L18,7 L18,17 L6,17 Z M9,10 L15,10 M9,13 L15,13" stroke="white" stroke-width="1.5" stroke-linecap="round" fill="none"/>
                    <path d="M10,5 L14,5 L14,7 L10,7 Z" fill="white" opacity="0.8"/>
                </svg>
            </div>
            <span>PlayStation Store</span>
        `;

        psnList.appendChild(storeOption);

        // Create what's new option
        const whatsNewOption = document.createElement('li');
        whatsNewOption.className = 'item';
        whatsNewOption.innerHTML = `
            <div class="psn-icon">
                <svg viewBox="0 0 24 24" width="64" height="64">
                    <rect width="24" height="24" rx="2" fill="#006FCD"/>
                    <path d="M12,7 L12,14 M12,16 L12,18" stroke="white" stroke-width="2" stroke-linecap="round"/>
                    <circle cx="12" cy="16" r="1" fill="white"/>
                </svg>
            </div>
            <span>What's New</span>
        `;

        psnList.appendChild(whatsNewOption);

        // Add friends list option
        const friendsOption = document.createElement('li');
        friendsOption.className = 'item';
        friendsOption.innerHTML = `
            <div class="psn-icon">
                <svg viewBox="0 0 24 24" width="64" height="64">
                    <rect width="24" height="24" rx="2" fill="#006FCD"/>
                    <path d="M16,7 C16,9.2 14.2,11 12,11 C9.8,11 8,9.2 8,7 C8,4.8 9.8,3 12,3 C14.2,3 16,4.8 16,7 Z" stroke="white" stroke-width="1.5" fill="none"/>
                    <path d="M20,21 C20,17.1 16.4,14 12,14 C7.6,14 4,17.1 4,21" stroke="white" stroke-width="1.5" fill="none"/>
                </svg>
            </div>
            <span>Friends</span>
        `;

        psnList.appendChild(friendsOption);

        // Add trophies option
        const trophiesOption = document.createElement('li');
        trophiesOption.className = 'item';
        trophiesOption.innerHTML = `
            <div class="psn-icon">
                <svg viewBox="0 0 24 24" width="64" height="64">
                    <rect width="24" height="24" rx="2" fill="#006FCD"/>
                    <path d="M12,4 L16,10 L12,16 L8,10 Z" fill="gold" stroke="white" stroke-width="0.5"/>
                    <path d="M12,16 L12,19 M9,19 L15,19" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
            </div>
            <span>Trophies</span>
        `;

        psnList.appendChild(trophiesOption);

        // Add messages option
        const messagesOption = document.createElement('li');
        messagesOption.className = 'item';
        messagesOption.innerHTML = `
            <div class="psn-icon">
                <svg viewBox="0 0 24 24" width="64" height="64">
                    <rect width="24" height="24" rx="2" fill="#006FCD"/>
                    <path d="M4,6 L20,6 L20,18 L4,18 L4,6 Z M4,10 L20,10 M4,14 L20,14" stroke="white" stroke-width="1.5" stroke-linecap="round" fill="none"/>
            </svg>
        </div>
        <span>Messages</span>
    `;

        psnList.appendChild(messagesOption);

        // Add click handler for store
        storeOption.addEventListener('click', () => {
            if (storeOption.classList.contains('active')) {
                openPSNStore();
            }
        });

        // Add click handler for friends
        friendsOption.addEventListener('click', () => {
            if (friendsOption.classList.contains('active')) {
                openFriendsList();
            }
        });

        // Add click handler for trophies
        trophiesOption.addEventListener('click', () => {
            if (trophiesOption.classList.contains('active')) {
                openTrophies();
            }
        });

        // Add click handler for messages
        messagesOption.addEventListener('click', () => {
            if (messagesOption.classList.contains('active')) {
                openMessages();
            }
        });
    }

    // Show PSN Store
    function openPSNStore() {
        createStorePanel();
        window.PS3XMB.playSelectSound();
    }

    // Create and display PlayStation Store panel
    function createStorePanel() {
        let storePanel = document.querySelector('.store-panel');
        if (!storePanel) {
            storePanel = document.createElement('div');
            storePanel.className = 'settings-panel store-panel';
            storePanel.innerHTML = `
                <div class="settings-panel-content">
                    <h2 class="settings-title">PlayStation Store</h2>
                    <div class="store-content">
                        <div class="store-banner">
                            <img src="https://i.imgur.com/R0yU1EV.jpg" alt="PlayStation Store Banner" style="width:100%; border-radius:5px;">
                        </div>
                        <div class="store-featured">
                            <h3>Featured Games</h3>
                            <div class="store-items">
                                <div class="store-item">
                                    <div class="store-item-image" style="background-color:#880000">
                                        <svg viewBox="0 0 24 24" width="64" height="64">
                                            <rect width="24" height="24" rx="2" fill="#880000"/>
                                            <text x="12" y="16" font-size="8" text-anchor="middle" fill="white">GOW3</text>
                                        </svg>
                                    </div>
                                    <div class="store-item-title">God of War III</div>
                                    <div class="store-item-price">$19.99</div>
                                </div>
                                <div class="store-item">
                                    <div class="store-item-image" style="background-color:#000088">
                                        <svg viewBox="0 0 24 24" width="64" height="64">
                                            <rect width="24" height="24" rx="2" fill="#000088"/>
                                            <text x="12" y="16" font-size="8" text-anchor="middle" fill="white">GT5</text>
                                        </svg>
                                    </div>
                                    <div class="store-item-title">Gran Turismo 5</div>
                                    <div class="store-item-price">$14.99</div>
                                </div>
                                <div class="store-item">
                                    <div class="store-item-image" style="background-color:#008800">
                                        <svg viewBox="0 0 24 24" width="64" height="64">
                                            <rect width="24" height="24" rx="2" fill="#008800"/>
                                            <text x="12" y="16" font-size="8" text-anchor="middle" fill="white">UC2</text>
                                        </svg>
                                    </div>
                                    <div class="store-item-title">Uncharted 2</div>
                                    <div class="store-item-price">$9.99</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="settings-controls">
                        <div class="control"><span class="key">O</span> Back</div>
                    </div>
                </div>
            `;
            document.body.appendChild(storePanel);

            // Add click handlers for store items
            const storeItems = storePanel.querySelectorAll('.store-item');
            storeItems.forEach(item => {
                item.addEventListener('click', () => {
                    const title = item.querySelector('.store-item-title').textContent;
                    const price = item.querySelector('.store-item-price').textContent;
                    window.PS3XMB.showNotification(`Purchasing ${title} for ${price}...`);
                    setTimeout(() => {
                        window.PS3XMB.showNotification(`${title} purchase complete!`);
                    }, 3000);
                });
            });
        }

        storePanel.classList.add('visible');

        // Handle close button
        const closeHandler = (e) => {
            if (e.key === 'o' || e.key === 'O' || e.key === 'Escape') {
                storePanel.classList.remove('visible');
                document.removeEventListener('keydown', closeHandler);
                e.preventDefault();
            }
        };

        document.addEventListener('keydown', closeHandler);
    }

    // Show Friends list
    function openFriendsList() {
        createFriendsPanel();
        window.PS3XMB.playSelectSound();
    }

    // Create and display friends panel
    function createFriendsPanel() {
        // Check if panel already exists
        let friendsPanel = document.querySelector('.friends-panel');
        if (!friendsPanel) {
            friendsPanel = document.createElement('div');
            friendsPanel.className = 'settings-panel friends-panel';
            friendsPanel.innerHTML = `
                <div class="settings-panel-content">
                    <h2 class="settings-title">Friends List</h2>
                    <div class="friends-list"></div>
                    <div class="settings-controls">
                        <div class="control"><span class="key">O</span> Back</div>
                    </div>
                </div>
            `;
            document.body.appendChild(friendsPanel);
        }

        // Populate friends list
        const friendsList = friendsPanel.querySelector('.friends-list');
        friendsList.innerHTML = '';

        // Sample friends data
        const friends = [
            { id: 1, name: 'xXSniperKing420Xx', status: 'online', game: 'Call of Duty: Modern Warfare 2' },
            { id: 2, name: 'GTRacer99', status: 'online', game: 'Gran Turismo 5' },
            { id: 3, name: 'ShadowNinja', status: 'away', game: null },
            { id: 4, name: 'MasterChief117', status: 'offline', game: null },
            { id: 5, name: 'ZeldaFan2000', status: 'online', game: 'LittleBigPlanet' },
            { id: 6, name: 'Xx_Dark_Sasuke_xX', status: 'offline', game: null },
            { id: 7, name: 'CrashBandicoot', status: 'online', game: 'God of War III' }
        ];

        friends.forEach(friend => {
            const friendElement = document.createElement('div');
            friendElement.className = 'friend-item';

            // Status color
            let statusColor = '#8e8e8e'; // Default gray for offline
            let statusIcon = '●';

            if (friend.status === 'online') {
                statusColor = '#32CD32'; // Green for online
                statusIcon = '●';
            } else if (friend.status === 'away') {
                statusColor = '#FFA500'; // Orange for away
                statusIcon = '○';
            }

            friendElement.innerHTML = `
                <div class="friend-avatar">
                    <svg viewBox="0 0 24 24" width="32" height="32">
                        <circle cx="12" cy="12" r="11" fill="#006FCD" stroke="white" stroke-width="1" />
                        <text x="12" y="16" font-size="10" text-anchor="middle" fill="white">${friend.name.charAt(0).toUpperCase()}</text>
                    </svg>
                </div>
                <div class="friend-info">
                    <div class="friend-name">${friend.name}</div>
                    <div class="friend-status">
                        <span class="status-indicator" style="color: ${statusColor}">${statusIcon}</span>
                        ${friend.status === 'online' && friend.game ? `Playing ${friend.game}` : friend.status}
                    </div>
                </div>
                <div class="friend-actions">
                    <button class="friend-action-btn ${friend.status === 'offline' ? 'disabled' : ''}">Message</button>
                </div>
            `;

            friendsList.appendChild(friendElement);
        });

        // Show the panel
        friendsPanel.classList.add('visible');

        // Handle close button
        const closeHandler = (e) => {
            if (e.key === 'o' || e.key === 'O' || e.key === 'Escape') {
                friendsPanel.classList.remove('visible');
                document.removeEventListener('keydown', closeHandler);
                e.preventDefault();
            }
        };

        document.addEventListener('keydown', closeHandler);
    }

    // Show Trophies
    function openTrophies() {
        createTrophiesPanel();
        window.PS3XMB.playSelectSound();
    }

    // Create and display trophies panel
    function createTrophiesPanel() {
        let trophiesPanel = document.querySelector('.trophies-panel');
        if (!trophiesPanel) {
            trophiesPanel = document.createElement('div');
            trophiesPanel.className = 'settings-panel trophies-panel';
            trophiesPanel.innerHTML = `
                <div class="settings-panel-content">
                    <h2 class="settings-title">Trophies</h2>
                    <div class="trophy-stats">
                        <div class="trophy-stat">
                            <div class="trophy-icon platinum"></div>
                            <div class="trophy-count">1</div>
                        </div>
                        <div class="trophy-stat">
                            <div class="trophy-icon gold"></div>
                            <div class="trophy-count">5</div>
                        </div>
                        <div class="trophy-stat">
                            <div class="trophy-icon silver"></div>
                            <div class="trophy-count">12</div>
                        </div>
                        <div class="trophy-stat">
                            <div class="trophy-icon bronze"></div>
                            <div class="trophy-count">27</div>
                        </div>
                    </div>
                    <div class="trophy-list">
                        <div class="trophy-item">
                            <div class="trophy-item-icon gold"></div>
                            <div class="trophy-item-info">
                                <div class="trophy-item-title">Master Driver</div>
                                <div class="trophy-item-desc">Win all races in Gran Turismo 5</div>
                                <div class="trophy-item-game">Gran Turismo 5</div>
                            </div>
                            <div class="trophy-item-date">Apr 12, 2025</div>
                        </div>
                        <div class="trophy-item">
                            <div class="trophy-item-icon silver"></div>
                            <div class="trophy-item-info">
                                <div class="trophy-item-title">Treasure Hunter</div>
                                <div class="trophy-item-desc">Find 50% of all treasures</div>
                                <div class="trophy-item-game">Uncharted 2</div>
                            </div>
                            <div class="trophy-item-date">Apr 10, 2025</div>
                        </div>
                        <div class="trophy-item">
                            <div class="trophy-item-icon bronze"></div>
                            <div class="trophy-item-info">
                                <div class="trophy-item-title">First Blood</div>
                                <div class="trophy-item-desc">Defeat your first enemy</div>
                                <div class="trophy-item-game">God of War III</div>
                            </div>
                            <div class="trophy-item-date">Apr 8, 2025</div>
                        </div>
                    </div>
                    <div class="settings-controls">
                        <div class="control"><span class="key">O</span> Back</div>
                    </div>
                </div>
            `;
            document.body.appendChild(trophiesPanel);
        }

        trophiesPanel.classList.add('visible');

        // Handle close button
        const closeHandler = (e) => {
            if (e.key === 'o' || e.key === 'O' || e.key === 'Escape') {
                trophiesPanel.classList.remove('visible');
                document.removeEventListener('keydown', closeHandler);
                e.preventDefault();
            }
        };

        document.addEventListener('keydown', closeHandler);
    }

    // Show Messages
    function openMessages() {
        createMessagesPanel();
        window.PS3XMB.playSelectSound();
    }

    // Create and display messages panel
    function createMessagesPanel() {
        let messagesPanel = document.querySelector('.messages-panel');
        if (!messagesPanel) {
            messagesPanel = document.createElement('div');
            messagesPanel.className = 'settings-panel messages-panel';
            messagesPanel.innerHTML = `
                <div class="settings-panel-content">
                    <h2 class="settings-title">Messages</h2>
                    <div class="messages-list">
                        <div class="message-item unread">
                            <div class="message-avatar">
                                <svg viewBox="0 0 24 24" width="32" height="32">
                                    <circle cx="12" cy="12" r="11" fill="#006FCD" stroke="white" stroke-width="1" />
                                    <text x="12" y="16" font-size="10" text-anchor="middle" fill="white">G</text>
                                </svg>
                            </div>
                            <div class="message-info">
                                <div class="message-sender">GTRacer99</div>
                                <div class="message-preview">Hey, wanna race online?</div>
                                <div class="message-time">Today, 14:32</div>
                            </div>
                        </div>
                        <div class="message-item">
                            <div class="message-avatar">
                                <svg viewBox="0 0 24 24" width="32" height="32">
                                    <circle cx="12" cy="12" r="11" fill="#006FCD" stroke="white" stroke-width="1" />
                                    <text x="12" y="16" font-size="10" text-anchor="middle" fill="white">S</text>
                                </svg>
                            </div>
                            <div class="message-info">
                                <div class="message-sender">ShadowNinja</div>
                                <div class="message-preview">Did you get the new DLC?</div>
                                <div class="message-time">Yesterday, 20:15</div>
                            </div>
                        </div>
                        <div class="message-item">
                            <div class="message-avatar">
                                <svg viewBox="0 0 24 24" width="32" height="32">
                                    <circle cx="12" cy="12" r="11" fill="#006FCD" stroke="white" stroke-width="1" />
                                    <text x="12" y="16" font-size="10" text-anchor="middle" fill="white">Z</text>
                                </svg>
                            </div>
                            <div class="message-info">
                                <div class="message-sender">ZeldaFan2000</div>
                                <div class="message-preview">Check out my new level in LBP!</div>
                                <div class="message-time">Apr 10, 2025</div>
                            </div>
                        </div>
                    </div>
                    <div class="settings-controls">
                        <div class="control"><span class="key">O</span> Back</div>
                    </div>
                </div>
            `;
            document.body.appendChild(messagesPanel);

            // Add click handler for messages
            const messageItems = messagesPanel.querySelectorAll('.message-item');
            messageItems.forEach(item => {
                item.addEventListener('click', () => {
                    const sender = item.querySelector('.message-sender').textContent;
                    item.classList.remove('unread');
                    window.PS3XMB.showNotification(`Opening message from ${sender}`);
                });
            });
        }

        messagesPanel.classList.add('visible');

        // Handle close button
        const closeHandler = (e) => {
            if (e.key === 'o' || e.key === 'O' || e.key === 'Escape') {
                messagesPanel.classList.remove('visible');
                document.removeEventListener('keydown', closeHandler);
                e.preventDefault();
            }
        };

        document.addEventListener('keydown', closeHandler);
    }

    // Initialize the PSN tab
    initializePSNTab();

    // Handle keypress handler for PSN items
    document.addEventListener('keydown', (e) => {
        if (document.querySelector('.category.active')?.dataset.category === 'psn') {
            if (e.key === 'Enter' || e.key === 'x' || e.key === 'X') {
                const activeItem = document.querySelector('.xmb-items[data-category="psn"] .item.active');
                if (activeItem) {
                    const itemText = activeItem.querySelector('span').textContent;
                    if (itemText === 'PlayStation Store') {
                        openPSNStore();
                        e.preventDefault();
                    } else if (itemText === 'Friends') {
                        openFriendsList();
                        e.preventDefault();
                    } else if (itemText === 'Trophies') {
                        openTrophies();
                        e.preventDefault();
                    } else if (itemText === 'Messages') {
                        openMessages();
                        e.preventDefault();
                    }
                }
            }
        }
    });

    // Export PSN functionality to window object
    window.PSNSystem = {
        openStore: openPSNStore,
        openFriends: openFriendsList,
        openTrophies: openTrophies,
        openMessages: openMessages
    };
});