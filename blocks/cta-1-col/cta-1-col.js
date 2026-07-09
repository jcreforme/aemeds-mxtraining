export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;
  row.classList.add('cta-card');

  const cells = [...row.children];
  const [text, action] = cells;
  if (text) text.classList.add('cta-card-text');
  if (action) action.classList.add('cta-card-action');
}
