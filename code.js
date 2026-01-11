// 1. Simple Ad Blocker
const removeAds = () => {
    const selectors = ['.ad, .ads, .adsense, .ad-box, .ad-slot', '[id*="google_ads"]'];
    selectors.forEach(sel => document.querySelectorAll(sel).forEach(el => el.remove()));
};
// Runs the ad-remover every 2 seconds to catch ads that load dynamically
setInterval(removeAds, 2000);

// 2. Lighthouse Logic
let isEnabled = true;      // Main switch for the extension
let isBlurEnabled = true;  // Toggle for the background blur effect
let blurAmount = 10;       // Intensity of the blur (in pixels)
let zoomAmount = 1.0;      // How much to scale the focused element
let currentTarget = null;  // Stores the element currently being focused

// Initial state load
chrome.storage.local.get(['lighthouseEnabled', 'blurEnabled', 'blurAmount'], (res) => {
    isEnabled = res.lighthouseEnabled !== false;
    isBlurEnabled = res.blurEnabled !== false;
    blurAmount = res.blurAmount !== undefined ? res.blurAmount : 10;
    zoomAmount = res.zoomAmount !== undefined ? res.zoomAmount : 1.0;
    blurAmount = res.blurAmount || 12;
});

// Message listener from Popup
chrome.runtime.onMessage.addListener((req) => {
    if (req.action === "toggle") isEnabled = req.status;
    if (req.action === "toggleBlur") isBlurEnabled = req.status;
    if (req.action === "updateBlurAmount") blurAmount = req.status;
    if (req.action === "updateZoomAmount") zoomAmount = req.status;       // Change zoom scale


    // ✅ ADD THESE
    if (req.action === "setBg") {
        document.documentElement.style.backgroundColor = req.color;
        document.body.style.backgroundColor = req.color;
    }

    if (req.action === "setText") {
        document.documentElement.style.color = req.color;
        document.body.style.color = req.color;

        document.querySelectorAll('p, span, li, a, h1, h2, h3, h4').forEach(el => {
            el.style.color = req.color;
        });
    }

    if (!isEnabled) {
        clearLighthouse();
    } else if (currentTarget) {
        updateLiveStyles();

    }
});

function updateLiveStyles() {
    if (isBlurEnabled) {
        document.body.classList.add('lh-blur-on');
        document.documentElement.style.setProperty('--lh-blur-size', blurAmount + 'px');
    } else {
        document.body.classList.remove('lh-blur-on');
    }
}

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