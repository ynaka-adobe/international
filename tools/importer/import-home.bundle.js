/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/hero-banner.js
  function parse(element, { document }) {
    var _a;
    const cells = [];
    const img = element.querySelector(".hero-container > picture img, picture img");
    if (img) {
      const desktop = (_a = img.closest("picture")) == null ? void 0 : _a.querySelector('source[media*="min-width"][srcset]');
      const desktopSrc = desktop == null ? void 0 : desktop.getAttribute("srcset").split(",")[0].trim().split(/\s+/)[0];
      const pic = document.createElement("img");
      pic.src = desktopSrc || img.getAttribute("src");
      pic.alt = img.getAttribute("alt") || "";
      cells.push([pic]);
    } else {
      cells.push([""]);
    }
    const content = [];
    const srcHeading = element.querySelector(".hero-headline h1, .hero-headline h2, .hero-headline h3");
    if (srcHeading) {
      const text = srcHeading.textContent.replace(/\s+/g, " ").trim();
      if (text) {
        const h = document.createElement("h2");
        h.textContent = text;
        content.push(h);
      }
    }
    element.querySelectorAll(".hero-caption p").forEach((p) => {
      if (p.textContent.trim()) content.push(p);
    });
    element.querySelectorAll(".hero-caption .link-container a").forEach((a) => {
      const label = a.textContent.replace(/\s+/g, " ").trim();
      if (!label) return;
      const p = document.createElement("p");
      const opensSubscribeModal = a.getAttribute("target") === "subscribe-modal" || a.getAttribute("data-bs-target") === "#subscribe-modal" || a.classList.contains("subscribe-modal");
      const href = opensSubscribeModal ? "/modals/newsletter" : a.getAttribute("href");
      if (href) {
        const link = document.createElement("a");
        link.href = href;
        link.textContent = label;
        p.append(link);
      } else {
        p.textContent = label;
      }
      content.push(p);
    });
    cells.push([content]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-thumbnails.js
  function parse2(element, { document }) {
    const cells = [];
    const slides = [...element.querySelectorAll(".hero-swiper-thumbnails .swiper-wrapper > .swiper-slide")].filter((s) => !s.classList.contains("swiper-slide-duplicate") && !s.closest(".thumb-nav"));
    slides.forEach((slide) => {
      const img = slide.querySelector(".hero-container > picture img, picture img");
      let imageCell = "";
      if (img) {
        const pic = document.createElement("img");
        pic.src = img.getAttribute("src");
        pic.alt = img.getAttribute("alt") || "";
        imageCell = pic;
      }
      const content = [];
      const srcHeading = slide.querySelector(".hero-headline h1, .hero-headline h2, .hero-headline h3");
      if (srcHeading) {
        const tagEl = srcHeading.querySelector(".h2-light");
        const tagline = tagEl ? tagEl.textContent.replace(/\s+/g, " ").trim() : "";
        const clone = srcHeading.cloneNode(true);
        clone.querySelectorAll(".h2-light").forEach((s) => s.remove());
        const title = clone.textContent.replace(/\s+/g, " ").trim();
        if (title) {
          const h = document.createElement("h2");
          h.textContent = title;
          content.push(h);
        }
        if (tagline) {
          const p = document.createElement("p");
          p.textContent = tagline;
          content.push(p);
        }
      }
      slide.querySelectorAll(".caption-content p").forEach((p) => {
        if (p.textContent.trim()) content.push(p);
      });
      slide.querySelectorAll(".caption-content a").forEach((a) => {
        const label = a.textContent.replace(/\s+/g, " ").trim();
        if (!label) return;
        const p = document.createElement("p");
        const href = a.getAttribute("href");
        if (href) {
          const link = document.createElement("a");
          link.href = href;
          link.textContent = label;
          p.append(link);
        } else {
          p.textContent = label;
        }
        content.push(p);
      });
      cells.push([imageCell, content]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-thumbnails", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-promo.js
  var textOf = (el) => el ? el.textContent.replace(/\s+/g, " ").trim() : "";
  function isIndividualCard(el) {
    return !!el && el.nodeType === 1 && el.classList.contains("individual-promo") && el.classList.contains("col-md-4");
  }
  function buildCard(card, document) {
    const srcImg = card.querySelector(".promo-image img, :scope > img, img");
    let imageCell = "";
    if (srcImg) {
      const img = document.createElement("img");
      img.src = srcImg.getAttribute("src");
      img.alt = srcImg.getAttribute("alt") || "";
      imageCell = img;
    }
    const content = [];
    const titleText = textOf(card.querySelector(".promo-title"));
    if (titleText) {
      const h = document.createElement("h3");
      h.textContent = titleText;
      content.push(h);
    }
    const subtitle = textOf(card.querySelector(".promo-subtitle"));
    if (subtitle) {
      const p = document.createElement("p");
      p.textContent = subtitle;
      content.push(p);
    }
    const desc = card.querySelector(".promo-description");
    if (desc && textOf(desc)) {
      const p = document.createElement("p");
      p.innerHTML = desc.innerHTML;
      p.querySelectorAll("br").forEach((br) => {
        if (!br.nextSibling) br.remove();
      });
      content.push(p);
    }
    const links = [...card.querySelectorAll(".cta-buttons a, a.promo-link")];
    links.forEach((a) => {
      const label = textOf(a);
      if (!label) return;
      const p = document.createElement("p");
      const href = a.getAttribute("href");
      if (href) {
        const link = document.createElement("a");
        link.href = href;
        link.textContent = label;
        p.append(link);
      } else {
        p.textContent = label;
      }
      content.push(p);
    });
    return [imageCell, content];
  }
  function parse3(element, { document }) {
    if (!element.parentNode) return;
    const cells = [];
    if (isIndividualCard(element)) {
      if (isIndividualCard(element.previousElementSibling)) return;
      const group = [element];
      let next = element.nextElementSibling;
      while (isIndividualCard(next)) {
        group.push(next);
        next = next.nextElementSibling;
      }
      group.forEach((card) => cells.push(buildCard(card, document)));
      group.slice(1).forEach((sib) => sib.remove());
    } else {
      const cards = [...element.querySelectorAll(".promo-list-card")];
      cards.forEach((card) => cells.push(buildCard(card, document)));
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-media.js
  var textOf2 = (el) => el ? el.textContent.replace(/\s+/g, " ").trim() : "";
  function isMediaPromo(el) {
    return !!el && el.nodeType === 1 && el.classList.contains("individual-promo") && !el.classList.contains("col-md-4");
  }
  function buildRow(promo, document) {
    const srcImg = promo.querySelector(".promo-image img, img");
    let imageCell = "";
    if (srcImg) {
      const img = document.createElement("img");
      img.src = srcImg.getAttribute("src");
      img.alt = srcImg.getAttribute("alt") || "";
      imageCell = img;
    }
    const content = [];
    const category = textOf2(promo.querySelector(".promo-category"));
    if (category) {
      const p = document.createElement("p");
      p.textContent = category;
      content.push(p);
    }
    const title = textOf2(promo.querySelector(".promo-title"));
    if (title) {
      const h = document.createElement("h2");
      h.textContent = title;
      content.push(h);
    }
    const subtitle = textOf2(promo.querySelector(".promo-subtitle"));
    if (subtitle) {
      const p = document.createElement("p");
      p.textContent = subtitle;
      content.push(p);
    }
    const desc = promo.querySelector(".promo-description");
    if (desc && textOf2(desc)) {
      const blockChildren = [...desc.children].filter((c) => /^(P|UL|OL|H[1-6]|BLOCKQUOTE)$/.test(c.tagName));
      if (blockChildren.length) {
        blockChildren.forEach((c) => content.push(c));
      } else {
        const p = document.createElement("p");
        p.innerHTML = desc.innerHTML;
        content.push(p);
      }
    }
    promo.querySelectorAll(".cta-buttons a").forEach((a) => {
      const label = textOf2(a);
      if (!label) return;
      const p = document.createElement("p");
      const href = a.getAttribute("href");
      if (href) {
        const link = document.createElement("a");
        link.href = href;
        link.textContent = label;
        p.append(link);
      } else {
        p.textContent = label;
      }
      content.push(p);
    });
    const imageRight = !!promo.querySelector(".image-right");
    return imageRight ? [content, imageCell] : [imageCell, content];
  }
  function parse4(element, { document }) {
    if (!element.parentNode) return;
    if (isMediaPromo(element.previousElementSibling)) return;
    const group = [element];
    let next = element.nextElementSibling;
    while (isMediaPromo(next)) {
      group.push(next);
      next = next.nextElementSibling;
    }
    const cells = group.map((promo) => buildRow(promo, document));
    group.slice(1).forEach((sib) => sib.remove());
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-media", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-category.js
  var textOf3 = (el) => el ? el.textContent.replace(/\s+/g, " ").trim() : "";
  function parse5(element, { document }) {
    const cells = [];
    const cards = [...element.querySelectorAll(".promo-icon-list-card")].filter((c) => !c.classList.contains("swiper-slide-duplicate"));
    cards.forEach((card) => {
      const labelText = textOf3(card.querySelector(".preview-title"));
      const srcImg = card.querySelector(".item-content-container img, img");
      const srcSvg = card.querySelector(".item-content-container svg, svg");
      let imageCell = "";
      if (srcImg && srcImg.getAttribute("src")) {
        const img = document.createElement("img");
        img.src = srcImg.getAttribute("src");
        img.alt = srcImg.getAttribute("alt") || labelText;
        imageCell = img;
      } else if (srcSvg) {
        const svg = srcSvg.cloneNode(true);
        if (!svg.getAttribute("xmlns")) svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        const markup = svg.outerHTML;
        let encoded;
        try {
          encoded = btoa(unescape(encodeURIComponent(markup)));
        } catch (e) {
          encoded = null;
        }
        const img = document.createElement("img");
        img.src = encoded ? `data:image/svg+xml;base64,${encoded}` : `data:image/svg+xml;utf8,${encodeURIComponent(markup)}`;
        img.alt = labelText;
        imageCell = img;
      }
      const content = [];
      const link = card.querySelector("a.promo-icon-list-item, a");
      const href = link ? link.getAttribute("href") : null;
      const label = textOf3(card.querySelector(".preview-title"));
      if (label) {
        const h = document.createElement("h3");
        if (href) {
          const a = document.createElement("a");
          a.href = href;
          a.textContent = label;
          h.append(a);
        } else {
          h.textContent = label;
        }
        content.push(h);
      }
      const action = textOf3(card.querySelector(".learn-more"));
      if (action) {
        const p = document.createElement("p");
        p.textContent = action;
        content.push(p);
      }
      cells.push([imageCell, content]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-category", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/international-cleanup.js
  function transform(hookName, element, payload) {
    if (hookName === "beforeTransform") {
      WebImporter.DOMUtils.remove(element, [
        '#PARTS-AND-SERVICE [id^="react_"]',
        "#start-quote",
        ".modal-form-wrapper"
      ]);
      WebImporter.DOMUtils.remove(element, [".privacy-warning"]);
      WebImporter.DOMUtils.remove(element, [
        '[id^="ZN_"]',
        '[id^="batBeacon"]',
        '[id^="universal_pixel"]',
        'iframe[src*="adsrvr.org"]',
        'iframe[src*="clarity.ms"]',
        'img[src*="clarity.ms"]',
        'img[src*="bat.bing.com"]',
        'img[src*="facebook.com/tr"]',
        'script[src*="clarity"]'
      ]);
      element.querySelectorAll("div.page-preview .preview-titles > div.h3-medium").forEach((div) => {
        const h2 = element.ownerDocument.createElement("h2");
        h2.innerHTML = div.innerHTML;
        div.replaceWith(h2);
      });
      WebImporter.DOMUtils.remove(element, [".swiper-notification"]);
      WebImporter.DOMUtils.remove(element, [".waypoint-id-box"]);
    }
    if (hookName === "afterTransform") {
      WebImporter.DOMUtils.remove(element, [
        "#wrapper > header",
        "#header",
        "#wrapper > footer",
        "#footer",
        "header",
        "footer",
        "nav",
        ".breadcrumb",
        "a.skip-link",
        ".modal",
        ".privacy-warning"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "script",
        "style",
        "noscript",
        "link",
        "iframe"
      ]);
      element.querySelectorAll("*").forEach((el) => {
        [...el.attributes].forEach((attr) => {
          const n = attr.name;
          if (n.startsWith("data-excat")) return;
          if (n.startsWith("data-") || n.startsWith("on") || n === "tabindex") {
            el.removeAttribute(n);
          }
        });
      });
    }
  }

  // tools/importer/transformers/international-sections.js
  var MARKER = "data-excat-section-id";
  function findSection(root, document, section) {
    const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
    for (const sel of selectors) {
      if (!sel) continue;
      try {
        const el = root.querySelector(sel) || document.querySelector(sel);
        if (el) return el;
      } catch (e) {
      }
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const template = payload && payload.template;
    const sections = template && template.sections;
    if (!sections || sections.length < 2) return;
    const document = element.ownerDocument || payload.document;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const el = findSection(element, document, section);
        if (!el) continue;
        if (i === 0 && !section.style) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(MARKER, section.id);
        if (i === 0) hr.setAttribute("data-excat-first", "true");
        el.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const metadata = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`) || document.querySelector(`hr[${MARKER}="${section.id}"]`);
        if (marker) {
          marker.after(metadata);
          marker.removeAttribute(MARKER);
          if (marker.hasAttribute("data-excat-first")) marker.remove();
        } else {
          const el = findSection(element, document, section);
          if (el) el.after(metadata);
        }
      }
      element.querySelectorAll("hr[data-excat-first]").forEach((hr) => hr.remove());
    }
  }

  // tools/importer/import-home.js
  var PAGE_TEMPLATE = {
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
  var parsers = {
    "hero-banner": parse,
    "carousel-thumbnails": parse2,
    "cards-promo": parse3,
    "columns-media": parse4,
    "cards-category": parse5
  };
  var transformers = [transform, transform2];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((fn) => {
      try {
        fn(hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
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
  var import_home_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (!parser) return;
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      main.appendChild(document.createElement("hr"));
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }];
    }
  };
  return __toCommonJS(import_home_exports);
})();
