export default function decorate(block) {
  [...block.children].forEach((row) => {
    const cols = [...row.children];
    row.classList.add('banner-3-cols-study-results-row');
    row.classList.add(`banner-3-cols-study-results-row-${cols.length}`);

    cols.forEach((col) => {
      col.classList.add('banner-3-cols-study-results-col');
      const label = col.querySelector('h2, h3, h4') || col.firstElementChild;
      if (label) label.classList.add('banner-3-cols-study-results-label');
    });
  });
}
