import { MessageType } from '../types';

document.addEventListener('DOMContentLoaded', () => {
  const detectBtn = document.getElementById('detect');
  const runBtn = document.getElementById('run');
  const resultsDiv = document.getElementById('results');

  detectBtn?.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    chrome.tabs.sendMessage(tab.id, { type: MessageType.DETECT_TABLES }, (response) => {
      if (resultsDiv) {
        resultsDiv.textContent = JSON.stringify(response, null, 2);
      }
    });
  });

  runBtn?.addEventListener('click', () => {
    if (resultsDiv) resultsDiv.textContent = 'Running Python... (Loading Pyodide for the first time may take 10-20s)';
    
    chrome.runtime.sendMessage({
      type: MessageType.RUN_PYTHON,
      code: 'import pandas as pd\ndf = pd.DataFrame({"a": [1, 2], "b": [3, 4]})\ndf.to_json(orient="records")',
      data: []
    }, (response) => {
      if (resultsDiv) {
        if (response.type === 'ERROR') {
          resultsDiv.textContent = 'Error: ' + response.error;
        } else {
          resultsDiv.textContent = 'Result: ' + JSON.stringify(response.result, null, 2);
        }
      }
    });
  });
});
