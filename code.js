// 1. Simple Ad Blocker
const removeAds = () => {
    const selectors = ['.ad, .ads, .adsense, .ad-box, .ad-slot', '[id*="google_ads"]'];
    selectors.forEach(sel => document.querySelectorAll(sel).forEach(el => el.remove()));
};
setInterval(removeAds, 2000);

// 2. State management
let isEnabled = true;
let isBlurEnabled = true;
let blurAmount = 10; 
let zoomAmount = 1.0;
let currentTarget = null;

chrome.storage.local.get(['lighthouseEnabled', 'blurEnabled', 'blurAmount', 'zoomAmount'], (res) => {
    isEnabled = res.lighthouseEnabled !== false;
    isBlurEnabled = res.blurEnabled !== false;
    blurAmount = res.blurAmount !== undefined ? res.blurAmount : 10;
    zoomAmount = res.zoomAmount !== undefined ? res.zoomAmount : 1.0;
});

chrome.runtime.onMessage.addListener((req) => {
    if (req.action === "toggle") isEnabled = req.status;
    if (req.action === "toggleBlur") isBlurEnabled = req.status;
    if (req.action === "updateBlurAmount") blurAmount = req.status;
    if (req.action === "updateZoomAmount") zoomAmount = req.status;
    
    if (!isEnabled) {
        clearLighthouse();
    } else if (currentTarget) {
        updateLiveStyles();
    }
});

function updateLiveStyles() {
    document.documentElement.style.setProperty('--lh-zoom-level', zoomAmount);
    document.documentElement.style.setProperty('--lh-blur-size', blurAmount + 'px');

    if (isBlurEnabled && isEnabled) {
        document.body.classList.add('lh-blur-on');
    } else {
        document.body.classList.remove('lh-blur-on');
    }
}

document.addEventListener('mouseover', (e) => {
    if (!isEnabled) return;
    
    // Check for paragraph or image
    const target = e.target.closest('p, img');
    
    if (target && target !== currentTarget) {
        // Validation: skip very short text snippets, but always allow images
        if (target.tagName.toLowerCase() === 'p' && target.innerText.length <= 20) return;

        if (currentTarget) {
            currentTarget.classList.remove('lh-highlight', 'lh-img-highlight');
        }
        
        currentTarget = target;
        
        const style = window.getComputedStyle(target);
        let bgColor = style.backgroundColor;
        if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
            bgColor = window.getComputedStyle(document.body).backgroundColor;
            if (bgColor === 'rgba(0, 0, 0, 0)') bgColor = '#ffffff';
        }

        target.style.setProperty('--lh-bg', bgColor);
        target.style.setProperty('--lh-text', style.color);

        // Apply specific class based on type
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
        const buffer = 60;
        if (e.clientX < rect.left - buffer || e.clientX > rect.right + buffer || 
            e.clientY < rect.top - buffer || e.clientY > rect.bottom + buffer) {
            clearLighthouse();
        }
    }
});

function clearLighthouse() {
    if (currentTarget) {
        currentTarget.classList.remove('lh-highlight', 'lh-img-highlight');
        currentTarget = null;
    }
    document.body.classList.remove('lh-blur-on');
}
