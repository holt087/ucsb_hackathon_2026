// content.js - Rishi's Extractor

function getMainContent() { // Define a function to get the main content from the page
  const articleTag = document.querySelector("article"); // Try to find an <article> tag first, often used for main content
  if (articleTag) return articleTag.innerText; // If an <article> exists, return its text and skip the rest

  const divs = Array.from(document.querySelectorAll("div")); // Get all <div> elements on the page and convert NodeList to an array
  let bestDiv = divs[0] || document.body; // Start with the first div (or body if there are no divs) as the candidate for main content
  let maxP = 0; // Initialize a counter for the maximum number of <p> tags found in a div

  divs.forEach(div => { // Loop through every div on the page
    const pCount = div.querySelectorAll("p").length; // Count how many <p> tags are inside this div
    if (pCount > maxP) { // If this div has more paragraphs than any previous div
      maxP = pCount; // Update the maximum paragraph count
      bestDiv = div; // Set this div as the current best candidate for main content
    } // End of if
  }); // End of loop

  return bestDiv.innerText; // Return the text content of the div with the most <p> tags
} // End of getMainContent function

function sendToAI() { // Define a function to send the extracted text to Cris' AI
  const rawText = getMainContent(); // Call getMainContent() and store the result in the variable rawText

  chrome.runtime.sendMessage( // Use Chrome's messaging API to send data to the background script
    {
      action: "CLEAN_TEXT", // This is the keyword Cris is listening for in background.js
      rawData: rawText // This is the actual text of the main content we just extracted
    }, // End of message object
    (response) => { // Callback function that runs when the background script sends back a response
      if (response.status === "success") { // Check if the AI successfully processed the text
        console.log("AI Summary received:", response.data); // Log the cleaned summary from Cris to the console
        // Optional: Here you could update the page to show the summary to the user
      } else { // If the AI returned an error
        console.error("AI Error:", response.message); // Log the error message to the console
      } // End of if/else
    } // End of callback function
  ); // End of chrome.runtime.sendMessage
} // End of sendToAI function

sendToAI(); // Call sendToAI immediately when the content script loads to start the extraction process




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
