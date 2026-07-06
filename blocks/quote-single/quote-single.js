// Maps an author's breakpoint label to a media query. Only two images are
// supported: desktop (≥900px) gets its own <source>; everything below —
// including tablet — falls back to the mobile <img>.
function mediaForLabel(label) {
  const l = label.toLowerCase();
  if (l.includes('desktop')) return '(min-width: 900px)';
  return null;
}

// True when a text node is one of the breakpoint labels (including "mobile"),
// so it can be excluded from the quote text.
function isBreakpointLabel(text) {
  return /^(desktop|tablet|mobile|small\s*desktop)$/i.test(text.trim());
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

// Finds the breakpoint label paired with an image. Authors may supply each
// image as its own table row (label cell + image cell) OR — because DA paste
// can flatten a block into a single cell — as a sequence of label / image
// paragraphs. In both cases the label is the text sibling that precedes the
// image's container (paragraph, picture, or grid cell).
function labelForImage(block, img) {
  let node = img.closest('p, picture') || img;
  // climb to the element whose previous sibling is the label
  while (node && node.parentElement !== block) {
    const prev = node.previousElementSibling;
    if (prev && !prev.querySelector('img, picture') && prev.textContent.trim()) {
      return prev.textContent.trim();
    }
    node = node.parentElement;
  }
  return '';
}

// Collects responsive image entries, pairing each image with its label.
function collectImageEntries(block) {
  return [...block.querySelectorAll('img')].map((img) => ({
    media: mediaForLabel(labelForImage(block, img)),
    src: img.getAttribute('src'),
  }));
}

export default function decorate(block) {
  const imageEntries = collectImageEntries(block);

  // Quote/author/disclaimer can sit in their own cell or be flattened alongside
  // the image paragraphs; query them directly and ignore image-related nodes.
  const quote = block.querySelector('blockquote, h1, h2, h3');
  const paragraphs = [...block.querySelectorAll('p')]
    .filter((p) => !p.querySelector('img')
      && !p.closest('blockquote')
      && !p.querySelector('blockquote')
      && !isBreakpointLabel(p.textContent)
      && p.textContent.trim() !== '');
  const author = paragraphs.find((p) => p.querySelector('strong'));
  const disclaimer = paragraphs[paragraphs.length - 1] !== author
    ? paragraphs[paragraphs.length - 1] : null;

  block.textContent = '';

  const text = document.createElement('div');
  text.className = 'quote-single-text';

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
    const alt = author?.textContent.trim() || '';
    image.append(buildResponsivePicture(imageEntries, alt));
    block.append(image);
  } else {
    block.classList.add('quote-single-no-image');
  }
}
