// Maps an author's breakpoint label to a media query. "mobile" (or anything
// unrecognized) becomes the <img> fallback. Breakpoints align with the project
// standard: 1200px / 900px / 600px.
function mediaForLabel(label) {
  const l = label.toLowerCase();
  if (l.includes('mobile')) return null;
  if (l.includes('tablet')) return '(min-width: 600px)';
  if (l.includes('small')) return '(min-width: 900px)';
  if (l.includes('desktop')) return '(min-width: 1200px)';
  return null;
}

// Builds an art-directed <picture> from author-supplied images. Each entry is a
// { media, src } pair; the entry without a media query is used as the fallback.
function buildResponsivePicture(entries, alt) {
  const picture = document.createElement('picture');

  const sources = entries.filter((e) => e.media);
  sources.sort((a, b) => parseInt(b.media.match(/\d+/)[0], 10)
    - parseInt(a.media.match(/\d+/)[0], 10));
  sources.forEach(({ media, src }) => {
    const source = document.createElement('source');
    source.media = media;
    source.srcset = src;
    picture.append(source);
  });

  const fallback = entries.find((e) => !e.media) || entries[entries.length - 1];
  const img = document.createElement('img');
  img.src = fallback.src;
  img.alt = alt;
  img.loading = 'lazy';
  picture.append(img);

  return picture;
}

export default function decorate(block) {
  let textCell;
  const imageEntries = [];

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const imageCell = cells.find((cell) => cell.querySelector('picture, img'));

    if (imageCell) {
      const labelCell = cells.find((cell) => cell !== imageCell);
      const label = labelCell ? labelCell.textContent.trim() : '';
      const src = imageCell.querySelector('img').getAttribute('src');
      imageEntries.push({ media: mediaForLabel(label), src });
    } else if (!textCell) {
      textCell = cells.find((cell) => cell.querySelector('blockquote, h1, h2, h3, h4'));
    }
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

  if (imageEntries.length) {
    const image = document.createElement('div');
    image.className = 'quote-single-image';
    const alt = text.querySelector('.quote-single-author')?.textContent.trim() || '';
    image.append(buildResponsivePicture(imageEntries, alt));
    block.append(image);
  } else {
    block.classList.add('quote-single-no-image');
  }
}
