export default function decorate(block) {
  const [imageCell, contentCell] = [...block.firstElementChild.children];

  if (imageCell) {
    imageCell.classList.add('side-effects-image');

    const picture = imageCell.querySelector('picture');

    // caption text may be a standalone <p>, inline within the image's <p>,
    // or a loose text node beside the <picture>. Capture all of it by cloning
    // the cell, stripping the image, and reading the remaining text.
    const cellClone = imageCell.cloneNode(true);
    cellClone.querySelectorAll('picture, img').forEach((el) => el.remove());
    const captionText = cellClone.textContent.trim();

    if (picture) {
      // build a clean figure containing only the picture and (optionally) the caption
      const figure = document.createElement('div');
      figure.className = 'side-effects-figure';
      figure.append(picture);

      if (captionText) {
        const caption = document.createElement('span');
        caption.className = 'side-effects-caption';
        caption.textContent = captionText;
        figure.append(caption);
      }

      // replace the cell's contents with the figure (drops stray wrapping <p> tags)
      imageCell.textContent = '';
      imageCell.append(figure);
    }
  }

  if (contentCell) {
    contentCell.classList.add('side-effects-content');
  }
}
