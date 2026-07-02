/**
 * Decorates the alert strip block.
 *
 * Authoring contract (one row, up to two cells):
 * | alert-strip |
 * | :information: | **Need help getting started on VYEPTI?
 *   Call [833-4-VYEPTI](tel:8334893784) (833-489-3784).** |
 *
 * The icon cell is optional; a single cell is treated as text only.
 *
 * @param {Element} block The alert-strip block element
 */
export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;

  const cells = [...row.children];
  cells.forEach((cell) => {
    const isIconOnly = cell.querySelector('.icon') && !cell.textContent.trim();
    cell.classList.add(isIconOnly ? 'alert-strip-icon' : 'alert-strip-text');
  });

  // an icon-only cell is decorative
  const icon = block.querySelector('.alert-strip-icon');
  if (icon) icon.setAttribute('aria-hidden', 'true');

  block.setAttribute('role', 'note');
}
