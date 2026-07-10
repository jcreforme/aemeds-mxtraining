/**
 * Table block
 * Transforms the authored div grid into a semantic HTML table.
 *
 * Standard table: the first authored row always becomes the <thead>, the
 * first cell of every body row becomes a row header, and the table is
 * wrapped in a scrollable region with a sticky first column.
 *
 * Comparison variant (`Table (Comparison)`): no column header row. A row
 * with content only in its first cell becomes a full-width group header
 * (e.g. "IV infusion for migraine") starting a new <tbody> row group. On
 * mobile the data rows reflow into a two-column grid — label left, dose
 * value and description stacked right — instead of scrolling horizontally.
 */

function cellIsEmpty(cell) {
  return !cell.textContent.trim() && !cell.querySelector('picture, .icon');
}

export default async function decorate(block) {
  const isComparison = block.classList.contains('comparison');
  const rows = [...block.children];
  const colCount = rows.reduce((max, row) => Math.max(max, row.children.length), 0);

  const table = document.createElement('table');
  let tbody = document.createElement('tbody');
  table.append(tbody);

  rows.forEach((row, rowIndex) => {
    const cells = [...row.children];
    const tr = document.createElement('tr');

    // standard tables: the first authored row is always the column header row
    if (!isComparison && rowIndex === 0) {
      const thead = document.createElement('thead');
      cells.forEach((cell) => {
        const th = document.createElement('th');
        th.scope = 'col';
        th.append(...cell.childNodes);
        // an empty cell should not be announced as a header
        if (cellIsEmpty(th)) {
          th.removeAttribute('scope');
          th.setAttribute('aria-hidden', 'true');
        }
        tr.append(th);
      });
      thead.append(tr);
      table.prepend(thead);
      return;
    }

    // comparison group header: content only in the first cell
    const isGroupRow = isComparison && cells.length > 1
      && !cellIsEmpty(cells[0]) && cells.slice(1).every(cellIsEmpty);
    if (isGroupRow) {
      tr.className = 'table-group-row';
      const th = document.createElement('th');
      th.colSpan = colCount;
      th.scope = 'rowgroup';
      th.append(...cells[0].childNodes);
      tr.append(th);
      // each group gets its own row group so the header scopes correctly
      if (tbody.children.length) {
        tbody = document.createElement('tbody');
        table.append(tbody);
      }
      tbody.append(tr);
      return;
    }

    cells.forEach((cell, cellIndex) => {
      const isRowLabel = cellIndex === 0;
      const el = document.createElement(isRowLabel ? 'th' : 'td');
      if (isRowLabel) el.scope = 'row';
      el.append(...cell.childNodes);
      if (el.tagName === 'TH' && cellIsEmpty(el)) {
        el.removeAttribute('scope');
        el.setAttribute('aria-hidden', 'true');
      }
      tr.append(el);
    });
    tbody.append(tr);
  });

  if (isComparison) {
    // the mobile layout switches rows to CSS grid, which strips native table
    // semantics from the accessibility tree; explicit roles preserve them
    table.setAttribute('role', 'table');
    table.querySelectorAll('tbody').forEach((group) => group.setAttribute('role', 'rowgroup'));
    table.querySelectorAll('tr').forEach((r) => r.setAttribute('role', 'row'));
    table.querySelectorAll('th').forEach((th) => th.setAttribute('role', 'rowheader'));
    table.querySelectorAll('td').forEach((td) => td.setAttribute('role', 'cell'));
    block.replaceChildren(table);
    return;
  }

  // scroll container keeps wide standard tables usable on small screens
  const scroller = document.createElement('div');
  scroller.className = 'table-scroll';
  scroller.setAttribute('role', 'region');
  scroller.setAttribute('tabindex', '0');
  const heading = block.closest('.section')?.querySelector('h1, h2, h3');
  scroller.setAttribute('aria-label', heading ? heading.textContent.trim() : 'Data table');
  scroller.append(table);

  block.replaceChildren(scroller);
}
