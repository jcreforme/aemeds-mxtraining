// Wraps the leading icon graphic of a column so it can sit centered above the
// heading + body text (used by the "icons" variant).
function buildIconColumn(col) {
  const picture = col.querySelector('picture, img');
  if (!picture) return;

  const iconWrapper = document.createElement('div');
  iconWrapper.className = 'banner-3-cols-icon';
  iconWrapper.setAttribute('aria-hidden', 'true');
  iconWrapper.append(picture.closest('picture') || picture);

  // Whatever paragraph only held the image is now empty; drop it.
  [...col.children].forEach((child) => {
    if (!child.querySelector('picture, img') && child.textContent.trim() === '') {
      child.remove();
    }
  });

  col.prepend(iconWrapper);
}

export default function decorate(block) {
  const isIcons = block.classList.contains('icons');

  [...block.children].forEach((row) => {
    const cols = [...row.children];
    row.classList.add('banner-3-cols-row');
    row.classList.add(`banner-3-cols-row-${cols.length}`);

    cols.forEach((col) => {
      col.classList.add('banner-3-cols-col');
      if (isIcons) buildIconColumn(col);
      const label = col.querySelector('h2, h3, h4') || col.firstElementChild;
      if (label) label.classList.add('banner-3-cols-label');
    });
  });
}
