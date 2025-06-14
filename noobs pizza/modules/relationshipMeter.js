// Relationship meter implementation
// Define relationship levels with thresholds on a 0-100 scale, mapping to CSS gradient stops
const RELATIONSHIP_LEVELS = [
    { name: 'Despise', color: '#ff0000', threshold: 0 }, // 0%
    { name: 'Enemies', color: '#ff4500', threshold: 20 }, // 20%
    { name: 'Hate', color: '#ff6b6b', threshold: 30 }, // 30%
    { name: 'Dislike', color: '#ffa07a', threshold: 40 }, // 40%
    { name: 'Angry', color: '#ffb6c1', threshold: 45 }, // 45%
    { name: 'Neutral', color: '#a9a9a9', threshold: 50 }, // 50%
    { name: 'Like', color: '#98fb98', threshold: 60 }, // 60%
    { name: 'Love', color: '#90ee90', threshold: 70 }, // 70%
    { name: 'Friends', color: '#32cd32', threshold: 80 }, // 80%
    { name: 'Best Friends', color: '#228b22', threshold: 90 } // Corresponds to the green end (near 100%)
];

let relationshipValue = 50; // Start at 50 for "Neutral"

export function setupRelationshipMeter() {
    updateMeterDisplay();
}

export function adjustRelationship(amount) {
    // Cap relationship value between 0 and 100
    relationshipValue = Math.max(0, Math.min(100, relationshipValue + amount));
    updateMeterDisplay();
    return getCurrentLevel();
}

export function getCurrentLevel() {
    // Find the highest threshold that the current relationshipValue meets
    // Iterate from highest threshold down
    for (let i = RELATIONSHIP_LEVELS.length - 1; i >= 0; i--) {
        if (relationshipValue >= RELATIONSHIP_LEVELS[i].threshold) {
            return RELATIONSHIP_LEVELS[i];
        }
    }
    // Should not happen if threshold 0 exists, but as a fallback:
    return RELATIONSHIP_LEVELS[0]; // Return the lowest level
}

function updateMeterDisplay() {
    const bar = document.getElementById('relationship-bar');
    const status = document.getElementById('relationship-status');
    const currentLevel = getCurrentLevel();
    
    if (!bar || !status) {
        console.error("Relationship meter elements not found.");
        return;
    }

    // Set bar width directly as a percentage of the 0-100 scale
    bar.style.width = `${relationshipValue}%`;
    
    // Update status text and color
    status.textContent = `${currentLevel.name} (${relationshipValue})`;
    status.style.color = currentLevel.color;
}

export function resetRelationship() {
    relationshipValue = 50; // Reset to Neutral
    updateMeterDisplay();
}

export function getRelationshipValue() {
    return relationshipValue;
}