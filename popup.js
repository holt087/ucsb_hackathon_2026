document.getElementById('dimming-on').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'set-dimming', value: true });
    });
});

document.getElementById('dimming-off').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'set-dimming', value: false });
    });
});

