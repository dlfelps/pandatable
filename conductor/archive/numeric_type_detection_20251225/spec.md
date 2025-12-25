# Specification: Automatic Numeric Type Detection in Pyodide

## Overview
Enhance the data loading pipeline within the Pyodide worker to automatically identify and convert formatted string values into numeric types. This will eliminate the manual cleaning steps currently required by users before they can perform calculations or generate plots.

## Functional Requirements
1.  **Automated Cleaning Utility:** Implement a Python utility function within the worker environment that processes string columns.
2.  **Character Stripping:**
    *   Remove thousands separators (commas: `,`).
    *   Remove currency symbols (e.g., `$`, `£`, `€`).
3.  **Percentage Conversion:**
    *   Detect values ending in `%`.
    *   Strip the symbol and convert to a decimal float (e.g., `"84.3%"` -> `0.843`).
4.  **Aggressive Type Inference:**
    *   Analyze columns that are initially loaded as objects/strings.
    *   If more than 50% of non-null values in a column are numeric (or become numeric after stripping the characters above), force the column to a numeric type.
    *   Non-convertible values in these columns should be turned into `NaN`.
5.  **Integration:** Automatically apply this logic to the DataFrame (`df`) immediately after it is constructed from the extracted HTML table data, before the user's script executes.

## Non-Functional Requirements
*   **Performance:** The detection and conversion process must be efficient enough to handle tables with thousands of rows without noticeable lag in the UI.

## Acceptance Criteria
*   Columns containing values like `"$1,234.50"` are automatically converted to `float64` with the value `1234.5`.
*   Columns containing values like `"15.5%"` are automatically converted to `float64` with the value `0.155`.
*   Mixed columns where the majority of entries are numeric (e.g., `["10", "20", "N/A", "30"]`) are converted to numeric, with "N/A" becoming `NaN`.
*   The user can immediately call `df.plot()` or mathematical functions without manual string replacement.

## Out of Scope
*   Automatic detection of Date/Time formats (to be handled in a future track).
*   Automatic detection of complex units (e.g., "kg", "m/s").
