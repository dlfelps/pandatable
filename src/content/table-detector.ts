export interface DetectedTable {
  id: string;
  hasHeader: boolean;
  element: HTMLTableElement;
}

export function detectTables(doc: Document = document): DetectedTable[] {
  let detectedTables: DetectedTable[] = [];

  // Detect tables in the current document
  const tables = Array.from(doc.querySelectorAll('table'));
  const visibleTables = tables.filter((table) => {
    // Basic visibility check
    const style = doc.defaultView?.getComputedStyle(table);
    if (style) {
      return style.display !== 'none' && style.visibility !== 'hidden' && !table.hidden;
    }
    return !table.hidden;
  });

  detectedTables = visibleTables.map((table, index) => {
    const hasHeader = table.querySelectorAll('th').length > 0;
    return {
      id: table.id || `table-${index}-${Math.random().toString(36).substr(2, 9)}`,
      hasHeader,
      element: table,
    };
  });

  // Recursively detect tables in same-origin iframes
  const iframes = Array.from(doc.querySelectorAll('iframe'));
  for (const iframe of iframes) {
    try {
      const iframeDoc = iframe.contentDocument;
      if (iframeDoc) {
        detectedTables = detectedTables.concat(detectTables(iframeDoc));
      }
    } catch (e) {
      // Ignore cross-origin iframes (SecurityError)
      console.warn('Could not access iframe content due to cross-origin restriction');
    }
  }

  return detectedTables;
}
