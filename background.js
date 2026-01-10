// This imports the AI function you just finished testing
import { processArticle } from './ai-integration.js';

console.log("Focus Flow: Background Brain is awake.");

// Listen for the "handshake" from Rishi (The Extractor)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
if (message.action === "CLEAN_TEXT") {
console.log("Brain received raw text. Consulting Gemini...");

// Send the text to your AI Architect function
processArticle(message.rawData)
.then(cleanData => {
// Send the AI's "Clean Path" back to the team
sendResponse({ status: "success", data: cleanData });
})
.catch(error => {
console.error("AI Error:", error);
sendResponse({ status: "error", message: error.message });
});

return true; // Required to keep the message channel open for the AI response
}
});