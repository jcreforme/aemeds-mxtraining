/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion. Base block: accordion.
 * Source: https://www.vyepti.com/downloadable-resources
 * Generated: 2026-07-22
 *
 * The source is a `.cmp-accordion` with one `.cmp-accordion__item` per category.
 * Each item has:
 *   - a title in `h3.cmp-accordion__header > button > span.cmp-accordion__title`
 *   - a `.cmp-accordion__panel` whose body contains NESTED download-tile /
 *     image-text card grids (`.resource-tile`, `.image-text-comp`).
 *
 * The accordion table is 2 columns, one row per item:
 *   cell 1 = category title (clickable label)
 *   cell 2 = panel content (kept as live DOM nodes so the nested
 *            `.resource-tile` / `.image-text-comp` elements remain in place).
 *
 * Composition with cards-download: the import framework applies the
 * cards-download parser to the nested `.resource-tile` / `.image-text-comp`
 * elements. Because those elements are placed (by reference) inside cell 2 here,
 * the resulting nested cards-download tables end up inside the correct panel
 * cell for each category.
 *
 * The 4 categories are: "Getting Started With VYEPTI", "Setting Up Your
 * Treatment", "Ongoing Support", "Community Resources". Plain "Accordion" block
 * name — no faq/insurance/multi-open modifier (first item auto-opens per the
 * base accordion block behaviour).
 */
export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll(':scope > .cmp-accordion__item, .cmp-accordion__item'))
    // keep only items directly owned by this accordion (guard against any
    // deeper nesting)
    .filter((item) => item.closest('.cmp-accordion') === element);

  const cells = [];

  items.forEach((item) => {
    // Title — the accordion header label.
    const titleEl = item.querySelector('.cmp-accordion__title, .cmp-accordion__header button, .cmp-accordion__header');
    const title = (titleEl ? titleEl.textContent : '').trim();

    // Panel — the collapsible content body containing the nested card grids.
    const panel = item.querySelector('.cmp-accordion__panel');

    // Collect the panel's content nodes (live references) so nested
    // .resource-tile / .image-text-comp elements are preserved for the
    // cards-download parser to transform in place.
    const contentCell = [];
    if (panel) {
      // Prefer inner content wrappers if present, otherwise use the panel body.
      Array.from(panel.childNodes).forEach((node) => contentCell.push(node));
    }

    // Empty-item guard: skip items with no title and no content.
    if (!title && contentCell.length === 0) return;

    cells.push([title || 'Section', contentCell]);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion', cells });
  element.replaceWith(block);
}
