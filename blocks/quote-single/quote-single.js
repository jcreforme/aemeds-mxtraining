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
  img.src = RESPONSIVE_SOURCES[0].src;
  img.alt = alt;
  img.loading = 'lazy';
  picture.append(img);

  return picture;
}

export default function decorate(block) {
  let imageCell;
  let textCell;

  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      if (cell.querySelector('blockquote, h1, h2, h3, h4')) {
        textCell = textCell || cell;
      } else if (!imageCell) {
        imageCell = cell;
      }
    });
  });

  block.textContent = '';

  const text = document.createElement('div');
  text.className = 'quote-single-text';

  // Content authored via paste can wrap everything in a single <p>; collect the
  // semantic elements directly so styling is applied regardless of nesting.
  const quote = textCell?.querySelector('blockquote, h1, h2, h3');
  const paragraphs = [...(textCell?.querySelectorAll('p') || [])]
    .filter((p) => !p.closest('blockquote') && !p.querySelector('blockquote'));
  const author = paragraphs.find((p) => p.querySelector('strong'));
  const disclaimer = paragraphs[paragraphs.length - 1] !== author
    ? paragraphs[paragraphs.length - 1] : null;

  if (quote) {
    quote.classList.add('quote-single-quote');
    text.append(quote);
  }
  if (author) {
    author.classList.add('quote-single-author');
    text.append(author);
  }
  if (disclaimer) {
    disclaimer.classList.add('quote-single-disclaimer');
    text.append(disclaimer);
  }
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
