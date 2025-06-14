// Button event handlers implementation
import { showReaction, triggerGameOver } from './reactions.js';
import { adjustRelationship, getRelationshipValue } from './relationshipMeter.js';
// Import the globally available playSound from audio module
import { playSound } from './audio.js'; // Import the playSound function

// This function remains here as the core logic for handling button clicks
export function handleButtonClick(config, event) {
    // Check if the game is over and this isn't a revival button
    if (document.querySelector('.container').classList.contains('game-over')) {
        // If it's a revival button, it's handled in revivalSystem.js
        // Otherwise, do nothing or show a message
        // Let's add a message for non-revival buttons clicked when dead
        // Simple check if parent is revival section
        const buttonElement = event ? event.target : null;
        if (buttonElement && !buttonElement.closest('.revival-section')) {
            showReaction("I can't do that right now... I'm kinda... dead.", null, 'rgba(100, 100, 100, 0.8)', false, 1500);
            return; // Prevent action if game is over and not a revival button
        }
         // If it is a revival button, let revivalSystem handle it
         if (config.isRevival) {
             // Logic moved to revivalSystem.js
             return;
         }
    }

    const relationshipValue = getRelationshipValue();
    let finalRelationshipChange = config.relationshipChange || 0;
    let finalSound = config.sound;
    let finalShake = config.shake;
    let finalColor = config.color;
    let finalDuration = config.duration || 1500; // Default duration

    // Play sound first if defined
    if (finalSound) {
        try {
             // Use the imported playSound function
             playSound(finalSound);
        } catch (e) {
            console.error(`Error playing sound "${finalSound}":`, e);
            // Fallback or silent failure for sound errors
        }
    }

    // Adjust relationship only if not lethal
    if (!config.lethal) {
        adjustRelationship(finalRelationshipChange);
    }

    // Show reaction
    showReaction(config.text, finalSound, finalColor, finalShake, finalDuration);

    // Trigger game over if lethal
    if (config.lethal) {
        // Dispatch event with death type
        const diedEvent = new CustomEvent('characterDied', { detail: { type: config.deathType } });
        document.dispatchEvent(diedEvent);
        triggerGameOver();
    }

    // Call callback if defined
    if (config.callback) {
        config.callback();
    }
}

// Helper functions used by some button callbacks (e.g., Eat Everything)
// These should probably live in their own module if used elsewhere, but are kept here for now as they seem tied to specific button behaviors.
function getRandomItems() {
    const items = [
        "acid", "lava", "rocks", "nuclear waste", "poison", "glass", "metal scraps",
        "thorny plants", "raw toxic fish", "spoiled milk", "ghost peppers",
        "literal garbage", "burning coal", "rusty nails", "cosmic debris",
        "dark matter", "antimatter", "radioactive waste", "moldy bread",
        "live wasps", "electric cables"
    ];
    const selectedItems = [];
    for (let i = 0; i < 3; i++) {
        const randomIndex = Math.floor(Math.random() * items.length);
        selectedItems.push(items[randomIndex]);
    }
    return selectedItems;
}

function getRandomHappyReaction() {
    const reactions = [
        "Mmm, delicious!",
        "Tasty!",
        "That's some good stuff!",
        "Yummy in my tummy!",
        "More please!",
        "This is great!",
        "I love this!",
        "*happy munching noises*",
        "Absolutely scrumptious!",
        "Can't get enough of this!"
    ];
    return reactions[Math.floor(Math.random() * reactions.length)];
}