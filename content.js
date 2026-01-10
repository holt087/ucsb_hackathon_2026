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
