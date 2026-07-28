/**
 * Hero Block
 *
 * Two variants:
 *
 * 1. DEFAULT — single-panel interior-page hero: full-bleed image with
 *    overlaid heading, copy, CTA, and optional "Actor portrayal" disclaimer.
 *
 * 2. SPLIT (`hero (split)`) — replica of the vyepti.com homepage banner
 *    (.teaser.homeBanner): two image panels side by side on desktop, stacked
 *    on mobile, each with centered overlay copy. Authoring contract — one row
 *    per panel, two cells (image | content):
 *    ┌──────────────────┬───────────────────────────────────────┐
 *    │ hero (split)                                             │
 *    ├──────────────────┼───────────────────────────────────────┤
 *    │ [left image]     │ When a showstopping migraine…         │
 *    │                  │ # nope                                │
 *    │                  │ *Actor portrayal*                     │
 *    ├──────────────────┼───────────────────────────────────────┤
 *    │ [right image]    │ It may be time to                     │
 *    │                  │ # say **yep** to **VYEPTI**           │
 *    │                  │ Migraine prevention that's proven…    │
 *    │                  │ [Check out study results](/…)         │
 *    │                  │ *Actor portrayal*                     │
 *    └──────────────────┴───────────────────────────────────────┘
 *    Within a heading, **bold** words render in the brand red
 *    (.split-color-chronic-red equivalent). An italic-only last paragraph
 *    becomes the photo disclaimer. A link becomes the rose pill CTA.
 */

/* ─── Split variant ─────────────────────────────────────────────────────── */

/**
 * Decorate one authored content cell into panel content:
 * headings → display text, paragraph after a heading → sub-text,
 * link → CTA pill, italic-only last paragraph → disclaimer.
 * @param {Element} content the content cell
 */
function decoratePanelContent(content) {
  content.classList.add('hero-panel-content');

  // classify the disclaimer first so it is never mistaken for sub-text
  const paragraphs = [...content.children].filter((el) => el.tagName === 'P');
  const last = paragraphs[paragraphs.length - 1];
  if (last && !last.querySelector('a') && last.querySelector('em, i')) {
    last.classList.add('hero-disclaimer');
  }

  content.querySelectorAll('h1, h2, h3').forEach((heading) => {
    heading.classList.add('hero-display');
    const next = heading.nextElementSibling;
    if (
      next
      && next.tagName === 'P'
      && !next.querySelector('a')
      && !next.classList.contains('hero-disclaimer')
    ) {
      next.classList.add('hero-subtext');
    }
  });

  const cta = content.querySelector('a');
  if (cta) {
    cta.classList.add('hero-cta');
    // unwrap authored bold/italic so the link itself is the button
    const wrap = cta.closest('strong, em');
    if (wrap) wrap.replaceWith(cta);
    const ctaWrapper = cta.closest('p');
    if (ctaWrapper) {
      ctaWrapper.classList.add('hero-cta-container');
      ctaWrapper.classList.remove('hero-subtext');
    }
  }
}

/**
 * Build the two-panel split hero (vyepti.com homeBanner equivalent).
 * @param {Element} block
 */
function decorateSplit(block) {
  const panels = document.createElement('div');
  panels.className = 'hero-panels';

  [...block.children].forEach((row, i) => {
    const cells = [...row.children];
    if (!cells.length) return;

    const panel = document.createElement('div');
    panel.className = `hero-panel hero-panel-${i + 1}`;

    // cells are order-agnostic: the one holding a <picture> is the media
    const mediaCell = cells.find((c) => c.querySelector('picture'));
    const contentCell = cells.find((c) => c !== mediaCell) || null;

    if (mediaCell) {
      const media = document.createElement('div');
      media.className = 'hero-panel-media';
      media.append(...mediaCell.querySelectorAll('picture'));
      panel.append(media);
    }
    if (contentCell) {
      decoratePanelContent(contentCell);
      panel.append(contentCell);
    }
    panels.append(panel);
  });

  block.replaceChildren(panels);
}

/* ─── Default single-panel variant ──────────────────────────────────────── */

