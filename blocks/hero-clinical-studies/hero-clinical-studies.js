export default function decorate(block) {
  const cell = block.querySelector(':scope > div > div') || block.firstElementChild;
  if (!cell) return;

  const picture = cell.querySelector('picture');
  const caption = [...cell.querySelectorAll('p')].find((p) => p.querySelector('em'));

  // image layer
  if (picture) {
    const imageWrap = document.createElement('div');
    imageWrap.className = 'hero-clinical-studies-image';
    imageWrap.append(picture);
    block.prepend(imageWrap);
  }

  // text overlay: collect headings into a content container
  const content = document.createElement('div');
  content.className = 'hero-clinical-studies-content';
  cell.querySelectorAll('h1, h2, h3, h4').forEach((h) => content.append(h));
  cell.replaceWith(content);

  // caption stays as a separate overlay element
  if (caption) {
    caption.classList.add('hero-clinical-studies-caption');
    block.append(caption);
  }
}
