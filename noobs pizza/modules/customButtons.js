// Custom button creation implementation
import { showReaction } from './reactions.js';
import { adjustRelationship } from './relationshipMeter.js';

export function setupCustomButtons() {
    const createCustomButton = document.getElementById('create-custom-button');
    const customButtonText = document.getElementById('custom-button-text');
    const buttonContainer = document.querySelector('.button-container'); // Find the main button container

    if (!createCustomButton || !customButtonText || !buttonContainer) {
        console.error("Could not find necessary elements for custom buttons.");
        return;
    }

    createCustomButton.addEventListener('click', handleCustomButtonCreation);

    // Also allow creating a button by pressing Enter in the input field
    customButtonText.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleCustomButtonCreation();
        }
    });
}

function handleCustomButtonCreation() {
    const customButtonText = document.getElementById('custom-button-text');
    const buttonContainer = document.querySelector('.button-container'); // Find the main button container

    if (!customButtonText || !buttonContainer) {
        console.error("Could not find necessary elements for custom buttons during creation.");
        return;
    }

    const buttonText = customButtonText.value.trim();

    if (buttonText === "") {
        alert("Please enter text for the custom button!");
        return;
    }

    // Create the new button element
    const newButton = document.createElement('button');
    newButton.textContent = buttonText;
    newButton.classList.add('custom-created-button'); // Use a distinct class

    // Append the new button to the main button container or a dedicated custom button section
    // Appending to the main container keeps them with other buttons
    // Let's append to the 'kind-section' for now, or create a new section?
    // Appending to the main button-container is simpler and allows autoclicker to find it easily.
    buttonContainer.appendChild(newButton); // Appends to the end of the main container

    // Add event listener to the new button
    newButton.addEventListener('click', () => {
        // Define reaction based on button text (simple keyword matching)
        const lowerText = buttonText.toLowerCase();
        let reactionMsg = `You offered ${buttonText}... `;
        let sound = 'groan'; // Default sound
        let bgColor = 'rgba(108, 117, 125, 0.8)'; // Default grey background
        let doShake = false; // Default no shake
        let duration = 1500; // Default duration
        let relationshipChange = 0; // Default neutral relationship change

        // Check for kind keywords
        const kindKeywords = ['pizza', 'pepperoni', 'cheese', 'candy', 'cookie', 'fries', 'ice cream', 'pretzel', 'taco', 'shiny', 'blanket', 'lullaby', 'joke', 'compliment', 'ears', 'backrub', 'secret', 'pillow', 'fort', 'fetch', 'massage', 'chocolate', 'story', 'headphones', 'figurine', 'meditation', 'brush', 'game', 'snuggle', 'pet', 'hug', 'kiss', 'love', 'nice', 'kind', 'happy'];
        if (kindKeywords.some(keyword => lowerText.includes(keyword)) && !lowerText.includes('bad') && !lowerText.includes('evil') && !lowerText.includes('gross') && !lowerText.includes('worm') && !lowerText.includes('mud') && !lowerText.includes('kill') && !lowerText.includes('hurt') && !lowerText.includes('gag') && !lowerText.includes('gross') && !lowerText.includes('disgusting') && !lowerText.includes('nsfw')) {
            reactionMsg += "Yum! I like that!";
            sound = 'happy';
            bgColor = 'rgba(0, 128, 0, 0.8)'; // Green
            doShake = false;
            relationshipChange = Math.floor(Math.random() * 10) + 5; // +5 to +14
        }
        // Check for evil keywords
        else if (lowerText.includes('strangle') || lowerText.includes('drown') || lowerText.includes('kill') || lowerText.includes('worm') || lowerText.includes('mealworms') || lowerText.includes('elixir') || lowerText.includes('blood') || lowerText.includes('ooze') || lowerText.includes('expired') || lowerText.includes('boop') || lowerText.includes('mud') || lowerText.includes('rock') || lowerText.includes('nsfw') || lowerText.includes('steal') || lowerText.includes('poison') || lowerText.includes('bad joke') || lowerText.includes('hide remote') || lowerText.includes('mush') || lowerText.includes('fart') || lowerText.includes('poke eye') || lowerText.includes('pull tail') || lowerText.includes('spicy') || lowerText.includes('off-key') || lowerText.includes('salt') || lowerText.includes('fake pizza') || lowerText.includes('spray water') || lowerText.includes('nuke') || lowerText.includes('void') || lowerText.includes('delete') || lowerText.includes('curse') || lowerText.includes('betray') || lowerText.includes('destroy') || lowerText.includes('lock in room') || lowerText.includes('erase memories') || lowerText.includes('turn into broccoli') || lowerText.includes('bieber') || lowerText.includes('mars') || lowerText.includes('clone') || lowerText.includes('squeaks') || lowerText.includes('terrible game') || lowerText.includes('slap') || lowerText.includes('hit') || lowerText.includes('hurt') || lowerText.includes('die') || lowerText.includes('evil') || lowerText.includes('gross') || lowerText.includes('disgusting') || lowerText.includes('poop') || lowerText.includes('pee')) {
            reactionMsg += "Hey! Don't do that! *or worse*";
            sound = 'no';
            bgColor = 'rgba(255, 0, 0, 0.8)'; // Red
            doShake = true;
            duration = 2000; // Longer firm "no" reaction
            relationshipChange = -(Math.floor(Math.random() * 15) + 5); // -5 to -19
            // Implement lethal actions for custom buttons? Maybe add a checkbox?
            // For now, custom evil buttons are just relationship penalties, not lethal.
        }
        // Check for neutral keywords
        else if (lowerText.includes('pineapple') || lowerText.includes('broccoli') || lowerText.includes('salad') || lowerText.includes('water') || lowerText.includes('empty box') || lowerText.includes('sandwich') || lowerText.includes('carrot') || lowerText.includes('sfw fanart') || lowerText.includes('boring') || lowerText.includes('plain') || lowerText.includes('rubber chicken') || lowerText.includes('weather') || lowerText.includes('plain rock') || lowerText.includes('sock') || lowerText.includes('spreadsheet') || lowerText.includes('cracker') || lowerText.includes('tap water') || lowerText.includes('stick') || lowerText.includes('blank wall') || lowerText.includes('dust bunny') || lowerText.includes('calculator') || lowerText.includes('paper') || lowerText.includes('encyclopedia') || lowerText.includes('bent spoon') || lowerText.includes('sushi')) {
            reactionMsg += "Uh... thanks, I guess.";
            sound = 'groan';
            bgColor = 'rgba(192, 192, 192, 0.8)'; // Silver/Gray
            doShake = false;
            relationshipChange = Math.floor(Math.random() * 3) - 1; // -1 to +1
        }
        // Check for image upload keywords (handled by the upload button itself, but good to have a rule)
        else if (lowerText.includes('image') || lowerText.includes('picture') || lowerText.includes('upload')) {
            reactionMsg += "Hmm, a picture...";
            sound = 'groan'; // Slightly unsure sound
            bgColor = 'rgba(72, 61, 139, 0.8)'; // Dark Slate Blue
            doShake = false;
            relationshipChange = 0;
        }
        else {
            // Fallback reaction for anything else
            reactionMsg += "Interesting...";
            sound = 'groan'; // Default unsure sound
            bgColor = 'rgba(108, 117, 125, 0.8)'; // Default grey
            doShake = false;
            relationshipChange = 0;
        }

        adjustRelationship(relationshipChange);
        showReaction(reactionMsg, sound, bgColor, doShake, duration);
    });

    // Clear the input field after creating the button
    customButtonText.value = '';
}