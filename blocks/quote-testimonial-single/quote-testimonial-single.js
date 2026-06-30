export default function decorate(block) {
  let imageCell;
  let textCell;

  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      if (cell.querySelector('picture, img')) imageCell = cell;
      else textCell = cell;
    });
  });

  block.textContent = '';

  const text = document.createElement('div');
  text.className = 'quote-testimonial-single-text';

  if (textCell) {
    const nodes = [...textCell.children];
    nodes.forEach((node, i) => {
      const tag = node.tagName.toLowerCase();
      if (tag === 'blockquote' || tag === 'h1' || tag === 'h2' || tag === 'h3') {
        node.classList.add('quote-testimonial-single-quote');
      } else if (i === nodes.length - 1) {
        node.classList.add('quote-testimonial-single-disclaimer');
      } else if (node.querySelector('strong') || tag === 'h4') {
        node.classList.add('quote-testimonial-single-author');
      }
      text.append(node);
    });
  }
  block.append(text);

  if (imageCell) {
    const image = document.createElement('div');
    image.className = 'quote-testimonial-single-image';
    image.append(...imageCell.children);
    block.append(image);
  } else {
    block.classList.add('quote-testimonial-single-no-image');
  }
}
