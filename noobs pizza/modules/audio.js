// Sound system implementation
let audioContext;
const audioBuffers = {};

// Map logical sound names to file paths
const soundMap = {
    // Core Roblox sounds sounds used by the game logic
    'no': 'oof.mp3',
    'gag': 'roblox-explosion-sound.mp3',
    'happy': 'roblox_happy.mp3',
    'groan': 'roblox-drink.mp3',
    'punch': 'roblox_punch.mp3',
    'explode': 'roblox-explosion-sound.mp3',

    // Other Roblox sounds and uploaded sound
    'drink': 'roblox-drink.mp3',
    'sword_swing_1': 'roblox-sword-swing-made-with-Voicemod.mp3',
    'sword_swing_2': 'roblox sword noise (mp3cut.net) (1).mp3',
    'vineboom': 'vineboom.mp3', // User uploaded - used for jumpscare replacement
    'spawn': 'roblox-spawn.mp3',
    'win': 'roblox-old-winning-sound-effect.mp3',
    'oof': 'oof.mp3',
    'eat': 'roblox-eating-sound-effect-nom-nom-nom.mp3',

    // Replace leftover/unused original sounds with existing sounds
    // Jumpscare was the only non-Roblox sound left that wasn't marked as '_old'
    // Mapping it to an existing sound file, like vineboom.
    'jumpscare': 'vineboom.mp3' // Replaced jumpscare.mp3 with vineboom.mp3
};

export function setupSoundSystem() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    loadAllSounds();
}

async function loadSound(url, name) {
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        audioContext.decodeAudioData(arrayBuffer, (buffer) => {
            audioBuffers[name] = buffer;
        }, (error) => {
            console.error(`Error decoding audio data for ${name} (${url}):`, error);
        });
    } catch (error) {
        console.error(`Error loading sound ${name} (${url}):`, error);
    }
}

function loadAllSounds() {
    // Load all sounds defined in the soundMap
    Object.entries(soundMap).forEach(([name, url]) => {
        loadSound(url, name);
    });
}

export function playSound(name) {
    if (!audioContext) {
        console.error("AudioContext not initialized.");
        return;
    }

    if (audioContext.state === 'suspended') {
        audioContext.resume().catch(e => console.error("Failed to resume AudioContext:", e));
    }

    const buffer = audioBuffers[name];
    if (buffer) {
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start(0);
    } else {
        console.warn(`Sound buffer "${name}" not found. Check soundMap and file paths.`);
    }
}

// Expose soundMap for debugging or dynamic use if needed elsewhere (though less common with fixed buttons)
export function getSoundMap() {
    return soundMap;
}