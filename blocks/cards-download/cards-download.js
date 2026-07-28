import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Cards Download Block
 *
 * A standalone resource-card grid (image/logo on the left, heading + copy +
 * Download/Email action links on the right), matching the vyepti.com
 * "Resources to help you get started" section. Two cards per row on desktop,
 * single column on mobile.
 *
 * Authoring contract — one row per card, two cells (image | body):
 * ┌───────────────┬──────────────────────────────────────────┐
 * │ cards-download                                            │
 * ├───────────────┼──────────────────────────────────────────┤
 * │ [logo/image]  │ ### Financial Assistance and …           │
 * │               │ Learn more about how VYEPTI CONNECT …    │
 * │               │ **[Download](…pdf)** :download-18:       │
 * │               │ *[Email](#tile-modal)* :email:           │
 * └───────────────┴──────────────────────────────────────────┘
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-download-card-image';
      } else {
        div.className = 'cards-download-card-body';
      }
    });

    // group the trailing action links (Download / Email) onto one row
    const body = li.querySelector('.cards-download-card-body');
    if (body) {
      const actionParas = [...body.querySelectorAll(':scope > p')]
        .filter((p) => {
          const a = p.querySelector('a');
          return a && p.textContent.trim() === a.textContent.trim();
        });
      if (actionParas.length) {
        const actions = document.createElement('div');
        actions.className = 'cards-download-actions';
        actionParas.forEach((p) => {
          const a = p.querySelector('a');
          // unwrap any authored bold/italic so the link itself is the action
          actions.append(a);
          p.remove();
        });
        body.append(actions);
      }
    }

    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => img
    .closest('picture')
    .replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));

  block.replaceChildren(ul);
}
