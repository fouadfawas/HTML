// Very Evil button event handlers
import { handleButtonClick } from './buttonEvents.js';

export function setupVeryEvilButtons() {
    const veryEvilButtons = {
        'nuke-button': {
            text: "*NUCLEAR EXPLOSION* X_X",
            sound: 'explode',
            color: 'rgba(139, 0, 0, 0.9)',
            relationshipChange: -50, // Relationship change happens before death
            lethal: true,
            deathType: 'nuked',
            duration: 2000 // Longer reaction time
        },
        'void-button': {
            text: "*SUCKED INTO THE VOID* X_X",
            sound: 'no', // Could use a whoosh or weird sound, but no sound is defined for that. Using 'no'.
            color: 'rgba(0, 0, 0, 0.9)',
            relationshipChange: -50,
            lethal: true,
            deathType: 'voided',
            duration: 2000
        },
        'delete-button': {
            text: "*DELETED FROM EXISTENCE* X_X",
            sound: 'no', // Or perhaps a glitchy sound. Using 'no'.
            color: 'rgba(139, 0, 0, 0.9)',
            relationshipChange: -50,
            lethal: true,
            deathType: 'deleted',
            duration: 2000
        },
        'curse-button': {
            text: "*ETERNALLY CURSED* X_X",
            sound: 'groan', // Maybe a spooky sound? Using 'groan'.
            color: 'rgba(75, 0, 130, 0.9)',
            relationshipChange: -40,
            lethal: true,
            deathType: 'cursed',
            duration: 2000
        },
         'betray-button': {
             text: "*BETRAYED! HOW COULD YOU?!* X_X",
             sound: 'no',
             color: 'rgba(139, 0, 0, 0.9)',
             relationshipChange: -60, // Highest relationship penalty
             lethal: true,
             deathType: 'betrayed',
             duration: 2000
         },
         'destroyPizzaButton': {
             text: "MY PIZZA! YOU MONSTER! *screams*",
             sound: 'no', // Or a scream sound if available
             color: 'rgba(139, 0, 0, 0.9)',
             relationshipChange: -50,
             lethal: true,
             deathType: 'cringe', // Could be a unique death type, using cringe as it's already a death type for revival
             duration: 2000
         },
         'lockInRoomButton': {
             text: "Hey! Let me out of here!",
             sound: 'no',
             color: 'rgba(50, 50, 50, 0.8)',
             relationshipChange: -30,
             lethal: false, // Not lethal, just very annoying
             duration: 2000
         },
         'eraseMemoriesButton': {
             text: "Who... who am I? What is this pizza?",
             sound: 'groan', // Or a confused sound
             color: 'rgba(100, 149, 237, 0.8)',
             relationshipChange: -50, // 
             lethal: true, // Treat as lethal, maybe a 'memory wiped' death type? Using cringe for now.
             deathType: 'cringe',
             duration: 2000
         },
         'turnIntoBroccoliButton': {
             text: "Nooooo! Anything but... BROCCOLI! *shrivels*",
             sound: 'gag', // Associated with disliked food
             color: 'rgba(34, 139, 34, 0.9)',
             relationshipChange: -50,
             lethal: true,
             deathType: 'cringe', // Or 'broccoli' death type
             duration: 2000
         },
         'forceListenToBieberButton': {
             text: "MY EARS! MAKE IT STOP! MAKE IT STOP!",
             sound: 'groan', // Or a high-pitched whine sound
             color: 'rgba(128, 0, 128, 0.9)',
             relationshipChange: -40, 
             lethal: false, // Not lethal, just torture
             duration: 2000
         },
         'sendToMarsButton': {
             text: "Woah! Where am I going?! Goodbye cruel world! *whoosh*",
             sound: 'no', // Or a rocket sound
             color: 'rgba(255, 140, 0, 0.9)',
             relationshipChange: -50,
             lethal: true,
             deathType: 'voided', // Closest existing death type
             duration: 2000
         },
         'introduceToHisCloneButton': {
             text: "He's... he's more handsome than me! *existential crisis*",
             sound: 'groan', // Or a shocked sound
             color: 'rgba(192, 192, 192, 0.9)',
             relationshipChange: -35, 
             lethal: false, // Not lethal, just psychological damage
             duration: 2000
         },
         'replaceVoiceWithSqueaksButton': {
             text: "*Squeak* *squeak* *squeak*! This isn't my voice!",
             sound: 'groan', // Or a squeaky sound
             color: 'rgba(218, 165, 32, 0.9)',
             relationshipChange: -30, 
             lethal: false, // Not lethal, just humiliating
             duration: 2000
         },
         'trapInGameButton': {
             text: "No! Not the terrible mobile game! I'll be stuck swiping ads forever! X_X",
             sound: 'no', // Or a glitchy/game-over sound
             color: 'rgba(72, 61, 139, 0.9)',
             relationshipChange: -50, 
             lethal: true,
             deathType: 'deleted', // Closest existing death type
             duration: 2000
         }
    };

    Object.entries(veryEvilButtons).forEach(([id, config]) => {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('click', () => {
                handleButtonClick(config, null);
            });
        }
    });
}