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
 * Content sourcing — the block always fetches its content from the shared
 * `/fragments/isi` fragment (single source of truth, authored once, rendered
 * on every page). An authored link/path inside the block overrides the
 * default fragment path; content authored directly in the block table is
 * kept only as a fallback if the fragment request fails.
 *
 * Loading safety — every promise in this module resolves. The fetch is
 * bounded by a timeout and wrapped in try/catch, and decorate() releases its
 * host section in a `finally` guard, so a slow or failing fragment can never
 * leave later sections stuck in `data-section-status="initialized"|"loading"`
 * with `display: none`.
 *
 * Expected fragment content — rich text split by H5 headings:
 *   ##### APPROVED USE
 *   VYEPTI is a prescription medicine…               ← summary
 *   ##### IMPORTANT SAFETY INFORMATION
 *   **Do not receive VYEPTI** if you have…           ← summary
 *   **VYEPTI may cause serious side effects…**       ← detail
 *   - Allergic reactions…                            ← detail
 *
 * Parsed result:
 *   sections[0] = Approved Use  { heading, summary: [p], detail: [] }
 *   sections[1] = ISI           { heading, summary: [p], detail: [p, ul, …] }
 */

const ISI_FRAGMENT_PATH = '/fragments/isi';
const FETCH_TIMEOUT_MS = 5000;

const CLS_EXPANDED = 'isi-tray-expanded';
const CLS_DOCKED = 'isi-tray-docked';

/* ─── Fragment loading ───────────────────────────────────────────────────── */

/**
 * Resolve the fragment path for the ISI content.
 * Priority: authored link in the block → authored plain-text path → default.
 * @param {Element} block
 * @returns {string}
 */
function resolveFragmentPath(block) {
  const link = block.querySelector('a[href]');
  if (link) {
    try {
      const url = new URL(link.getAttribute('href'), window.location.href);
      if (url.origin === window.location.origin) return url.pathname;
    } catch {
      /* malformed href — fall through to default */
    }
  }
  const text = block.textContent.trim();
  if (text.startsWith('/') && !text.startsWith('//') && !/\s/.test(text)) return text;
  return ISI_FRAGMENT_PATH;
}

/**
 * Fetch and parse the ISI fragment. The request is bounded by a timeout so a
 * stalled network can never hold the section pipeline hostage; any failure
 * resolves to `null` rather than rejecting.
 * @param {string} path fragment path (without `.plain.html`)
 * @returns {Promise<Element|null>} parsed fragment root, or null on failure
 */
async function fetchFragment(path) {
  try {
    const resp = await fetch(`${path}.plain.html`, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!resp.ok) throw new Error(`unexpected response ${resp.status}`);

    const root = document.createElement('div');
    root.innerHTML = await resp.text();

    // rebase relative media references to the fragment's own path
    const resetAttributeBase = (tag, attr) => {
      root.querySelectorAll(`${tag}[${attr}^="./media_"]`).forEach((elem) => {
        elem[attr] = new URL(elem.getAttribute(attr), new URL(path, window.location)).href;
      });
    };
    resetAttributeBase('img', 'src');
    resetAttributeBase('source', 'srcset');

    return root;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`ISI fragment failed to load from ${path}`, error);
    return null;
  }
}

/**
 * Locate the element whose direct children are the authored rich text
 * (H5 headings, paragraphs, lists), regardless of wrapper nesting.
 * @param {Element} root
 * @returns {Element|null}
 */
function findContentRoot(root) {
  if (!root) return null;
  const heading = root.querySelector('h5');
  return heading ? heading.parentElement : null;
}

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
    if (!expanded) body.scrollTop = 0;
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
    isiSection.append(isi.heading.cloneNode(true), ...cloneNodes(isi.summary));
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
 * ResizeObserver covers content changes; window resize and font loading are
 * handled explicitly as fallbacks since both change the header height.
 */
function syncTrayOffset(tray) {
  const header = tray.querySelector('.isi-tray-header');
  const update = () => {
    const h = tray.classList.contains(CLS_DOCKED) ? 0 : header.offsetHeight;
    document.documentElement.style.setProperty('--isi-tray-offset', `${h}px`);
  };
  new ResizeObserver(update).observe(header);
  tray.addEventListener('transitionend', update);
  window.addEventListener('resize', update, { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(update);
  update();
}

/**
 * Keep only one sticky ISI tray in the document.
 * Re-decoration can happen in authoring or preview flows; this prevents
 * duplicated `.isi-tray` nodes.
 */
function cleanupExistingTray() {
  document.querySelectorAll('.isi-tray').forEach((existingTray) => existingTray.remove());
  document.documentElement.style.removeProperty('--isi-tray-offset');
}

/**
 * Remove the block (and its wrapper) when there is nothing to render,
 * leaving the section pipeline untouched.
 */
function removeBlock(block) {
  cleanupExistingTray();
  const wrapper = block.closest('.isi-wrapper');
  (wrapper || block).remove();
}

/* ─── Block entry point ──────────────────────────────────────────────────── */

/**
 * Loads and decorates the ISI block.
 *
 * This function is awaited by loadBlock()/loadSection() in aem.js, so it is
 * guaranteed to RESOLVE in bounded time no matter what happens to the
 * fragment request: the fetch is time-boxed, every failure path is caught,
 * and the `finally` guard releases the host section. Later page sections can
 * therefore never be stuck hidden behind a slow or missing ISI fragment.
 *
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  // Content authored directly in the block table (legacy pages) is kept as a
  // fallback in case the shared fragment cannot be fetched.
  const authoredContent = findContentRoot(block);
  const fragmentPath = resolveFragmentPath(block);

  const fragment = await fetchFragment(fragmentPath);
  const content = findContentRoot(fragment) || authoredContent;

  try {
    const sections = content ? parseSections(content) : [];
    if (!sections.length) {
      removeBlock(block);
      return;
    }

    // External document links (PI/PPI PDFs) → new tab
    content.querySelectorAll('a[href$=".pdf"]').forEach((a) => {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    });

    // 1. Inline panel (in document flow)
    const panel = buildInlinePanel(sections);
    block.replaceChildren(panel);

    // 2. Sticky tray (outside document flow — no CLS)
    cleanupExistingTray();
    const { tray } = buildTray(sections);
    document.body.append(tray);

    wireDocking(tray, panel);
    syncTrayOffset(tray);

    // Support deep links to the inline panel (e.g. footer "See full ISI")
    if (window.location.hash === `#${panel.id}`) panel.scrollIntoView();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('ISI decoration failed', error);
    removeBlock(block);
  } finally {
    // Fail-open: whatever happened above, never leave the host section
    // hidden — mirrors the safety net used by the fragment block.
    const section = block.closest('.section');
    if (section && section.dataset.sectionStatus !== 'loaded') {
      section.dataset.sectionStatus = 'loaded';
      section.style.display = null;
    }
  }
}
