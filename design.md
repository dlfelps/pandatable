# Pandas Table Scraper Browser Extension - Design Document

## Project Overview

A browser extension that allows users to scrape HTML tables from any webpage and execute pandas DataFrame operations directly in the browser using Pyodide, without needing to export data or switch to a Python environment.

## Goals

- Enable one-click table extraction from any webpage
- Provide an interactive pandas environment in the browser
- Support common data manipulation, analysis, and visualization tasks
- Work offline after initial setup
- Maintain good performance despite Pyodide’s overhead

## Non-Goals (v1)

- Scraping complex nested structures beyond tables
- Supporting languages other than Python/pandas
- Real-time collaboration features
- Cloud storage/sync of scraped data

## Target Users

- Data analysts who frequently work with web data
- Researchers gathering data from online sources
- Developers prototyping data pipelines
- Students learning pandas/data analysis

## Technical Architecture

### Technology Stack

- **Framework**: Browser Extension (Chrome/Firefox compatible)
- **Manifest**: Manifest V3 (for Chrome compatibility)
- **Python Runtime**: Pyodide 0.25+
- **Python Libraries**: pandas, numpy, matplotlib (via Pyodide)
- **UI Framework**: React or Vanilla JS (TBD based on complexity)
- **Build Tool**: Webpack or Vite

### Extension Components

#### 1. Content Script (`content.js`)

**Purpose**: Interacts with the webpage DOM

**Responsibilities**:

- Detect tables on the current page
- Extract table data (HTML → structured JSON)
- Highlight tables on hover (optional feature)
- Inject scraped data indicator/badge
- Listen for messages from popup/sidepanel

**Key Functions**:

```javascript
// Detect all tables on page
function detectTables() -> Array<TableMetadata>

// Extract specific table to JSON
function extractTable(tableIndex) -> JSON

// Parse HTML table to array of objects
function parseHTMLTable(tableElement) -> Array<Object>
```

#### 2. Popup/Side Panel (`popup.html`, `popup.js`)

**Purpose**: Main user interface

**Features**:

- List detected tables with preview
- Table selection interface
- Code editor for pandas operations (Monaco Editor or CodeMirror)
- Output display area
- Export options (CSV, JSON, HTML)

**UI Sections**:

1. **Table Selector**: Dropdown or list of detected tables
1. **Data Preview**: First 10 rows of selected table
1. **Code Editor**: Write pandas code
1. **Execute Button**: Run the code
1. **Output Panel**: Display results (text, table, or plot)
1. **Action Buttons**: Export, Clear, Save Snippet

#### 3. Background Service Worker (`background.js`)

**Purpose**: Manage Pyodide runtime and message routing

**Responsibilities**:

- Initialize Pyodide on extension install/update
- Cache Pyodide and pandas packages
- Route messages between content script and popup
- Manage Pyodide worker lifecycle
- Handle error logging and recovery

**Key Functions**:

```javascript
// Initialize Pyodide runtime
async function initPyodide() -> PyodideInstance

// Execute pandas code
async function executePandasCode(code, dataframe) -> Result

// Load additional packages
async function loadPackage(packageName) -> void
```

#### 4. Pyodide Worker (`pyodide-worker.js`)

**Purpose**: Isolated environment for Python execution

**Responsibilities**:

- Run Pyodide in a Web Worker (off main thread)
- Execute user’s pandas code
- Return results to background script
- Handle Python errors gracefully
- Manage DataFrame state between executions

**Communication Flow**:

```
Popup → Background → Worker → Pyodide → Worker → Background → Popup
```

### Data Flow

