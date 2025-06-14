import { setupSoundSystem } from './modules/audio.js';
import { setupKindButtons } from './modules/kindButtonEvents.js';
import { setupNeutralButtons } from './modules/neutralButtonEvents.js';
import { setupEvilButtons } from './modules/evilButtonEvents.js';
import { setupVeryEvilButtons } from './modules/veryEvilButtonEvents.js';
import { setupImageUpload } from './modules/imageUpload.js';
import { setupCustomButtons } from './modules/customButtons.js';
import { setupAutoclicker } from './modules/autoclicker.js';
import { setupPizzaInteraction } from './modules/pizzaInteraction.js';
import { setupRelationshipMeter } from './modules/relationshipMeter.js';
import { setupRevivalSystem } from './modules/revivalSystem.js';
import { setupAIInteraction } from './modules/aiInteraction.js';

document.addEventListener('DOMContentLoaded', () => {
    setupSoundSystem();
    setupKindButtons();
    setupNeutralButtons();
    setupEvilButtons();
    setupVeryEvilButtons();
    setupImageUpload();
    setupCustomButtons();
    setupAutoclicker();
    setupPizzaInteraction();
    setupRelationshipMeter();
    setupRevivalSystem();
    setupAIInteraction();
});