function decorateSingle(block) {
  const row = block.firstElementChild;
  if (!row) return;

  row.classList.add('hero-layout');

  const columns = Array.from(row.children);
  if (columns.length < 2) return;

  const media = columns[0];
  const content = columns[1];

  media.classList.add('hero-media');
  content.classList.add('hero-content');

  const picture = media.querySelector('picture');
  if (picture) media.replaceChildren(picture);

  const cta = content.querySelector('a');
  if (cta) {
    cta.classList.add('hero-cta');
    const ctaWrapper = cta.closest('p');
    if (ctaWrapper) ctaWrapper.classList.add('hero-cta-container');
  }

  const secondaryDisclaimer = content.querySelector(
    '.cmp-teaser__description__secondary, .actor-portrayl-text-shadow, .actor-portrayal-text-shadow',
  );

  if (secondaryDisclaimer) {
    const disclaimerEl = secondaryDisclaimer.classList.contains('cmp-teaser__description__secondary')
      ? secondaryDisclaimer
      : secondaryDisclaimer.closest('.cmp-teaser__description__secondary') || secondaryDisclaimer;
    disclaimerEl.classList.add('hero-disclaimer');
    return;
  }

  const paragraphs = Array.from(content.children).filter((el) => el.tagName === 'P');
  const lastParagraph = paragraphs[paragraphs.length - 1];

  if (
    lastParagraph
    && !lastParagraph.querySelector('a')
    && lastParagraph.querySelector('em, i')
  ) {
    lastParagraph.classList.add('hero-disclaimer');
  }
}

/* ─── Prepare variant (interactive tabbed card) ─────────────────────────── */

/**
 * Build the "prepare for each step" tabbed card from a flat authored table so
 * it round-trips through Document Authoring:
 *   - a one-cell row  -> the card title
 *   - a two-cell row  -> one tab: [icon + label] | [that tab's panel content]
 * @param {Element} block
 */
function decoratePrepare(block) {
  const rows = [...block.children];
  const singleCellRows = [];
  const tabRows = [];

  rows.forEach((row) => {
    const cells = [...row.children].filter((child) => child.tagName === 'DIV');
    if (cells.length >= 2) tabRows.push(cells);
    else if (cells.length === 1) singleCellRows.push(cells[0]);
  });

  const titleSource = singleCellRows[0];
  const cardTitle = titleSource ? titleSource.textContent.trim() : 'Prepare for each step';

  const card = document.createElement('div');
  card.className = 'hero-prepare-card';

  const header = document.createElement('div');
  header.className = 'hero-prepare-header';
  const heading = document.createElement('h3');
  heading.textContent = cardTitle;
  header.append(heading);

  const tablist = document.createElement('div');
  tablist.className = 'hero-prepare-tabs';
  tablist.setAttribute('role', 'tablist');

  const panelWrap = document.createElement('div');
  panelWrap.className = 'hero-prepare-panels';

  const uid = `hero-prepare-${Math.random().toString(36).slice(2, 8)}`;
  const tabs = [];
  const panels = [];

  tabRows.forEach((cells, i) => {
    const [labelCell, panelCell] = cells;
    const tabId = `${uid}-tab-${i}`;
    const panelId = `${uid}-panel-${i}`;

    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'hero-prepare-tab';
    tab.id = tabId;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panelId);

    const icon = labelCell.querySelector('.icon');
    if (icon) {
      const iconWrap = document.createElement('span');
      iconWrap.className = 'hero-prepare-tab-icon';
      iconWrap.append(icon);
      tab.append(iconWrap);
    }
    const label = document.createElement('span');
    label.className = 'hero-prepare-tab-label';
    label.textContent = labelCell.textContent.trim();
    tab.append(label);

    const panel = document.createElement('div');
    panel.className = 'hero-prepare-panel';
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
  block.replaceChildren(card);

  if (tabs.length) activate(tabs.length - 1);
}

/* ─── Block entry point ─────────────────────────────────────────────────── */

/**
 * @param {Element} block The hero block element
 */
export default function decorate(block) {
  if (block.classList.contains('prepare')) {
    decoratePrepare(block);
  } else if (block.classList.contains('split')) {
    decorateSplit(block);
  } else {
    decorateSingle(block);
  }
}
