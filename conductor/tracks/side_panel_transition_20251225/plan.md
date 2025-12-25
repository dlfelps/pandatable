# Plan: Side Panel Transition

Transform the "Pandas Table Scraper" from a popup-based extension to a side panel-based one using the Chrome `sidePanel` API to ensure state persistence and better user experience.

## Phase 1: Manifest & Basic Setup
Configure the extension to support the side panel and remove the popup trigger.

- [x] Task: Update `src/manifest.json` to include `sidePanel` permission and set `default_path`. (6e9414c)
- [ ] Task: Remove `default_popup` from `action` in `manifest.json`.
- [ ] Task: Update `vite.config.ts` to ensure the side panel HTML is bundled correctly (if not already handled).
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Manifest & Basic Setup' (Protocol in workflow.md)

## Phase 2: Side Panel UI Migration
Move the existing popup logic and UI to the side panel.

- [ ] Task: Verify `src/popup/index.html` and `src/popup/index.ts` work correctly when loaded as a side panel.
- [ ] Task: Adjust CSS/Layout in `src/popup/index.html` (or a new `src/sidepanel/index.html`) for the side panel's vertical format.
- [ ] Task: Implement the extension icon click handler in `src/background/index.ts` to open the side panel.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Side Panel UI Migration' (Protocol in workflow.md)

## Phase 3: Tab-Specific State Management
Implement persistence for detected tables and code, isolated by browser tab.

- [ ] Task: Design and implement a state storage mechanism in `src/background/index.ts` or via `chrome.storage`.
- [ ] Task: Update side panel to load state based on the current active tab's ID.
- [ ] Task: Implement listeners to update the side panel when the user switches tabs or navigates to a new page.
- [ ] Task: Ensure code persists across navigations but tables are cleared, as per specification.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Tab-Specific State Management' (Protocol in workflow.md)

## Phase 4: Testing & Quality Assurance
Verify the transition and ensure no regressions.

- [ ] Task: Write unit tests for the new state management logic.
- [ ] Task: Perform integration testing across multiple tabs and navigations.
- [ ] Task: Final code review and cleanup.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Testing & Quality Assurance' (Protocol in workflow.md)
