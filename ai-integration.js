// ai-integration.js
export async function processArticle(rawText) {
  const API_KEY = "AIzaSyB3Tq1WH-P6wZ31kk9x6OziTwz4qWi3RY0"; // (don't ship this long-term)
  const MODEL_NAME = "models/gemini-flash-latest"; 
  // or "models/gemini-2.5-flash" / "models/gemini-2.0-flash-lite"

  // NOTE: MODEL_NAME already includes "models/..."
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/${MODEL_NAME}:generateContent`;

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": API_KEY,
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
Rewrite the following content for ADHD readability.

Return HTML ONLY with this structure:
<h1>Title</h1>
<h2>Key takeaways</h2>
<ul><li>...</li></ul>
<h2>Clean version</h2>
Use short paragraphs (1–2 sentences max).
Use lots of bullet points.
Bold important terms with <strong>.
Add clear subheadings.
Do NOT include <style>, <script>, or external links.

CONTENT:
${rawText}
`

            }
          ]
        }
      ]
    })
  });

  const data = await response.json();
  console.log("Gemini says:", data);

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (text) return text;

  throw new Error("AI response failed: " + JSON.stringify(data));
}
