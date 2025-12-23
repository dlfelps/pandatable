# Track Plan: Core Functionality - Pandas Table Scraper

## Phase 1: Project Scaffolding & Build Setup
- [x] Task: Initialize Vite project with TypeScript and WebExtension plugin [689682e]
- [x] Task: Create project directory structure and basic manifest.json [2d90262]
- [x] Task: Set up testing framework (Vitest) and basic health check test [8ec1bed]
- [x] Task: Conductor - User Manual Verification 'Phase 1: Project Scaffolding & Build Setup' (Protocol in workflow.md) [2f5b993]

## Phase 2: Table Detection & Extraction (Content Script)
- [x] Task: Write Tests for table detection logic [362f3aa]
- [x] Task: Implement basic `<table>` detection in content script [362f3aa]
- [x] Task: Write Tests for table data extraction (JSON format) [362f3aa]
- [x] Task: Implement table extraction with header support [362f3aa]
- [x] Task: Write Tests for iframe table detection [362f3aa]
- [x] Task: Implement same-origin iframe support [362f3aa]
- [x] Task: Conductor - User Manual Verification 'Phase 2: Table Detection & Extraction' (Protocol in workflow.md) [ceed1c9]

## Phase 3: Pyodide Runtime & Background Service Worker
- [x] Task: Set up Background Service Worker for message routing [653500f]
- [x] Task: Implement Pyodide Web Worker initialization [653500f]
- [x] Task: Implement Offscreen Document for Pyodide hosting [653500f]
- [x] Task: Implement fully local asset bundling for Pyodide/pandas [653500f]
- [x] Task: Implement execution bridge: Popup -> Background -> Offscreen -> Worker -> Pyodide [653500f]
- [x] Task: Conductor - User Manual Verification 'Phase 3: Pyodide Runtime & Background Service Worker' (Protocol in workflow.md) [653500f]

## Phase 4: Popup UI & Code Editor Integration
- [x] Task: Create basic Popup HTML/CSS layout [653500f]
- [x] Task: Implement table selector with visual highlighting [latest]
- [x] Task: Integrate CodeMirror editor for pandas code [latest]
- [x] Task: Implement "Run" button and link to Background/Offscreen [latest]
- [x] Task: Conductor - User Manual Verification 'Phase 4: Popup UI & Code Editor Integration' [latest]

## Phase 5: Results Display & CSV Export
- [x] Task: Implement tabbed results panel (Console, Table, Plot) [latest]
- [x] Task: Implement matplotlib static image capture and display [latest]
- [x] Task: Implement "Export to CSV" functionality [latest]
- [x] Task: Conductor - User Manual Verification 'Phase 5: Results Display & CSV Export' [latest]
