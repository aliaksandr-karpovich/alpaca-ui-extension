
const DARK_MODE_ID = 'alpaca-ext-dark-mode';

function applyDarkMode(enabled) {
  let link = document.getElementById(DARK_MODE_ID);
  if (enabled) {
    if (!link) {
      link = document.createElement('link');
      link.id = DARK_MODE_ID;
      link.rel = 'stylesheet';
      link.href = chrome.runtime.getURL('dark-mode.css');
      document.head.appendChild(link);
    }
  } else if (link) {
    link.remove();
  }
}

chrome.storage.local.get('darkMode', (data) => {
  applyDarkMode(!!data.darkMode);
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.darkMode !== undefined) {
    applyDarkMode(msg.darkMode);
  }
});

async function fixPositionsTableWidth() {
  if (globalThis.location.href.startsWith('https://app.alpaca.markets/account/positions')) {
    const wrapper = document.getElementById('page-wrapper');
    if (wrapper && wrapper.children[1]) {
      const secondChild = wrapper.children[1];
      secondChild.classList.remove('max-w-6xl');
      secondChild.style.maxWidth = '1500px !important';
    }
  }
  setTimeout(fixPositionsTableWidth, 3000);
}

setTimeout(fixPositionsTableWidth, 3000);