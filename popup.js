// ==========================================
// 1. ELEMENT SELECTION
// ==========================================
// Grabbing all the UI elements from popup.html so we can interact with them
const toggleBtn = document.getElementById('toggleBtn');
const blurBtn = document.getElementById('blurBtn');
const blurSlider = document.getElementById('blurSlider');
const blurValText = document.getElementById('blurVal');
const zoomSlider = document.getElementById('zoomSlider');
const zoomValText = document.getElementById('zoomVal');
const resetBtn = document.getElementById('resetBtn');
const pill = document.getElementById('pill');

// Defining the "factory settings"
const DEFAULT_BLUR = 10;
const DEFAULT_ZOOM = 1.0;

// ==========================================
// 2. INITIAL LOAD
// ==========================================
// When you open the popup, this gets your saved settings from Chrome's memory
chrome.storage.local.get(['lighthouseEnabled', 'blurEnabled', 'blurAmount', 'zoomAmount'], (res) => {
    // Set the Main Toggle (Focus Mode)
    const isEn = res.lighthouseEnabled !== false;
    toggleBtn.checked = isEn;
    
    // Set the Blur Toggle
    blurBtn.checked = res.blurEnabled !== false;
    
    // Set the Blur Intensity slider and text
    const bAmount = res.blurAmount !== undefined ? res.blurAmount : DEFAULT_BLUR;
    blurSlider.value = bAmount;
    blurValText.innerText = bAmount + "px";

    // Set the Zoom slider and text (rounded to 2 decimal places)
    const zAmount = res.zoomAmount !== undefined ? res.zoomAmount : DEFAULT_ZOOM;
    zoomSlider.value = zAmount;
    zoomValText.innerText = Number(zAmount).toFixed(2) + "x";

    // Update the visual "Active/Inactive" badge
    updatePill(isEn);
});

// ==========================================
// 3. EVENT LISTENERS (User Input)
// ==========================================

// Listen for Main Toggle changes
toggleBtn.addEventListener('change', () => {
    updatePill(toggleBtn.checked); // Change green/red pill
    chrome.storage.local.set({ lighthouseEnabled: toggleBtn.checked }); // Save setting
    sendMsg("toggle", toggleBtn.checked); // Tell code.js to turn on/off
});

// Listen for Blur Toggle changes
blurBtn.addEventListener('change', () => {
    chrome.storage.local.set({ blurEnabled: blurBtn.checked });
    sendMsg("toggleBlur", blurBtn.checked);
});

// Listen for Blur Slider movement
blurSlider.addEventListener('input', () => {
    const val = blurSlider.value;
    blurValText.innerText = val + "px"; // Update text next to slider
    chrome.storage.local.set({ blurAmount: val });
    sendMsg("updateBlurAmount", val);
});

// Listen for Zoom Slider movement
zoomSlider.addEventListener('input', () => {
    const val = zoomSlider.value;
    zoomValText.innerText = Number(val).toFixed(2) + "x"; // Update text next to slider
    chrome.storage.local.set({ zoomAmount: val });
    sendMsg("updateZoomAmount", val);
});

// Listen for Reset Button click
resetBtn.addEventListener('click', () => {
    // Put UI back to defaults
    zoomSlider.value = DEFAULT_ZOOM;
    zoomValText.innerText = DEFAULT_ZOOM.toFixed(2) + "x";
    blurSlider.value = DEFAULT_BLUR;
    blurValText.innerText = DEFAULT_BLUR + "px";
    
    // Save defaults and tell the page to update
    chrome.storage.local.set({ zoomAmount: DEFAULT_ZOOM, blurAmount: DEFAULT_BLUR });
    sendMsg("updateZoomAmount", DEFAULT_ZOOM);
    sendMsg("updateBlurAmount", DEFAULT_BLUR);
});

// ==========================================
// 4. HELPER FUNCTIONS
// ==========================================

// Changes the visual style of the "Active/Inactive" pill badge
function updatePill(isEn) {
    pill.innerText = isEn ? "Active" : "Inactive";
    pill.className = isEn ? "status-pill active-pill" : "status-pill inactive-pill";
}

// Sends a message from the popup to the actual webpage (code.js)
function sendMsg(action, status) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            // Sends the command (e.g., "toggle", true) to the active tab
            chrome.tabs.sendMessage(tabs[0].id, { action, status }).catch(e => {
                // Ignore errors if the page hasn't finished loading
            });
        }
    });
}
