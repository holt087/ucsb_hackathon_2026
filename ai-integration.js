import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Initialize the API (Put your key here from Google AI Studio)
const API_KEY = "";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// 2. The main function to clean the text
export async function processArticle(rawText) {
  const prompt = `
    You are an ADHD Focus Assistant. 
    I will provide raw text from a webpage. 
    1. Remove all ads, "click here", and related link text.
    2. Extract the core story or educational content.
    3. Return it as a simple list of clear, bold points.
    
    Text to process: ${rawText}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text(); 
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error processing text.";
  }
}
// 2. THIS IS YOUR TEST - It runs automatically when you start the file
console.log("--- AI TEST STARTING ---");
processArticle("The University of California, Santa Barbara is a leading research university.")
  .then(summary => {
    console.log("AI SAYS:", summary);
    console.log("--- TEST SUCCESSFUL ---");
  })
  .catch(err => console.error("TEST FAILED:", err));
