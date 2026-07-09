export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;
  row.classList.add('cta-card');

  [...row.children].forEach((cell) => {
    if (cell.querySelector('picture, img')) {
      cell.classList.add('cta-card-shape');
    } else if (cell.querySelector('a')) {
      cell.classList.add('cta-card-action');
    } else {
      cell.classList.add('cta-card-text');
    }
  });
}
