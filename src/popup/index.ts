import { EditorView, basicSetup } from "codemirror";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import { MessageType } from "../types";

let editor: EditorView;
let detectedTables: any[] = [];
let lastCsvData: string | null = null;
let currentTabId: number | null = null;

const DEFAULT_CODE = `# 'df' contains the selected table
import matplotlib.pyplot as plt

print("Shape:", df.shape)
print("Columns:", df.columns.tolist())

# Try creating a plot (example)
# df.plot(kind='bar') 
# plt.show()

df.head()`;

interface TabState {
  code: string;
  tables: any[];
  selectedTableId: string;
}

async function saveState() {
  if (currentTabId === null) return;
  const state: TabState = {
    code: editor.state.doc.toString(),
    tables: detectedTables,
    selectedTableId: (document.getElementById('table-select') as HTMLSelectElement).value
  };
  const key = `tab_${currentTabId}`;
  await chrome.storage.session.set({ [key]: state });
}

async function loadState(tabId: number) {
  currentTabId = tabId;
  const key = `tab_${tabId}`;
  const result = await chrome.storage.session.get(key);
  const state = result[key] as TabState | undefined;

  // Update Editor
  const code = state?.code ?? DEFAULT_CODE;
  editor.dispatch({
    changes: { from: 0, to: editor.state.doc.length, insert: code }
  });

  // Update Tables
  detectedTables = state?.tables ?? [];
  updateTableSelect(state?.selectedTableId ?? '');
}

function updateTableSelect(selectedId: string = '') {
  const tableSelect = document.getElementById('table-select') as HTMLSelectElement;
  const runBtn = document.getElementById('run') as HTMLButtonElement;
  
  tableSelect.innerHTML = '';
  if (detectedTables.length === 0) {
    tableSelect.innerHTML = '<option value="">No tables found</option>';
    runBtn.disabled = true;
  } else {
    detectedTables.forEach((t, i) => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = `Table ${i} (${t.hasHeader ? 'H' : 'NoH'}) - ${t.id.slice(0,8)}`;
      tableSelect.appendChild(opt);
    });
    tableSelect.value = selectedId;
    runBtn.disabled = !tableSelect.value;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const detectBtn = document.getElementById('detect') as HTMLButtonElement;
  const runBtn = document.getElementById('run') as HTMLButtonElement;
  const exportBtn = document.getElementById('export-csv') as HTMLButtonElement;
  const tableSelect = document.getElementById('table-select') as HTMLSelectElement;
  const statusText = document.getElementById('status-text') as HTMLDivElement;
  const editorContainer = document.getElementById('editor-container') as HTMLDivElement;

  // Output containers
  const outText = document.getElementById('output-text') as HTMLDivElement;
  const outTable = document.getElementById('output-table') as HTMLDivElement;
  const outPlot = document.getElementById('output-plot') as HTMLDivElement;

  // Initialize CodeMirror with change listener
  editor = new EditorView({
    doc: DEFAULT_CODE,
    extensions: [
      basicSetup, 
      python(), 
      oneDark,
      EditorView.updateListener.of((update) => {
        if (update.docChanged) saveState();
      })
    ],
    parent: editorContainer
  });

  // Initialize state for current tab
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (activeTab?.id) {
    await loadState(activeTab.id);
  }

  // Listen for tab activation changes
  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    await loadState(activeInfo.tabId);
  });

  // Listen for tab content updates (e.g. navigation)
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (tabId === currentTabId && changeInfo.status === 'complete') {
      await loadState(tabId);
    }
  });

  // Listen for storage changes (e.g. background clearing tables)
  chrome.storage.onChanged.addListener(async (changes, areaName) => {
    if (areaName === 'session' && currentTabId !== null) {
      const key = `tab_${currentTabId}`;
      if (changes[key]) {
        const newState = changes[key].newValue as TabState;
        detectedTables = newState.tables;
        updateTableSelect(newState.selectedTableId);
        // We don't update code here to avoid overwriting user's active typing
      }
    }
  });

  // Tab switching (UI tabs: Console/Table/Plot)
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.output-content').forEach(c => c.classList.remove('active'));
      
      tab.classList.add('active');
      const targetId = (tab as HTMLElement).dataset.tab;
      if (targetId) document.getElementById(targetId)?.classList.add('active');
    });
  });

  // Detect Tables
  detectBtn.addEventListener('click', async () => {
    statusText.textContent = 'Detecting...';
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    chrome.tabs.sendMessage(tab.id, { type: MessageType.DETECT_TABLES }, (response) => {
      detectedTables = response?.tables || [];
      updateTableSelect();
      if (detectedTables.length > 0) {
        statusText.textContent = `Found ${detectedTables.length} tables.`;
        // Trigger highlight for first table automatically
        tableSelect.dispatchEvent(new Event('change'));
      } else {
        statusText.textContent = 'No tables found.';
      }
      saveState();
    });
  });

  // Highlight selected table on change
  tableSelect.addEventListener('change', async () => {
    const tableId = tableSelect.value;
    saveState();
    if (!tableId) return;

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'HIGHLIGHT_TABLE', tableId });
    }
  });

  // Run Python
  runBtn.addEventListener('click', async () => {
    const tableId = tableSelect.value;
    if (!tableId) return;

    outText.textContent = 'Running...';
    outTable.innerHTML = '';
    outPlot.innerHTML = '';
    runBtn.disabled = true;
    exportBtn.disabled = true;

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    chrome.tabs.sendMessage(tab.id, { type: MessageType.EXTRACT_TABLE, tableId }, (extraction) => {
      if (!extraction?.data) {
        outText.textContent = 'Extraction failed.';
        runBtn.disabled = false;
        return;
      }

      chrome.runtime.sendMessage({
        type: MessageType.RUN_PYTHON,
        code: editor.state.doc.toString(),
        data: extraction.data
      }, (response) => {
        runBtn.disabled = false;
        if (response.type === 'ERROR') {
          outText.textContent = response.error;
          // Switch to console tab on error
          document.querySelector('.tab[data-tab="output-text"]')?.dispatchEvent(new Event('click'));
        } else {
          // Fill Console
          outText.textContent = (response.stdout || '') + (response.stdout ? '\n' : '') + 
                                (typeof response.result === 'string' ? response.result : JSON.stringify(response.result, null, 2));
          
          // Fill Table
          if (response.html) {
            outTable.innerHTML = response.html;
            document.querySelector('.tab[data-tab="output-table"]')?.dispatchEvent(new Event('click'));
          }
          
          // Fill Plot
          if (response.plot) {
            const img = document.createElement('img');
            img.src = `data:image/png;base64,${response.plot}`;
            outPlot.appendChild(img);
            document.querySelector('.tab[data-tab="output-plot"]')?.dispatchEvent(new Event('click'));
          }

          // Enable CSV export if data exists
          lastCsvData = response.csv;
          exportBtn.disabled = !lastCsvData;
          statusText.textContent = 'Done.';
        }
      });
    });
  });

  // Export CSV
  exportBtn.addEventListener('click', () => {
    if (!lastCsvData) return;
    try {
      const blob = new Blob([lastCsvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `table_export_${new Date().getTime()}.csv`;
      document.body.appendChild(a); 
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      outText.textContent = 'Export Error: ' + err;
    }
  });
});

