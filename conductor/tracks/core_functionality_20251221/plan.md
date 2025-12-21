# Track Plan: Core Functionality - Pandas Table Scraper

## Phase 1: Project Scaffolding & Build Setup
- [x] Task: Initialize Vite project with TypeScript and WebExtension plugin [689682e]
- [x] Task: Create project directory structure and basic manifest.json [2d90262]
- [ ] Task: Set up testing framework (Vitest) and basic health check test
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Project Scaffolding & Build Setup' (Protocol in workflow.md)

## Phase 2: Table Detection & Extraction (Content Script)
- [ ] Task: Write Tests for table detection logic
- [ ] Task: Implement basic `<table>` detection in content script
- [ ] Task: Write Tests for table data extraction (JSON format)
- [ ] Task: Implement table extraction with header support
- [ ] Task: Write Tests for iframe table detection
- [ ] Task: Implement same-origin iframe support
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Table Detection & Extraction' (Protocol in workflow.md)

## Phase 3: Pyodide Runtime & Background Service Worker
- [ ] Task: Set up Background Service Worker for message routing
- [ ] Task: Implement Pyodide Web Worker initialization
- [ ] Task: Write Tests for Pyodide package loading and caching
- [ ] Task: Implement IndexedDB caching for Pyodide/pandas
- [ ] Task: Write Tests for Python code execution via message bridge
- [ ] Task: Implement execution bridge: Popup -> Background -> Worker -> Pyodide
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Pyodide Runtime & Background Service Worker' (Protocol in workflow.md)

## Phase 4: Popup UI & Code Editor Integration
- [ ] Task: Create basic Popup HTML/CSS layout
- [ ] Task: Implement table selector with preview (10 rows)
- [ ] Task: Write Tests for code editor state management
- [ ] Task: Integrate CodeMirror/Monaco editor for pandas code
- [ ] Task: Implement "Run" button and link to Background Service Worker
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Popup UI & Code Editor Integration' (Protocol in workflow.md)

## Phase 5: Results Display & CSV Export
- [ ] Task: Write Tests for result formatting (Table, Text, Plot)
- [ ] Task: Implement results display panel with type-specific rendering
- [ ] Task: Implement matplotlib static image display in output panel
- [ ] Task: Write Tests for CSV export functionality
- [ ] Task: Implement "Export to CSV" button
- [ ] Task: Conductor - User Manual Verification 'Phase 5: Results Display & CSV Export' (Protocol in workflow.md)
