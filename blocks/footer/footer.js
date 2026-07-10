import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Visually hides the text label of icon-only links (e.g. social links,
 * the Lundbeck logo link) while keeping it available to screen readers.
 * @param {Element} scope The element to search for icon links
 */
function decorateIconLinks(scope) {
  scope.querySelectorAll('a').forEach((a) => {
    if (!a.querySelector('.icon')) return;
    [...a.childNodes].forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        const label = document.createElement('span');
        label.className = 'visually-hidden';
        label.textContent = node.textContent.trim();
        node.replaceWith(label);
      }
    });
  });
}

/**
 * Removes stray literal markdown bold markers (`**`) left around a node when
 * an author typed `**…**` instead of using the editor's bold formatting.
 * @param {Element} el The element whose child text nodes to clean
 */
function stripBoldMarkers(el) {
  el.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE && /^\s*\*+\s*$/.test(node.textContent)) {
      node.remove();
    } else if (node.nodeType === Node.TEXT_NODE && node.textContent.includes('**')) {
      node.textContent = node.textContent.replace(/\*\*/g, '');
    }
  });
}

/**
 * Turns the "For assistance, call" tel link into the magenta call button and
 * groups it with its label into a right-aligned CTA. Works regardless of
 * whether the author bolded the link, so it never relies on auto-buttonization.
 * @param {Element} footer The footer container
 */
function decorateCallToAction(footer) {
  const tel = footer.querySelector('a[href^="tel:"]');
  if (!tel) return;

  const buttonP = tel.closest('p') || tel.parentElement;
  stripBoldMarkers(buttonP);
  // unwrap any leftover strong/em so the link is the button itself
  const wrap = tel.closest('strong, em');
  if (wrap && wrap.parentElement === buttonP) wrap.replaceWith(tel);

  tel.classList.add('button', 'primary', 'footer-call');
  buttonP.classList.add('button-wrapper');

  const info = footer.querySelector('.footer-info .default-content-wrapper')
    || footer.querySelector('.footer-info') || buttonP.parentElement;
  const cta = document.createElement('div');
  cta.className = 'footer-cta';
  // the paragraph immediately before the button is the "For assistance, call" label
  const label = buttonP.previousElementSibling;
  if (label && label.tagName === 'P' && !label.classList.contains('button-wrapper')) {
    cta.append(label);
  }
  cta.append(buttonP);
  info.prepend(cta);
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/fragments/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // identify the footer sections: legal links strip, info, brand
  const classes = ['legal', 'info', 'brand'];
  classes.forEach((c, i) => {
    const section = footer.children[i];
    if (section) section.classList.add(`footer-${c}`);
  });

  decorateCallToAction(footer);
  decorateIconLinks(footer);

  block.append(footer);
}
