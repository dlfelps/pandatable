import { describe, it, expect, beforeEach } from 'vitest';
import { detectTables } from './table-detector';

describe('Table Detector', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should detect all <table> elements on the page', () => {
    document.body.innerHTML = `
      <div>
        <table>
          <tr><td>Data 1</td></tr>
        </table>
        <table>
          <tr><td>Data 2</td></tr>
        </table>
      </div>
    `;

    const tables = detectTables();
    expect(tables).toHaveLength(2);
  });

  it('should ignore hidden tables', () => {
    document.body.innerHTML = `
      <table><tr><td>Visible</td></tr></table>
      <table style="display: none;"><tr><td>Hidden Style</td></tr></table>
      <table hidden><tr><td>Hidden Attribute</td></tr></table>
    `;

    const tables = detectTables();
    expect(tables).toHaveLength(1);
  });

  it('should identify tables with headers', () => {
    document.body.innerHTML = `
      <table id="with-header">
        <thead>
          <tr><th>Header 1</th></tr>
        </thead>
        <tbody>
          <tr><td>Data 1</td></tr>
        </tbody>
      </table>
      <table id="no-header">
        <tr><td>Data 2</td></tr>
      </table>
    `;

    const tables = detectTables();
    const withHeader = tables.find(t => t.id === 'with-header');
    const noHeader = tables.find(t => t.id === 'no-header');

    expect(withHeader?.hasHeader).toBe(true);
    expect(noHeader?.hasHeader).toBe(false);
  });

  it('should detect tables in same-origin iframes', () => {
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    
    // In happy-dom, we can directly access contentDocument
    const iframeDoc = iframe.contentDocument;
    if (iframeDoc) {
      iframeDoc.body.innerHTML = `
        <table>
          <tr><td>Iframe Data</td></tr>
        </table>
      `;
    }

    const tables = detectTables();
    expect(tables).toHaveLength(1);
  });
});
