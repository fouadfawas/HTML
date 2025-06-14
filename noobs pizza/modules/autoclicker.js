// Autoclicker implementation
export function setupAutoclicker() {
    let autoclickerInterval = null;
    const startAutoclicker = document.getElementById('start-autoclicker');
    const stopAutoclicker = document.getElementById('stop-autoclicker');
    const autoclickerInput = document.getElementById('autoclicker-button-text');
    const autoclickerStatus = document.querySelector('.autoclicker-status');

    if (!startAutoclicker || !stopAutoclicker || !autoclickerInput || !autoclickerStatus) {
        console.error("Could not find necessary elements for autoclicker.");
        return;
    }

    function updateAutoclickerStatus(isActive, targetButtonText = null) {
        autoclickerStatus.textContent = isActive 
            ? `Status: Active - Clicking "${targetButtonText}"`
            : 'Status: Inactive';
    }

    function handleAutoclickerStart(startButton, stopButton) {
        const buttonText = autoclickerInput.value.trim();
        if (!buttonText) {
            alert('Please enter button text first!');
            return;
        }

        const targetButton = findButtonByText(buttonText);
        if (!targetButton) {
            alert('No button found with that text!');
            return;
        }

        if (autoclickerInterval) {
            clearInterval(autoclickerInterval);
        }

        autoclickerInterval = setInterval(() => {
            if (!targetButton.disabled) {
                targetButton.click();
            } else {
                handleAutoclickerStop(startButton, stopButton);
            }
        }, 50); 

        startButton.disabled = true;
        stopButton.disabled = false;
        updateAutoclickerStatus(true, targetButton.textContent);
    }

    function handleAutoclickerStop(startButton, stopButton) {
        if (autoclickerInterval) {
            clearInterval(autoclickerInterval);
            autoclickerInterval = null;
        }

        startButton.disabled = false;
        stopButton.disabled = true;
        updateAutoclickerStatus(false);
    }

    startAutoclicker.addEventListener('click', () => handleAutoclickerStart(startAutoclicker, stopAutoclicker));
    stopAutoclicker.addEventListener('click', () => handleAutoclickerStop(startAutoclicker, stopAutoclicker));

    document.addEventListener('gameOver', () => {
        if (autoclickerInterval) {
            handleAutoclickerStop(startAutoclicker, stopAutoclicker);
        }
        startAutoclicker.disabled = true;
        stopAutoclicker.disabled = true;
        autoclickerInput.disabled = true;
    });

    document.addEventListener('characterRevived', () => {
        startAutoclicker.disabled = false;
        stopAutoclicker.disabled = true;
        autoclickerInput.disabled = false;
    });
}