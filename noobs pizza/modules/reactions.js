// Reaction system implementation
import { playSound } from './audio.js';

export function showReaction(text, soundName, backgroundColor = 'rgba(255, 0, 0, 0.8)', doShake = true, duration = 1500) {
    const creaturePizzaImg = document.getElementById('creature-pizza');
    const reactionText = document.getElementById('reaction-text');

    if (!creaturePizzaImg || !reactionText) {
        console.error("Could not find creature-pizza or reaction-text elements.");
        return;
    }

    if (soundName) {
        playSound(soundName);
    }

    reactionText.textContent = text;
    reactionText.style.display = 'block';
    reactionText.style.backgroundColor = backgroundColor;

    if (doShake) {
        creaturePizzaImg.classList.add('shake');
    }

    if (duration > 0) {
        // Keep track of the timeout ID if needed to clear it, but for now, simple timeout is fine
        setTimeout(() => {
            reactionText.style.display = 'none';
            creaturePizzaImg.classList.remove('shake');
            // Note: Resetting the image source should probably happen elsewhere
            // if it was changed by image upload or death.
            // The logic below seems specific to pizza click reaction timeout,
            // let's remove the image reset here to avoid conflicts.
            // If an uploaded image or death state needs resetting, the revival system should handle it.
            // The dataset originalSrc should be managed by upload/revival.
        }, duration);
    }
}

export function triggerGameOver() {
    const allButtons = document.querySelectorAll('.button-container button, .custom-button-container button, .upload-button');
    allButtons.forEach(button => button.disabled = true);
    
    const container = document.querySelector('.container');
    if (container) {
        container.classList.add('game-over');
    } else {
        console.error("Could not find container element.");
    }

    const customButtonText = document.getElementById('custom-button-text');
    const createCustomButton = document.getElementById('create-custom-button');
    if (customButtonText) customButtonText.disabled = true;
    if (createCustomButton) createCustomButton.disabled = true;
    
    // Trigger characterDied event
    const diedEvent = new CustomEvent('characterDied');
    document.dispatchEvent(diedEvent);
    
    // Trigger gameOver event for autoclicker
    const gameOverEvent = new CustomEvent('gameOver');
    document.dispatchEvent(gameOverEvent);

    // Add 'dead' class to the image
    const creaturePizzaImg = document.getElementById('creature-pizza');
    if (creaturePizzaImg) {
        creaturePizzaImg.classList.add('dead');
        // Also explicitly set display/opacity if the animation class doesn't cover all cases
        // creaturePizzaImg.style.opacity = 0; // Animation should handle this
    }

    // Show a final death reaction text if one isn't already showing
    const reactionText = document.getElementById('reaction-text');
    if (reactionText && reactionText.style.display === 'none') {
        // This is a fallback, the death type handling in buttonEvents might show a message first
        // Let's ensure the game-over reaction style is applied
        reactionText.classList.add('game-over');
        // The death event listener might set the actual text and background color
    }
}