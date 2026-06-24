function classify(block) {
  [...block.children].forEach((row) => {
    if (row.classList.contains('study-results-title')) return;

    const cells = [...row.children];

    if (cells.length === 3) {
      row.classList.add('study-results-stats');
      cells.forEach((cell) => {
        cell.classList.add('study-results-stat');
        const label = cell.querySelector('h4') || cell.firstElementChild;
        if (label) label.classList.add('study-results-stat-label');
      });
      return;
    }

    const hasImage = row.querySelector('picture, img');

    if (cells.length === 1 && hasImage) {
      row.classList.add('study-results-safety');
      return;
    }

    if (cells.length === 2) {
      row.classList.add('study-results-impact');
      const [imageCell, textCell] = cells;
      imageCell.classList.add('study-results-impact-image');
      textCell.classList.add('study-results-impact-text');
      return;
    }

    if (cells.length === 1) {
      const cell = cells[0];
      const heading = cell.querySelector('h1, h2, h3, h4');

      if (heading && cell.textContent.trim()) {
        row.classList.add('study-results-title');
        return;
      }

      row.remove();
    }
  });
}

export default function decorate(block) {
  const table = block.querySelector('table');

  // When authored as a nested table whose name cell isn't first, EDS leaves
  // the raw <table> in place. Rebuild the expected row/cell div structure.
  if (table) {
    const rows = [];

    // A heading authored alongside the table belongs above the box, not inside
    // it — lift it out so it renders as the section title like the original.
    const titleHeading = [...block.querySelectorAll('h1, h2, h3')]
      .find((heading) => !heading.closest('table'));
    if (titleHeading) {
      const titleWrapper = document.createElement('div');
      titleWrapper.classList.add('study-results-title');
      titleWrapper.append(titleHeading);
      block.before(titleWrapper);
    }

    [...table.querySelectorAll('tr')].forEach((tr) => {
      if (tr.textContent.trim().toLowerCase() === 'study-results') return;

      const rowDiv = document.createElement('div');
      [...tr.children].forEach((td) => {
        const cellDiv = document.createElement('div');
        cellDiv.innerHTML = td.innerHTML;
        rowDiv.append(cellDiv);
      });
      rows.push(rowDiv);
    });

    block.textContent = '';
    rows.forEach((row) => block.append(row));
  }

  classify(block);
}
