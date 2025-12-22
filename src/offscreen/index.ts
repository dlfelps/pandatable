// The offscreen document hosts the Pyodide worker
const worker = new Worker(new URL('../worker/pyodide-worker.ts', import.meta.url), {
  type: 'module'
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.target !== 'offscreen') return;

  const handler = (event: MessageEvent) => {
    if (event.data.type === 'RUN_COMPLETE' || event.data.type === 'ERROR' || event.data.type === 'INIT_COMPLETE') {
      worker.removeEventListener('message', handler);
      sendResponse(event.data);
    }
  };

  worker.addEventListener('message', handler);
  
  // Inject the indexURL if it's a RUN_CODE or INIT message
  const data = { 
    ...message.data, 
    indexURL: chrome.runtime.getURL('pyodide/') 
  };
  
  worker.postMessage(data);
  
  return true; // Keep channel open
});