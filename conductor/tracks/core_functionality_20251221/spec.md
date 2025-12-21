# Track Spec: Core Functionality - Pandas Table Scraper

## Overview
This track focuses on establishing the foundational components of the Pandas Table Scraper browser extension. This includes the build system, table detection and extraction logic, the Pyodide-powered Python runtime, and a basic user interface for code execution and result viewing.

## User Stories
- As a user, I want the extension to automatically find and highlight tables on the current page.
- As a user, I want to select a specific table and see a preview of its data.
- As a user, I want to write pandas code in a built-in editor and execute it against the selected table.
- As a user, I want to see the results of my code execution as a table, text, or plot.
- As a user, I want to export my final DataFrame to a CSV file.

## Functional Requirements
### 1. Project Initialization & Build Setup
- Initialize a Vite-based project with TypeScript.
- Configure `vite-plugin-web-extension` for Manifest V3.
- Set up the project structure: `src/content`, `src/background`, `src/popup`, `src/worker`.

### 2. Table Detection & Extraction (Content Script)
- Implement DOM scanning logic to find `<table>` elements.
- Extract table structure (headers and rows) into a JSON format.
- Handle same-origin iframes for table detection.
- Send detected table metadata to the popup.

### 3. Pyodide Integration (Background & Worker)
- Set up a Web Worker for Pyodide execution to avoid blocking the UI.
- Implement lazy loading and IndexedDB caching for Pyodide and pandas/numpy packages.
- Establish a communication bridge: Popup -> Background -> Worker -> Pyodide.

### 4. Code Editor & UI (Popup)
- Create a functional popup UI with a table selector.
- Integrate a code editor (CodeMirror or Monaco) for writing pandas code.
- Implement a "Run" button to trigger execution in the Pyodide worker.

### 5. Results & Export
- Display execution results in an output panel.
- Support multiple output types: Styled HTML tables, text (e.g., `df.info()`), and matplotlib plots (static images).
- Implement a "Export to CSV" button using `df.to_csv()`.

## Non-Functional Requirements
- **Security:** Ensure all user code execution is sandboxed within the Pyodide worker.
- **Performance:** Pyodide initialization should be optimized via caching; UI should remain responsive during execution.
- **Reliability:** Graceful handling of Python errors and malformed tables.

## Technical Constraints
- **Manifest V3:** Adhere to MV3 security and lifecycle constraints.
- **Bundle Size:** Optimize the extension bundle size, especially given the inclusion of a code editor and Pyodide integration.
