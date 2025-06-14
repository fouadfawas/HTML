// Revival system implementation
import { showReaction, triggerGameOver } from './reactions.js';
import { adjustRelationship, getRelationshipValue, resetRelationship } from './relationshipMeter.js';
import { playSound } from './audio.js';

export function setupRevivalSystem() {
    const revivalButtonConfigs = {
        'revive-button': { text: "You feel life return!", sound: 'happy', color: 'rgba(144, 238, 144, 0.8)', isRevival: true }, // Light Green
        'phoenix-down-button': { text: "A feather descends... *poof* You're back!", sound: 'happy', color: 'rgba(255, 165, 0, 0.8)', isRevival: true }, // Orange
        'healing-potion-button': { text: "*Glug glug* Ah, much better!", sound: 'happy', color: 'rgba(173, 216, 230, 0.8)', isRevival: true }, // Light Blue
        '1up-mushroom-button': { text: "*Boing* I feel bouncy!", sound: 'happy', color: 'rgba(0, 128, 0, 0.8)', isRevival: true }, // Green
        'divine-intervention-button': { text: "A beam of light... Holy moly!", sound: 'happy', color: 'rgba(255, 255, 0, 0.8)', isRevival: true }, // Yellow
        'cpr-button': { text: "Cough cough! Thanks! You saved me!", sound: 'happy', color: 'rgba(220, 20, 60, 0.8)', isRevival: true } // Crimson
    };

    Object.entries(revivalButtonConfigs).forEach(([id, config]) => {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('click', () => {
                // Check if the character is dead
                const container = document.querySelector('.container');
                if (container && container.classList.contains('game-over')) {
                    reviveCharacter(config);
                } else {
                    // Optional: React if trying to revive when not dead
                    // Use 'groan' sound key
                    showReaction("But I'm not dead!", 'groan', 'rgba(100, 100, 100, 0.8)', false, 1500);
                }
            });
        }
    });

    // Listen for the character died event
    document.addEventListener('characterDied', handleCharacterDied);
}

function handleCharacterDied() {
    // Logic to handle character death state specific to revival?
    // Currently, triggerGameOver handles most of this (disabling buttons, adding game-over class)
    // Maybe ensure revival buttons remain enabled? The current CSS/JS doesn't disable this section.
    // No specific action needed here for now, just confirming the listener exists.
}

function reviveCharacter(config) {
    const container = document.querySelector('.container');
    const creaturePizzaImg = document.getElementById('creature-pizza');
    const reactionText = document.getElementById('reaction-text');
    const originalPizzaSrc = creaturePizzaImg.dataset.originalSrc; // Get original source

    if (!container || !creaturePizzaImg || !reactionText || !originalPizzaSrc) {
         console.error("Revival elements not found.");
         return;
     }

    // Reset game state
    resetRelationship();
    container.classList.remove('game-over');

    // Re-enable buttons and inputs - iterate through disabled elements
    document.querySelectorAll('.button-container button:disabled, .custom-button-container button:disabled, .upload-button:disabled, .ai-interaction-container input:disabled, .ai-interaction-container button:disabled, .custom-button-container input:disabled, .custom-button-container button:disabled, .autoclicker-container input:disabled, .autoclicker-container button:disabled').forEach(element => {
        element.disabled = false;
    });


    // Reset image
    creaturePizzaImg.src = originalPizzaSrc; // Restore original pizza image
    creaturePizzaImg.classList.remove('dead');
    // Ensure any lingering animation classes are removed
    creaturePizzaImg.classList.remove('exploding', 'drowning', 'strangling', 'shake', 'beatup');


    // Hide reaction text and remove game-over class if it was applied to it
    reactionText.style.display = 'none';
    reactionText.classList.remove('game-over');


    // Show revival reaction - Use the 'happy' sound key as defined in revivalButtonConfigs
    showReaction(config.text, config.sound, config.color, false, 2000); // No shake for revival


    // Dispatch revival event for other modules
    const revivedEvent = new CustomEvent('characterRevived');
    document.dispatchEvent(revivedEvent);

    // Ensure jumpscare state is reset if necessary (though current jumpscare is tied to death state/low relationship)
    // The jumpscare overlay is handled by showReaction. If character is revived, no death reaction is active.
    // We might need to explicitly remove a persistent jumpscare overlay class if one exists after death.
    // Checking styles/general.css, there's a '.punch-overlay.jumpscare-active'. Let's remove that on revival.
    const punchOverlay = document.querySelector('.punch-overlay');
    if (punchOverlay) {
        punchOverlay.classList.remove('jumpscare-active');
         // Also remove the basic active class just in case
         punchOverlay.classList.remove('active');
    }
}