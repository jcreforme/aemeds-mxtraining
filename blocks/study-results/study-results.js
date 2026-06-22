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
    }
  });
}
