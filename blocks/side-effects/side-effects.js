export default function decorate(block) {
  const [imageCell, contentCell] = [...block.firstElementChild.children];

  if (imageCell) {
    imageCell.classList.add('side-effects-image');
  }

  if (contentCell) {
    contentCell.classList.add('side-effects-content');
  }
}
