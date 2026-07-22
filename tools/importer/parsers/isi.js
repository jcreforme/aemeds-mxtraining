/* eslint-disable */
/* global WebImporter */
/**
 * Parser for isi. Custom block (no library convention).
 * Source: https://www.vyepti.com/downloadable-resources
 * Generated: 2026-07-22
 *
 * Target block: blocks/isi/isi.js. That block builds a sticky tray + inline
 * panel from rich text split by H5 headings. It expects the authored content
 * (the fallback used when the shared /fragments/isi fragment is unavailable) as
 * a single content cell containing, in document order:
 *
 *   ##### APPROVED USE
 *   VYEPTI is a prescription medicine…        ← summary (first child)
 *   ##### IMPORTANT SAFETY INFORMATION
 *   Do not receive VYEPTI…                    ← summary (first child)
 *   VYEPTI may cause serious side effects…    ← detail (remaining children)
 *   - Allergic reactions…                     ← detail
 *   …                                         ← detail
 *
 * parseSections() in the block groups by H5: sections[0] = Approved Use,
 * sections[1] = ISI (with all the detail paragraphs/lists). So the parser emits
 * Approved Use first, then Important Safety Information + its full detail body.
 *
 * The source markup is a Bootstrap grid with visual (source-order) columns; the
 * mobile-only "AND APPROVED USE" subtitle (`.mob-approved-text`) and the
 * expand-icon `<i>` glyphs are stripped — the block re-adds the subtitle itself.
 * PI/PPI PDF anchors (.download-link) are preserved verbatim.
 */
export default function parse(element, { document }) {
  // Use the collapsed tray source (#isiFixedBottom) as the authoritative
  // content — it carries both headings, both summaries, and the full detail
  // body. Fall back to the whole element if the id is absent.
  const scope = element.querySelector('#isiFixedBottom') || element;

  // Locate the three logical groups by their heading text / body id.
  const headings = Array.from(scope.querySelectorAll('h5'));
  const findHeading = (label) => headings.find((h) => (
    h.textContent.trim().toUpperCase().startsWith(label)
    // exclude the mobile-only "AND APPROVED USE" subtitle
    && !h.classList.contains('mob-approved-text')
  ));

  const isiHeading = findHeading('IMPORTANT SAFETY INFORMATION');
  const auHeading = findHeading('APPROVED USE');

  // Helper: clone a heading as a clean H5 without the expand-icon glyph.
  const cleanHeading = (h, text) => {
    const clone = document.createElement('h5');
    clone.textContent = (text || h.textContent).replace(/\s+/g, ' ').trim();
    return clone;
  };

  // The summary paragraph lives as a sibling <p> in the same column as its H5.
  const summaryOf = (h) => (h ? h.parentElement.querySelector(':scope > p') : null);

  // The full ISI detail body — the column carrying the list + detail paragraphs.
  const detailBody = scope.querySelector('#safetyInformationBody, .col-md-12.order-2');

  const contentCell = [];

  // 1. Approved Use section.
  if (auHeading) {
    contentCell.push(cleanHeading(auHeading, 'APPROVED USE'));
    const auSummary = summaryOf(auHeading);
    if (auSummary) contentCell.push(auSummary);
  }

  // 2. Important Safety Information section: heading + summary + full detail.
  if (isiHeading) {
    contentCell.push(cleanHeading(isiHeading, 'IMPORTANT SAFETY INFORMATION'));
    const isiSummary = summaryOf(isiHeading);
    if (isiSummary) contentCell.push(isiSummary);
  }
  if (detailBody) {
    Array.from(detailBody.children).forEach((node) => contentCell.push(node));
  }

  // Empty-block guard.
  if (contentCell.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Single-column block: one row, one cell holding all content elements.
  const cells = [[contentCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'isi', cells });
  element.replaceWith(block);
}
