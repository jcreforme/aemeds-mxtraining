/* eslint-disable */
/* global WebImporter */
/**
 * Parser for the download tiles / image-text items inside the accordion panels.
 * Source: https://www.vyepti.com/downloadable-resources
 *
 * These tiles are authored NESTED inside the accordion panels. The EDS markdown
 * import pipeline cannot convert a block nested inside another block's cell, so
 * instead of emitting a nested `cards-download` block table, this parser flattens
 * each tile into clean default content that decorates natively inside the panel:
 *
 *   <picture> (illustration)
 *   <h3>      (tile heading)
 *   <p>       (description)
 *   <p><a>    (each action link on its own line → renders as a button)
 *
 * Download-tiles carry TWO links: a "Download" PDF anchor (.download-button) and
 * an "Email" anchor (.cmp-button.email-me → #tile-modal). Image-text items carry
 * a SINGLE link. All hrefs are preserved verbatim.
 */
export default function parse(element, { document }) {
  const picture = element.querySelector('.tile-img-block picture, .image-text-comp picture, picture');
  const img = element.querySelector('.tile-img-block img, .image-text-comp img, img');
  const imageEl = picture || img;

  const heading = element.querySelector('.tile-content h3, .tile-heading-content, h3, h4, [class*="heading"]');
  const description = element.querySelector('.tile-content p, p');

  // Action links: download + email for tiles, single link for image-text.
  const links = Array.from(
    element.querySelectorAll('.tile-link a, a.download-button, a.cmp-button, a.email-me, a.cmp-teaser__action-link, .cmp-button-group a'),
  );
  const seen = new Set();
  const uniqueLinks = links.filter((a) => {
    if (seen.has(a)) return false;
    seen.add(a);
    return true;
  });
  // Fallback: any anchor that is not wrapping the image.
  if (uniqueLinks.length === 0) {
    Array.from(element.querySelectorAll('a')).forEach((a) => {
      if (!a.querySelector('picture, img') && !seen.has(a)) {
        seen.add(a);
        uniqueLinks.push(a);
      }
    });
  }

  const nodes = [];
  if (imageEl) {
    // Wrap the picture/img in a paragraph so it sits as its own content block.
    const p = document.createElement('p');
    p.append(imageEl);
    nodes.push(p);
  }
  if (heading) nodes.push(heading);
  if (description) nodes.push(description);
  // Each link on its own paragraph so a standalone link decorates as a button.
  uniqueLinks.forEach((a) => {
    const p = document.createElement('p');
    p.append(a);
    nodes.push(p);
  });

  // Empty guard.
  if (nodes.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  element.replaceWith(...nodes);
}
