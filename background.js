// background.js - REPLACE ENTIRE FILE
import { processArticle } from './ai-integration.js';

console.log("Focus Flow: Background Brain is awake.");

// Listen for the "handshake" from Rishi (The Extractor)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "CLEAN_TEXT") {
    console.log("Brain received raw text. Consulting Gemini...");

    // Call your function in the other file
    processArticle(message.rawData)
      .then(cleanData => {
        sendResponse({ status: "success", data: cleanData });
      })
      .catch(error => {
        console.error("AI Error:", error);
        sendResponse({ status: "error", message: error.message });
      });

    return true; // Keeps the communication line open
  }
});
