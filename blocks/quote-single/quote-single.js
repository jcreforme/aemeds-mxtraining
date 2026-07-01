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

// Collects responsive image entries. Authors may supply each image as its own
// table row (label cell + image cell) OR — because DA paste can flatten a block
// into a single cell — as a sequence of label / image paragraphs. Both are
// handled by pairing every image with the text element that precedes it.
function collectImageEntries(block) {
  return [...block.querySelectorAll('img')].map((img) => {
    const container = img.closest('p') || img.parentElement;
    const labelEl = container?.previousElementSibling;
    const label = labelEl && !labelEl.querySelector('img')
      ? labelEl.textContent.trim() : '';
    return { media: mediaForLabel(label), src: img.getAttribute('src') };
  });
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
      && mediaForLabel(p.textContent.trim()) === null
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
