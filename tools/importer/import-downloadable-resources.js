/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import accordionParser from './parsers/accordion.js';
import cardsDownloadParser from './parsers/cards-download.js';
import isiParser from './parsers/isi.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/vyepti-cleanup.js';
import sectionsTransformer from './transformers/vyepti-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'downloadable-resources',
  description: 'Resource library page: intro paragraph, category accordion with download-tile / image-text content, and ISI.',
  urls: [
    'https://www.vyepti.com/downloadable-resources',
  ],
  blocks: [
    {
      name: 'accordion',
      instances: [
        '.resource-accordions .cmp-accordion',
        '.resource-accordions .accordion.panelcontainer .cmp-accordion',
      ],
    },
    {
      name: 'cards-download',
      instances: [
        '.downloadresourcetile .resource-tile.resource-large-tile',
        '.resourcetile .resource-tile',
        '.imagetext .image-text-comp',
      ],
    },
    {
      name: 'isi',
      instances: [
        '.cmp-experiencefragment--isi .isi',
        '.safetyInfo#isiFixedBottom',
      ],
    },
  ],
  sections: [
    {
      id: 'section-2-intro',
      name: 'Intro paragraph',
      selector: '.columncontainer .section-padding .rte .rteComponent',
      style: null,
      blocks: [],
      defaultContent: ['.columncontainer .section-padding .rte .rteComponent'],
    },
    {
      id: 'section-3-accordion',
      name: 'Resource category accordion',
      selector: '.resource-accordions .cmp-accordion',
      style: null,
      blocks: ['accordion', 'cards-download'],
      defaultContent: [],
    },
    {
      id: 'section-4-isi',
      name: 'Important Safety Information (ISI)',
      selector: ['.cmp-experiencefragment--isi .isi', '.safetyInfo#isiFixedBottom'],
      style: null,
      blocks: ['isi'],
      defaultContent: [],
    },
  ],
};

// PARSER REGISTRY
const parsers = {
  accordion: accordionParser,
  'cards-download': cardsDownloadParser,
  isi: isiParser,
};

// TRANSFORMER REGISTRY - cleanup first, section breaks after
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const seen = new Set();

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        if (seen.has(element)) return;
        seen.add(element);
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block. Accordion runs before cards-download so nested
    //    download tiles remain in the panel cell for the cards-download parser.
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // already replaced by an earlier parser
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup + section breaks)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
