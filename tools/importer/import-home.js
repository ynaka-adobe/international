/* eslint-disable */
/* global WebImporter */

import heroBannerParser from './parsers/hero-banner.js';
import carouselThumbnailsParser from './parsers/carousel-thumbnails.js';
import cardsPromoParser from './parsers/cards-promo.js';
import columnsMediaParser from './parsers/columns-media.js';
import cardsCategoryParser from './parsers/cards-category.js';
import cleanupTransformer from './transformers/international-cleanup.js';
import sectionsTransformer from './transformers/international-sections.js';

const PAGE_TEMPLATE = {
  "name": "home",
  "urls": [
    "https://www.international.com/"
  ],
  "representativeUrl": "https://www.international.com/",
  "description": "International homepage: full-bleed heroes, truck class slider, service/promo cards, icon tiles, and alternating image/text promos",
  "urlPattern": "/",
  "blocks": [
    {
      "name": "hero-banner",
      "instances": [
        "div.main-hero"
      ]
    },
    {
      "name": "carousel-thumbnails",
      "instances": [
        "div.hero-slider"
      ]
    },
    {
      "name": "cards-promo",
      "instances": [
        "div.promo-list",
        "#PARTS-AND-SERVICE div.individual-promo.col-md-4"
      ]
    },
    {
      "name": "columns-media",
      "instances": [
        "section.background-asphalt div.individual-promo:not(.col-md-4)"
      ]
    },
    {
      "name": "cards-category",
      "instances": [
        "div.promo-icon-list"
      ]
    }
  ],
  "sections": [
    {
      "id": "rc2",
      "name": "Hero - Buying Parts",
      "selector": [
        "#content > div.row > div.main-hero:nth-of-type(1)",
        "div.main-hero.margin-bottom-md:nth-of-type(1)"
      ],
      "style": null,
      "blocks": [
        "hero-banner"
      ],
      "defaultContent": []
    },
    {
      "id": "rc3",
      "name": "Intro Headline",
      "selector": [
        "#content > div.row > section.section-container:nth-of-type(1)"
      ],
      "style": "centered",
      "blocks": [],
      "defaultContent": [
        "div.title-block"
      ]
    },
    {
      "id": "rc4",
      "name": "Hero - S13 Integrated Powertrain",
      "selector": [
        "#content > div.row > div.main-hero:nth-of-type(2)",
        "div.main-hero.margin-bottom-md:nth-of-type(2)"
      ],
      "style": null,
      "blocks": [
        "hero-banner"
      ],
      "defaultContent": []
    },
    {
      "id": "rc5",
      "name": "Truck Classes + Services",
      "selector": [
        "#content > div.row > section.section-container:nth-of-type(2)"
      ],
      "style": null,
      "blocks": [
        "carousel-thumbnails",
        "cards-promo"
      ],
      "defaultContent": [
        "div.page-preview"
      ]
    },
    {
      "id": "rc6",
      "name": "Trustworthy Company Award",
      "selector": [
        "section.section-container.background-asphalt.margin-bottom-md"
      ],
      "style": "dark",
      "blocks": [
        "columns-media"
      ],
      "defaultContent": []
    },
    {
      "id": "rc7",
      "name": "Parts and Service / Explore More",
      "selector": [
        "#PARTS-AND-SERVICE"
      ],
      "style": null,
      "blocks": [
        "cards-promo",
        "cards-category"
      ],
      "defaultContent": [
        "div.page-preview",
        "div.title-block"
      ]
    },
    {
      "id": "rc8",
      "name": "What Drives Us",
      "selector": [
        "#WHAT-DRIVES-US"
      ],
      "style": "dark",
      "blocks": [
        "columns-media"
      ],
      "defaultContent": [
        "div.title-block"
      ]
    },
    {
      "id": "rc9",
      "name": "Hero - Run With Us",
      "selector": [
        "#content > div.row > div.main-hero:nth-of-type(3)",
        "div.main-hero:not(.margin-bottom-md)"
      ],
      "style": null,
      "blocks": [
        "hero-banner"
      ],
      "defaultContent": []
    }
  ]
};

const parsers = {
  'hero-banner': heroBannerParser,
  'carousel-thumbnails': carouselThumbnailsParser,
  'cards-promo': cardsPromoParser,
  'columns-media': columnsMediaParser,
  'cards-category': cardsCategoryParser,
};
const transformers = [cleanupTransformer, sectionsTransformer];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((fn) => {
    try { fn(hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    });
  });
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (!parser) return;
      try { parser(block.element, { document, url, params }); }
      catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
    });

    executeTransformers('afterTransform', main, payload);

    main.appendChild(document.createElement('hr'));
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }];
  },
};
