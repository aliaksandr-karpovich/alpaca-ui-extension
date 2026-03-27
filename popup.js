const toggle = document.getElementById('darkToggle');

chrome.storage.local.get('darkMode', (data) => {
  toggle.checked = !!data.darkMode;
});

toggle.addEventListener('change', () => {
  const enabled = toggle.checked;
  chrome.storage.local.set({ darkMode: enabled });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { darkMode: enabled });
    }
  });
});