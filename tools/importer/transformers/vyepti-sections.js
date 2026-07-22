/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: vyepti.com section breaks and section metadata.
 *
 * Reads sections from payload.template.sections (page-templates.json) and, for
 * each section (processed in reverse order):
 *   - inserts an <hr> before the section element when it is not the first
 *     section, so EDS splits the page into the intended sections;
 *   - creates a "Section Metadata" block after the section element when the
 *     section defines a `style`.
 *
 * For the downloadable-resources template all four sections have style === null,
 * so this produces 3 <hr> breaks and no Section Metadata blocks. Section
 * selectors were verified against migration-work/cleaned.html:
 *   - section-1-header:    .teaser.sub-banner-teaser .cmp-teaser        (line 1989/1990)
 *   - section-2-intro:     .columncontainer .section-padding .rte .rteComponent (lines 2011/2016)
 *   - section-3-accordion: .resource-accordions .cmp-accordion          (line 2030)
 *   - section-4-isi:       .cmp-experiencefragment--isi .isi            (line 2635)
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

/**
 * Resolve the first DOM element for a section using its selector(s).
 * A section selector may be a string or an array of fallback selectors.
 */
function findSectionElement(root, selector) {
  const selectors = Array.isArray(selector) ? selector : [selector];
  for (let i = 0; i < selectors.length; i += 1) {
    const sel = selectors[i];
    if (sel) {
      const found = root.querySelector(sel);
      if (found) return found;
    }
  }
  return null;
}

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    const template = payload && payload.template;
    const sections = template && template.sections;
    if (!sections || sections.length < 2) return;

    const doc = element.ownerDocument;

    // Process in reverse so earlier insertions do not shift later selectors.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const sectionEl = findSectionElement(element, section.selector);
      if (!sectionEl) continue;

      // Section Metadata block after the section, only when a style is set.
      if (section.style) {
        const metaBlock = WebImporter.Blocks.createBlock(doc, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        sectionEl.after(metaBlock);
      }

      // Section break before every non-first section.
      if (i > 0) {
        sectionEl.before(doc.createElement('hr'));
      }
    }
  }
}
