/*
 * Vyepti Homepage Call CTA
 * A centered "Need help getting started on VYEPTI? Call ..." strip with an
 * info icon, on the light teal band. Mirrors the original
 * `.vyepti-homepage-call-cta` component.
 *
 * Authoring contract (da.live) — a one-row table:
 *
 * | Vyepti Homepage Call Cta |||
 * | --- | --- |
 * | :information: | **Need help getting started on VYEPTI?
 *   Call [833-4-VYEPTI](tel:8334893784) (833-489-3784).** |
 *
 * The icon cell is optional: a single-cell row renders text only.
 */

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;
  const cells = [...row.children];

  // an icon cell holds only an icon (no meaningful text)
  const iconCell = cells.find((cell) => cell.querySelector(':scope .icon, :scope img')
    && !cell.textContent.trim());
  const textCell = cells.find((cell) => cell !== iconCell && cell.textContent.trim())
    || cells[cells.length - 1];

  if (iconCell) {
    iconCell.classList.add('vyepti-homepage-info-icon');
    // icon is decorative; the text conveys the message
    iconCell.querySelectorAll('.icon, img').forEach((el) => el.setAttribute('aria-hidden', 'true'));
  }
  if (textCell) textCell.classList.add('vyepti-homepage-cta');

  // expose the message to assistive tech as an informational note
  block.setAttribute('role', 'note');
}
