// Undertale sigma game
document.addEventListener('DOMContentLoaded', () => {
    const backgroundMusic = document.getElementById('background-music');
    const menuMusic = document.getElementById('menu-music');

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    const scenes = [
        {
            image: 'IntroCard1.png',
            text: 'long before time... 2 races ruled the planet, human and doha salams',
            displayTime: 10000,
            specialTyping: true
        },
        {
            image: 'IntroCard2.png',
            text: 'one day, war broke out\nthe students, and the dohas had a long fight.',
            displayTime: 9000
        },
        {
            image: 'IntroCard3.png',
            text: 'after a long  fight,\nthe students won',
            displayTime: 9000
        },
        {
            image: 'IntroCard4.png',
            text: 'they sealed the doha salams\ninto the closet',
            displayTime: 9000,
            specialAnimation: 'imageOnly'
        },
        {
            image: 'IntroCard5.png',
            text: '',
            displayTime: 6000,
            specialTransition: 'imageOnly'
        },
        {
            image: 'IntroCard6.png',
            text: 'science class\n2023',
            displayTime: 8000
        },
        {
            image: 'IntroCard7.png',
            text: 'legends say that those who climb the mountain never return.',
            displayTime: 8000
        },
        {
            image: 'IntroCard8.png',
            text: '...',
            displayTime: 4000
        },
        {
            image: 'IntroCard9.png',
            text: '',
            displayTime: 4000
        },
        {
            image: 'IntroCard10.png',
            text: 'for gods sake just dont fall',
            displayTime: 4000
        },
        {
            image: 'IntroCard11 (1).png',
            text: 'pro',
            displayTime: 8500,
            specialAnimation: 'verticalScroll'
        }
    ];

    const sceneContainer = document.getElementById('scene-container');
    const textContainer = document.getElementById('text-container');

    let currentSceneIndex = 0;
    let textAnimationTimeout = null;
    let introTimeoutId = null;
    let playerName = '';

    // Variables for name confirmation screen
    let selectedConfirmOption = 0;
    let confirmOptions = [];

    // Define confirmation handlers in the outer scope to avoid ReferenceError
    function updateConfirmSelection() {
        confirmOptions.forEach((option, index) => {
            option.style.color = index === selectedConfirmOption ? 'yellow' : 'white';
        });
    }

    function handleConfirmationKeyInput(e) {
        switch(e.key) {
            case 'ArrowLeft':
                selectedConfirmOption = 0;
                updateConfirmSelection();
                break;
            case 'ArrowRight':
                selectedConfirmOption = 1;
                updateConfirmSelection();
                break;
            case 'z':
            case 'Enter':
                selectConfirmationOption();
                break;
            case 'x':
            case 'Backspace':
                document.removeEventListener('keydown', handleConfirmationKeyInput);
                showNameSelection();
                break;
        }
    }

    function selectConfirmationOption() {
        document.removeEventListener('keydown', handleConfirmationKeyInput);
        if (selectedConfirmOption === 0) {
            startGame();
        } else {
            showNameSelection();
        }
    }

    // Define credits handler in the outer scope
     function handleCreditsKeyInput(e) {
        switch(e.key) {
            case 'x':
            case 'Backspace':
                document.removeEventListener('keydown', handleCreditsKeyInput);
                showMainMenu();
                break;
        }
    }


    function playMusic() {
        if (backgroundMusic) {
            backgroundMusic.volume = 1;
            backgroundMusic.play().catch(e => {
                console.error("Audio play failed, likely due to user interaction requirement:", e);
                document.body.addEventListener('click', retryPlayMusic, { once: true });
                document.body.addEventListener('touchstart', retryPlayMusic, { once: true });
            });
        } else {
            console.error("Background music element not found!");
        }
    }

    function retryPlayMusic() {
         if (backgroundMusic && backgroundMusic.paused) {
             backgroundMusic.play().catch(e => console.error("Audio play failed after interaction:", e));
         }
    }

    function playMenuMusic() {
         if (menuMusic) {
             menuMusic.volume = 1;
             menuMusic.play().catch(e => console.error("Menu music play failed:", e));
         } else {
             console.error("Menu music element not found!");
         }
    }

    function skipIntro() {
        if (currentSceneIndex < scenes.length) {
            console.log("Skipping intro...");

            clearTimeout(introTimeoutId);
            clearTimeout(textAnimationTimeout);

            const allImages = sceneContainer.querySelectorAll('.scene-image');
            allImages.forEach(img => {
                img.style.transition = 'opacity 0.5s ease-in-out';
                img.style.opacity = 0;
            });

            const borderContainers = sceneContainer.querySelectorAll('div');
            borderContainers.forEach(container => {
                if (container.style.border) {
                     container.style.transition = 'opacity 0.5s ease-in-out';
                     container.style.opacity = 0;
                }
            });

            textContainer.style.transition = 'opacity 0.5s ease-in-out';
            textContainer.style.opacity = 0;

            if (backgroundMusic && !backgroundMusic.paused) {
                const fadeAudio = setInterval(() => {
                    if (backgroundMusic.volume > 0.1) {
                        backgroundMusic.volume -= 0.1;
                    } else {
                        backgroundMusic.pause();
                        backgroundMusic.volume = 1;
                        clearInterval(fadeAudio);
                    }
                }, 50);
            }

            currentSceneIndex = scenes.length;

            setTimeout(() => {
                sceneContainer.innerHTML = '';
                textContainer.innerHTML = '';

                showTitleScreen();
            }, 500);

            document.removeEventListener('keydown', handleIntroSkip);
        }
    }

    function handleIntroSkip(e) {
        if (scenes[currentSceneIndex] && scenes[currentSceneIndex].specialAnimation === 'verticalScroll') {
             return;
        }

        if (e.key === 'Enter' || e.key === 'z') {
            skipIntro();
        }
    }

    document.addEventListener('keydown', handleIntroSkip);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'F4') {
            e.preventDefault();
            toggleFullscreen();
        }
    });

    function displayScene(sceneIndex) {
        if (sceneIndex >= scenes.length) {
            console.log('Intro complete!');
            document.removeEventListener('keydown', handleIntroSkip);

            if (backgroundMusic && !backgroundMusic.paused) {
                 const fadeAudio = setInterval(() => {
                     if (backgroundMusic.volume > 0.1) {
                         backgroundMusic.volume -= 0.1;
                     } else {
                         backgroundMusic.volume = 0;
                         backgroundMusic.pause();
                         backgroundMusic.volume = 1;
                         clearInterval(fadeAudio);
                     }
                 }, 200);
            }

            showTitleScreen();
            return;
        }

        currentSceneIndex = sceneIndex;

        const scene = scenes[sceneIndex];

        sceneContainer.innerHTML = '';
        textContainer.textContent = '';
        textContainer.style.opacity = 0;

        const imageElement = document.createElement('img');
        imageElement.src = scene.image;
        imageElement.classList.add('scene-image');
        sceneContainer.appendChild(imageElement);

        if (scene.specialAnimation === 'verticalScroll') {
            imageElement.style.maxWidth = '150%';
            imageElement.style.maxHeight = '150%';
            imageElement.style.width = 'auto';
            imageElement.style.height = 'auto';
            imageElement.style.position = 'absolute';
            imageElement.style.left = '50%';
            imageElement.style.transform = 'translateX(-50%)';
            imageElement.style.transition = 'opacity 1s ease-in-out, top 8s ease-in-out';
            imageElement.style.top = '-50%';

            const outerBorderContainer = document.createElement('div');
            outerBorderContainer.style.position = 'absolute';
            outerBorderContainer.style.top = '0';
            outerBorderContainer.style.left = '0';
            outerBorderContainer.style.width = '100%';
            outerBorderContainer.style.height = '100%';
            outerBorderContainer.style.border = '76px solid black';
            outerBorderContainer.style.boxSizing = 'border-box';
            outerBorderContainer.style.zIndex = '4';
            outerBorderContainer.style.opacity = 0;
            outerBorderContainer.style.transition = 'opacity 1s ease-in-out';

            const borderContainer = document.createElement('div');
            borderContainer.style.position = 'absolute';
            borderContainer.style.top = '0';
            borderContainer.style.left = '0';
            borderContainer.style.width = '100%';
            borderContainer.style.height = '100%';
            borderContainer.style.border = '90px solid black';
            borderContainer.style.boxSizing = 'border-box';
            borderContainer.style.zIndex = '5';
            borderContainer.style.opacity = 0;
            borderContainer.style.transition = 'opacity 1s ease-in-out';

            sceneContainer.appendChild(outerBorderContainer);
            sceneContainer.appendChild(borderContainer);

            imageElement.onload = () => {
                imageElement.style.left = '50%';
                imageElement.style.transform = 'translateX(-50%)';

                const containerHeight = sceneContainer.clientHeight;
                const imageHeight = imageElement.clientHeight;
                const startTop = containerHeight * 0.5 - imageHeight * 0.8;
                const endTop = containerHeight * 0.5 - imageHeight * 0.2;

                imageElement.style.top = `${startTop}px`;

                setTimeout(() => {
                    imageElement.style.opacity = 1;
                    borderContainer.style.opacity = 1;
                    outerBorderContainer.style.opacity = 1;

                    setTimeout(() => {
                        imageElement.style.transition = 'opacity 1s ease-in-out, top 15s linear';
                        imageElement.style.top = `${endTop}px`;

                        introTimeoutId = setTimeout(() => {
                            imageElement.style.opacity = 0;
                            borderContainer.style.opacity = 0;
                            outerBorderContainer.style.opacity = 0;

                            setTimeout(() => {
                                imageElement.remove();
                                borderContainer.remove();
                                outerBorderContainer.remove();
                                displayScene(sceneIndex + 1);
                            }, 1000);
                        }, 15000);
                    }, 100);
                }, 100);
            };

            imageElement.onerror = () => {
                console.error("Error loading image for vertical scroll scene:", scene.image);
                displayScene(sceneIndex + 1);
            };

            return;
        }

        const typingTime = scene.text.length * 100;

        setTimeout(() => {
            imageElement.style.opacity = 1;
            textContainer.style.opacity = 1;
            textAnimationTimeout = setTimeout(() => typeWriter(scene.text, scene.specialTyping), 1000);
        }, 100);

        const effectiveDisplayTime = Math.max(scene.displayTime, typingTime + (scene.specialTyping ? 2000 : 1000));

        introTimeoutId = setTimeout(() => {
            imageElement.style.opacity = 0;
            textContainer.style.opacity = 0;

            setTimeout(() => {
                imageElement.remove();
                displayScene(sceneIndex + 1);
            }, 1000);
        }, effectiveDisplayTime);

        function typeWriter(text, isSpecial = false) {
            if (textAnimationTimeout) {
                clearTimeout(textAnimationTimeout);
            }

            textContainer.textContent = '';

            if (isSpecial) {
                const parts = text.split('\n');
                let firstPart = parts[0];
                let secondPart = parts.length > 1 ? parts[1] : '';

                const firstChars = firstPart.split('');
                let currentIndex = 0;

                function typeFirstPart() {
                    if (currentIndex < firstChars.length) {
                        textContainer.textContent += firstChars[currentIndex];
                        currentIndex++;
                        textAnimationTimeout = setTimeout(typeFirstPart, 100);
                    } else {
                        textContainer.textContent += '\n';

                        if (secondPart) {
                            textAnimationTimeout = setTimeout(() => {
                                const secondChars = secondPart.split('');
                                currentIndex = 0;

                                function typeSecondPart() {
                                    if (currentIndex < secondChars.length) {
                                        textContainer.textContent += secondChars[currentIndex];
                                        currentIndex++;
                                        textAnimationTimeout = setTimeout(typeSecondPart, 100);
                                    }
                                }

                                typeSecondPart();
                            }, 1000);
                        }
                    }
                }

                typeFirstPart();
            } else {
                const textChars = text.split('');
                let currentIndex = 0;

                function addNextChar() {
                    if (currentIndex < textChars.length) {
                        textContainer.textContent += textChars[currentIndex];
                        currentIndex++;
                        textAnimationTimeout = setTimeout(addNextChar, 100);
                    }
                }

                addNextChar();
            }
        }
    }

    function showTitleScreen() {
        sceneContainer.innerHTML = '';
        textContainer.innerHTML = '';

        const titleImage = document.createElement('img');
        titleImage.src = 'a1df32bcfee9568ab09fc411e14f8c47.png';
        titleImage.style.maxWidth = '80%';
        titleImage.style.position = 'absolute';
        titleImage.style.top = '50%';
        titleImage.style.left = '50%';
        titleImage.style.transform = 'translate(-50%, -50%)';
        titleImage.style.opacity = 0;
        titleImage.classList.add('scene-image');
        titleImage.style.transition = 'opacity 1s ease-in-out';
        sceneContainer.appendChild(titleImage);

        if (backgroundMusic && !backgroundMusic.paused) {
            const fadeAudio = setInterval(() => {
                if (backgroundMusic.volume > 0.1) {
                    backgroundMusic.volume -= 0.1;
                } else {
                    backgroundMusic.pause();
                    backgroundMusic.volume = 1;
                    clearInterval(fadeAudio);
                    playMenuMusic();
                }
            }, 200);
        } else {
            playMenuMusic();
        }

        setTimeout(() => {
            titleImage.style.opacity = 1;

            setTimeout(() => {
                titleImage.style.opacity = 0;
                setTimeout(() => {
                    titleImage.remove();
                    showInstructions();
                }, 1000);
            }, 2000);
        }, 100);
    }

    function showInstructions() {
        sceneContainer.innerHTML = '';
        textContainer.innerHTML = '';

        const bgImage = document.createElement('img');
        bgImage.src = 'costume3.png';
        bgImage.style.position = 'absolute';
        bgImage.style.width = '100%';
        bgImage.style.height = '100%';
        bgImage.style.objectFit = 'cover';
        bgImage.style.opacity = 0.5;
        sceneContainer.appendChild(bgImage);

        const instructionsContainer = document.createElement('div');
        instructionsContainer.style.display = 'flex';
        instructionsContainer.style.flexDirection = 'column';
        instructionsContainer.style.alignItems = 'center';
        instructionsContainer.style.justifyContent = 'center';
        instructionsContainer.style.height = '100%';
        instructionsContainer.style.position = 'relative';
        sceneContainer.appendChild(instructionsContainer);

        const instructionsTitle = document.createElement('div');
        instructionsTitle.textContent = '--- instructions ---';
        instructionsTitle.style.color = '#808080';
        instructionsTitle.style.fontSize = '24px';
        instructionsTitle.style.marginBottom = '20px';
        instructionsTitle.style.fontFamily = 'Determination, sans-serif';
        instructionsContainer.appendChild(instructionsTitle);

        const instructions = document.createElement('div');
        instructions.style.color = '#808080';
        instructions.style.fontSize = '20px';
        instructions.style.textAlign = 'left';
        instructions.style.fontFamily = 'Determination, sans-serif';
        instructions.style.marginBottom = '40px';
        instructions.innerHTML = '[z or enter] - confirm<br>' +
                               '[x or shift] - cancel<br>' +
                               '[c or ctrl] - menu (in-game)<br>' +
                               '[f4] - fullscreen<br>' +
                               '[hold esc] - quit<br>' +
                               'when hp is 0 you lose.';
        instructionsContainer.appendChild(instructions);

        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '20px';
        instructionsContainer.appendChild(buttonContainer);

        const beginButton = document.createElement('div');
        beginButton.textContent = 'begin game';
        beginButton.style.cursor = 'pointer';
        beginButton.style.padding = '10px 20px';
        beginButton.style.color = 'white';
        beginButton.style.fontSize = '20px';
        beginButton.style.fontFamily = 'Determination, sans-serif';
        beginButton.style.textShadow = '2px 2px 0 #000';
        buttonContainer.appendChild(beginButton);

        const settingsButton = document.createElement('div');
        settingsButton.textContent = 'settings';
        settingsButton.style.cursor = 'pointer';
        settingsButton.style.padding = '10px 20px';
        settingsButton.style.color = 'white';
        settingsButton.style.fontSize = '20px';
        settingsButton.style.fontFamily = 'Determination, sans-serif';
        settingsButton.style.textShadow = '2px 2px 0 #000';
        buttonContainer.appendChild(settingsButton);

        let selectedButton = 0;
        const buttons = [beginButton, settingsButton];

        function updateButtonSelection() {
            buttons.forEach((button, index) => {
                button.style.color = index === selectedButton ? 'yellow' : 'white';
            });
        }

        function handleKeyPress(e) {
            switch(e.key) {
                case 'ArrowLeft':
                    selectedButton = 0;
                    updateButtonSelection();
                    break;
                case 'ArrowRight':
                    selectedButton = 1;
                    updateButtonSelection();
                    break;
                case 'z':
                case 'Enter':
                    document.removeEventListener('keydown', handleKeyPress);
                    if (selectedButton === 0) {
                        showMainMenu();
                    } else {
                        alert('Settings not implemented yet');
                        document.addEventListener('keydown', handleKeyPress);
                    }
                    break;
                case 'x':
                case 'Backspace':
                    document.removeEventListener('keydown', handleKeyPress);
                    showTitleScreen();
                    break;
            }
        }

        document.addEventListener('keydown', handleKeyPress);
        updateButtonSelection();
    }

    function showMainMenu() {
        sceneContainer.innerHTML = '';
        textContainer.innerHTML = '';

        const bgImage = document.createElement('img');
        bgImage.src = 'costume3.png';
        bgImage.style.position = 'absolute';
        bgImage.style.width = '100%';
        bgImage.style.height = '100%';
        bgImage.style.objectFit = 'cover';
        bgImage.style.opacity = 0.5;
        sceneContainer.appendChild(bgImage);

        const menuContainer = document.createElement('div');
        menuContainer.id = 'menu-container';
        menuContainer.style.display = 'flex';
        menuContainer.style.flexDirection = 'column';
        menuContainer.style.alignItems = 'center';
        menuContainer.style.justifyContent = 'center';
        menuContainer.style.height = '100%';
        menuContainer.style.width = '100%';
        menuContainer.style.position = 'absolute';
        menuContainer.style.top = '0';
        menuContainer.style.left = '0';
        sceneContainer.appendChild(menuContainer);

        const titleImage = document.createElement('img');
        titleImage.src = 'a1df32bcfee9568ab09fc411e14f8c47.png';
        titleImage.style.maxWidth = '60%';
        titleImage.style.marginBottom = '40px';
        titleImage.classList.add('scene-image');
        titleImage.style.opacity = 1;
        titleImage.style.transition = 'none';
        menuContainer.appendChild(titleImage);

        const menuOptions = ['play', 'options', 'credits'];
        let selectedOption = 0;

        menuOptions.forEach((option, index) => {
            const button = document.createElement('div');
            button.textContent = option;
            button.className = 'menu-option';
            button.dataset.index = index;
            button.style.fontSize = '20px';
            button.style.marginBottom = '15px';
            button.style.cursor = 'pointer';
            button.style.padding = '8px 24px';
            button.style.fontFamily = 'Determination, sans-serif';
            menuContainer.appendChild(button);
        });

        function updateMenuSelection() {
            document.querySelectorAll('.menu-option').forEach((option, index) => {
                if (index === selectedOption) {
                    option.style.color = 'yellow';
                } else {
                    option.style.color = 'white';
                }
            });
        }

        updateMenuSelection();

        function handleMenuKeyInput(e) {
            switch(e.key) {
                case 'ArrowUp':
                    selectedOption = (selectedOption - 1 + menuOptions.length) % menuOptions.length;
                    updateMenuSelection();
                    break;
                case 'ArrowDown':
                    selectedOption = (selectedOption + 1) % menuOptions.length;
                    updateMenuSelection();
                    break;
                case 'z':
                case 'Enter':
                    selectMenuOption();
                    break;
                case 'x':
                case 'Backspace':
                    document.removeEventListener('keydown', handleMenuKeyInput);
                    showInstructions();
                    break;
            }
        }

        function selectMenuOption() {
            document.removeEventListener('keydown', handleMenuKeyInput);

            switch(selectedOption) {
                case 0:
                    menuContainer.style.transition = 'opacity 1s';
                    menuContainer.style.opacity = 0;
                    setTimeout(() => {
                        showNameSelection();
                    }, 1000);
                    break;
                case 1:
                    alert('Options menu is not implemented yet.');
                    document.addEventListener('keydown', handleMenuKeyInput);
                    break;
                case 2:
                    menuContainer.style.transition = 'opacity 1s';
                    menuContainer.style.opacity = 0;
                    setTimeout(() => {
                        showCredits();
                    }, 1000);
                    break;
            }
        }

        document.addEventListener('keydown', handleMenuKeyInput);
    }


    function showNameSelection() {
        sceneContainer.innerHTML = '';
        textContainer.innerHTML = '';

        if (menuMusic && !menuMusic.paused) {
            menuMusic.pause();
            menuMusic.volume = 1;
        }

        const nameSelectionContainer = document.createElement('div');
        nameSelectionContainer.id = 'name-selection-container';
        nameSelectionContainer.style.display = 'flex';
        nameSelectionContainer.style.flexDirection = 'column';
        nameSelectionContainer.style.alignItems = 'center';
        nameSelectionContainer.style.justifyContent = 'center';
        nameSelectionContainer.style.height = '100%';
        nameSelectionContainer.style.width = '100%';
        nameSelectionContainer.style.position = 'absolute';
        nameSelectionContainer.style.top = '0';
        nameSelectionContainer.style.left = '0';
        sceneContainer.appendChild(nameSelectionContainer);

        const promptText = document.createElement('div');
        promptText.textContent = 'name the fallen student.';
        promptText.style.fontSize = '28px';
        promptText.style.marginBottom = '15px';
        promptText.style.fontFamily = 'Determination, sans-serif';
        nameSelectionContainer.appendChild(promptText);

        const nameDisplay = document.createElement('div');
        nameDisplay.id = 'name-display';
        nameDisplay.textContent = playerName;
        nameDisplay.style.fontSize = '24px';
        nameDisplay.style.width = '400px';
        nameDisplay.style.height = '40px';
        nameDisplay.style.marginBottom = '20px';
        nameDisplay.style.textAlign = 'center';
        nameDisplay.style.padding = '5px';
        nameDisplay.style.fontFamily = 'Determination, sans-serif';
        nameDisplay.style.letterSpacing = '10px';
        nameDisplay.style.textShadow = '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 4px 0 #000';
        nameSelectionContainer.appendChild(nameDisplay);

        const keyboardContainer = document.createElement('div');
        keyboardContainer.id = 'keyboard-container';
        keyboardContainer.style.display = 'flex';
        keyboardContainer.style.flexDirection = 'column';
        keyboardContainer.style.alignItems = 'center';
        keyboardContainer.style.width = 'auto';
        keyboardContainer.style.paddingLeft = '0';
        nameSelectionContainer.appendChild(keyboardContainer);

        const keyboardLayout = [
            ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
            ['H', 'I', 'J', 'K', 'L', 'M', 'N'],
            ['O', 'P', 'Q', 'R', 'S', 'T', 'U'],
            ['V', 'W', 'X', 'Y', 'Z'],
            ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
            ['h', 'i', 'j', 'k', 'l', 'm', 'n'],
            ['o', 'p', 'q', 'r', 's', 't', 'u'],
            ['v', 'w', 'x', 'y', 'z'],
            ['Quit', 'Backspace', 'Done']
        ];

        let currentRowIndex = 0;
        let currentColumnIndex = 0;

        keyboardLayout.forEach((row, rowIndex) => {
            const rowElement = document.createElement('div');
            rowElement.className = 'keyboard-row';
            rowElement.style.paddingLeft = '0';
            row.forEach((key, colIndex) => {
                const keyElement = document.createElement('div');
                keyElement.textContent = key;
                keyElement.className = 'keyboard-key';
                keyElement.dataset.rowIndex = rowIndex;
                keyElement.dataset.colIndex = colIndex;
                keyElement.style.cursor = 'pointer';
                keyElement.style.fontFamily = 'Determination, sans-serif';
                keyElement.style.fontSize = '25px';
                keyElement.style.marginRight = '30px';
                if (key === 'Quit' || key === 'Backspace' || key === 'Done') {
                    keyElement.style.width = 'auto';
                    keyElement.style.padding = '0px 10px';
                    keyElement.style.marginRight = '30px';
                    keyElement.style.minWidth = 'initial';
                } else {
                    keyElement.style.width = '37px';
                    keyElement.style.height = '37px';
                    keyElement.style.minWidth = '37px';
                }
                rowElement.appendChild(keyElement);
            });
            keyboardContainer.appendChild(rowElement);
        });

        function updateSelection() {
            document.querySelectorAll('.keyboard-key').forEach(key => {
                key.classList.remove('selected');
            });

            const selectedKey = document.querySelector(`.keyboard-key[data-row-index="${currentRowIndex}"][data-col-index="${currentColumnIndex}"]`);
            if (selectedKey) {
                selectedKey.classList.add('selected');
            }
        }

        updateSelection();

        function handleKeyInput(e) {
            e.preventDefault();

            const currentRowLength = keyboardLayout[currentRowIndex].length;

            switch(e.key) {
                case 'ArrowUp':
                    currentRowIndex--;
                    if (currentRowIndex < 0) {
                        currentRowIndex = keyboardLayout.length - 1;
                    }
                    currentColumnIndex = Math.min(currentColumnIndex, keyboardLayout[currentRowIndex].length - 1);
                    break;
                case 'ArrowDown':
                    currentRowIndex++;
                    if (currentRowIndex >= keyboardLayout.length) {
                        currentRowIndex = 0;
                    }
                    currentColumnIndex = Math.min(currentColumnIndex, keyboardLayout[currentRowIndex].length - 1);
                    break;
                case 'ArrowLeft':
                    currentColumnIndex--;
                    if (currentColumnIndex < 0) {
                        currentColumnIndex = currentRowLength - 1;
                    }
                    break;
                case 'ArrowRight':
                    currentColumnIndex++;
                    if (currentColumnIndex >= currentRowLength) {
                        currentColumnIndex = 0;
                    }
                    break;
                case 'z':
                case 'Enter':
                    selectCurrentKey();
                    break;
                case 'x':
                    performBackspace();
                    break;
                case 'Backspace':
                    performBackspace();
                    break;
            }
            updateSelection();
        }

        function selectCurrentKey() {
            const selectedKeyValue = keyboardLayout[currentRowIndex][currentColumnIndex];

            if (selectedKeyValue.length === 1) {
                if (playerName.length < 6) {
                    playerName += selectedKeyValue;
                    nameDisplay.textContent = playerName;
                }
            } else if (selectedKeyValue === 'Backspace') {
                performBackspace();
            } else if (selectedKeyValue === 'Done') {
                if (playerName.length > 0) {
                    document.removeEventListener('keydown', handleKeyInput);
                    showNameConfirmation();
                } else {
                    console.log("Name cannot be empty.");
                }
            } else if (selectedKeyValue === 'Quit') {
                document.removeEventListener('keydown', handleKeyInput);
                showMainMenu();
            }
        }

        function performBackspace() {
            if (playerName.length > 0) {
                playerName = playerName.slice(0, -1);
                nameDisplay.textContent = playerName;
            }
        }

        document.addEventListener('keydown', handleKeyInput);
    }

    function showNameConfirmation() {
        sceneContainer.innerHTML = '';
        textContainer.innerHTML = '';

        const confirmationContainer = document.createElement('div');
        confirmationContainer.id = 'name-confirmation-container';
        confirmationContainer.style.display = 'flex';
        confirmationContainer.style.flexDirection = 'column';
        confirmationContainer.style.alignItems = 'center';
        confirmationContainer.style.justifyContent = 'center';
        confirmationContainer.style.height = '100%';
        confirmationContainer.style.width = '100%';
        confirmationContainer.style.position = 'absolute';
        confirmationContainer.style.top = '0';
        confirmationContainer.style.left = '0';
        sceneContainer.appendChild(confirmationContainer);

        const nameDisplay = document.createElement('div');
        nameDisplay.id = 'name-display-confirm';
        nameDisplay.textContent = playerName;
        nameDisplay.style.fontSize = '24px';
        nameDisplay.style.marginBottom = '40px';
        nameDisplay.style.fontFamily = 'Determination, sans-serif';
        nameDisplay.style.letterSpacing = '10px';
        nameDisplay.style.textShadow = '2px 2px 0 #000';
        nameDisplay.style.transition = 'font-size 1.5s ease-in-out, opacity 1.5s ease-in-out, transform 1.5s ease-in-out, text-shadow 1.5s ease-in-out';
        nameDisplay.style.opacity = 1;
        nameDisplay.style.transform = 'scale(1)';
        confirmationContainer.appendChild(nameDisplay);

        const questionText = document.createElement('div');
        questionText.textContent = 'is this name correct?';
        questionText.style.fontSize = '28px';
        questionText.style.marginBottom = '20px';
        questionText.style.fontFamily = 'Determination, sans-serif';
        questionText.style.opacity = 0;
        questionText.style.transition = 'opacity 0.5s ease-in-out';
        confirmationContainer.appendChild(questionText);

        const optionsContainer = document.createElement('div');
        optionsContainer.style.display = 'flex';
        optionsContainer.style.gap = '40px';
        optionsContainer.style.opacity = 0;
        optionsContainer.style.transition = 'opacity 0.5s ease-in-out';
        confirmationContainer.appendChild(optionsContainer);

        const yesOption = document.createElement('div');
        yesOption.textContent = 'yes.';
        yesOption.className = 'confirm-option';
        yesOption.dataset.value = 'yes';
        yesOption.style.fontSize = '24px';
        yesOption.style.cursor = 'pointer';
        yesOption.style.fontFamily = 'Determination, sans-serif';
        yesOption.style.textShadow = '2px 2px 0 #000';
        optionsContainer.appendChild(yesOption);

        const noOption = document.createElement('div');
        noOption.textContent = 'no.';
        noOption.className = 'confirm-option';
        noOption.dataset.value = 'no';
        noOption.style.fontSize = '24px';
        noOption.style.cursor = 'pointer';
        noOption.style.fontFamily = 'Determination, sans-serif';
        noOption.style.textShadow = '2px 2px 0 #000';
        optionsContainer.appendChild(noOption);

        confirmOptions = [yesOption, noOption];

        setTimeout(() => {
            nameDisplay.style.fontSize = '48px';
            nameDisplay.style.opacity = 0;
            nameDisplay.style.transform = 'scale(1.5)';

            setTimeout(() => {
                nameDisplay.style.transition = 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out, font-size 0.5s ease-in-out, text-shadow 0.5s ease-in-out';
                nameDisplay.style.fontSize = '24px';
                nameDisplay.style.opacity = 1;
                nameDisplay.style.transform = 'scale(1)';

                setTimeout(() => {
                    questionText.style.opacity = 1;
                    optionsContainer.style.opacity = 1;
                    updateConfirmSelection();
                    document.addEventListener('keydown', handleConfirmationKeyInput);
                }, 1000);
            }, 1500);
        }, 100);
    }

    function startGame() {
        sceneContainer.innerHTML = '';
        textContainer.innerHTML = '';

        if (menuMusic && !menuMusic.paused) {
            menuMusic.pause();
        }

        const gameArea = document.createElement('div');
        gameArea.id = 'game-area';
        gameArea.style.width = '100%';
        gameArea.style.height = '100%';
        gameArea.style.backgroundColor = 'black';
        gameArea.style.position = 'relative';
        gameArea.style.overflow = 'hidden';
        sceneContainer.appendChild(gameArea);

        const dialogueBox = document.createElement('div');
        dialogueBox.id = 'dialogue-box';
        dialogueBox.style.position = 'absolute';
        dialogueBox.style.bottom = '10px';
        dialogueBox.style.left = '50%';
        dialogueBox.style.transform = 'translateX(-50%)';
        dialogueBox.style.width = '95%';
        dialogueBox.style.zIndex = '100';
        dialogueBox.style.display = 'flex';
        dialogueBox.style.alignItems = 'center';
        dialogueBox.style.justifyContent = 'center';
        gameArea.appendChild(dialogueBox);

        const temmieDialog = document.createElement('img');
        temmieDialog.src = 'undertale_text_box.gif';
        temmieDialog.style.width = '100%';
        temmieDialog.style.imageRendering = 'pixelated';
        dialogueBox.appendChild(temmieDialog);

        let dialogueComplete = false;
        
        function handleDialogueInput(e) {
            if (dialogueComplete && (e.key === 'z' || e.key === 'Enter')) {
                dialogueBox.style.display = 'none';
                document.removeEventListener('keydown', handleDialogueInput);
                startPlayerControls();
            }
        }

        setTimeout(() => {
            // Change to static image when animation ends
            temmieDialog.src = 'undertale_text_box (1).png';
            dialogueComplete = true;
        }, 3000);

        document.addEventListener('keydown', handleDialogueInput);

        const player = document.createElement('div');
        player.id = 'player';
        player.style.width = '60px';
        player.style.height = '60px';
        player.style.position = 'absolute';
        player.style.left = '50%';
        player.style.top = '50%';
        player.style.transform = 'translate(-50%, -50%)';
        player.style.backgroundImage = `url('idleDown.png')`;
        player.style.backgroundSize = 'contain';
        player.style.backgroundRepeat = 'no-repeat';
        player.style.imageRendering = 'pixelated';
        player.style.zIndex = '10';
        gameArea.appendChild(player);

        const playerState = {
            x: gameArea.clientWidth / 2,
            y: gameArea.clientHeight / 2,
            speed: 1.5, // 25% slower
            direction: 'down',
            isMoving: false,
            animationFrame: 0,
            animationSpeed: 10,
            frameCount: 0
        };

        const keys = {
            up: false,
            down: false,
            left: false,
            right: false
        };

        function startPlayerControls() {
            document.addEventListener('keydown', handleKeyDown);
            document.addEventListener('keyup', handleKeyUp);
            requestAnimationFrame(updatePlayer);
        }

        function handleKeyDown(e) {
            switch(e.key) {
                case 'w':
                case 'ArrowUp':
                    keys.up = true;
                    break;
                case 's':
                case 'ArrowDown':
                    keys.down = true;
                    break;
                case 'a':
                case 'ArrowLeft':
                    keys.left = true;
                    break;
                case 'd':
                case 'ArrowRight':
                    keys.right = true;
                    break;
            }
        }

        function handleKeyUp(e) {
            switch(e.key) {
                case 'w':
                case 'ArrowUp':
                    keys.up = false;
                    break;
                case 's':
                case 'ArrowDown':
                    keys.down = false;
                    break;
                case 'a':
                case 'ArrowLeft':
                    keys.left = false;
                    break;
                case 'd':
                case 'ArrowRight':
                    keys.right = false;
                    break;
            }
        }

        function updatePlayer() {
            let isMoving = false;
            let newDirection = playerState.direction;
            let movedThisFrame = false;

            if (keys.up || keys.down || keys.left || keys.right) {
                 isMoving = true;
                 if (keys.up) newDirection = 'up';
                 if (keys.down) newDirection = 'down';
                 if (keys.left) newDirection = 'left';
                 if (keys.right) newDirection = 'right';
            }

            if (keys.up) {
                playerState.y -= playerState.speed;
                newDirection = 'up';
                movedThisFrame = true;
            }
            if (keys.down) {
                playerState.y += playerState.speed;
                newDirection = 'down';
                 movedThisFrame = true;
            }
            if (keys.left) {
                playerState.x -= playerState.speed;
                newDirection = 'left';
                 movedThisFrame = true;
            }
            if (keys.right) {
                playerState.x += playerState.speed;
                newDirection = 'right';
                 movedThisFrame = true;
            }

            playerState.direction = newDirection;
            playerState.isMoving = movedThisFrame;

            const gameAreaRect = gameArea.getBoundingClientRect();
            const playerWidth = player.clientWidth;
            const playerHeight = player.clientHeight;

            playerState.x = Math.max(playerWidth / 2, Math.min(gameAreaRect.width - playerWidth / 2, playerState.x));
            playerState.y = Math.max(playerHeight / 2, Math.min(gameAreaRect.height - playerHeight / 2, playerState.y));

            player.style.left = `${playerState.x}px`;
            player.style.top = `${playerState.y}px`;


            if (playerState.isMoving) {
                playerState.frameCount++;
                if (playerState.frameCount >= playerState.animationSpeed) {
                    playerState.frameCount = 0;
                    playerState.animationFrame = (playerState.animationFrame + 1) % 4; 
                }
            } else {
                playerState.animationFrame = 0;
                playerState.frameCount = 0;
            }

            updateSprite();

            requestAnimationFrame(updatePlayer);
        }

        function updateSprite() {
            let sprite = '';
            let scaleX = 1; 

            if (playerState.isMoving) {
                switch (playerState.direction) {
                    case 'up':
                        if (playerState.animationFrame === 0) sprite = 'walkingup1.png';
                        else if (playerState.animationFrame === 1) sprite = 'idleup.png';
                        else if (playerState.animationFrame === 2) sprite = 'walkingup2.png';
                        else sprite = 'idleup.png'; 
                        break;
                    case 'down':
                        if (playerState.animationFrame === 0) sprite = 'idleDown.png';
                        else if (playerState.animationFrame === 1) sprite = 'walkingdown1.png';
                        else if (playerState.animationFrame === 2) sprite = 'idleDown.png';
                        else sprite = 'walkingdown2.png'; 
                        break;
                    case 'left':
                        if (playerState.animationFrame === 0) sprite = 'walkingSide1.png';
                        else if (playerState.animationFrame === 1) sprite = 'idleSide.png';
                        else if (playerState.animationFrame === 2) sprite = 'walkingSide1.png';
                        else sprite = 'idleSide.png'; 
                        scaleX = 1;
                        break;
                    case 'right':
                        if (playerState.animationFrame === 0) sprite = 'walkingSide1.png';
                        else if (playerState.animationFrame === 1) sprite = 'idleSide.png';
                        else if (playerState.animationFrame === 2) sprite = 'walkingSide1.png';
                        else sprite = 'idleSide.png'; 
                        scaleX = -1; 
                        break;
                }
            } else {
                switch (playerState.direction) {
                    case 'up':
                        sprite = 'idleup.png';
                        break;
                    case 'down':
                        sprite = 'idleDown.png';
                        break;
                    case 'left':
                        sprite = 'idleSide.png';
                        scaleX = 1;
                        break;
                    case 'right':
                        sprite = 'idleSide.png'; 
                        scaleX = -1; 
                        break;
                }
            }

            player.style.backgroundImage = `url('${sprite}')`;
            player.style.transform = `translate(-50%, -50%) scaleX(${scaleX})`; 


        }

        const observer = new ResizeObserver(entries => {
            for (let entry of entries) {
                const gameAreaWidth = entry.contentRect.width;
                const gameAreaHeight = entry.contentRect.height;
                const playerWidth = player.clientWidth;
                const playerHeight = player.clientHeight;

                playerState.x = gameAreaWidth / 2;
                playerState.y = gameAreaHeight / 2;

                player.style.left = `${playerState.x}px`;
                player.style.top = `${playerState.y}px`;

                requestAnimationFrame(updatePlayer);

                observer.disconnect();
            }
        });

        observer.observe(gameArea); 


        document.removeEventListener('keydown', handleConfirmationKeyInput);
        document.removeEventListener('keydown', handleKeyInput);
        document.removeEventListener('keydown', handleMenuKeyInput);
        document.removeEventListener('keydown', handleCreditsKeyInput);
        document.removeEventListener('keydown', handleIntroSkip);

    }

    function showCredits() {
        sceneContainer.innerHTML = '';
        textContainer.innerHTML = '';

        const bgImage = document.createElement('img');
        bgImage.src = 'costume3.png';
        bgImage.style.position = 'absolute';
        bgImage.style.width = '100%';
        bgImage.style.height = '100%';
        bgImage.style.objectFit = 'cover';
        bgImage.style.opacity = 0.5;
        sceneContainer.appendChild(bgImage);

        const creditsContainer = document.createElement('div');
        creditsContainer.id = 'credits-container';
        creditsContainer.style.display = 'flex';
        creditsContainer.style.flexDirection = 'column';
        creditsContainer.style.alignItems = 'center';
        creditsContainer.style.justifyContent = 'center';
        creditsContainer.style.height = '100%';
        creditsContainer.style.width = '100%';
        creditsContainer.style.position = 'absolute';
        creditsContainer.style.top = '0';
        creditsContainer.style.left = '0';
        sceneContainer.appendChild(creditsContainer);

        const creditsTitle = document.createElement('div');
        creditsTitle.textContent = '--- credits ---';
        creditsTitle.style.color = '#808080';
        creditsTitle.style.fontSize = '24px';
        creditsTitle.style.marginBottom = '30px';
        creditsTitle.style.fontFamily = 'Determination, sans-serif';
        creditsContainer.appendChild(creditsTitle);

        const creditsText = document.createElement('div');
        creditsText.style.color = '#808080';
        creditsText.style.fontSize = '18px';
        creditsText.style.textAlign = 'center';
        creditsText.style.fontFamily = 'Determination, sans-serif';
        creditsText.style.lineHeight = '1.5';
        creditsText.innerHTML = 'based on undertale by idk<br>' +
                               'music by idk<br>' +
                               'game recreation by fouadd<br>' + 
                               '<br>' +
                               '[press x or backspace to return]';
        creditsContainer.appendChild(creditsText);

        function handleCreditsKeyInput(e) {
            switch(e.key) {
                case 'x':
                case 'Backspace':
                    document.removeEventListener('keydown', handleCreditsKeyInput);
                    showMainMenu();
                    break;
            }
        }

        document.addEventListener('keydown', handleCreditsKeyInput);
    }

    setTimeout(() => {
        playMusic();
        displayScene(0);
    }, 2000);
});