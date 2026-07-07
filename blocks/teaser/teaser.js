/**
 * Teaser block
 *
 * Variants (set by table header, drives CSS class):
 *   Teaser (Image Right)  → .teaser.image-right  — two-column split; content
 *                           left / image right on desktop, image first on mobile.
 *   Teaser (Image Left)   → .teaser.image-left   — two-column split; image left /
 *                           content right on desktop, image first on mobile.
 *   Teaser (Image Center) → .teaser.image-center — stacked, centered; image
 *                           above content.
 *
 * Authored as a one-row, two-column table. One cell holds the image, the other
 * the content — in either order (the image cell is detected, not positional).
 * Content: eyebrow (bold-only paragraph) + heading + body + CTA link.
 */

const VARIANTS = ['image-left', 'image-right', 'image-center'];

// Earlier pages were authored with the long variant names; map them to the
// current short classes so published content keeps rendering after the rename.
const LEGACY_ALIASES = {
  'teaser-image-right-align-first': 'image-right',
  'teaser-image-center-align': 'image-center',
};

export default function decorate(block) {
  Object.entries(LEGACY_ALIASES).forEach(([legacy, current]) => {
    if (block.classList.contains(legacy)) block.classList.add(current);
  });
  if (!VARIANTS.some((v) => block.classList.contains(v))) {
    block.classList.add('image-right');
  }

  const row = block.querySelector(':scope > div');
  if (!row) return;

  // Authors may put the image in either cell — detect it, don't assume order
  const cells = [...row.querySelectorAll(':scope > div')];
  const imageCell = cells.find((cell) => cell.querySelector('picture, img'));
  const contentCell = cells.find((cell) => cell !== imageCell);

  if (imageCell) imageCell.classList.add('teaser-image');

  const hasContent = contentCell
    && (contentCell.children.length > 0 || contentCell.textContent.trim());
  if (hasContent) {
    contentCell.classList.add('teaser-content');

    const heading = contentCell.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) heading.classList.add('teaser-heading');

    // First child <p> whose only substantive child is a <strong> or <em>
    // → eyebrow label (being the first child, it always precedes the heading)
    const firstP = contentCell.querySelector(':scope > p:first-child');
    if (firstP) {
      const substantive = [...firstP.childNodes].filter(
        (n) => !(n.nodeType === Node.TEXT_NODE && !n.textContent.trim()),
      );
      if (
        substantive.length === 1
        && ['STRONG', 'EM'].includes(substantive[0].tagName)
      ) {
        firstP.classList.add('teaser-eyebrow');
      }
    }
  }

  // Lift cells directly into the block, image first so it stacks on top on
  // mobile for every variant; desktop order is handled in CSS
  if (imageCell) block.append(imageCell);
  if (hasContent) block.append(contentCell);
  row.remove();
}
