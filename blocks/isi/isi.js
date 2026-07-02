/**
 * ISI (Important Safety Information) Block
 *
 * Replicates the two-section AEM pattern from the live Vyepti.com source:
 *
 *   1. Sticky tray (#isiFixedBottom equivalent) — fixed to the viewport bottom.
 *      - COLLAPSED: two-column header (ISI left, Approved Use right on desktop;
 *        single column with "AND APPROVED USE" subtitle on mobile).
 *      - EXPANDED: same header + full ISI body slides in below.
 *      - Auto-docks (slides out) when the inline panel enters view.
 *
 *   2. Inline panel (#SafetyPanelInfo equivalent) — in document flow above the
 *      footer. Single-column: Approved Use → ISI summary → full ISI detail.
 *
 * Authoring contract — single table cell, rich text:
 * ┌─────────────────────────────────────────────────────────┐
 * │ isi                                                     │
 * ├─────────────────────────────────────────────────────────┤
 * │ ##### APPROVED USE                                      │
 * │ VYEPTI is a prescription medicine…                      │
 * │ ##### IMPORTANT SAFETY INFORMATION                      │
 * │ **Do not receive VYEPTI** if you have…      ← summary  │
 * │ **VYEPTI may cause serious side effects…**  ← detail   │
 * │ - Allergic reactions…                        ← detail  │
 * │ …                                                       │
 * └─────────────────────────────────────────────────────────┘
 *
 * Parsed result:
 *   sections[0] = Approved Use  { heading, summary: [p], detail: [] }
 *   sections[1] = ISI           { heading, summary: [p], detail: [p, ul, …] }
 */

const CLS_EXPANDED = 'isi-tray-expanded';
const CLS_DOCKED = 'isi-tray-docked';

/* ─── Content parsing ────────────────────────────────────────────────────── */

/**
 * Split the authored content into sections by H5 heading.
 * Each section's body is further split into:
 *   summary — the first child element (shown in the collapsed tray header)
 *   detail  — remaining children (shown only when the tray is expanded)
 * @param {Element} root
 * @returns {{ heading: Element, summary: Element[], detail: Element[] }[]}
 */
function parseSections(root) {
  const sections = [];
  let current = null;
  [...root.children].forEach((el) => {
    if (el.tagName === 'H5') {
      current = { heading: el, summary: [], detail: [] };
      sections.push(current);
    } else if (current) {
      if (current.summary.length === 0) {
        current.summary.push(el); // first child → visible in collapsed tray
      } else {
        current.detail.push(el); // rest → only shown when expanded
      }
    }
  });
  return sections;
}

/** Deep-clone a section's node list. */
function cloneNodes(nodes) {
  return nodes.map((n) => n.cloneNode(true));
}

/* ─── Shared toggle button ───────────────────────────────────────────────── */

/**
 * Create an accessible +/− circular toggle button.
 * @param {string} controlsId  id of the controlled region
 * @param {string} closedLabel  aria-label when collapsed
 * @param {string} openLabel    aria-label when expanded
 */
function makeToggle(controlsId, closedLabel, openLabel) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'isi-toggle';
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', controlsId);
  btn.setAttribute('aria-label', closedLabel);
  btn.dataset.closed = closedLabel;
  btn.dataset.open = openLabel;
  return btn;
}

function syncToggle(btn, expanded) {
  btn.setAttribute('aria-expanded', String(expanded));
  btn.setAttribute('aria-label', expanded ? btn.dataset.open : btn.dataset.closed);
}

/* ─── Sticky tray (#isiFixedBottom) ─────────────────────────────────────── */

/**
 * Build the sticky fixed-bottom tray.
 *
 * Collapsed header layout (mirrors the live Vyepti.com isiFixedBottom):
 *   Desktop: [ISI heading + summary | AU heading + para | toggle btn]
 *   Mobile:  [ISI heading (with "AND APPROVED USE" subtitle) + summary | toggle]
 *
 * Expanded: header stays visible, full ISI detail body slides in beneath.
 *
 * @param {{ heading, summary, detail }[]} sections  [0]=AU, [1]=ISI
 * @returns {{ tray: HTMLElement }}
 */
