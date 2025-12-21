import { describe, it, expect, beforeEach } from 'vitest';
import { extractTableData } from './table-extractor';

describe('Table Extractor', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should extract table data into JSON format', () => {
    const table = document.createElement('table');
    table.innerHTML = `
      <thead>
        <tr><th>Name</th><th>Age</th></tr>
      </thead>
      <tbody>
        <tr><td>Alice</td><td>30</td></tr>
        <tr><td>Bob</td><td>25</td></tr>
      </tbody>
    `;

    const data = extractTableData(table);
    expect(data).toEqual([
      { Name: 'Alice', Age: '30' },
      { Name: 'Bob', Age: '25' },
    ]);
  });

  it('should handle tables without headers by using column indices', () => {
    const table = document.createElement('table');
    table.innerHTML = `
      <tr><td>Alice</td><td>30</td></tr>
      <tr><td>Bob</td><td>25</td></tr>
    `;

    const data = extractTableData(table);
    expect(data).toEqual([
      { '0': 'Alice', '1': '30' },
      { '0': 'Bob', '1': '25' },
    ]);
  });

  it('should trim whitespace from cell content', () => {
    const table = document.createElement('table');
    table.innerHTML = `
      <tr><th> Name </th></tr>
      <tr><td> Alice </td></tr>
    `;

    const data = extractTableData(table);
    expect(data).toEqual([
      { Name: 'Alice' },
    ]);
  });
});
