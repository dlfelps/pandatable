# Specification: Side Panel Transition

## Overview
Transform the "Pandas Table Scraper" from a popup-based extension to a side panel-based one using the Chrome `sidePanel` API. This move aims to resolve issues with state loss during popup closure, allowing users to persist detected tables and code while interacting with the webpage.

## Functional Requirements
1.  **Side Panel Implementation:**
    *   Migrate the existing popup UI (`src/popup/index.html` and `src/popup/index.ts`) to a side panel configuration.
    *   Update `manifest.json` to include the `sidePanel` permission and set the side panel's default path.
    *   Remove the `default_popup` from the `action` section in `manifest.json`.

2.  **State Management (Tab-Specific):**
    *   Maintain a separate state (detected tables and CodeMirror editor content) for each browser tab.
    *   When the user switches tabs, the side panel must update to reflect the state of the active tab.
    *   When the user navigates to a new page within the same tab:
        *   Persist the written code.
        *   Clear the list of detected tables and reset the table selection.
        *   Optionally provide a way to clear the code.

3.  **Triggering:**
    *   The side panel should open when the user clicks the extension icon in the toolbar.

4.  **UI Adjustments:**
    *   Ensure the layout is responsive and works well in the narrower side panel format (typically ~300-400px wide).

## Non-Functional Requirements
*   **Performance:** Switching between tabs should feel instantaneous.
*   **Reliability:** Ensure state is correctly saved/restored even after background service worker restarts (MV3).

## Acceptance Criteria
*   Clicking the extension icon opens the side panel instead of a popup.
*   Detected tables and code persist even if the side panel is closed and reopened (while staying on the same tab).
*   Switching to a different tab updates the side panel with that tab's specific data.
*   Navigating to a new URL in the same tab clears the tables but keeps the code.

## Out of Scope
*   Multi-panel support (multiple side panels open at once).
*   Global code snippets library (to be handled in a future track).
