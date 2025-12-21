export function extractTableData(table: HTMLTableElement): Record<string, string>[] {
  const rows = Array.from(table.rows);
  if (rows.length === 0) return [];

  const headers: string[] = [];
  let startIndex = 0;

  // Try to find headers in the first row (th or td)
  const firstRow = rows[0];
  const firstRowCells = Array.from(firstRow.cells);
  const hasTh = firstRowCells.some(cell => cell.tagName.toLowerCase() === 'th');

  if (hasTh) {
    firstRowCells.forEach((cell, index) => {
      headers.push(cell.textContent?.trim() || index.toString());
    });
    startIndex = 1;
  } else {
    // If no <th>, check if it's a <thead> structure
    const thead = table.tHead;
    if (thead && thead.rows.length > 0) {
      Array.from(thead.rows[0].cells).forEach((cell, index) => {
        headers.push(cell.textContent?.trim() || index.toString());
      });
      // startIndex remains 0 if we use tHead, but rows array includes tHead rows usually.
      // Actually, table.rows includes everything. If there's a tHead, rows[0] is likely the header.
      startIndex = 1;
    } else {
      // No explicit headers found, use indices
      firstRowCells.forEach((_, index) => {
        headers.push(index.toString());
      });
      startIndex = 0;
    }
  }

  const data: Record<string, string>[] = [];

  for (let i = startIndex; i < rows.length; i++) {
    const row = rows[i];
    const rowData: Record<string, string> = {};
    Array.from(row.cells).forEach((cell, index) => {
      const header = headers[index] || index.toString();
      rowData[header] = cell.textContent?.trim() || '';
    });
    // Only add if row has data
    if (Object.keys(rowData).length > 0) {
      data.push(rowData);
    }
  }

  return data;
}