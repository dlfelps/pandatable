const OFFSCREEN_PATH = 'src/offscreen/index.html';

async function createOffscreen() {
  if (await chrome.offscreen.hasDocument?.()) return;

  await chrome.offscreen.createDocument({
    url: OFFSCREEN_PATH,
    reasons: [chrome.offscreen.Reason.WORKERS || 'WORKERS'],
    justification: 'Run Pyodide in a Web Worker for data processing',
  });
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === 'RUN_PYTHON') {
    (async () => {
      try {
        await createOffscreen();
        const response = await chrome.runtime.sendMessage({
          target: 'offscreen',
          data: {
            type: 'RUN_CODE',
            code: request.code,
            data: request.data
          }
        });
        sendResponse(response);
      } catch (error: any) {
        sendResponse({ type: 'ERROR', error: error.message });
      }
    })();
    return true; // Keep channel open
  }
});

// Open side panel on action click
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

console.log('Background Service Worker loaded');