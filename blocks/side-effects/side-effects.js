export default function decorate(block) {
  const [imageCell, contentCell] = [...block.firstElementChild.children];

  if (imageCell) {
    imageCell.classList.add('side-effects-image');
    const caption = [...imageCell.querySelectorAll('p')]
      .find((p) => !p.querySelector('picture, img'));
    if (caption) {
      caption.classList.add('side-effects-caption');
    }
  }

  if (contentCell) {
    contentCell.classList.add('side-effects-content');
  }
}
