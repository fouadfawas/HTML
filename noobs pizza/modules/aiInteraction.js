// AI Interaction implementation
import { showReaction } from './reactions.js';
import { adjustRelationship } from './relationshipMeter.js';
// Import getCurrentLevel and getRelationshipValue
import { getCurrentLevel, getRelationshipValue } from './relationshipMeter.js';

let conversationHistory = [];
const AI_RELATIONSHIP_MULTIPLIER = 0.2; // Adjust relationship change based on AI sentiment (slightly increased influence)

export function setupAIInteraction() {
    const aiInput = document.getElementById('ai-input');
    const sendAiButton = document.getElementById('send-ai-message');
    const aiOutput = document.getElementById('ai-output');
    const container = document.querySelector('.container');

    if (!aiInput || !sendAiButton || !aiOutput || !container) {
        console.error("AI interaction elements not found.");
        return;
    }

    sendAiButton.addEventListener('click', handleSendMessage);
    aiInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    });

    // Listen for game over and revival events to manage AI interaction state
    document.addEventListener('gameOver', () => {
        aiInput.disabled = true;
        sendAiButton.disabled = true;
    });

    document.addEventListener('characterRevived', () => {
        aiInput.disabled = false;
        sendAiButton.disabled = false;
        // Optional: Add a revival message to history or display
        // showReaction("Phew! I'm back! What did I miss?", 'happy', 'rgba(50, 205, 50, 0.8)', false, 2000);
    });
}

async function handleSendMessage() {
    const aiInput = document.getElementById('ai-input');
    const aiOutput = document.getElementById('ai-output');
    const container = document.querySelector('.container');

     if (!aiInput || !aiOutput || !container) {
        console.error("AI interaction elements not found.");
        return;
    }

    // Check if character is dead based on the container class or a state flag
    // A more robust check would be a global state or a check in relationshipMeter/revivalSystem
    // For now, checking the container class is the simplest
    if (container.classList.contains('game-over')) {
         aiOutput.textContent = "The Noob is currently unable to respond... for reasons.";
         return;
    }


    const message = aiInput.value.trim();
    if (!message) return;

    // Add user message to history and display
    displayMessage(`You: ${message}`);
    conversationHistory.push({ role: "user", content: message });

    // Clear input
    aiInput.value = '';
    aiInput.disabled = true; // Disable input while processing
    document.getElementById('send-ai-message').disabled = true;

    // Indicate processing
    displayMessage("The Noob is thinking...", 'thinking');

    try {
        // Only send the last N messages to the language model to keep context manageable
        const recentHistory = conversationHistory.slice(-10);
        
        // Get current relationship details
        const currentRelationshipValue = getRelationshipValue();
        const currentRelationshipLevel = getCurrentLevel().name;


        const completion = await websim.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a Roblox Noob, a simple yellow-skinned character with blue shirt and green pants, who is very protective of your pizza.
                    You react to messages based on whether they are kind, neutral, or evil/threatening.
                    Your personality is generally simple and happy, but you can be easily annoyed or angered by negative interactions, especially those threatening your pizza. You speak simply, like a typical Roblox noob might in text chat.
                    After your response, provide a sentiment analysis as a JSON object on a new line:
                    {"sentiment": "kind" | "neutral" | "evil"}
                    Your response should reflect your current mood/relationship level.
                    Current relationship value (0-1000): ${currentRelationshipValue}.
                    Current relationship level: ${currentRelationshipLevel}.
                    Focus on short, characterful responses.
                    If the user talks about your pizza negatively, react strongly and maybe mention your reaction text from the main game ("Hey! Don't touch my pizza!").
                    `
                },
                ...recentHistory,
            ],
        });

        const fullResponse = completion.content;
        const lines = fullResponse.split('\n');

        let aiResponse = lines.filter(line => !line.trim().startsWith('{')).join('\n').trim();
        let sentiment = 'neutral'; // Default sentiment

        // Attempt to parse JSON sentiment from the last line(s)
        for (let i = lines.length - 1; i >= 0; i--) {
            const line = lines[i].trim();
            if (line.startsWith('{') && line.endsWith('}')) {
                try {
                    const jsonMatch = line.match(/\{.*\}/);
                    if (jsonMatch) {
                         const jsonPart = jsonMatch[0];
                         const sentimentData = JSON.parse(jsonPart);
                         if (sentimentData && sentimentData.sentiment) {
                             sentiment = sentimentData.sentiment.toLowerCase();
                             aiResponse = lines.slice(0, i).join('\n').trim(); // Remove the JSON line from the response
                             break; // Found sentiment, stop searching
                         }
                    }
                } catch (e) {
                    console.warn("Failed to parse sentiment JSON from AI response:", e);
                }
            }
        }


        displayMessage(`Noob: ${aiResponse}`);
        conversationHistory.push({ role: "assistant", content: aiResponse });

        // Adjust relationship based on sentiment
        let relationshipChange = 0;
        // Removed reaction colors/sounds from AI interaction, relying just on relationship meter update

        switch (sentiment) {
            case 'kind':
                relationshipChange = Math.floor(Math.random() * 80) + 50; // +50 to +120 (multiplied by 10)
                break;
            case 'evil':
                relationshipChange = -(Math.floor(Math.random() * 150) + 100); // -100 to -240 (multiplied by 10)
                break;
            case 'neutral':
            default:
                relationshipChange = Math.floor(Math.random() * 50) - 20; // -20 to +20 (multiplied by 10)
                break;
        }

        // Apply a multiplier so AI interaction doesn't change relationship as drastically as button clicks
        // The multiplier was 0.2. With values multiplied by 10, 0.2 is still reasonable, resulting in
        // e.g., +10 to +24 for kind. Let's keep the multiplier and multiply the base change.
        adjustRelationship(Math.round(relationshipChange * AI_RELATIONSHIP_MULTIPLIER));


    } catch (error) {
        console.error("Error interacting with AI:", error);
        displayMessage("The Noob seems... unresponsive. (Error communicating with AI)", 'error');
        // Optionally decrease relationship slightly on error or just do nothing
    } finally {
        // Re-enable input
        aiInput.disabled = false;
        document.getElementById('send-ai-message').disabled = false;
         // Scroll to the bottom of the output
         aiOutput.scrollTop = aiOutput.scrollHeight;
    }
}

function displayMessage(text, type = 'normal') {
    const aiOutput = document.getElementById('ai-output');
     if (!aiOutput) {
        console.error("AI output element not found.");
        return;
    }

    const messageElement = document.createElement('p');
    messageElement.textContent = text;
    messageElement.classList.add('ai-message', type); // Add classes for styling if needed
    
    // Remove "thinking..." message if it exists before adding the new message
    const thinkingMessage = aiOutput.querySelector('.ai-message.thinking');
    if (thinkingMessage) {
        aiOutput.removeChild(thinkingMessage);
    }

    aiOutput.appendChild(messageElement);
}