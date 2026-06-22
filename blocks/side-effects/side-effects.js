export default function decorate(block) {
  const [imageCell, contentCell] = [...block.firstElementChild.children];

  if (imageCell) {
    imageCell.classList.add('side-effects-image');

    const picture = imageCell.querySelector('picture');

    // collect caption text from anywhere in the cell (standalone p or inline next to the image)
    const captionText = [...imageCell.querySelectorAll('p')]
      .map((p) => {
        const clone = p.cloneNode(true);
        clone.querySelectorAll('picture, img').forEach((el) => el.remove());
        return clone.textContent.trim();
      })
      .find((t) => t) || '';

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
