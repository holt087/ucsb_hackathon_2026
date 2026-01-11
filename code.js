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
let locked = false;

let lockedTarget = null;

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

    if (isEnabled) {
    ensureProgressBar();
    updateProgress();
  }

});

// Message listener from Popup
chrome.runtime.onMessage.addListener((req) => {
  if (req.action === "toggle") {
    isEnabled = req.status;
    if (!isEnabled) {
      clearLighthouse();
      removeProgressBar();
    } else {
      ensureProgressBar();
      updateProgress();
      updateLiveStyles();
    }
  }

  if (req.action === "toggleBlur") isBlurEnabled = req.status;
  if (req.action === "updateBlurAmount") blurAmount = req.status;

  if (isEnabled) updateLiveStyles();
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
    if (locked) return;
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
        currentTarget = target;

        
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
    if (locked) return;
    if (currentTarget) {
        currentTarget.classList.remove('lh-highlight');
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



