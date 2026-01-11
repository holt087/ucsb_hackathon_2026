let locked = false;
let lockedTarget = null;


function getMainContainer() {
  return document.querySelector("#mw-content-text")     // Wikipedia body
    || document.querySelector("#content")              // Wikipedia content wrapper
    || document.querySelector("article")
    || document.querySelector("main")
    || document.querySelector("#main")
    || document.querySelector(".post")
    || document.body;
}

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
    if (isEnabled) {
    ensureProgressBar();
    updateProgress();
  }
});

function getReadingRoot() {
  return document.getElementById("focusflow-panel") || document.body;
}

chrome.runtime.onMessage.addListener((req) => {

  if (req.action === "setBg") {
    const root = getReadingRoot();
    if (!root) return;
    root.style.backgroundColor = req.color;
    return;
  }

  if (req.action === "setText") {
    const root = getReadingRoot();
    if (!root) return;

    root.style.color = req.color;
    root.querySelectorAll('p, span, li, a, h1, h2, h3, h4').forEach(el => {
      el.style.color = req.color;
    });
    return;
  }

  // everything else keeps going
  if (req.action === "toggle") isEnabled = req.status;
  if (req.action === "toggleBlur") isBlurEnabled = req.status;
  if (req.action === "updateBlurAmount") blurAmount = req.status;
  if (req.action === "updateZoomAmount") zoomAmount = req.status;

  if (!isEnabled) {
    clearLighthouse();
    removeProgressBar();
  } else {
    ensureProgressBar();
    updateProgress();
    updateLiveStyles();
  }
});



chrome.runtime.onMessage.addListener((req) => {
    console.log("CONTENT got message:", req);
    if (req.action === "toggle") isEnabled = req.status;
    if (req.action === "toggleBlur") isBlurEnabled = req.status;
    if (req.action === "updateBlurAmount") blurAmount = req.status;
    if (req.action === "updateZoomAmount") zoomAmount = req.status;
    
    if (!isEnabled) {
        clearLighthouse();
        removeProgressBar();
    } else {
        ensureProgressBar();
      updateProgress();
        updateLiveStyles();
    }

  if (isEnabled) updateLiveStyles();
});

function updateLiveStyles() {
    document.documentElement.style.setProperty('--lh-zoom-level', zoomAmount);
    document.documentElement.style.setProperty('--lh-blur-size', blurAmount + 'px');

    if (isBlurEnabled && isEnabled) {
        document.body.classList.add('lh-blur-on');
        document.documentElement.style.setProperty('--lh-blur-size', blurAmount + 'px');
    } else {
        document.body.classList.remove('lh-blur-on');
    }
}

document.addEventListener('mouseover', (e) => {
    if (!isEnabled) return;
    if (locked) return;
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
        currentTarget=target;
        
        updateLiveStyles();
    }
});

document.addEventListener('mousemove', (e) => {
    if(locked) return;
    if (currentTarget) {
        const rect = currentTarget.getBoundingClientRect();
        const buffer = 60;
        if (e.clientX < rect.left - buffer || e.clientX > rect.right + buffer || 
            e.clientY < rect.top - buffer || e.clientY > rect.bottom + buffer) {
            clearLighthouse();
        }
    }
});

window.addEventListener("scroll", () => {
  if (!isEnabled) return;
  updateProgress();
}, { passive: true });

window.addEventListener("resize", () => {
  if (!isEnabled) return;
  updateProgress();
});

function clearLighthouse() {
    if (currentTarget) {
        currentTarget.classList.remove('lh-highlight', 'lh-img-highlight');
        currentTarget = null;
    }
    document.body.classList.remove('lh-blur-on');
}

function ensureProgressBar() {
  if (document.getElementById("lh-progress-wrap")) return;

  const wrap = document.createElement("div");
  wrap.id = "lh-progress-wrap";
  wrap.style.position = "fixed";
  wrap.style.top = "0";
  wrap.style.left = "0";
  wrap.style.width = "100vw";
  wrap.style.height = "6px";
  wrap.style.zIndex = "2147483647";
  wrap.style.background = "rgba(0,0,0,0.15)";

  const bar = document.createElement("div");
  bar.id = "lh-progress-bar";
  bar.style.height = "100%";
  bar.style.width = "0%";
  bar.style.background = "#228be6";
  bar.style.transition = "width 0.1s linear";

  wrap.appendChild(bar);
  document.documentElement.appendChild(wrap);
}

function removeProgressBar() {
  document.getElementById("lh-progress-wrap")?.remove();
}

function updateProgress() {
  const main = getMainContainer();
  if (!main) return;

  // Where the content starts in the document
  const startY = window.scrollY + main.getBoundingClientRect().top;

  // How tall the content actually is (scrollable height)
  const contentHeight =
    (main === document.body || main === document.documentElement)
      ? document.documentElement.scrollHeight
      : main.scrollHeight;

  // How far the viewport has moved through the content
  const viewportBottom = window.scrollY + window.innerHeight;
  const current = viewportBottom - startY;

  let pct = (current / contentHeight) * 100;
  pct = Math.max(0, Math.min(100, pct));

  const bar = document.getElementById("lh-progress-bar");
  if (bar) bar.style.width = pct.toFixed(1) + "%";
}




document.addEventListener("click", (e) => {
    if (!isEnabled || !currentTarget) return;

    locked = !locked;

    if (locked) {
        lockedTarget = currentTarget;
        lockedTarget.classList.add("lh-locked");
    } else {
        lockedTarget?.classList.remove("lh-locked");
        lockedTarget = null;
    }

    e.preventDefault();
    e.stopPropagation();
}, true);

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && locked) {
        locked = false;
        lockedTarget?.classList.remove("lh-locked");
        lockedTarget = null;
    }
});
