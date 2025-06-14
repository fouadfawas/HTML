// Kind button event handlers
import { handleButtonClick } from './buttonEvents.js';

export function setupKindButtons() {
    const kindButtonConfigs = {
        'pet-button': {
            text: "Aww, thanks for the pets! *purrs*",
            sound: 'happy', 
            color: 'rgba(152, 251, 152, 0.8)',
            shake: false,
            relationshipChange: 15
        },
        'hug-button': {
            text: "*hugs back* This is nice!",
            sound: 'happy', 
            color: 'rgba(176, 224, 230, 0.8)',
            shake: false,
            relationshipChange: 18
        },
        'kiss-button': {
            text: "*blushes a little* Oh my...!",
            sound: 'happy', 
            color: 'rgba(255, 182, 193, 0.8)',
            shake: false,
            relationshipChange: 25
        },
        'pepperoni-button': {
            text: "Ooh, pepperoni! My favorite!",
            sound: 'eat', 
            color: 'rgba(0, 128, 0, 0.8)',
            shake: false,
            relationshipChange: 10
        },
        'cookie-button': {
            text: "A cookie! Yes please!",
            sound: 'eat', 
            color: 'rgba(210, 105, 30, 0.8)',
            shake: false,
            relationshipChange: 8
        },
        'fries-button': {
            text: "Fries! Crunchy goodness!",
            sound: 'eat', 
            color: 'rgba(255, 215, 0, 0.8)',
            shake: false,
            relationshipChange: 6
        },
        'ice-cream-button': {
            text: "Ice cream! My second favorite!",
            sound: 'eat', 
            color: 'rgba(255, 105, 180, 0.8)',
            shake: false,
            relationshipChange: 9
        },
        'cheese-button': {
            text: "Cheese! Melty goodness!",
            sound: 'eat', 
            color: 'rgba(255, 215, 0, 0.8)',
            shake: false,
            relationshipChange: 7
        },
        'pretzel-button': {
            text: "A pretzel! Nice and salty!",
            sound: 'eat', 
            color: 'rgba(205, 133, 63, 0.8)',
            shake: false,
            relationshipChange: 5
        },
        'candy-button': {
            text: "Candy! Sweet!",
            sound: 'eat', 
            color: 'rgba(238, 130, 238, 0.8)',
            shake: false,
            relationshipChange: 8
        },
        'offerTacoButton': {
             text: "A taco! Awesome!",
             sound: 'eat', 
             color: 'rgba(255, 140, 0, 0.8)',
             shake: false,
             relationshipChange: 10
         },
         'giveShinyStoneButton': {
             text: "Ooh, shiny! I love shiny things!",
             sound: 'happy', 
             color: 'rgba(176, 196, 222, 0.8)',
             shake: false,
             relationshipChange: 12
         },
         'offerWarmBlanketButton': {
             text: "Mmm, a warm blanket! So cozy!",
             sound: 'happy', 
             color: 'rgba(240, 230, 140, 0.8)',
             shake: false,
             relationshipChange: 10
         },
         'singLullabyButton': {
             text: "That's a sweet song. *yawn*",
             sound: 'happy', 
             color: 'rgba(106, 90, 205, 0.8)',
             shake: false,
             relationshipChange: 7
         },
         'tellJokeButton': {
             text: "Haha! That's funny!",
             sound: 'happy', 
             color: 'rgba(152, 251, 152, 0.8)',
             shake: false,
             relationshipChange: 8
         },
         'complimentButton': {
              text: "Aw, you're too kind!",
              sound: 'happy', 
              color: 'rgba(255, 182, 193, 0.8)',
              shake: false,
              relationshipChange: 9
          },
          'scratchEarsButton': {
              text: "*happy tail wagging*",
              sound: 'happy', 
              color: 'rgba(218, 112, 214, 0.8)',
              shake: false,
              relationshipChange: 15
          },
          'offerBackrubButton': {
              text: "Oh yeah, right there. That's the spot!",
              sound: 'happy', 
              color: 'rgba(189, 183, 107, 0.8)',
              shake: false,
              relationshipChange: 12
          },
          'shareSecretButton': {
              text: "Ooh, a secret! Tell me more!",
              sound: 'happy', 
              color: 'rgba(119, 136, 153, 0.8)',
              shake: false,
              relationshipChange: 10
          },
          'offerComfyPillowButton': {
              text: "A comfy pillow! Perfect for naps!",
              sound: 'happy', 
              color: 'rgba(135, 206, 250, 0.8)',
              shake: false,
              relationshipChange: 9
          },
          'buildFortButton': {
              text: "A fort! This is gonna be awesome!",
              sound: 'happy', 
              color: 'rgba(60, 179, 113, 0.8)',
              shake: false,
              relationshipChange: 15
          },
          'playFetchButton': {
              text: "Ball! Ball! Ball! *happy panting*",
              sound: 'happy', 
              color: 'rgba(255, 99, 71, 0.8)',
              shake: false,
              relationshipChange: 14
          },
          'offerMassageButton': {
              text: "Ah, pure bliss.",
              sound: 'happy', 
              color: 'rgba(152, 251, 152, 0.8)',
              shake: false,
              relationshipChange: 13
          },
          'makeHotChocolateButton': {
              text: "Hot chocolate! Just how I like it!",
              sound: 'eat', 
              color: 'rgba(210, 105, 30, 0.8)',
              shake: false,
              relationshipChange: 11
          },
          'readStoryButton': {
              text: "Once upon a time... this is nice.",
              sound: 'happy', 
              color: 'rgba(188, 143, 143, 0.8)',
              shake: false,
              relationshipChange: 8
          },
          'offerHeadphonesButton': {
              text: "Noise-canceling? Finally, some peace!",
              sound: 'happy', 
              color: 'rgba(72, 61, 139, 0.8)',
              shake: false,
              relationshipChange: 9
          },
          'giveFigurineButton': {
              text: "A cool figurine! I'll put it on my shelf!",
              sound: 'happy', 
              color: 'rgba(105, 105, 105, 0.8)',
              shake: false,
              relationshipChange: 10
          },
          'offerGuidedMeditationButton': {
              text: "Okay, breathing in... breathing out... *calm*",
              sound: 'happy', 
              color: 'rgba(176, 224, 230, 0.8)',
              shake: false,
              relationshipChange: 7
          },
          'offerSoftBrushButton': {
              text: "Ooh, that feels good! Brush my fur!",
              sound: 'happy', 
              color: 'rgba(245, 222, 179, 0.8)',
              shake: false,
              relationshipChange: 13
          },
          'offerFavoriteGameButton': {
              text: "My favorite game! Let's play!",
              sound: 'happy', 
              color: 'rgba(0, 128, 0, 0.8)',
              shake: false,
              relationshipChange: 15
          },
          'offerSnuggleButton': {
              text: "*purrs loudly* This is nice...",
              sound: 'happy', 
              color: 'rgba(255, 192, 203, 0.8)',
              shake: false,
              relationshipChange: 20
          },
          'offerNewPizzaButton': {
              text: "Another pizza?! You're the best!",
              sound: 'eat', 
              color: 'rgba(255, 165, 0, 0.8)',
              shake: false,
              relationshipChange: 25
          },
    };

    Object.entries(kindButtonConfigs).forEach(([id, config]) => {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('click', () => {
                handleButtonClick(config, null);
            });
        }
    });
}