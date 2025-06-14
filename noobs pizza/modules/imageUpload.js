// Image upload implementation
import { showReaction } from './reactions.js';

export function setupImageUpload() {
    const uploadImageInput = document.getElementById('image-upload-input');
    const uploadImageButton = document.getElementById('upload-image-button');
    const creaturePizzaImg = document.getElementById('creature-pizza');

    if (!uploadImageInput || !uploadImageButton || !creaturePizzaImg) {
        console.error("Could not find necessary elements for image upload.");
        return;
    }

    // Store the initial original source only once during setup
    // This will now store the '/roblox_noob_pizza.png' source
    if (!creaturePizzaImg.dataset.originalSrc) {
        creaturePizzaImg.dataset.originalSrc = creaturePizzaImg.src;
    }

    uploadImageButton.addEventListener('click', () => {
        uploadImageInput.click();
    });

    uploadImageInput.addEventListener('change', (event) => {
        const files = event.target.files;

        if (files && files.length > 0) {
            // Process the first file selected (for simplicity, could extend to show multiple)
            const file = files[0];

            if (file.type.startsWith('image/')) {
                const reader = new FileReader();

                reader.onload = (e) => {
                    // Change the image source to the uploaded image
                    creaturePizzaImg.src = e.target.result;

                    // Show a reaction
                    showReaction("Hmm, a new picture!", 'groan', 'rgba(72, 61, 139, 0.8)', false, 2000); // Dark Slate Blue, slightly curious/confused, groan, no shake
                };

                reader.onerror = (e) => {
                    console.error("FileReader error:", e);
                    showReaction("Couldn't load that image!", 'no', 'rgba(255, 99, 71, 0.8)', true, 1500); // Tomato, error reaction, no sound, shake
                };

                // Read the image file as a data URL
                reader.readAsDataURL(file);
            } else {
                // Not an image file
                showReaction("That's not an image!", 'no', 'rgba(255, 99, 71, 0.8)', true, 1500); // Tomato, error reaction, no sound, shake
            }

            // Clear the input value so the change event fires even if the same file is selected again
            event.target.value = '';
        }
    });
}