// --- EXTRACT ---

// 1. Try to grab the main article or post
let mainElement = document.querySelector("article") || document.querySelector("#main") || document.querySelector(".post");

// 2. If that fails, pick the div with the most paragraphs
if (!mainElement) {
    const divs = Array.from(document.querySelectorAll("div"));
    divs.sort((a, b) => b.querySelectorAll("p").length - a.querySelectorAll("p").length);
    mainElement = divs[0];
}

// 3. Extract the title and text
const extractedContent = {
    title: document.title,
    text: mainElement ? mainElement.innerText : ""
};

// 4. Show it in the console
console.log("Content for AI:", extractedContent);



// --- Adblocker ---

// content.js
function hideAds() {
    // List of common ad selectors
    const selectors = [
        'iframe[src*="doubleclick"]',
        'iframe[src*="googlesyndication"]',
        'iframe[src*="amazon-adsystem"]',
        '[id^="ad-"]',          // IDs starting with "ad-"
        '[class*="ad-"]',       // Classes containing "ad-"
        '[class*="ads"]',       // Classes containing "ads"
        '[data-ad]'             // Any element with data-ad attribute
    ];

    // Hide all matching elements
    document.querySelectorAll(selectors.join(',')).forEach(el => {
        el.style.display = 'none';
    });
}

// Run immediately
hideAds();

// Watch for dynamically added content
const observer = new MutationObserver(hideAds);
observer.observe(document.body, { childList: true, subtree: true });
// 5. SEND TO THE BRAIN (The Bridge)
if (extractedContent.text.length > 0) {
    console.log("Sending text to AI Architect...");
    
    chrome.runtime.sendMessage({
        action: "CLEAN_TEXT",      // Your Keyword
        rawData: extractedContent.text // Your Variable
    }, (response) => {
        if (chrome.runtime.lastError) {
            console.error("Error sending to background:", chrome.runtime.lastError);
        } else if (response && response.status === "success") {
            console.log("AI BRAIN SUCCESS:", response.data);
            // Now the UI Specialist can use response.data to show the summary!
        }
    });
}
