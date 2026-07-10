const CALLOUT_MARKER_PATTERN = /^(\[?callout(?:-start)?\]?|---)$/i;

function isCalloutMarker(element) {
  if (!element) return false;
  if (element.classList.contains('callout-start')) return true;
  if (element.tagName === 'HR') return true;

  const markerText = (element.textContent || '').trim();
  return CALLOUT_MARKER_PATTERN.test(markerText);
}

function getCalloutStartIndex(columnChildren) {
  const markerIndex = columnChildren.findIndex(isCalloutMarker);
  if (markerIndex !== -1) return markerIndex + 1;

  // Backward compatibility with existing authored content.
  return columnChildren.length > 2 ? 2 : -1;
}

function normalizeAuthoredIcon(iconElement) {
  if (!iconElement) return;

  [...iconElement.classList]
    .filter((className) => className.startsWith('icon-icon-'))
    .forEach((className) => {
      iconElement.classList.remove(className);
      iconElement.classList.add(className.replace('icon-icon-', 'icon-'));
    });

  const iconImage = iconElement.querySelector('img[data-icon-name^="icon-"]');
  if (!iconImage) return;

  const normalizedIconName = iconImage.dataset.iconName.replace(/^icon-/, '');
  iconImage.dataset.iconName = normalizedIconName;
  iconImage.src = iconImage.src.replace(/\/icons\/icon-([a-z0-9-]+)\.svg$/i, '/icons/$1.svg');
}

// Picks the best available source URL from an authored <picture> or <img>.
function bestSrc(graphic) {
  if (graphic.tagName === 'PICTURE') {
    const source = graphic.querySelector('source[type="image/webp"][media]')
      || graphic.querySelector('source[type="image/webp"]')
      || graphic.querySelector('source');
    if (source && source.getAttribute('srcset')) return source.getAttribute('srcset');
  }
  const img = graphic.tagName === 'IMG' ? graphic : graphic.querySelector('img');
  return img ? img.getAttribute('src') : '';
}

// Combines an authored desktop + mobile graphic into one responsive <picture>
// that swaps at the 900px breakpoint (desktop >= 900px, tablet/mobile below).
function buildResponsivePicture(desktopGraphic, mobileGraphic) {
  const out = document.createElement('picture');

  const source = document.createElement('source');
  source.media = '(min-width: 900px)';
  source.srcset = bestSrc(desktopGraphic);
  out.append(source);

  const mobileImg = mobileGraphic.tagName === 'IMG' ? mobileGraphic : mobileGraphic.querySelector('img');
  const img = document.createElement('img');
  img.src = bestSrc(mobileGraphic);
  img.alt = mobileImg ? mobileImg.getAttribute('alt') || '' : '';
  img.loading = 'lazy';
  out.append(img);

  return out;
}

// Splits a column into a leading icon graphic + the remaining text so they can
// sit side by side. The icon is the first image/picture the author placed in
// the column; everything else becomes the text side. When the author supplies
// two graphics, they become a responsive desktop/tablet swap at 900px.
function buildIconColumn(column) {
  const graphics = [...column.querySelectorAll('picture, img')]
    .filter((el) => !(el.tagName === 'IMG' && el.closest('picture')));
  if (!graphics.length) return;

  const iconWrapper = document.createElement('div');
  iconWrapper.className = 'columns-content-icon';
  iconWrapper.setAttribute('aria-hidden', 'true');

  if (graphics.length >= 2) {
    iconWrapper.append(buildResponsivePicture(graphics[0], graphics[1]));
    graphics.forEach((g) => (g.closest('p') || g).remove());
  } else {
    const graphic = graphics[0];
    iconWrapper.append(graphic.closest('picture') || graphic);
  }

  const text = document.createElement('div');
  text.className = 'columns-content-icon-text';
  [...column.children].forEach((child) => {
    if (!child.querySelector('picture, img') && child.textContent.trim() === '') {
      child.remove();
      return;
    }
    text.append(child);
  });

  column.textContent = '';
  column.append(iconWrapper, text);
  column.classList.add('has-icon');
}

