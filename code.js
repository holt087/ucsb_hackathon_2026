// 1. Simple Ad Blocker
const removeAds = () => {
    const selectors = ['.ad, .ads, .adsense, .ad-box, .ad-slot', '[id*="google_ads"]'];
    selectors.forEach(sel => document.querySelectorAll(sel).forEach(el => el.remove()));
};
setInterval(removeAds, 2000);

// 2. Lighthouse Logic
let isEnabled = true;
let isBlurEnabled = true;
let blurAmount = 12; 
let currentTarget = null;

// Initial state load
chrome.storage.local.get(['lighthouseEnabled', 'blurEnabled', 'blurAmount'], (res) => {
    isEnabled = res.lighthouseEnabled !== false;
    isBlurEnabled = res.blurEnabled !== false;
    blurAmount = res.blurAmount || 12;
});

// Message listener from Popup
chrome.runtime.onMessage.addListener((req) => {
    if (req.action === "toggle") isEnabled = req.status;
    if (req.action === "toggleBlur") isBlurEnabled = req.status;
    if (req.action === "updateBlurAmount") blurAmount = req.status;
    
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

document.addEventListener('mouseover', (e) => {
    if (!isEnabled) return;
    const target = e.target.closest('p');
    
    if (target && target !== currentTarget && target.innerText.length > 20) {
        if (currentTarget) currentTarget.classList.remove('lh-highlight');
        currentTarget = target;
        
        const style = window.getComputedStyle(target);
        let bgColor = style.backgroundColor;
        if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
            bgColor = window.getComputedStyle(document.body).backgroundColor;
            if (bgColor === 'rgba(0, 0, 0, 0)') bgColor = '#ffffff';
        }

        target.style.setProperty('--lh-bg', bgColor);
        target.style.setProperty('--lh-text', style.color);
        target.classList.add('lh-highlight');
        
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
        currentTarget.classList.remove('lh-highlight');
        currentTarget = null;
    }
    document.body.classList.remove('lh-blur-on');
}
