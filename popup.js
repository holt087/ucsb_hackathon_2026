const toggleBtn = document.getElementById('toggleBtn');
const blurBtn = document.getElementById('blurBtn');
const blurSlider = document.getElementById('blurSlider');
const blurValText = document.getElementById('blurVal');
const zoomSlider = document.getElementById('zoomSlider');
const zoomValText = document.getElementById('zoomVal');
const resetBtn = document.getElementById('resetBtn');
const pill = document.getElementById('pill');

const DEFAULT_BLUR = 10;
const DEFAULT_ZOOM = 1.0;

// Load values
chrome.storage.local.get(['lighthouseEnabled', 'blurEnabled', 'blurAmount', 'zoomAmount'], (res) => {
    const isEn = res.lighthouseEnabled !== false;
    toggleBtn.checked = isEn;
    blurBtn.checked = res.blurEnabled !== false;
    
    const bAmount = res.blurAmount !== undefined ? res.blurAmount : DEFAULT_BLUR;
    blurSlider.value = bAmount;
    blurValText.innerText = bAmount + "px";

    const zAmount = res.zoomAmount !== undefined ? res.zoomAmount : DEFAULT_ZOOM;
    zoomSlider.value = zAmount;
    zoomValText.innerText = Number(zAmount).toFixed(2) + "x";

    updatePill(isEn);
});

toggleBtn.addEventListener('change', () => {
    updatePill(toggleBtn.checked);
    chrome.storage.local.set({ lighthouseEnabled: toggleBtn.checked });
    sendMsg("toggle", toggleBtn.checked);
});

blurBtn.addEventListener('change', () => {
    chrome.storage.local.set({ blurEnabled: blurBtn.checked });
    sendMsg("toggleBlur", blurBtn.checked);
});

blurSlider.addEventListener('input', () => {
    const val = blurSlider.value;
    blurValText.innerText = val + "px";
    chrome.storage.local.set({ blurAmount: val });
    sendMsg("updateBlurAmount", val);
});

zoomSlider.addEventListener('input', () => {
    const val = zoomSlider.value;
    zoomValText.innerText = Number(val).toFixed(2) + "x";
    chrome.storage.local.set({ zoomAmount: val });
    sendMsg("updateZoomAmount", val);
});

resetBtn.addEventListener('click', () => {
    zoomSlider.value = DEFAULT_ZOOM;
    zoomValText.innerText = DEFAULT_ZOOM.toFixed(2) + "x";
    blurSlider.value = DEFAULT_BLUR;
    blurValText.innerText = DEFAULT_BLUR + "px";
    
    chrome.storage.local.set({ zoomAmount: DEFAULT_ZOOM, blurAmount: DEFAULT_BLUR });
    sendMsg("updateZoomAmount", DEFAULT_ZOOM);
    sendMsg("updateBlurAmount", DEFAULT_BLUR);
});

function updatePill(isEn) {
    pill.innerText = isEn ? "Active" : "Inactive";
    pill.className = isEn ? "status-pill active-pill" : "status-pill inactive-pill";
}

function sendMsg(action, status) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { action, status }).catch(e => {});
        }
    });
}
