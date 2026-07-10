import { decorateBlock, loadBlock } from '../../scripts/aem.js';

const ANIMATION_DURATION_MS = 220;
const ANIMATION_EASING = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';

const NESTED_BLOCK_SELECTORS = [
  '.alert-strip',
  '.cards',
  '.cards-callout',
  '.cards-feature',
  '.carousel-quote',
  '.columns',
  '.columns-hero',
  '.fragment',
  '.hero',
  '.isi',
  '.quote',
  '.widget',
].join(', ');

function getRowCells(row) {
  return [...row.children].filter((child) => child.tagName === 'DIV');
}

function createAccordionItem({
  itemId,
  panelId,
  title,
  contentCells,
  expanded,
}) {
  const item = document.createElement('section');
  item.className = 'accordion-item';

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.id = `${itemId}-trigger`;
  trigger.className = 'accordion-trigger';
  trigger.setAttribute('aria-expanded', String(expanded));
  trigger.setAttribute('aria-controls', panelId);
  trigger.textContent = title;

  // heading wrapper gives the trigger a place in the document outline
  const header = document.createElement('h3');
  header.className = 'accordion-header';
  header.append(trigger);

  const panel = document.createElement('div');
  panel.id = panelId;
  panel.className = 'accordion-panel';
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-labelledby', trigger.id);
  panel.hidden = !expanded;

  const panelContent = document.createElement('div');
  panelContent.className = 'accordion-panel-content';
  if (contentCells.length > 1) {
    panelContent.classList.add('accordion-panel-content-multi');
  }

  contentCells.forEach((cell) => {
    cell.classList.add('accordion-panel-cell');
    panelContent.append(cell);
  });

  panel.append(panelContent);
  item.append(header, panel);
  return item;
}

function setItemExpandedState(item, expanded) {
  const trigger = item.querySelector(':scope > .accordion-header > .accordion-trigger');
  const panel = item.querySelector(':scope > .accordion-panel');
  if (!trigger || !panel) return;

  trigger.setAttribute('aria-expanded', String(expanded));
  panel.hidden = !expanded;
}

function shouldReduceMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function waitTransitionEnd(panel) {
  return new Promise((resolve) => {
    let completed = false;
    let onTransitionEnd;
    const done = () => {
      if (completed) return;
      completed = true;
      panel.removeEventListener('transitionend', onTransitionEnd);
      resolve();
    };
    onTransitionEnd = (event) => {
      if (event.target === panel && event.propertyName === 'height') done();
    };
    panel.addEventListener('transitionend', onTransitionEnd);
    window.setTimeout(done, ANIMATION_DURATION_MS + 40);
  });
}

function clearPanelAnimationStyles(panel) {
  panel.style.height = '';
  panel.style.overflow = '';
  panel.style.opacity = '';
  panel.style.transform = '';
  panel.style.transition = '';
}

async function animatePanelOpen(panel) {
  const content = panel.querySelector(':scope > .accordion-panel-content');
  panel.hidden = false;
  panel.style.overflow = 'hidden';
  panel.style.height = '0px';
  panel.style.opacity = '0';
  panel.style.transform = 'translateY(-4px)';
  // Force style application before starting transition.
  panel.getBoundingClientRect();
  panel.style.transition = `height ${ANIMATION_DURATION_MS}ms ${ANIMATION_EASING}, opacity ${ANIMATION_DURATION_MS}ms ${ANIMATION_EASING}, transform ${ANIMATION_DURATION_MS}ms ${ANIMATION_EASING}`;
  panel.style.height = `${content ? content.scrollHeight : panel.scrollHeight}px`;
  panel.style.opacity = '1';
  panel.style.transform = 'translateY(0)';
  await waitTransitionEnd(panel);
  clearPanelAnimationStyles(panel);
}

async function animatePanelClose(panel) {
  panel.style.overflow = 'hidden';
  panel.style.height = `${panel.scrollHeight}px`;
  panel.style.opacity = '1';
  panel.style.transform = 'translateY(0)';
  // Force style application before starting transition.
  panel.getBoundingClientRect();
  panel.style.transition = `height ${ANIMATION_DURATION_MS}ms ${ANIMATION_EASING}, opacity ${ANIMATION_DURATION_MS}ms ${ANIMATION_EASING}, transform ${ANIMATION_DURATION_MS}ms ${ANIMATION_EASING}`;
  panel.style.height = '0px';
  panel.style.opacity = '0';
  panel.style.transform = 'translateY(-4px)';
  await waitTransitionEnd(panel);
  panel.hidden = true;
  clearPanelAnimationStyles(panel);
}

