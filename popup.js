const toggle = document.getElementById('nightToggle');

chrome.storage.local.get('nightMode', (data) => {
  toggle.checked = !!data.nightMode;
});

toggle.addEventListener('change', () => {
  const enabled = toggle.checked;
  chrome.storage.local.set({ nightMode: enabled });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { nightMode: enabled });
    }
  });
});