// Pizza interaction implementation
import { showReaction } from './reactions.js';
import { playSound } from './audio.js';

export function setupPizzaInteraction() {
    const creaturePizzaImg = document.getElementById('creature-pizza');
    // Store the initial source, which is now the Roblox Noob image
    creaturePizzaImg.dataset.originalSrc = creaturePizzaImg.src;

    // Add event listener to the parent element of the image, which is the pizza-area div
    const pizzaArea = creaturePizzaImg.parentElement;
    if (pizzaArea) {
        pizzaArea.addEventListener('click', handlePizzaClick);
    } else {
        console.error("Could not find the parent element for creature-pizza.");
    }
}

function handlePizzaClick() {
    const creaturePizzaImg = document.getElementById('creature-pizza');
    const punchOverlay = document.querySelector('.punch-overlay');
    const reactionText = document.getElementById('reaction-text');

    if (!creaturePizzaImg || !punchOverlay || !reactionText) {
        console.error("Could not find necessary elements for pizza interaction.");
        return;
    }

    // Use the stored original source from the dataset
    const originalPizzaSrc = creaturePizzaImg.dataset.originalSrc;
    const currentSrc = creaturePizzaImg.src;
    // Check if the current image source is one of the original character images
    const isOriginalCharacter = currentSrc.includes('/roblox_noob_pizza.png') || currentSrc.includes('/maxresdefault.jpg'); 

    if (isOriginalCharacter) { // Only react violently if it's the character holding the pizza
        creaturePizzaImg.classList.add('beatup');
        reactionText.classList.add('angry');
        
        const flashCount = 6;
        let flashInterval = setInterval(() => {
            punchOverlay.classList.toggle('active');
        }, 100);

        setTimeout(() => {
            clearInterval(flashInterval);
            punchOverlay.classList.remove('active');
        }, flashCount * 100);

        const punchCount = 3;
        // Ensure sound is played after a slight delay to match animation
        for(let i = 0; i < punchCount; i++) {
            setTimeout(() => playSound('punch'), i * 200); // Use the 'punch' sound key
        }

        // Use the 'no' sound key for the reaction text sound
        showReaction("DON'T TOUCH MY PIZZA! *PUNCH* *KICK* *POW*", 'no', 'rgba(139, 0, 0, 0.9)', true, 2000);

        setTimeout(() => {
            creaturePizzaImg.classList.remove('beatup');
            reactionText.classList.remove('angry');
        }, 2000);
    } else {
        // Interaction when the image is not the original character (e.g., uploaded image)
        // Use the 'groan' sound key for this reaction
        showReaction("That's not my pizza!", 'groan', 'rgba(128, 0, 128, 0.8)', false, 1500);
    }
}