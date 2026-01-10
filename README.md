# Lighthouse
Focus your eyes, filter the noise. A project for web accessibility and digital wellbeing.

The Problem:
The modern web is cluttered. For users with ADHD, visual processing disorders, or simply those experiencing "information overload," reading an article can be a sensory nightmare. Advertisements, sidebar popups, and dense walls of text make it difficult to maintain focus and track lines of text.

Our Solution:
Lighthouse is a browser extension designed to create a "visual spotlight" for readers. It combines a unique hover-based focus effect with a seamless ad-blocking engine to transform any webpage into a distraction-free reading environment.

## Key Features

* **Visual Spotlight:** Dynamically blurs background elements while highlighting the specific paragraph or text block under your cursor.
* **Click-to-Zoom:** Instant magnification of content for better legibility without breaking the page layout.
* **Integrated Shield:** A built-in ad blocker that prevents distracting banners and tracking scripts from loading.
* **Ghost-Space Removal:** Automatically collapses "empty" spaces left behind by blocked ads to restore the flow of the article.

## How it Works
Lighthouse uses a dual-layer approach to clean the web:

1. **The Engine (Manifest V3):** Utilizes the `declarativeNetRequest` API to block intrusive ad-server requests at the browser level before they even download.
2. **The Experience (Content Scripts):** A lightweight JavaScript engine monitors mouse movement to calculate focus zones, applying real-time CSS filters to the surrounding DOM elements.

## Project Structure

```text
├── manifest.json   # Extension configuration & ad-blocking permissions
├── rules.json      # The "Shield" - network filtering rules
├── code.js         # The "Lighthouse" - hover logic & element hider
├── styles.css      # The "Atmosphere" - blur and highlight effects
├── popup.html      # User interface & toggles
└── popup.js        # UI logic

```

## Installation & Setup

1. Clone this repository.
2. Open Chrome/Edge and navigate to `chrome://extensions`.
3. Enable **"Developer mode"** (top right toggle).
4. Click **"Load unpacked"** and select the project folder.
5. Open any news article and start reading!

## Future Roadmap

* **Customizable Blur:** Let users choose the intensity of the background blur.
* **Text-to-Speech Integration:** Highlighted text can be read aloud with a single shortcut.
* **Dynamic Rule Updates:** Fetching community-maintained blocklists (like EasyList) to keep the ad blocker current.

---

**Created for SB Hacks 2026**
