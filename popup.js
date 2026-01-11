const toggleBtn = document.getElementById('toggleBtn');
const blurBtn = document.getElementById('blurBtn');
const blurSlider = document.getElementById('blurSlider');
const blurValText = document.getElementById('blurVal');
const pill = document.getElementById('pill');

chrome.storage.local.get(['lighthouseEnabled', 'blurEnabled', 'blurAmount'], (res) => {
    const isEn = res.lighthouseEnabled !== false;
    toggleBtn.checked = isEn;
    blurBtn.checked = res.blurEnabled !== false;
    const amount = res.blurAmount || 12;
    blurSlider.value = amount;
    blurValText.innerText = amount + "px";
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

function updatePill(isEn) {
    pill.innerText = isEn ? "Active" : "Inactive";
    pill.className = isEn ? "status-pill active-pill" : "status-pill inactive-pill";
}

function sendMsg(action, status) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { action, status });
    });
}
