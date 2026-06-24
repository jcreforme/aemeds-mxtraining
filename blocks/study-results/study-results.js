export default function decorate(block) {
  [...block.children].forEach((row) => {
    const cells = [...row.children];

    if (cells.length === 3) {
      row.classList.add('study-results-stats');
      cells.forEach((cell) => cell.classList.add('study-results-stat'));
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
