// Neutral button event handlers
import { handleButtonClick } from './buttonEvents.js';

export function setupNeutralButtons() {
    const neutralButtonConfigs = {
        'blue-cheese-button': {
            text: "Blech! Blue cheese! *gag*",
            sound: 'gag',
            color: 'rgba(100, 149, 237, 0.8)', // Steel Blue
            shake: true,
            relationshipChange: -5
        },
        'pineapple-button': {
            text: "Pineapple? On pizza? *groan*",
            sound: 'groan',
            color: 'rgba(255, 165, 0, 0.8)', // Orange
            shake: true,
            relationshipChange: -3
        },
        'broccoli-button': {
            text: "Broccoli? Uh... thanks, I guess.",
            sound: 'groan',
            color: 'rgba(60, 179, 113, 0.8)', // Medium Sea Green
            shake: true,
            relationshipChange: -2
        },
        'sushi-button': {
            text: "Sushi? Hmm... interesting.",
            sound: 'groan',
            color: 'rgba(128, 0, 128, 0.8)', // Purple
            shake: false,
            relationshipChange: 0
        },
        'sandwich-button': {
            text: "A sandwich? This isn't pizza!",
            sound: 'groan',
            color: 'rgba(244, 164, 96, 0.8)', // Sandy Brown
            shake: true,
            relationshipChange: -1
        },
        'carrot-button': {
            text: "A carrot? Are you kidding?",
            sound: 'groan',
            color: 'rgba(237, 145, 33, 0.8)', // Dark Orange
            shake: true,
            relationshipChange: -2
        },
        'salad-button': {
            text: "Salad? This is boring.",
            sound: 'groan',
            color: 'rgba(144, 238, 144, 0.8)', // Light Green
            shake: false,
            relationshipChange: -1
        },
        'water-button': {
            text: "Water? Okay, thanks.",
            sound: 'groan', 
            color: 'rgba(173, 216, 230, 0.8)', // Light Blue
            shake: false,
            relationshipChange: 0
        },
        'empty-box-button': {
            text: "An empty box? What am I supposed to do with this?",
            sound: 'groan',
            color: 'rgba(205, 133, 63, 0.8)', // Peru
            shake: false,
            relationshipChange: -1
        },
        'opposite-day-button': {
            text: "Opposite day? Does that mean I hate pizza now? *Confused*",
            sound: 'groan', 
            color: 'rgba(150, 150, 200, 0.8)',
            shake: false,
            relationshipChange: 0
        },
        'lemon-button': {
            text: "A lemon?! So sour! *gag*",
            sound: 'gag',
            color: 'rgba(255, 255, 0, 0.8)',
            shake: true,
            relationshipChange: -4
        },
        'eat-everything-button': {
            text: () => { 
                const items = getRandomItems().join(', ');
                return `*Munching sounds* I ate the ${items}! *burp*`;
            },
            sound: 'eat', 
            color: 'rgba(100, 100, 100, 0.8)', // Grey
            shake: false,
            relationshipChange: 0 
        },
        'sfw-fanart-button': {
            text: "Hmm, fanart? It's... interesting.",
            sound: 'groan',
            color: 'rgba(192, 192, 192, 0.8)', // Silver (Neutral)
            shake: false,
            relationshipChange: 1
        },
        'offerRubberChickenButton': {
             text: "A rubber chicken? Squeak!",
             sound: 'groan', 
             color: 'rgba(255, 255, 0, 0.8)', // Yellow
             shake: true, 
             relationshipChange: 0
         },
         'showWeatherReportButton': {
             text: "The weather report? Riveting...",
             sound: 'groan',
             color: 'rgba(176, 196, 222, 0.8)', // Light Steel Blue
             shake: false,
             relationshipChange: 0
         },
         'givePlainRockButton': {
             text: "A rock. Thanks?",
             sound: 'groan',
             color: 'rgba(105, 105, 105, 0.8)', // Dim Grey (Neutral)
             shake: false,
             relationshipChange: 0
         },
         'offerUsedSockButton': {
             text: "A used sock? Um... no.",
             sound: 'gag',
             color: 'rgba(160, 82, 45, 0.8)', // Sienna (Brownish)
             shake: true,
             relationshipChange: -3
         },
         'showSpreadsheetButton': {
             text: "A spreadsheet? My eyes glaze over...",
             sound: 'groan',
             color: 'rgba(144, 238, 144, 0.8)', // Light Green
             shake: false,
             relationshipChange: -1
         },
         'giveDryCrackerButton': {
             text: "A dry cracker. Needs more flavor.",
             sound: 'groan',
             color: 'rgba(210, 180, 140, 0.8)', // Tan
             shake: false,
             relationshipChange: 0
         },
         'offerTapWaterButton': {
             text: "Tap water? Is the fancy stuff broken?",
             sound: 'groan',
             color: 'rgba(173, 216, 230, 0.8)', // Light Blue
             shake: false,
             relationshipChange: 0
         },
         'giveSmallStickButton': {
             text: "A small stick. Could be worse.",
             sound: 'groan',
             color: 'rgba(139, 69, 19, 0.8)', // Saddle Brown
             shake: false,
             relationshipChange: 0
         },
         'showBlankWallButton': {
             text: "A blank wall... Fascinating.",
             sound: 'groan',
             color: 'rgba(192, 192, 192, 0.8)', // Silver (Neutral)
             shake: false,
             relationshipChange: -1
         },
         'offerDustBunnyButton': {
             text: "A dust bunny? Really?",
             sound: 'gag',
             color: 'rgba(105, 105, 105, 0.8)', // Dim Grey (Neutral)
             shake: true,
             relationshipChange: -3
         },
         'giveCalculatorButton': {
             text: "A calculator? I can do math in my head, thanks.",
             sound: 'groan',
             color: 'rgba(0, 0, 128, 0.8)', // Navy Blue
             shake: false,
             relationshipChange: 0
         },
         'offerPieceOfPaperButton': {
             text: "A piece of paper. What am I supposed to do, draw?",
             sound: 'groan',
             color: 'rgba(245, 245, 220, 0.8)', // Ivory (Off-White)
             shake: false,
             relationshipChange: 0
         },
         'showEncyclopediaButton': {
             text: "An encyclopedia? I prefer the internet.",
             sound: 'groan',
             color: 'rgba(150, 75, 0, 0.8)', // Muted Brown (like old book covers)
             shake: false,
             relationshipChange: -1
         },
         'giveBentSpoonButton': {
             text: "A bent spoon? Did you even try?",
             sound: 'groan',
             color: 'rgba(169, 169, 169, 0.8)', // Dark Grey (Neutral)
             shake: false,
             relationshipChange: -2
         },
    };

    Object.entries(neutralButtonConfigs).forEach(([id, config]) => {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('click', (event) => { 
                 handleButtonClick(config, event);
            });
        }
    });
}

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