```
┌─────────────┐
│ Webpage │
│ (Table) │
└──────┬──────┘
│
▼
┌─────────────────┐
│ Content Script │ ← Detects & extracts table
│ (DOM Parser) │
└──────┬──────────┘
│ postMessage
▼
┌─────────────────┐
│ Background SW │ ← Routes data
└──────┬──────────┘
│
▼
┌─────────────────┐
│ Pyodide Worker │ ← Converts to DataFrame
│ (Web Worker) │ Executes pandas code
└──────┬──────────┘
│
▼
┌─────────────────┐
│ Popup/Panel │ ← Displays results
│ (UI) │
└─────────────────┘
```

## Core Features

### Feature 1: Table Detection & Extraction

**Implementation**:

- Scan DOM for `<table>` elements
- Parse table headers (`<th>`) and rows (`<td>`)
- Handle colspan/rowspan
- Support nested tables (extract independently)
- Generate metadata: row count, column count, headers

**Edge Cases**:

- Tables without headers → use column indices
- Mixed data types in columns
- Empty cells → null/NaN
- Tables with merged cells
- Dynamically loaded tables (wait for load)

### Feature 2: Pyodide Integration

**Initialization Strategy**:

- Lazy loading: Load Pyodide only when user first opens popup
- Cache strategy: Store Pyodide files in extension storage
- Progressive loading: Load core first, then pandas on demand

**Package Management**:

```javascript
// Initial packages to load
const CORE_PACKAGES = ['pandas', 'numpy'];
const OPTIONAL_PACKAGES = ['matplotlib', 'scipy', 'scikit-learn'];
```

**Memory Management**:

- Limit DataFrame size (warn if >10k rows)
- Clear old DataFrames between runs
- Implement garbage collection triggers

### Feature 3: Interactive Code Editor

**Editor Features**:

- Syntax highlighting for Python
- Autocomplete for pandas methods
- Code snippets/templates
- Error highlighting
- Line numbers

**Pre-loaded Code Snippets**:

```python
# Example snippets
df.head()
df.describe()
df.info()
df.groupby('column').sum()
df.plot(kind='bar')
```

**Built-in Variables**:

- `df`: Current DataFrame
- `pd`: pandas module
- `np`: numpy module

### Feature 4: Result Visualization

**Output Types**:

1. **Text Output**:
- `df.info()`, `df.describe()` → formatted text
1. **Table Output**:
- DataFrame display → HTML table (styled)
- Pagination for large results
1. **Plot Output**:
- matplotlib figures → PNG/SVG base64
- Display in output panel
1. **Error Output**:
- Python tracebacks → formatted, user-friendly

### Feature 5: Export Functionality

**Export Formats**:

- CSV (via `df.to_csv()`)
- JSON (via `df.to_json()`)
- Excel (via `df.to_excel()` if openpyxl available)
- HTML table
- Copy to clipboard

**Export Triggers**:

- Button in UI after code execution
- Right-click context menu
- Keyboard shortcut

## User Workflows

### Primary Workflow: Quick Analysis

1. User navigates to webpage with table
1. Clicks extension icon → popup opens
1. Extension auto-detects tables, shows count
1. User selects table from dropdown
1. Table preview loads in popup
1. User writes pandas code: `df.groupby('Category').mean()`
1. Clicks “Run” button
1. Results display in output panel
1. User exports to CSV

### Secondary Workflow: Multi-step Analysis

1. User scrapes table (as above)
1. Executes first operation: `df = df[df['Price'] > 100]`
1. DataFrame state persists
1. Executes second operation: `df.plot(x='Date', y='Price')`
1. Plot displays in output panel
1. User saves both code snippets for reuse

### Workflow: Batch Processing

1. User opens multiple tabs with similar tables
1. For each tab:
- Extension detects table
- User runs saved snippet
- Results auto-exported to downloads
1. User combines CSVs in local pandas environment

## Technical Challenges & Solutions

### Challenge 1: Pyodide Size (~100MB)

**Solutions**:

- **On-demand loading**: Only load when extension is first opened
- **IndexedDB caching**: Store Pyodide files locally after first download
- **CDN usage**: Load from Pyodide CDN, fall back to bundled version
- **Lazy package loading**: Load numpy/pandas only when needed

