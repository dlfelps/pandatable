# Initial Concept

Review the design.md. The details are there.

The project is a **Pandas Table Scraper Browser Extension**. It allows users to scrape HTML tables from any webpage and execute pandas DataFrame operations directly in the browser using Pyodide, without needing to export data or switch to a Python environment.

# Product Guide - Pandas Table Scraper

## Product Vision
A powerful browser extension that bridges the gap between web data and Python analysis. It empowers users to instantly transform static HTML tables into interactive pandas DataFrames, allowing for real-time data manipulation, analysis, and visualization directly in the browser without the need for external tools or environment switching.

## Target Users
*   **Data Analysts & Researchers:** Professionals who frequently gather, clean, and analyze data from diverse web sources and require a quick way to verify or transform that data on the fly.
*   **Students & Educators:** Individuals learning or teaching data science who benefit from an immediate, zero-setup environment to practice pandas operations on real-world web data.

## Core Goals (v1)
*   **One-Click Extraction:** Seamlessly detect and extract HTML tables from any webpage with minimal user effort.
*   **In-Browser Python:** Provide a stable and responsive pandas environment powered by Pyodide.
*   **Immediate Insight:** Support essential data operations (filtering, grouping, describing) and basic visualizations (plots) to provide instant value.

## Essential Features (MVP)
*   **Table Detection & Extraction:** Intelligent DOM scanning to identify tables, handle headers, and extract structured data with automatic numeric type inference (currency, percentages, formatted numbers).
*   **Interactive Code Editor:** A specialized editor with syntax highlighting for writing and running Python/pandas code.
*   **Pyodide Runtime Integration:** Lifecycle management for the Python runtime, including optimized loading and package handling.
*   **Result Visualization:** Multiple output formats including styled HTML tables, formatted text, and matplotlib plots.
*   **Flexible Export:** Support for exporting processed DataFrames to standard formats like CSV, JSON, and Excel.

## Technical Constraints & Priorities
*   **Manifest V3 Compliance:** Architecture must robustly handle the lifecycle of Service Workers and Web Workers within the MV3 security and persistence model.
*   **Cross-Origin Accessibility:** Robust handling of tables within iframes and across different origins through secure scripting and permission strategies.

## Visual Aesthetic & UI
*   **Professional & Functional:** A clean, data-centric interface prioritized for utility. Features a clear layout with prominent action buttons and a side-by-side arrangement for code entry and result viewing to maximize productivity.
*   **Side Panel Interface:** Operates as a persistent Chrome Side Panel, maintaining tab-specific state (code and detected tables) to prevent data loss during browser interaction.