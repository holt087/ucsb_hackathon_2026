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



///-------------------------------

document.addEventListener('DOMContentLoaded', () => {
   // Helper to get element by ID
   const el = id => document.getElementById(id);
   const send = msg =>
  chrome.tabs.query({ active:true, currentWindow:true }, t => {
    console.log("POPUP sending:", msg, "to tab", t[0]?.id);
    if (t[0]) chrome.tabs.sendMessage(t[0].id, msg);
  });



   // DOM elements
   const toggle = el('toggleBtn'),
         blur = el('blurBtn'),
         slider = el('blurSlider'),
         val = el('blurVal'),
         pill = el('pill'),
         bgBtn = el('bg-btn'),
         textBtn = el('text-btn'),
         bgInput = el('bg-color'),
         textInput = el('text-color'),
         reset = el('reset-colors');


   // Load saved state
   chrome.storage.local.get(['lighthouseEnabled','blurEnabled','blurAmount'], r => {
       toggle.checked = r.lighthouseEnabled !== false;
       blur.checked = r.blurEnabled !== false;
       slider.value = r.blurAmount || 12;
       val.innerText = slider.value + 'px';
       pill.innerText = toggle.checked ? 'Active' : 'Inactive';
       pill.className = toggle.checked ? 'status-pill active-pill' : 'status-pill inactive-pill';
       bgBtn.style.backgroundColor = bgInput.value;
       textBtn.style.backgroundColor = textInput.value;
   });


   // Helpers
   const updatePill = () => {
       pill.innerText = toggle.checked ? 'Active' : 'Inactive';
       pill.className = toggle.checked ? 'status-pill active-pill' : 'status-pill inactive-pill';
   };
   const updateColor = (input, btn, action) => {
       btn.style.backgroundColor = input.value;
       send({ action, color: input.value });
   };


   // Toggle & blur
   toggle.addEventListener('change', () => {
       updatePill();
       chrome.storage.local.set({ lighthouseEnabled: toggle.checked });
       send({ action: 'toggle', status: toggle.checked });
   });
   blur.addEventListener('change', () => {
       chrome.storage.local.set({ blurEnabled: blur.checked });
       send({ action: 'toggleBlur', status: blur.checked });
   });
   slider.addEventListener('input', () => {
       val.innerText = slider.value + 'px';
       chrome.storage.local.set({ blurAmount: slider.value });
       send({ action: 'updateBlurAmount', status: slider.value });
   });


   // Color pickers
   bgBtn.onclick = () => bgInput.click();
   textBtn.onclick = () => textInput.click();
   bgInput.oninput = () => updateColor(bgInput, bgBtn, 'setBg');
   textInput.oninput = () => updateColor(textInput, textBtn, 'setText');


   // Reset button
   reset.onclick = () => {
       bgInput.value = '#ffffff';
       textInput.value = '#000000';
       updateColor(bgInput, bgBtn, 'setBg');
       updateColor(textInput, textBtn, 'setText');
   };
});


