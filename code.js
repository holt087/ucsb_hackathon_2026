// ==========================================
// 1. AD-BLOCKING FUNCTIONALITY
// ==========================================
// Periodically scans the page for common ad selectors and removes them from the DOM
const removeAds = () => {
    const selectors = ['.ad, .ads, .adsense, .ad-box, .ad-slot', '[id*="google_ads"]'];
    selectors.forEach(sel => document.querySelectorAll(sel).forEach(el => el.remove()));
};
// Runs the ad-remover every 2 seconds to catch ads that load dynamically
setInterval(removeAds, 2000);

// ==========================================
// 2. STATE & CONFIGURATION management
// ==========================================
let isEnabled = true;      // Main switch for the extension
let isBlurEnabled = true;  // Toggle for the background blur effect
let blurAmount = 10;       // Intensity of the blur (in pixels)
let zoomAmount = 1.0;      // How much to scale the focused element
let currentTarget = null;  // Stores the element currently being focused

// Load saved settings from Chrome's local storage
chrome.storage.local.get(['lighthouseEnabled', 'blurEnabled', 'blurAmount', 'zoomAmount'], (res) => {
    isEnabled = res.lighthouseEnabled !== false;
    isBlurEnabled = res.blurEnabled !== false;
    blurAmount = res.blurAmount !== undefined ? res.blurAmount : 10;
    zoomAmount = res.zoomAmount !== undefined ? res.zoomAmount : 1.0;
});

// ==========================================
// 3. COMMUNICATION (Messages from Popup/UI)
// ==========================================
// Listens for changes made in the extension popup menu
chrome.runtime.onMessage.addListener((req) => {
    if (req.action === "toggle") isEnabled = req.status;                  // Master ON/OFF
    if (req.action === "toggleBlur") isBlurEnabled = req.status;          // Blur ON/OFF
    if (req.action === "updateBlurAmount") blurAmount = req.status;       // Change blur px
    if (req.action === "updateZoomAmount") zoomAmount = req.status;       // Change zoom scale
    
    if (!isEnabled) {
        clearLighthouse(); // Clean up styles if disabled
    } else if (currentTarget) {
        updateLiveStyles(); // Apply new settings immediately to active focus
    }
});

// ==========================================
// 4. STYLE APPLICATION
// ==========================================
// Injects the current settings into CSS variables used by the stylesheet
function updateLiveStyles() {
    document.documentElement.style.setProperty('--lh-zoom-level', zoomAmount);
    document.documentElement.style.setProperty('--lh-blur-size', blurAmount + 'px');

    // Adds/removes the class that triggers the background blur
    if (isBlurEnabled && isEnabled) {
        document.body.classList.add('lh-blur-on');
    } else {
        document.body.classList.remove('lh-blur-on');
    }
}

// ==========================================
// 5. HOVER DETECTION (The "Lighthouse" Logic)
// ==========================================
document.addEventListener('mouseover', (e) => {
    if (!isEnabled) return;
    
    // Finds the closest paragraph or image to the mouse cursor
    const target = e.target.closest('p, img');
    
    if (target && target !== currentTarget) {
        // Validation: Ignore very short paragraphs (under 20 characters)
        if (target.tagName.toLowerCase() === 'p' && target.innerText.length <= 20) return;

        // Clean up previous highlight before moving to the new one
        if (currentTarget) {
            currentTarget.classList.remove('lh-highlight', 'lh-img-highlight');
        }
        
        currentTarget = target;
        
        // Match the focus background to the element's actual background
        let bgColor = window.getComputedStyle(target).backgroundColor;
        if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
            bgColor = window.getComputedStyle(document.body).backgroundColor;
            if (bgColor === 'rgba(0, 0, 0, 0)') bgColor = '#ffffff';
        }

        // Set CSS variables for the specific element
        target.style.setProperty('--lh-bg', bgColor);
        target.style.setProperty('--lh-text', window.getComputedStyle(target).color);

        // Apply focus classes based on element type
        if (target.tagName.toLowerCase() === 'img') {
            target.classList.add('lh-img-highlight');
        } else {
            target.classList.add('lh-highlight');
        }
        
        updateLiveStyles();
    }
});

// ==========================================
// 6. EXIT DETECTION
// ==========================================
// Removes the focus if the mouse moves too far away from the active element
document.addEventListener('mousemove', (e) => {
    if (currentTarget) {
        const rect = currentTarget.getBoundingClientRect();
        const buffer = 60; // Distance in pixels before focus is lost
        if (e.clientX < rect.left - buffer || e.clientX > rect.right + buffer || 
            e.clientY < rect.top - buffer || e.clientY > rect.bottom + buffer) {
            clearLighthouse();
        }
    }
});

// Resets the page to its original state
function clearLighthouse() {
    if (currentTarget) {
        currentTarget.classList.remove('lh-highlight', 'lh-img-highlight');
        currentTarget = null;
    }
    document.body.classList.remove('lh-blur-on');
}
