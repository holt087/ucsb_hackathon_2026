let dimmingEnabled = false; // start Off
let focusedParagraph = null;
let mainArticle = null;

// Detect main article
function detectMainArticle() {
    const article = document.querySelector('article') || document.querySelector('main') || document.querySelector('body');
    if (article) {
        article.classList.add('focus-article');
        mainArticle = article;
    }
}

// Enable focus mode on clicked paragraph
function enableFocusMode(p) {
    focusedParagraph = p;
    p.classList.add('focused');
    document.body.classList.add('focused-active');

    // Auto-scroll paragraph to center
    const rect = p.getBoundingClientRect();
    const scrollTop = window.scrollY || window.pageYOffset;
    const targetY = scrollTop + rect.top - window.innerHeight / 2 + rect.height / 2;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
}

// Exit focus mode
function exitFocusMode() {
    if (!focusedParagraph) return;
    focusedParagraph.classList.remove('focused');
    focusedParagraph = null;
    document.body.classList.remove('focused-active');
}

// Setup paragraphs for hover + click
function setupParagraphs() {
    if (!mainArticle) return;

    const paragraphs = mainArticle.querySelectorAll('p');

    paragraphs.forEach(p => {
        // Remove old listeners
        p.onmouseenter = null;
        p.onmouseleave = null;
        p.onclick = null;

        if (dimmingEnabled) {
            // Hover effect
            p.addEventListener('mouseenter', () => {
                p.classList.add('hovered');
                mainArticle.classList.add('hover-active');
            });

            p.addEventListener('mouseleave', () => {
                p.classList.remove('hovered');
                mainArticle.classList.remove('hover-active');
            });

            // Click to focus
            p.addEventListener('click', (e) => {
                enableFocusMode(p);
                e.stopPropagation(); // prevent exit immediately
            });
        }
    });
}

// Listen for On/Off toggle from popup
chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === 'set-dimming') {
        dimmingEnabled = msg.value;

        if (dimmingEnabled) {
            // ON button: enable hover/focus logic
            detectMainArticle();
            setupParagraphs();
        } else {
            // OFF button: restore page fully
            if (mainArticle) {
                // Remove hover/focus classes
                mainArticle.classList.remove('hover-active', 'focus-article');
                mainArticle.querySelectorAll('p').forEach(p => {
                    p.classList.remove('hovered', 'focused');

                    // Remove all inline styles added by JS
                    p.style.transform = '';
                    p.style.opacity = '';
                    p.style.position = '';
                    p.style.top = '';
                    p.style.left = '';
                    p.style.zIndex = '';
                    p.style.backgroundColor = '';
                    p.style.color = '';
                    p.style.padding = '';
                    p.style.borderRadius = '';
                    p.style.maxWidth = '';
                    p.style.lineHeight = '';
                    p.style.boxShadow = '';
                });
                mainArticle = null;
            }

            // Remove any body-level classes
            document.body.classList.remove('focused-active', 'focus-dimmed');

            // Reset header inline styles
            const header = document.querySelector('header');
            if (header) {
                header.style.top = '';
                header.style.position = '';
                header.style.width = '';
                header.style.zIndex = '';
            }
        }
    }
});


// Exit focus mode if clicking outside the focused paragraph
document.addEventListener('click', (e) => {
    // Ignore clicks on your extension's button/popup
    if (e.target.closest('#your-toggle-button-id')) return;

    if (focusedParagraph && !focusedParagraph.contains(e.target)) {
        exitFocusMode();
    }
});

// Header auto-hide / show on mouse hover at top
const header = document.querySelector('header');
if (header) {
    header.style.top = '0'; // header starts visible
    let lastScroll = window.scrollY;

    // Show header when hovering at top
    document.addEventListener('mousemove', (e) => {
        if (e.clientY <= 5) {
            header.style.top = '0';
        }
    });

    // Hide header when scrolling down
    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        if (currentScroll > lastScroll) {
            header.style.top = '-60px'; // slide header up
        }
        lastScroll = currentScroll;
    });
};