**Implementation**:

```javascript
// Check if Pyodide is cached
const cachedPyodide = await checkCache();
if (!cachedPyodide) {
showLoadingIndicator("Downloading Pyodide (one-time, ~50MB)...");
await downloadAndCachePyodide();
}
```

### Challenge 2: Loading Time (3-5 seconds)

**Solutions**:

- Pre-initialize in background on extension install
- Show progress indicator with ETA
- Keep worker alive for session (don’t reload)
- Warm start: Pre-load common packages

**UX Strategy**:

```
First time: "Setting up Python environment... 3s"
Subsequent: "Loading... 0.5s" (from cache)
```

### Challenge 3: Memory Constraints

**Solutions**:

- Limit DataFrame size (warn at 10k rows, block at 50k)
- Clear DataFrames between sessions
- Implement “large dataset” mode with sampling
- Monitor memory usage, show warnings

**Code Example**:

```javascript
if (rowCount > 10000) {
showWarning("Large table detected. Consider sampling for better performance.");
offerSamplingOption(); // df.sample(n=5000)
}
```

### Challenge 4: Manifest V3 Restrictions

**Issue**: Service workers have limited lifetime, can’t maintain persistent state

**Solutions**:

- Use IndexedDB for DataFrame persistence
- Keep worker alive with keepalive messages
- Store execution history in chrome.storage.local
- Implement state recovery on worker restart

### Challenge 5: Cross-Origin Tables

**Issue**: Some tables might be in iframes from different origins

**Solutions**:

- Request `<all_urls>` permission
- Detect iframe tables, warn user
- Provide “inject script” option for user consent
- Fall back to manual copy-paste option

## Security Considerations

### Sandboxing

- Pyodide runs in isolated Web Worker (no DOM access)
- User code cannot access extension APIs
- No network requests from user code (disable fetch/XMLHttpRequest)

### Input Validation

- Sanitize table data before passing to Pyodide
- Validate user code (basic checks for malicious patterns)
- Limit execution time (timeout after 30s)
- Limit output size (truncate large results)

### Permissions

- `offscreen`: For running Pyodide in a separate context
- `host_permissions`: `<all_urls>` for content script injection
- No unnecessary permissions

## Performance Optimization

### Optimization Strategies

1. **Web Worker Usage**: Keep Pyodide off main thread
1. **Streaming Results**: Send partial results for large operations
1. **DataFrame Caching**: Cache converted DataFrames, avoid re-parsing
1. **Code Memoization**: Cache results of identical code
1. **Incremental Loading**: Load table data in chunks for large tables

### Performance Targets

- Table detection: <100ms
- Table extraction: <500ms for typical table
- Pyodide initialization: <5s first time, <1s cached
- Code execution: <2s for typical operation
- UI responsiveness: Never block >100ms

## Error Handling

### Error Types & Responses

1. **Table Extraction Errors**:
- No tables found → “No tables detected on this page”
- Malformed table → Attempt recovery, show warning
1. **Pyodide Loading Errors**:
- Network failure → Retry with exponential backoff
- Corrupted cache → Clear and re-download
1. **Code Execution Errors**:
- Syntax error → Show Python traceback
- Runtime error → User-friendly message + traceback
- Timeout → “Execution took too long (>30s)”
1. **Memory Errors**:
- Out of memory → Suggest smaller dataset
- Quota exceeded → Clear cache option

### Error Recovery

- Auto-retry for transient failures
- Graceful degradation (disable features vs. full crash)
- Error reporting to analytics (opt-in)
- Clear error messages with actionable solutions

## UI/UX Design

### UI Framework Choice

**Option A: Vanilla JS** (Recommended for v1)

- Pros: Smaller bundle, faster load
- Cons: More code for complex UI

**Option B: React**

- Pros: Better for complex state management
- Cons: Larger bundle size

