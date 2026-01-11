const toggleBtn = document.getElementById('toggleBtn');
const blurBtn = document.getElementById('blurBtn');
const blurSlider = document.getElementById('blurSlider');
const blurValText = document.getElementById('blurVal');
const zoomSlider = document.getElementById('zoomSlider');
const zoomValText = document.getElementById('zoomVal');
const fontSelect = document.getElementById('fontSelect');
const resetBtn = document.getElementById('resetBtn');
const pill = document.getElementById('pill');

const bgBtn = document.getElementById('bg-btn');
const textBtn = document.getElementById('text-btn');
const bgInput = document.getElementById('bg-color');
const textInput = document.getElementById('text-color');
const resetColors = document.getElementById('reset-colors');

const DEFAULT_BLUR = 10;
const DEFAULT_ZOOM = 1.0;
const DEFAULT_FONT = 'Arial, sans-serif';

chrome.storage.local.get(['lighthouseEnabled', 'blurEnabled', 'blurAmount', 'zoomAmount', 'activeFont'], (res) => {
    const isEn = res.lighthouseEnabled !== false;
    toggleBtn.checked = isEn;
    blurBtn.checked = res.blurEnabled !== false;
    
    const bAmount = res.blurAmount !== undefined ? res.blurAmount : DEFAULT_BLUR;
    blurSlider.value = bAmount;
    blurValText.innerText = bAmount + "px";

    const zAmount = res.zoomAmount !== undefined ? res.zoomAmount : DEFAULT_ZOOM;
    zoomSlider.value = zAmount;
    zoomValText.innerText = Number(zAmount).toFixed(2) + "x";

    const font = res.activeFont || DEFAULT_FONT;
    if (fontSelect) fontSelect.value = font;

    updatePill(isEn);
});

fontSelect.addEventListener('change', () => {
    const font = fontSelect.value;
    chrome.storage.local.set({ activeFont: font });
    sendMsg("updateFont", font);
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

const updateColor = (input, btn, action) => {
    btn.style.backgroundColor = input.value;
    sendMsg(action, input.value);
};

bgBtn.onclick = () => bgInput.click();
textBtn.onclick = () => textInput.click();
bgInput.oninput = () => updateColor(bgInput, bgBtn, 'setBg');
textInput.oninput = () => updateColor(textInput, textBtn, 'setText');

resetColors.onclick = () => {
    bgInput.value = '#ffffff';
    textInput.value = '#000000';
    updateColor(bgInput, bgBtn, 'setBg');
    updateColor(textInput, textBtn, 'setText');
};

resetBtn.addEventListener('click', () => {
    zoomSlider.value = DEFAULT_ZOOM;
    zoomValText.innerText = DEFAULT_ZOOM.toFixed(2) + "x";
    blurSlider.value = DEFAULT_BLUR;
    blurValText.innerText = DEFAULT_BLUR + "px";
    if (fontSelect) fontSelect.value = DEFAULT_FONT;
    
    chrome.storage.local.set({ 
        zoomAmount: DEFAULT_ZOOM, 
        blurAmount: DEFAULT_BLUR,
        activeFont: DEFAULT_FONT 
    });

    sendMsg("updateZoomAmount", DEFAULT_ZOOM);
    sendMsg("updateBlurAmount", DEFAULT_BLUR);
    sendMsg("updateFont", DEFAULT_FONT);
});

function updatePill(isEn) {
    pill.innerText = isEn ? "Active" : "Inactive";
    pill.className = isEn ? "status-pill active-pill" : "status-pill inactive-pill";
}

function sendMsg(action, status) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { 
                action: action, 
                status: status, 
                color: status 
            }).catch(e => {});
        }
    });
}
