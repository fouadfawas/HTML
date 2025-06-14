// Evil button event handlers
import { handleButtonClick } from './buttonEvents.js';

export function setupEvilButtons() {
    const evilButtonConfigs = {
        'worm-button': {
            text: "Ew! A worm! Get it away!",
            sound: 'gag',
            color: 'rgba(85, 107, 47, 0.8)',
            shake: true,
            relationshipChange: -8
        },
        'mealworms-button': {
            text: "More worms?! Blech! *gag*",
            sound: 'gag',
            color: 'rgba(85, 107, 47, 0.8)',
            shake: true,
            relationshipChange: -10
        },
        'strange-elixir-button': {
            text: "What is this strange stuff? No way!",
            sound: 'no',
            color: 'rgba(101, 67, 33, 0.8)',
            shake: true,
            relationshipChange: -4
        },
        'blood-button': {
            text: "Is that...? No thanks! *gag*",
            sound: 'gag',
            color: 'rgba(178, 34, 34, 0.8)',
            shake: true,
            relationshipChange: -12
        },
        'mystery-ooze-button': {
            text: "What IS this?! It's... slimy! *gag*",
            sound: 'gag',
            color: 'rgba(34, 139, 34, 0.8)',
            shake: true,
            relationshipChange: -6
        },
        'spill-soda-button': {
            text: "Woah! Hey, I'm all wet now!",
            sound: 'no',
            color: 'rgba(0, 206, 209, 0.8)',
            shake: true,
            relationshipChange: -1
        },
        'expired-food-button': {
            text: "Phew! What's that smell?! Get it away! *gag*",
            sound: 'gag',
            color: 'rgba(160, 82, 45, 0.8)',
            shake: true,
            relationshipChange: -11
        },
        'boop-nose-button': {
            text: "Hey! Don't boop me!",
            sound: 'no',
            color: 'rgba(220, 20, 60, 0.8)',
            shake: true,
            relationshipChange: -3
        },
        'mud-button': {
            text: "Mud?! Gross! *gag*",
            sound: 'gag',
            color: 'rgba(139, 69, 19, 0.8)',
            shake: true,
            relationshipChange: -9
        },
        'rock-button': {
            text: "A rock? Is this a joke?!",
            sound: 'no',
            color: 'rgba(105, 105, 105, 0.8)',
            shake: true,
            relationshipChange: -7
        },
        'stealHisPizzaButton': {
             text: "Hey! Get your hands off my pizza!",
             sound: 'no',
             color: 'rgba(139, 0, 0, 0.8)',
             shake: true,
             relationshipChange: -20
         },
         'offerPoisonedAppleButton': {
             text: "Is this... poisoned? NO!",
             sound: 'no',
             color: 'rgba(178, 34, 34, 0.8)',
             shake: true,
             relationshipChange: -15
         },
         'tellBadJokeButton': {
             text: "That wasn't funny... that was just sad.",
             sound: 'groan',
             color: 'rgba(108, 117, 125, 0.8)',
             shake: false,
             relationshipChange: -5
         },
         'hideRemoteButton': {
             text: "Where's the remote?! You hid it?!",
             sound: 'no',
             color: 'rgba(0, 0, 139, 0.8)',
             shake: true,
             relationshipChange: -10
         },
         'replaceFillingButton': {
             text: "Mush?! What did you do to my pizza?!",
             sound: 'gag',
             color: 'rgba(139, 0, 0, 0.8)',
             shake: true,
             relationshipChange: -25
         },
         'fartLoudlyButton': {
             text: "P-U! What was that?! Gross!",
             sound: 'gag',
             color: 'rgba(85, 107, 47, 0.8)',
             shake: true,
             relationshipChange: -8
         },
         'pokeEyeButton': {
             text: "OW! My eye! What's wrong with you?!",
             sound: 'no',
             color: 'rgba(220, 20, 60, 0.8)',
             shake: true,
             relationshipChange: -30
         },
         'pullTailButton': {
             text: "YOWCH! Don't pull my tail! That hurts!",
             sound: 'no',
             color: 'rgba(255, 0, 0, 0.8)',
             shake: true,
             relationshipChange: -40
         },
         'offerSpicyPepperButton': {
             text: "A ghost pepper?! My mouth is on fire!",
             sound: 'gag',
             color: 'rgba(255, 69, 0, 0.8)',
             shake: true,
             relationshipChange: -20
         },
         'singOffKeyButton': {
             text: "My ears! Stop the noise!",
             sound: 'groan',
             color: 'rgba(108, 117, 125, 0.8)',
             shake: false,
             relationshipChange: -7
         },
         'pourSaltButton': {
             text: "You put salt in my water?!",
             sound: 'no',
             color: 'rgba(173, 216, 230, 0.8)',
             shake: true,
             relationshipChange: -10
         },
         'giveFakePizzaButton': {
             text: "This isn't real pizza! You tricked me!",
             sound: 'no',
             color: 'rgba(139, 0, 0, 0.8)',
             shake: true,
             relationshipChange: -20
         },
         'sprayWaterButton': {
             text: "Hey! I don't like getting wet!",
             sound: 'no',
             color: 'rgba(0, 191, 255, 0.8)',
             shake: true,
             relationshipChange: -5
         },
    };

    Object.entries(evilButtonConfigs).forEach(([id, config]) => {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('click', () => {
                handleButtonClick(config, null);
            });
        }
    });
}