**Recommendation**: Start with Vanilla JS, migrate to React if needed

### Visual Design

**Color Scheme**:

- Primary: Blue (#2563eb) - for action buttons
- Secondary: Gray (#6b7280) - for text
- Success: Green (#10b981) - for successful execution
- Error: Red (#ef4444) - for errors
- Background: White/Light gray

**Layout**:

```
┌─────────────────────────────────────┐
│ Pandas Table Scraper [ X ] │
├─────────────────────────────────────┤
│ Tables Found: 3 │
│ ┌─────────────────────────────┐ │
│ │ Select Table ▼ │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────────┤
│ Preview (5 rows) │
│ ┌─────────────────────────────┐ │
│ │ Col1 │ Col2 │ Col3 │ │
│ │ ---- │ ---- │ ---- │ │
│ │ data │ data │ data │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────────┤
│ Code Editor │
│ ┌─────────────────────────────┐ │
│ │ df.head() │ │
│ │ │ │
│ └─────────────────────────────┘ │
│ [Run Code] [Clear] [Snippets▼] │
├─────────────────────────────────────┤
│ Output │
│ ┌─────────────────────────────┐ │
│ │ Results appear here │ │
│ └─────────────────────────────┘ │
│ [Export▼] [Copy] │
└─────────────────────────────────────┘
```

### Responsive Behavior

- Minimum width: 400px
- Resizable side panel option
- Adapt to different screen sizes
- Mobile: Not supported (desktop extension only)

## Testing Strategy

### Unit Tests

- Table parser functions
- Data type detection
- Error handling
- Message passing

### Integration Tests

- Content script ↔ Background communication
- Pyodide loading and execution
- Export functionality
- Cache management

### E2E Tests

- Full workflow: detect → extract → execute → export
- Multiple tables on page
- Large dataset handling
- Error scenarios

### Manual Testing

- Test on popular websites (Wikipedia, GitHub, data portals)
- Different table structures
- Performance with large tables
- Cross-browser compatibility

### Test Websites

- Wikipedia (complex tables)
- Google Finance (dynamic tables)
- Government data portals (large datasets)
- GitHub (markdown tables)

## Deployment & Distribution

### Build Process

```bash
npm run build # Production build
npm run build:chrome # Chrome-specific
npm run build:firefox # Firefox-specific
npm run test # Run tests
npm run lint # Code linting
```

### Release Checklist

- [ ] Update version number
- [ ] Run all tests
- [ ] Build for Chrome and Firefox
- [ ] Test on both browsers
- [ ] Update changelog
- [ ] Create release notes
- [ ] Submit to Chrome Web Store
- [ ] Submit to Firefox Add-ons

### Versioning

- Follow semantic versioning (MAJOR.MINOR.PATCH)
- v0.1.0: MVP with basic functionality
- v0.2.0: Add visualizations
- v0.3.0: Add advanced features
- v1.0.0: Production-ready release

## Future Enhancements (Post-v1)

### Phase 2 Features

- Support for multiple DataFrame tabs
- Code history and favorites
- Export to Google Sheets/Excel online
- Jupyter notebook export (.ipynb)
- Custom CSS selectors for scraping

### Phase 3 Features

- Scrape beyond tables (lists, cards, etc.)
- Schedule periodic scraping
- Diff detection (alert on table changes)
- Integration with data visualization tools
- Collaboration features (share snippets)

### Advanced Features

- Machine learning with scikit-learn
- Natural language queries (GPT integration)
- Automated data cleaning suggestions
- Database export (SQLite, PostgreSQL)
- API endpoint creation from scraped data

## Success Metrics

### Adoption Metrics

- Number of installs
- Daily active users (DAU)
- Weekly active users (WAU)
- User retention (D7, D30)

### Engagement Metrics

- Tables scraped per user
- Average code executions per session
- Most used pandas operations
- Export format preferences

### Performance Metrics

- Average load time
- Code execution time (p50, p95, p99)
- Error rate
- Crash rate

### Quality Metrics

- User ratings (target: >4.5/5)
- Support ticket volume
- Bug reports per version
- Feature requests

## Documentation Requirements

### User Documentation

- Getting started guide
- Video tutorial (2-3 minutes)
- pandas code examples
- FAQ section
- Troubleshooting guide

### Developer Documentation

- Architecture overview
- Setup instructions
- Contributing guidelines
- API documentation
- Code comments

## Project Timeline

### Phase 1: MVP (4-6 weeks)

- Week 1-2: Project setup, architecture, table detection
- Week 3-4: Pyodide integration, basic UI
- Week 5: Code editor, execution, output display
- Week 6: Testing, bug fixes, polish

### Phase 2: Beta Release (2-3 weeks)

- Week 7: User testing, feedback
- Week 8: Bug fixes, performance optimization
- Week 9: Documentation, prepare for launch

### Phase 3: Public Release (1-2 weeks)

- Week 10: Submit to stores, marketing
- Week 11: Monitor, support, iterate

## Open Questions

1. Should we support Python packages beyond pandas? (matplotlib, seaborn, plotly)
1. What’s the optimal max DataFrame size before warning?
1. Should we implement collaborative features in v1?
1. How to handle tables that update dynamically (websockets/polling)?
1. Should we provide a “headless mode” for automation?
1. Pricing: Free with optional premium features?

## Resources & References

### Key Technologies

- Pyodide: https://pyodide.org/
- Pandas: https://pandas.pydata.org/
- Chrome Extensions: https://developer.chrome.com/docs/extensions/
- Web Workers: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API

### Similar Projects

- JupyterLite (Jupyter in browser)
- Observable (JavaScript notebooks)
- Google Colab (cloud notebooks)

### Learning Resources

- Pyodide documentation
- Chrome Extension samples
- Web Worker best practices

-----

## Appendix A: Example Code Snippets

### Table Detection (Content Script)

```javascript
function detectTables() {
const tables = document.querySelectorAll('table');
return Array.from(tables).map((table, index) => ({
index,
rowCount: table.rows.length,
colCount: table.rows[0]?.cells.length || 0,
hasHeaders: table.querySelector('th') !== null,
preview: extractTablePreview(table, 3)
}));
}
```

### Pyodide Initialization (Worker)

```javascript
async function initializePyodide() {
self.pyodide = await loadPyodide({
indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/"
});

await self.pyodide.loadPackage(['pandas', 'numpy']);

self.pyodide.runPython(`
import pandas as pd
import numpy as np
pd.set_option('display.max_rows', 100)
`);
}
```

### Execute Pandas Code

```javascript
async function executePandasCode(code, tableData) {
// Convert table data to DataFrame
await self.pyodide.runPython(`
import pandas as pd
df = pd.DataFrame(${JSON.stringify(tableData)})
`);

// Execute user code
try {
const result = await self.pyodide.runPython(code);
return { success: true, result: result };
} catch (error) {
return { success: false, error: error.message };
}
}
```

## Appendix B: Manifest V3 Example

```json
{
"manifest_version": 3,
"name": "Pandas Table Scraper",
"version": "0.1.0",
"description": "Scrape tables and run pandas operations directly in your browser",
"permissions": [
"activeTab",
"storage",
"scripting"
],
"host_permissions": [
"<all_urls>"
],
"action": {
"default_popup": "popup.html",
"default_icon": {
"16": "icons/icon16.png",
"48": "icons/icon48.png",
"128": "icons/icon128.png"
}
},
"background": {
"service_worker": "background.js"
},
"content_scripts": [
{
"matches": ["<all_urls>"],
"js": ["content.js"],
"run_at": "document_idle"
}
],
"web_accessible_resources": [
{
"resources": ["pyodide-worker.js"],
"matches": ["<all_urls>"]
}
]
}
```

-----