async function setItemExpanded(item, expanded, { animate = true } = {}) {
  const trigger = item.querySelector(':scope > .accordion-header > .accordion-trigger');
  const panel = item.querySelector(':scope > .accordion-panel');
  if (!trigger || !panel) return;

  trigger.setAttribute('aria-expanded', String(expanded));

  if (!animate || shouldReduceMotion()) {
    panel.hidden = !expanded;
    clearPanelAnimationStyles(panel);
    return;
  }

  if (expanded) {
    await animatePanelOpen(panel);
    return;
  }

  await animatePanelClose(panel);
}

async function loadNestedBlocks(panel) {
  const nestedBlocks = [...panel.querySelectorAll(NESTED_BLOCK_SELECTORS)]
    .filter((candidate) => candidate.closest('.accordion-panel') === panel)
    .filter((candidate) => !candidate.dataset.blockStatus);

  await Promise.all(
    nestedBlocks.map(async (nestedBlock) => {
      decorateBlock(nestedBlock);
      await loadBlock(nestedBlock);
    }),
  );
}

async function expandItem(items, targetItem) {
  const updates = items.map((item) => setItemExpanded(item, item === targetItem));
  await Promise.all(updates);

  if (targetItem.dataset.nestedLoaded === 'true') return;
  const panel = targetItem.querySelector(':scope > .accordion-panel');
  if (!panel) return;

  await loadNestedBlocks(panel);
  targetItem.dataset.nestedLoaded = 'true';
}

async function toggleItem(item) {
  const isExpanded = item
    .querySelector(':scope > .accordion-header > .accordion-trigger')
    ?.getAttribute('aria-expanded') === 'true';
  await setItemExpanded(item, !isExpanded);

  if (isExpanded || item.dataset.nestedLoaded === 'true') return;
  const panel = item.querySelector(':scope > .accordion-panel');
  if (!panel) return;

  await loadNestedBlocks(panel);
  item.dataset.nestedLoaded = 'true';
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const sourceRows = [...block.children];
  if (!sourceRows.length) return;

  const isMultiOpen = block.classList.contains('multi-open');
  // FAQ variant starts fully collapsed, matching the live FAQ page
  const expandFirst = !block.classList.contains('faq');
  const uid = `accordion-${Math.random().toString(36).slice(2, 8)}`;
  const items = [];

  sourceRows.forEach((row, index) => {
    const cells = getRowCells(row);
    if (!cells.length) return;

    const titleCell = cells[0];
    const contentCells = cells.slice(1);
    const title = titleCell.textContent.trim() || `Section ${index + 1}`;

    const item = createAccordionItem({
      itemId: `${uid}-item-${index + 1}`,
      panelId: `${uid}-panel-${index + 1}`,
      title,
      contentCells,
      expanded: expandFirst && index === 0,
    });

    items.push(item);
  });

  block.replaceChildren(...items);

  items.forEach((item) => {
    const trigger = item.querySelector(':scope > .accordion-header > .accordion-trigger');
    if (!trigger) return;

    trigger.addEventListener('click', async () => {
      if (isMultiOpen) {
        await toggleItem(item);
      } else {
        const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
        if (isExpanded) {
          await setItemExpanded(item, false);
          return;
        }
        await expandItem(items, item);
      }
    });
  });

  if (!expandFirst) {
    items.forEach((item) => {
      setItemExpandedState(item, false);
    });
    return;
  }

  if (items[0]) {
    await setItemExpanded(items[0], true, { animate: false });
    items.slice(1).forEach((item) => {
      setItemExpandedState(item, false);
    });
    const firstPanel = items[0].querySelector(':scope > .accordion-panel');
    if (firstPanel) {
      await loadNestedBlocks(firstPanel);
      items[0].dataset.nestedLoaded = 'true';
    }
  }
}
