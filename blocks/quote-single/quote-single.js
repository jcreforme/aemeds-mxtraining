const RESPONSIVE_SOURCES = [
  { media: '(min-width: 1200px)', src: 'https://www.assets.lundbeck-tools.com/content/dam/lundbeck/vyepti/2024-dot-03/second-set/1x/desktop/quote-stephanie-clinical-472-desktop.png' },
  { media: '(min-width: 992px)', src: 'https://www.assets.lundbeck-tools.com/content/dam/lundbeck/vyepti/2024-dot-03/second-set/1x/smallerdesktop/quote-stephanie-clincal-371-smalldesktop.png' },
  { media: '(min-width: 768px)', src: 'https://www.assets.lundbeck-tools.com/content/dam/lundbeck/vyepti/2024-dot-03/second-set/1x/tablet/quote-stephanie-clinical-422-tablet.png' },
  { media: '(min-width: 320px)', src: 'https://www.assets.lundbeck-tools.com/content/dam/lundbeck/vyepti/2024-dot-03/second-set/1x/mobile/quote-stephanie-clincal-340-mobile.png' },
];

function buildResponsivePicture(alt) {
  const picture = document.createElement('picture');
  RESPONSIVE_SOURCES.forEach(({ media, src }) => {
    const source = document.createElement('source');
    source.media = media;
    source.srcset = src;
    picture.append(source);
  });

  const img = document.createElement('img');
  img.src = RESPONSIVE_SOURCES[RESPONSIVE_SOURCES.length - 1].src;
  img.alt = alt;
  img.loading = 'lazy';
  picture.append(img);

  return picture;
}

export default function decorate(block) {
  let imageCell;
  const textNodes = [];

  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      const isTextCell = cell.querySelector('blockquote, h1, h2, h3, h4');
      if (!imageCell && !isTextCell) {
        imageCell = cell;
      } else {
        textNodes.push(...cell.children);
      }
    });
  });

  block.textContent = '';

  const text = document.createElement('div');
  text.className = 'quote-single-text';

  textNodes.forEach((node, i) => {
    const tag = node.tagName.toLowerCase();
    if (tag === 'blockquote' || tag === 'h1' || tag === 'h2' || tag === 'h3') {
      node.classList.add('quote-single-quote');
    } else if (i === textNodes.length - 1) {
      node.classList.add('quote-single-disclaimer');
    } else if (node.querySelector('strong') || tag === 'h4') {
      node.classList.add('quote-single-author');
    }
    text.append(node);
  });
  block.append(text);

  if (imageCell) {
    const image = document.createElement('div');
    image.className = 'quote-single-image';

    if (imageCell.querySelector('picture, img')) {
      image.append(...imageCell.children);
    } else {
      const alt = text.querySelector('.quote-single-author')?.textContent.trim() || '';
      image.append(buildResponsivePicture(alt));
    }
    block.append(image);
  } else {
    block.classList.add('quote-single-no-image');
  }
}
