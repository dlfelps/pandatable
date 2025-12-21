# Product Guidelines - Pandas Table Scraper

## Tone and Prose Style
*   **Friendly & Educational:** The interface and documentation should be helpful, guiding users through the process of data extraction and analysis. Use clear, accessible language that provides context and helpful tips, making the tool approachable for students while remaining professional for researchers.

## Brand Messaging Principles
*   **Empowerment:** Focus on the message: "Turn the web into your personal data playground." Emphasize how the tool gives users immediate control over web data.
*   **Simplicity:** Highlight the convenience: "Data analysis without the setup or the export." Stress the friction-less transition from browsing to analyzing.
*   **Reliability:** Build trust: "Trusted pandas power, right in your browser." Assure users of the accuracy and stability of the underlying Python environment.

## Visual Identity & UI Patterns
*   **Data-First Layout:** The UI must prioritize the visibility of extracted data and the code editor. Decorative elements should be minimal to ensure the focus remains on the user's analysis.
*   **Interactive Feedback:** Provide clear and immediate visual cues for all system states. This includes progress indicators for Pyodide initialization, success/fail notifications for table extraction, and active status during code execution.

## Error Handling & User Feedback
*   **Informative & Actionable:** Errors should be treated as learning opportunities. For Python code errors, provide detailed tracebacks. For system or extraction failures, offer clear, actionable instructions (e.g., "No tables detected. Ensure the page has fully loaded or try a different tab.") to help the user resolve the issue independently.
