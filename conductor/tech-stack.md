# Technology Stack - Pandas Table Scraper

## Core Runtime & Languages
*   **Extension Logic:** TypeScript / JavaScript (ES6+)
*   **Python Runtime:** [Pyodide](https://pyodide.org/) (WebAssembly-based Python 3.11+ environment)
*   **Python Libraries:** [pandas](https://pandas.pydata.org/), [NumPy](https://numpy.org/), [Matplotlib](https://matplotlib.org/) (installed via micropip in Pyodide)

## Frontend & UI
*   **Framework:** Vanilla TypeScript (for maximum performance and minimum bundle size)
*   **Build Tool:** [Vite](https://vitejs.dev/) with specialized configuration for WebExtensions
*   **Code Editor:** [CodeMirror 6](https://codemirror.net/) or [Monaco Editor](https://microsoft.github.io/monaco-editor/) (to be finalized based on bundle size constraints)

## Storage & State Management
*   **Persistent Data:** [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) (via a library like `idb`) for caching Pyodide packages and large DataFrames
*   **Configuration & History:** [chrome.storage.local](https://developer.chrome.com/docs/extensions/reference/storage/) for user settings, snippets, and execution history
*   **State Persistence:** IndexedDB-backed recovery system to handle Manifest V3 service worker restarts

## Extension Architecture
*   **Manifest Version:** Manifest V3
*   **Components:**
    *   **Content Scripts:** DOM analysis and table extraction (TypeScript)
    *   **Background Service Worker:** Lifecycle management and message routing (TypeScript)
    *   **Web Worker:** Isolated Pyodide execution environment to prevent UI blocking
    *   **Popup UI:** Main interface for analysis and visualization (HTML/TypeScript)

## Build & Deployment
*   **Environment:** Node.js 18+
*   **Package Manager:** npm / pnpm
*   **Build Target:** Chrome (Manifest V3)
