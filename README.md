# 🐼 Pandas Table Scraper

A powerful Chrome Extension that allows you to detect, extract, and analyze HTML tables using **Pandas** directly in your browser. Powered by **Pyodide**, this extension runs a full Python environment locally within your browser—no backend required.

![Panda Icon](public/icon.png)

## 🚀 Features

- **Automatic Table Detection:** Scan any webpage for HTML tables, including those inside same-origin iframes.
- **Visual Highlighting:** Selecting a table in the extension UI highlights it on the page and scrolls it into view.
- **In-Browser Python Environment:** Write and execute Pandas code using a built-in CodeMirror editor with Python syntax highlighting.
- **Rich Results Panel:** 
  - **Console:** View standard output and variable summaries.
  - **Table View:** See a formatted HTML preview of your resulting DataFrame.
  - **Plotting:** Support for **Matplotlib** to generate charts and visualizations on the fly.
- **CSV Export:** Download your analyzed data with a single click.
- **Privacy-First:** All processing happens locally on your machine via Web Workers and Offscreen Documents.

## 🛠️ Installation

### For Developers (Load Unpacked)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/pandas-table-scraper.git
   cd pandas-table-scraper
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the project:**
   ```bash
   npm run build
   ```

4. **Load into Chrome:**
   - Open Chrome and navigate to `chrome://extensions/`.
   - Enable **Developer mode** (toggle in the top right).
   - Click **Load unpacked** and select the `dist` folder in this project directory.

## 📖 How to Use

1. **Find a Table:** Navigate to any website containing data tables (e.g., a Wikipedia list).
2. **Open the Extension:** Click the 🐼 icon in your Chrome toolbar.
3. **Detect:** Click the **Detect** button. The dropdown will fill with all detected tables.
4. **Select & Verify:** Choose a table from the dropdown. The extension will highlight the table on the page with a blue glow.
5. **Analyze:** 
   - The editor provides a default variable `df` which contains the extracted table data as a Pandas DataFrame.
   - Write your Python code in the editor (e.g., `df.describe()` or `df.groupby('Column').mean()`).
6. **Run:** Click **Run**.
   - *Note: The first run may take a few seconds as Pyodide initializes its environment.*
7. **View Results:** Switch between the **Console**, **Table**, and **Plot** tabs to see your output.
8. **Export:** Click **CSV** to download your final DataFrame.

## 📦 Tech Stack

- **TypeScript** & **Vite**: Modern development and build pipeline.
- **Pyodide**: Python 3.x runtime for the browser.
- **Pandas** & **Matplotlib**: Data science and visualization libraries.
- **CodeMirror 6**: Professional-grade code editor.
- **Chrome Extension MV3**: Using Service Workers and Offscreen Documents.

## 📄 License

This project is licensed under the ISC License.
