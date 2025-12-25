# Plan: Automatic Numeric Type Detection in Pyodide

This plan implements automatic detection and conversion of formatted numeric strings (currency, percentages, thousands separators) in the Pandas DataFrame within the Pyodide worker.

## Phase 1: Utility Implementation & Unit Testing
Implement the core Python utility functions for cleaning and inferring types.

- [x] Task: Create Python test suite for type detection logic `src/worker/type_detection_test.py`
- [x] Task: Implement `clean_numeric_string` helper in Python [03ca4de]
- [x] Task: Implement `infer_and_convert_column` logic in Python [03ca4de]
- [x] Task: Implement `auto_convert_dataframe` to process all object columns [03ca4de]
- [x] Task: Conductor - User Manual Verification 'Phase 1: Utility Implementation' (Protocol in workflow.md)

## Phase 2: Integration into Pyodide Worker [checkpoint: 03ca4de]
Integrate the auto-conversion utility into the existing data loading pipeline.

- [x] Task: Inject the new utility functions into the Pyodide environment on startup in `src/worker/pyodide-worker.ts`
- [x] Task: Update the `RUN_CODE` handler in `src/worker/pyodide-worker.ts` to call `auto_convert_dataframe(df)` after CSV loading
- [x] Task: Add integration test in `src/offscreen/index.test.ts` (or equivalent) to verify end-to-end conversion [via manual verification]
- [x] Task: Conductor - User Manual Verification 'Phase 2: Integration' (Protocol in workflow.md)

## Phase 3: Final Verification & Cleanup
Perform final checks and ensure documentation is up to date.

- [x] Task: Verify fix with the "Nation Population" table provided by the user [03ca4de]
- [x] Task: Ensure code coverage for new Python logic is >80% [03ca4de]
- [x] Task: Conductor - User Manual Verification 'Phase 3: Final Verification' (Protocol in workflow.md)
