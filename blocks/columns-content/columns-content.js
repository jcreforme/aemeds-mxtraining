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

// prepare-steps variant: builds a two-column "choose a location" + interactive
// "prepare for each step" card from a FLAT authored table so it round-trips
// through Document Authoring:
//   - a one-cell row  -> left column content (the first one) or the card title
//   - a two-cell row  -> one tab: [icon + label] | [that tab's panel content]

// A bulleted list whose every item leads with an icon becomes the 4-across
// location grid (icon stacked above its label).
function buildLocationGrid(container) {
  const list = [...container.querySelectorAll('ul')].find((ul) => {
    const items = [...ul.children];
    return items.length > 0 && items.every((li) => li.querySelector(':scope > .icon'));
  });
  if (!list) return;

  const grid = document.createElement('div');
  grid.className = 'prepare-steps-locations';

  [...list.children].forEach((li) => {
    const cell = document.createElement('div');
    const icon = li.querySelector(':scope > .icon');
    if (icon) {
      icon.classList.add('prepare-steps-location-icon');
      cell.append(icon);
    }
    const label = document.createElement('p');
    label.textContent = li.textContent.trim();
    cell.append(label);
    grid.append(cell);
  });

  list.replaceWith(grid);
}

function decoratePrepareSteps(block) {
  const rows = [...block.children];
  const singleCellRows = [];
  const tabRows = [];

  rows.forEach((row) => {
    const cells = [...row.children].filter((child) => child.tagName === 'DIV');
    if (cells.length >= 2) tabRows.push(cells);
    else if (cells.length === 1) singleCellRows.push(cells[0]);
  });

  const leftSource = singleCellRows[0];
  const titleSource = singleCellRows[1];
  const cardTitle = titleSource ? titleSource.textContent.trim() : 'Prepare for each step';

  // ---- left column ----
  const left = document.createElement('div');
  left.className = 'prepare-steps-content';
  if (leftSource) {
    while (leftSource.firstChild) left.append(leftSource.firstChild);
    buildLocationGrid(left);
  }

  // ---- right column: the prepare card ----
  const card = document.createElement('div');
  card.className = 'prepare-steps-card';

  const header = document.createElement('div');
  header.className = 'prepare-steps-header';
  const heading = document.createElement('h3');
  heading.textContent = cardTitle;
  header.append(heading);

  const tablist = document.createElement('div');
  tablist.className = 'prepare-steps-tabs';
  tablist.setAttribute('role', 'tablist');

  const panelWrap = document.createElement('div');
  panelWrap.className = 'prepare-steps-panels';

  const uid = `prepare-steps-${Math.random().toString(36).slice(2, 8)}`;
  const tabs = [];
  const panels = [];

  tabRows.forEach((cells, i) => {
    const [labelCell, panelCell] = cells;
    const tabId = `${uid}-tab-${i}`;
    const panelId = `${uid}-panel-${i}`;

    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'prepare-steps-tab';
    tab.id = tabId;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panelId);

    const icon = labelCell.querySelector('.icon');
    if (icon) {
      const iconWrap = document.createElement('span');
      iconWrap.className = 'prepare-steps-tab-icon';
      iconWrap.append(icon);
      tab.append(iconWrap);
    }
    const label = document.createElement('span');
    label.className = 'prepare-steps-tab-label';
    label.textContent = labelCell.textContent.trim();
    tab.append(label);

    const panel = document.createElement('div');
    panel.className = 'prepare-steps-panel';
    panel.id = panelId;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tabId);
    while (panelCell.firstChild) panel.append(panelCell.firstChild);

    tablist.append(tab);
    panelWrap.append(panel);
    tabs.push(tab);
    panels.push(panel);
  });

  const activate = (index, setFocus = false) => {
    tabs.forEach((tab, i) => {
      const selected = i === index;
      tab.classList.toggle('is-active', selected);
      tab.setAttribute('aria-selected', selected ? 'true' : 'false');
      tab.setAttribute('tabindex', selected ? '0' : '-1');
      panels[i].hidden = !selected;
      if (selected && setFocus) tab.focus();
    });
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activate(i));
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        activate((i + 1) % tabs.length, true);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        activate((i - 1 + tabs.length) % tabs.length, true);
      } else if (e.key === 'Home') {
        e.preventDefault();
        activate(0, true);
      } else if (e.key === 'End') {
        e.preventDefault();
        activate(tabs.length - 1, true);
      }
    });
  });

  card.append(header, tablist, panelWrap);
  block.replaceChildren(left, card);

  if (tabs.length) activate(tabs.length - 1);
}

/**
 * Decorates 2-column layout with optional callout.
 * Configured via block variant: "Columns Content (callout-both)", "Columns Content (callout-left)"
 * Or via data-callout="left" | "right" (default) | "both".
 * @param {Element} block
 */
export default function decorate(block) {
  if (block.classList.contains('prepare-steps')) {
    decoratePrepareSteps(block);
    return;
  }

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