function buildTray(sections) {
  const [au, isi] = sections.length >= 2 ? sections : [null, sections[0]];

  const tray = document.createElement('aside');
  tray.className = 'isi-tray';
  tray.setAttribute('role', 'complementary');
  tray.setAttribute('aria-label', 'Important Safety Information');

  /* ── Two-column header ─────────────────────────────────────────────────── */
  const header = document.createElement('div');
  header.className = 'isi-tray-header';

  // Left column — ISI summary (always visible on all breakpoints)
  const isiCol = document.createElement('div');
  isiCol.className = 'isi-tray-col isi-tray-col-isi';

  if (isi) {
    const isiHeading = isi.heading.cloneNode(true);
    // Mobile subtitle "AND APPROVED USE" inside the ISI heading
    const subtitle = document.createElement('span');
    subtitle.className = 'isi-tray-subtitle';
    subtitle.textContent = 'AND APPROVED USE';
    isiHeading.append(subtitle);
    isiCol.append(isiHeading, ...cloneNodes(isi.summary));
  }

  // Right column — Approved Use (hidden on mobile via CSS)
  const auCol = document.createElement('div');
  auCol.className = 'isi-tray-col isi-tray-col-au';

  if (au) {
    auCol.append(au.heading.cloneNode(true), ...cloneNodes(au.summary));
  }

  // Single toggle button
  const bodyId = 'isi-tray-body';
  const toggle = makeToggle(
    bodyId,
    'Expand Important Safety Information',
    'Collapse Important Safety Information',
  );

  header.append(isiCol, auCol, toggle);

  /* ── Expandable detail body ────────────────────────────────────────────── */
  const body = document.createElement('div');
  body.className = 'isi-tray-body';
  body.id = bodyId;
  body.setAttribute('role', 'region');
  body.setAttribute('aria-label', 'Full Important Safety Information');

  const bodyInner = document.createElement('div');
  bodyInner.className = 'isi-tray-body-inner';

  if (isi) bodyInner.append(...cloneNodes(isi.detail));
  body.append(bodyInner);

  tray.append(header, body);

  /* ── Interaction ────────────────────────────────────────────────────────── */
  const setExpanded = (expanded) => {
    tray.classList.toggle(CLS_EXPANDED, expanded);
    syncToggle(toggle, expanded);
  };

  // Clicking header (or the toggle button within it) toggles the tray
  header.addEventListener('click', (e) => {
    if (e.target.closest('a')) return;
    setExpanded(!tray.classList.contains(CLS_EXPANDED));
  });

  // Links inside the expanded body navigate without collapsing
  body.addEventListener('click', (e) => {
    if (e.target.closest('a')) e.stopPropagation();
  });

  // Escape key collapses
  tray.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && tray.classList.contains(CLS_EXPANDED)) {
      setExpanded(false);
      toggle.focus();
    }
  });

  return { tray };
}

/* ─── Inline panel (#SafetyPanelInfo) ───────────────────────────────────── */

/**
 * Build the full inline ISI panel.
 *
 * @param {{ heading, summary, detail }[]} sections  [0]=AU, [1]=ISI
 * @returns {HTMLElement}
 */
function buildInlinePanel(sections) {
  const [au, isi] = sections.length >= 2 ? sections : [null, sections[0]];

  const panel = document.createElement('section');
  panel.className = 'isi-panel';
  panel.id = 'SafetyPanelInfo';
  panel.setAttribute('aria-label', 'Important Safety Information');

  // Approved Use section
  const auSection = document.createElement('div');
  auSection.className = 'isi-section';
  if (au) {
    auSection.append(au.heading.cloneNode(true), ...cloneNodes(au.summary));
  }

  // ISI section — heading + summary + full detail (always visible)
  const isiSection = document.createElement('div');
  isiSection.className = 'isi-section';
  if (isi) {
    isiSection.append(
      isi.heading.cloneNode(true),
      ...cloneNodes(isi.summary),
    );
  }

  // ISI detail body (always visible in the inline panel)
  const isiDetail = document.createElement('div');
  isiDetail.className = 'isi-section-detail';
  if (isi) isiDetail.append(...cloneNodes(isi.detail));

  panel.append(auSection, isiSection, isiDetail);
  return panel;
}

/* ─── Docking + body offset ─────────────────────────────────────────────── */

/**
 * Use IntersectionObserver to dock the tray when the inline panel is visible,
 * and undock it when the user scrolls back up.
 */
function wireDocking(tray, panel) {
  if (!('IntersectionObserver' in window)) return;
  new IntersectionObserver(
    (entries) => entries.forEach(({ isIntersecting }) => {
      tray.classList.toggle(CLS_DOCKED, isIntersecting);
    }),
    { threshold: 0 },
  ).observe(panel);
}

/**
 * Keep --isi-tray-offset on :root equal to the tray header height so the
 * page's body padding-bottom reserves space — declared in CSS (no CLS).
 */
function syncTrayOffset(tray) {
  const header = tray.querySelector('.isi-tray-header');
  const update = () => {
    const h = tray.classList.contains(CLS_DOCKED) ? 0 : header.offsetHeight;
    document.documentElement.style.setProperty('--isi-tray-offset', `${h}px`);
  };
  new ResizeObserver(update).observe(header);
  tray.addEventListener('transitionend', update);
  update();
}

/* ─── Block entry point ──────────────────────────────────────────────────── */

/**
 * @param {Element} block
 */
export default async function decorate(block) {
  const content = block.querySelector(':scope > div > div') || block.firstElementChild;
  if (!content) return;

  // External PDFs → new tab
  content.querySelectorAll('a[href$=".pdf"]').forEach((a) => {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  });

  const sections = parseSections(content);

  // 1. Inline panel (in document flow)
  const panel = buildInlinePanel(sections);
  block.replaceChildren(panel);

  // 2. Sticky tray (outside document flow — no CLS)
  const { tray } = buildTray(sections);
  document.body.append(tray);

  wireDocking(tray, panel);
  syncTrayOffset(tray);
}
