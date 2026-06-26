// explicit media condition per background-image row, largest first.
// every authored image gets its own <source media>; the last one also
// provides the <img> fallback.
const BG_MEDIA = ['(min-width: 1600px)', '(min-width: 768px)', '(min-width: 375px)'];

// pick the best available source URL from an authored <picture>
function bestSrcset(picture) {
  const source = picture.querySelector('source[type="image/webp"][media]')
    || picture.querySelector('source[type="image/webp"]')
    || picture.querySelector('source');
  if (source && source.getAttribute('srcset')) return source.getAttribute('srcset');
  const img = picture.querySelector('img');
  return img ? img.getAttribute('src') : '';
}

// combine the authored background pictures into one responsive <picture>
function buildResponsivePicture(pictures) {
  const out = document.createElement('picture');

  pictures.forEach((pic, i) => {
    const source = document.createElement('source');
    if (BG_MEDIA[i]) source.media = BG_MEDIA[i];
    source.srcset = bestSrcset(pic);
    out.append(source);
  });

  const base = pictures[pictures.length - 1];
  const baseImg = base.querySelector('img');
  const img = document.createElement('img');
  img.src = bestSrcset(base);
  img.alt = baseImg ? baseImg.getAttribute('alt') || '' : '';
  img.loading = 'eager';
  out.append(img);

  return out;
}

export default function decorate(block) {
  const rows = [...block.children];

  // leading image-only rows supply the responsive background; the row that
  // holds the headings is the text overlay.
  const bgPictures = [];
  let contentRow = null;
  rows.forEach((row) => {
    const cell = row.firstElementChild;
    if (!cell) return;
    const hasHeading = cell.querySelector('h1, h2, h3, h4');
    const picture = cell.querySelector('picture');
    if (picture && !hasHeading) {
      bgPictures.push(picture);
    } else if (hasHeading) {
      contentRow = row;
    }
  });
  if (!contentRow) contentRow = rows[rows.length - 1];

  // backward compat: legacy authoring placed the single background image in the
  // same cell as the headings. If no dedicated image rows were found, fall back
  // to a picture inside the content row.
  if (!bgPictures.length) {
    const legacy = contentRow.querySelector('picture');
    if (legacy) bgPictures.push(legacy);
  }

  // text overlay
  const content = document.createElement('div');
  content.className = 'hero-two-columns-content';
  contentRow.querySelectorAll('h1, h2, h3, h4').forEach((h) => content.append(h));

  // "Actor portrayal" caption: the innermost <p> with an <em> and no image
  const caption = [...contentRow.querySelectorAll('p')]
    .find((p) => p.querySelector('em') && !p.querySelector('picture, img'));

  block.textContent = '';

  // the responsive <picture> is the block's background: append it directly as
  // the first child (no wrapper div) and position it behind the content via CSS.
  if (bgPictures.length) {
    const picture = buildResponsivePicture(bgPictures);
    picture.classList.add('hero-two-columns-bg');
    block.append(picture);
  }

  block.append(content);

  if (caption) {
    caption.classList.add('hero-two-columns-caption');
    block.append(caption);
  }
}