function buildCallout(column) {
  const directChildren = [...column.children];
  const startIndex = getCalloutStartIndex(directChildren);
  if (startIndex < 0 || startIndex >= directChildren.length) return;

  const markerIndex = directChildren.findIndex(isCalloutMarker);
  if (markerIndex !== -1) {
    directChildren[markerIndex].remove();
  }

  const callout = document.createElement('div');
  callout.className = 'columns-content-callout';

  const calloutChildren = directChildren.slice(startIndex);
  const firstChild = calloutChildren[0];
  const authoredIcon = firstChild?.querySelector('span[class*="icon"]') || (firstChild?.classList.contains('icon') ? firstChild : null);

  normalizeAuthoredIcon(authoredIcon);

  if (authoredIcon) {
    const iconWrapper = document.createElement('span');
    iconWrapper.className = 'columns-content-callout-icon';
    iconWrapper.setAttribute('aria-hidden', 'true');
    iconWrapper.append(authoredIcon);
    callout.append(iconWrapper);
    callout.classList.add('has-icon');
    if (!firstChild.hasChildNodes()) firstChild.remove();
  }

  const content = document.createElement('div');
  content.className = 'columns-content-callout-content';

  calloutChildren.forEach((element) => content.append(element));

  callout.append(content);
  column.append(callout);
}

// dark variant: turn any lone-link paragraph that page-level decoration left
// unstyled into a secondary pill button (e.g. an author forgot to italicize a
// CTA). Links that share their paragraph with other text (like a trailing ".")
// are intentionally skipped so inline links stay inline.
function buttonizeStandaloneLinks(block) {
  block.querySelectorAll('p > a[href]').forEach((a) => {
    if (a.classList.contains('button')) return;
    const p = a.closest('p');
    if (p.textContent.trim() !== a.textContent.trim()) return;
    if (a.querySelector('img')) return;
    p.classList.add('button-wrapper');
    a.classList.add('button', 'secondary');
  });
}

// dark variant: merge adjacent button-wrappers (authored as separate
// paragraphs) into a single row so the CTAs sit side by side.
function groupAdjacentButtons(block) {
  block.querySelectorAll('.button-wrapper').forEach((wrapper) => {
    const next = wrapper.nextElementSibling;
    if (next && next.classList.contains('button-wrapper')) {
      [...next.childNodes].forEach((node) => wrapper.append(node));
      next.remove();
    }
  });
}

/**
 * Decorates 2-column layout with optional callout.
 * Configured via block variant: "Columns Content (callout-both)", "Columns Content (callout-left)"
 * Or via data-callout="left" | "right" (default) | "both".
 * @param {Element} block
 */
export default function decorate(block) {
  const variantCallout = ['both', 'left', 'right'].find((v) => block.classList.contains(`callout-${v}`));
  const calloutConfig = (variantCallout || block.dataset.callout || 'right').toLowerCase();
  const shouldDecorateLeft = calloutConfig === 'left' || calloutConfig === 'both';
  const shouldDecorateRight = calloutConfig === 'right' || calloutConfig === 'both';

  // icon-right variant: the right column leads with an icon graphic beside its text.
  const iconRight = block.classList.contains('icon-right');

  if (block.classList.contains('dark')) {
    buttonizeStandaloneLinks(block);
    groupAdjacentButtons(block);
  }

  [...block.children].forEach((row) => {
    const cols = [...row.children];
    if (cols.length !== 2) return;

    row.classList.add('columns-content-row');
    cols[0].classList.add('columns-content-left');
    cols[1].classList.add('columns-content-right');

    if (iconRight) {
      buildIconColumn(cols[1]);
      return;
    }

    if (shouldDecorateLeft) buildCallout(cols[0]);
    if (shouldDecorateRight) buildCallout(cols[1]);
  });
}
