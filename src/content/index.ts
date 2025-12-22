import { MessageType, MessageRequest } from '../types';
import { detectTables } from './table-detector';
import { extractTableData } from './table-extractor';

export function setupMessageListener() {
  chrome.runtime.onMessage.addListener((request: MessageRequest, _sender, sendResponse) => {
    if (request.type === MessageType.DETECT_TABLES) {
      const detected = detectTables();
      sendResponse({
        tables: detected.map(t => ({
          id: t.id,
          hasHeader: t.hasHeader,
          name: t.element.caption?.textContent?.trim() || t.id
        }))
      });
    } else if (request.type === MessageType.EXTRACT_TABLE) {
      const detected = detectTables();
      const table = detected.find(t => t.id === request.tableId);
      if (table) {
        const data = extractTableData(table.element);
        sendResponse({ data });
      } else {
        sendResponse({ data: [] });
      }
    }
    return true; // Keep channel open for async response if needed
  });
}

// Initialize if not in test environment
if (process.env.NODE_ENV !== 'test') {
  console.log('Pandas Table Scraper: Content script loaded');
  setupMessageListener();

  // Expose debug helper to window for easier testing
  (window as any).__PANDAS_SCRAPER__ = {
    detect: () => {
      const tables = detectTables();
      console.log(`Detected ${tables.length} tables:`, tables.map(t => ({ id: t.id, hasHeader: t.hasHeader })));
      return tables;
    },
    extract: (tableId: string) => {
      const tables = detectTables();
      const table = tables.find(t => t.id === tableId);
      if (table) {
        const data = extractTableData(table.element);
        console.table(data);
        return data;
      }
      console.error(`Table with ID "${tableId}" not found.`);
    }
  };

  console.log(
    '%c Pandas Table Scraper Debug Mode \n' +
    '%c To use the debug helper, switch the Console context from "top" to "Pandas Table Scraper".\n' +
    'Then run: __PANDAS_SCRAPER__.detect()',
    'font-weight: bold; font-size: 14px;',
    'color: gray;'
  );
}