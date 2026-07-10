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

/* ─── Block entry point ─────────────────────────────────────────────────── */

/**
 * @param {Element} block The hero block element
 */
export default function decorate(block) {
  if (block.classList.contains('split')) {
    decorateSplit(block);
  } else {
    decorateSingle(block);
  }
}
