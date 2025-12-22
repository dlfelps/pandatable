export interface DetectedTable {
  id: string;
  hasHeader: boolean;
  element: HTMLTableElement;
}

/**
 * Checks if an element is visible in the DOM.
 */
function isVisible(el: HTMLElement): boolean {
  const style = window.getComputedStyle(el);
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    el.offsetWidth > 0 &&
    el.offsetHeight > 0 &&
    !el.hidden
  );
}

/**
 * Recursively finds all visible table elements in a document and its same-origin iframes.
 */
function findTables(doc: Document): HTMLTableElement[] {
  let tables: HTMLTableElement[] = Array.from(doc.querySelectorAll('table'));
  
  // Filter for visibility
  tables = tables.filter(isVisible);

  // Look into iframes
  const iframes = Array.from(doc.querySelectorAll('iframe'));
  for (const iframe of iframes) {
    try {
      const iframeDoc = iframe.contentDocument;
      if (iframeDoc) {
        tables = tables.concat(findTables(iframeDoc));
      }
    } catch (e) {
      // Ignore cross-origin iframes
    }
  }
  return tables;
}

export function detectTables(): DetectedTable[] {
  const allTables = findTables(document);
  
  return allTables.map((table, index) => {
    const hasHeader = table.querySelectorAll('th').length > 0;
    return {
      // Use the element's actual ID if it exists, otherwise use a stable index-based ID
      id: table.id || `table-${index}`,
      hasHeader,
      element: table,
    };
  });
}