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

  // tools/importer/import-content-page.js
  var import_content_page_exports = {};
  __export(import_content_page_exports, {
    default: () => import_content_page_default
  });

  // tools/importer/parsers/hero-banner.js
  var textOf = (el) => el ? el.textContent.replace(/\s+/g, " ").trim() : "";
  function headingHtml(heading2, document) {
    const clone = heading2.cloneNode(true);
    const parts = [];
    let current = "";
    const walk = (node) => {
      node.childNodes.forEach((n) => {
        if (n.nodeName === "BR") {
          parts.push(current);
          current = "";
        } else if (n.nodeType === 3) {
          current += n.textContent;
        } else if (n.nodeType === 1) {
          walk(n);
        }
      });
    };
    walk(clone);
    parts.push(current);
    const lines = parts.map((p) => p.replace(/\s+/g, " ").trim()).filter(Boolean);
    const holder = document.createElement("div");
    lines.forEach((line, i) => {
      if (i) holder.append(document.createElement("br"));
      holder.append(document.createTextNode(line));
    });
    return holder;
  }
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
      const text = textOf(srcHeading);
      if (text) {
        const h = document.createElement(srcHeading.tagName === "H1" ? "h1" : "h2");
        h.append(...headingHtml(srcHeading, document).childNodes);
        content.push(h);
      }
      if (srcHeading.tagName === "H1") {
        const headline = srcHeading.closest(".hero-headline");
        const tagline = headline && [...headline.querySelectorAll(".h1-light")].find((t) => !srcHeading.contains(t));
        if (tagline && textOf(tagline)) {
          const p = document.createElement("p");
          p.append(...headingHtml(tagline, document).childNodes);
          content.push(p);
        }
      }
    }
    element.querySelectorAll(".hero-caption p, .hero-caption h1, .hero-caption h2, .hero-caption h3, .hero-caption h4, .hero-caption h5, .hero-caption h6").forEach((el) => {
      if (el.closest(".link-container")) return;
      if (el.tagName !== "P") {
        if (!textOf(el)) return;
        const h = document.createElement(el.tagName === "H1" || el.tagName === "H2" ? "h3" : el.tagName.toLowerCase());
        h.textContent = textOf(el);
        content.push(h);
        return;
      }
      if (el.textContent.trim()) content.push(el);
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
    const name = element.closest("section.section-container") ? "hero-banner (contained)" : "hero-banner";
    const block = WebImporter.Blocks.createBlock(document, { name, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-cta-band.js
  var textOf2 = (el) => el ? el.textContent.replace(/\s+/g, " ").trim() : "";
  var MEDIA = "img, picture, video, iframe, svg, canvas, .video, .main-hero, .hero-slider, .promo-list, .individual-promo";
  function linkParagraph(a, document) {
    const label = textOf2(a);
    if (!label) return null;
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
    return p;
  }
  function textContent(component, document) {
    const content = [];
    const root = component.querySelector(":scope > .component-content") || component;
    const blocks = [...root.querySelectorAll("h1, h2, h3, h4, h5, h6, p, ul, ol")].filter((el) => !el.parentElement.closest("h1, h2, h3, h4, h5, h6, p, ul, ol"));
    if (!blocks.length && textOf2(root)) {
      const p = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = textOf2(root);
      p.append(strong);
      return [p];
    }
    blocks.forEach((el) => {
      if (!textOf2(el)) return;
      if (/^H[1-6]$/.test(el.tagName)) {
        const p = document.createElement("p");
        const strong = document.createElement("strong");
        strong.innerHTML = el.innerHTML.trim();
        p.append(strong);
        content.push(p);
      } else {
        content.push(el);
      }
    });
    return content;
  }
  function parse2(element, { document }) {
    if (!element.isConnected && !element.parentNode) return;
    const row2 = element.querySelector(":scope > .component-content > .row");
    if (!row2) return;
    const parts = [...row2.children].filter((c) => textOf2(c) || c.querySelector(MEDIA));
    const buttons = parts.filter((c) => c.matches(".button-link"));
    const texts = parts.filter((c) => !c.matches(".button-link"));
    const isBand = buttons.length > 0 && texts.length > 0 && texts.every((c) => c.matches(".section-title, .rich-text, .title-block") && !c.querySelector(MEDIA) && !c.querySelector(".button-link"));
    if (!isBand) return;
    const textCell = texts.flatMap((c) => textContent(c, document));
    const ctaCell = buttons.flatMap((b) => [...b.querySelectorAll("a, button")]).map((a) => linkParagraph(a, document)).filter(Boolean);
    const cells = [[textCell, ctaCell]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-cta-band", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-headline.js
  var textOf3 = (el) => el ? el.textContent.replace(/[\s ]+/g, " ").trim() : "";
  var BLOCK_TAGS = /^(P|UL|OL|H[1-6]|BLOCKQUOTE|TABLE)$/;
  function richText(container, document) {
    const out = [];
    let para3 = null;
    const flush = () => {
      if (para3) {
        while (para3.lastChild && para3.lastChild.nodeName === "BR") para3.lastChild.remove();
        while (para3.firstChild && para3.firstChild.nodeName === "BR") para3.firstChild.remove();
        if (textOf3(para3) || para3.querySelector("img")) out.push(para3);
      }
      para3 = null;
    };
    [...container.childNodes].forEach((node) => {
      if (node.nodeType === 3) {
        if (!node.textContent.trim()) {
          if (para3) para3.append(node);
          return;
        }
        para3 = para3 || document.createElement("p");
        para3.append(node);
        return;
      }
      if (node.nodeType !== 1) return;
      if (BLOCK_TAGS.test(node.tagName)) {
        flush();
        if (textOf3(node) || node.querySelector("img")) {
          if (node.tagName === "P") {
            while (node.lastChild && node.lastChild.nodeName === "BR") node.lastChild.remove();
          }
          out.push(node);
        }
        return;
      }
      if (node.tagName === "LI") {
        flush();
        const last = out[out.length - 1];
        if (last && last.tagName === "UL" && last.dataset.loose) {
          last.append(node);
        } else {
          const ul = document.createElement("ul");
          ul.dataset.loose = "1";
          ul.append(node);
          out.push(ul);
        }
        return;
      }
      if (node.tagName === "DIV" || node.tagName === "SMALL" || node.tagName === "SECTION") {
        flush();
        if ([...node.children].some((c) => BLOCK_TAGS.test(c.tagName) || c.tagName === "DIV")) {
          out.push(...richText(node, document));
        } else if (textOf3(node)) {
          const p = document.createElement("p");
          p.innerHTML = node.innerHTML.trim();
          while (p.lastChild && p.lastChild.nodeName === "BR") p.lastChild.remove();
          out.push(p);
        }
        return;
      }
      if (node.tagName === "BR" && !para3) return;
      para3 = para3 || document.createElement("p");
      para3.append(node);
    });
    flush();
    out.forEach((el) => {
      if (el.dataset) delete el.dataset.loose;
    });
    return out;
  }
  function buttonParagraph(a, document) {
    const label = textOf3(a);
    if (!label) return null;
    const href = a.getAttribute("href");
    const p = document.createElement("p");
    let target = p;
    if (a.classList.contains("btn-secondary")) {
      target = document.createElement("em");
      p.append(target);
    } else if (a.classList.contains("btn-primary") || a.classList.contains("btn")) {
      target = document.createElement("strong");
      p.append(target);
    }
    if (href) {
      const link = document.createElement("a");
      link.href = href;
      link.textContent = label;
      target.append(link);
    } else {
      target.textContent = label;
    }
    return p;
  }
  function headlineHtml(el) {
    const clone = el.cloneNode(true);
    clone.querySelectorAll("h1, h2, h3, h4, h5, h6, span, div").forEach((n) => n.replaceWith(...n.childNodes));
    return clone.innerHTML.replace(/^(\s|<br>)+|(\s|<br>)+$/g, "").trim();
  }
  function parse3(element, { document }) {
    if (!element.parentNode) return;
    const root = element.querySelector(":scope > .component-content") || element;
    const titles = root.querySelector(".preview-titles");
    const container = root.querySelector(".preview-content-container");
    const titleEl = titles && titles.querySelector(":scope > .h3-medium, :scope > h2, :scope > h1, :scope > h3") || root.querySelector(".preview-title");
    const tagline = titles ? titles.querySelector(":scope > .h3-light") : null;
    const headingCell = [];
    if (titleEl && textOf3(titleEl)) {
      const h2 = document.createElement("h2");
      h2.innerHTML = headlineHtml(titleEl);
      if (tagline && textOf3(tagline)) {
        h2.append(document.createElement("br"));
        h2.insertAdjacentHTML("beforeend", headlineHtml(tagline));
      }
      headingCell.push(h2);
    }
    if (titles) {
      titles.querySelectorAll(":scope > .preview-content").forEach((c) => headingCell.push(...richText(c, document)));
    }
    const bodyCell = [];
    if (container) {
      [...container.children].forEach((child) => {
        if (child.matches("a.btn, a.btn-primary, a.btn-secondary")) {
          const p = buttonParagraph(child, document);
          if (p) bodyCell.push(p);
        } else if (child.matches(".preview-category")) {
          if (textOf3(child)) {
            const p = document.createElement("p");
            p.textContent = textOf3(child);
            bodyCell.push(p);
          }
        } else if (child.matches(".h3-light, .h3-medium, h2, h3")) {
          if (textOf3(child)) {
            const h3 = document.createElement("h3");
            h3.innerHTML = headlineHtml(child);
            bodyCell.push(h3);
          }
        } else if (child.matches(".preview-content")) {
          bodyCell.push(...richText(child, document));
        } else if (textOf3(child)) {
          bodyCell.push(...richText(child, document));
        }
      });
    }
    if (!headingCell.length) {
      if (!bodyCell.length) {
        element.remove();
        return;
      }
      const frag = document.createElement("div");
      frag.append(...bodyCell);
      element.replaceWith(...frag.childNodes);
      return;
    }
    const cells = [[headingCell, bodyCell]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-headline", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-hero.js
  var textOf4 = (el) => el ? el.textContent.replace(/[\s ]+/g, " ").trim() : "";
  function slideImage(scope, document) {
    const img = scope.querySelector(".hero-container > picture img, picture img, img");
    if (!img) return "";
    const picture = img.closest("picture");
    const desktop = picture && picture.querySelector('source[media*="min-width"][srcset]');
    const desktopSrc = desktop ? desktop.getAttribute("srcset").split(",")[0].trim().split(/\s+/)[0] : "";
    const src = desktopSrc || img.getAttribute("src") || img.getAttribute("data-src");
    if (!src) return "";
    const out = document.createElement("img");
    out.src = src;
    out.alt = img.getAttribute("alt") || "";
    return out;
  }
  function linkParagraph2(a, document) {
    const label = textOf4(a);
    if (!label) return null;
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
    return p;
  }
  function parse4(element, { document }) {
    if (!element.parentNode) return;
    const slides = [...element.querySelectorAll(".swiper-wrapper > .swiper-slide")].filter((s) => !s.classList.contains("swiper-slide-duplicate"));
    const cells = [];
    slides.forEach((slide) => {
      const imageCell = slideImage(slide, document);
      const content = [];
      const srcHeading = slide.querySelector(".hero-headline h1, .hero-headline h2, .hero-headline h3");
      if (srcHeading) {
        const tagEl = srcHeading.querySelector(".h2-light");
        const tagline = textOf4(tagEl);
        const clone = srcHeading.cloneNode(true);
        clone.querySelectorAll(".h2-light").forEach((s) => s.remove());
        const title = textOf4(clone);
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
        if (!textOf4(p)) return;
        const para3 = document.createElement("p");
        para3.innerHTML = p.innerHTML.trim();
        content.push(para3);
      });
      slide.querySelectorAll(".caption-content a.btn, .caption-content > a").forEach((a) => {
        const p = linkParagraph2(a, document);
        if (p) content.push(p);
      });
      if (!imageCell && !content.length) return;
      cells.push([imageCell, content]);
    });
    if (!cells.length) return;
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-thumbnails.js
  function parse5(element, { document }) {
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
  var textOf5 = (el) => el ? el.textContent.replace(/\s+/g, " ").trim() : "";
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
    const titleEl = card.querySelector(".promo-title");
    const titleClone = titleEl ? titleEl.cloneNode(true) : null;
    if (titleClone) titleClone.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
    const titleText = textOf5(titleClone);
    if (titleText) {
      const h = document.createElement("h3");
      h.textContent = titleText;
      content.push(h);
    }
    const subtitle = textOf5(card.querySelector(".promo-subtitle"));
    if (subtitle) {
      const p = document.createElement("p");
      p.textContent = subtitle;
      content.push(p);
    }
    const desc = card.querySelector(".promo-description");
    const descBlocks = desc ? [...desc.children].filter((c) => /^(P|UL|OL)$/.test(c.tagName) && textOf5(c)) : [];
    if (descBlocks.length) {
      content.push(...descBlocks);
    } else if (desc && textOf5(desc)) {
      const p = document.createElement("p");
      p.innerHTML = desc.innerHTML;
      p.querySelectorAll("br").forEach((br) => {
        if (!br.nextSibling) br.remove();
      });
      content.push(p);
    }
    const links = [...card.querySelectorAll(".cta-buttons a, a.promo-link")];
    links.forEach((a) => {
      const label = textOf5(a);
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
  function parse6(element, { document }) {
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

  // tools/importer/parsers/carousel-cards.js
  var textOf6 = (el) => el ? el.textContent.replace(/[\s ]+/g, " ").trim() : "";
  function imageOf(card, document) {
    const img = card.querySelector("img");
    if (!img) return "";
    const picture = img.closest("picture");
    const desktop = picture && picture.querySelector('source[media*="min-width"][srcset]');
    const desktopSrc = desktop ? desktop.getAttribute("srcset").split(",")[0].trim().split(/\s+/)[0] : "";
    const src = desktopSrc || img.getAttribute("src") || img.getAttribute("data-src");
    if (!src || src.startsWith("data:")) return "";
    const out = document.createElement("img");
    out.src = src;
    out.alt = img.getAttribute("alt") || "";
    return out;
  }
  function para(text, document) {
    const p = document.createElement("p");
    p.textContent = text;
    return p;
  }
  function linkPara(label, href, document) {
    const p = document.createElement("p");
    if (href) {
      const a = document.createElement("a");
      a.href = href;
      a.textContent = label;
      p.append(a);
    } else {
      p.textContent = label;
    }
    return p;
  }
  function description(el, document) {
    if (!el || !textOf6(el)) return [];
    const blocks = [...el.children].filter((c) => /^(P|UL|OL)$/.test(c.tagName) && textOf6(c));
    if (blocks.length) return blocks;
    const p = document.createElement("p");
    p.innerHTML = el.innerHTML.trim();
    while (p.lastChild && (p.lastChild.nodeName === "BR" || p.lastChild.nodeType === 3 && !p.lastChild.textContent.trim())) p.lastChild.remove();
    return textOf6(p) ? [p] : [];
  }
  function heading(el, level, href, document) {
    const h = document.createElement(level);
    if (href) {
      const a = document.createElement("a");
      a.href = href;
      a.textContent = textOf6(el);
      h.append(a);
    } else {
      h.textContent = textOf6(el);
    }
    return h;
  }
  function relatedCard(card, document) {
    const content = [];
    const titleEl = card.querySelector(".related-article-title");
    const titleLink = titleEl && titleEl.querySelector("a[href]");
    const href = titleLink && titleLink.getAttribute("href") || [...card.querySelectorAll("a[href]")].map((a) => a.getAttribute("href"))[0];
    const date = textOf6(card.querySelector(".related-article-date"));
    if (date) content.push(para(date, document));
    if (titleEl && textOf6(titleEl)) content.push(heading(titleEl, "h3", href, document));
    content.push(...description(card.querySelector(".related-article-preview"), document));
    const more = [...card.querySelectorAll(":scope > a[href], a.detail-medium")].find((a) => textOf6(a) && !a.closest(".related-article-title"));
    if (more) content.push(linkPara(textOf6(more), more.getAttribute("href"), document));
    return [imageOf(card, document), content];
  }
  function promoCard(card, document) {
    const content = [];
    const wrapLink = card.querySelector(":scope > a.promo-card-background[href], :scope > a[href]");
    const category = textOf6(card.querySelector(".promo-category"));
    if (category) content.push(para(category, document));
    const link = card.querySelector(".promo-link");
    const hasCta = !!(link && textOf6(link));
    const wrapHref = wrapLink ? wrapLink.getAttribute("href") : null;
    const titleEl = card.querySelector(".promo-title");
    if (titleEl && textOf6(titleEl)) {
      const level = /^H[1-6]$/.test(titleEl.tagName) ? titleEl.tagName.toLowerCase() : "h5";
      content.push(heading(titleEl, level, hasCta ? null : wrapHref, document));
    }
    content.push(...description(card.querySelector(".promo-description"), document));
    if (hasCta) {
      content.push(linkPara(textOf6(link), link.getAttribute("href") || wrapHref, document));
    }
    return [imageOf(card, document), content];
  }
  function progressCard(card, document) {
    const content = [];
    const eyebrow = textOf6(card.querySelector(".eyebrow"));
    if (eyebrow) content.push(para(eyebrow, document));
    const titleEl = card.querySelector("h1, h2, h3, h4, h5, h6");
    if (titleEl && textOf6(titleEl)) content.push(heading(titleEl, titleEl.tagName.toLowerCase(), null, document));
    card.querySelectorAll(":scope > p, .caption").forEach((p) => content.push(...description(p, document)));
    card.querySelectorAll(":scope > a[href]").forEach((a) => {
      if (textOf6(a)) content.push(linkPara(textOf6(a), a.getAttribute("href"), document));
    });
    return [imageOf(card, document), content];
  }
  function parse7(element, { document }) {
    if (!element.parentNode) return;
    const notClone = (s) => !s.classList.contains("swiper-slide-duplicate");
    let cells = [];
    let before = [];
    if (element.matches(".related-article-carousel")) {
      const title = element.querySelector(".related-title");
      if (title && textOf6(title)) {
        const h2 = document.createElement("h2");
        h2.textContent = textOf6(title);
        before.push(h2);
      }
      cells = [...element.querySelectorAll(".related-article")].filter(notClone).map((card) => relatedCard(card, document));
    } else if (element.querySelector(".promo-list-card")) {
      cells = [...element.querySelectorAll(".promo-list-card")].filter(notClone).map((card) => promoCard(card, document));
    } else {
      cells = [...element.querySelectorAll(".swiper-wrapper > .swiper-slide")].filter(notClone).map((card) => progressCard(card, document));
    }
    cells = cells.filter(([img, content]) => img || content.length);
    if (!cells.length) return;
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-cards", cells });
    element.replaceWith(...before, block);
  }

  // tools/importer/parsers/cards-overlay.js
  var textOf7 = (el) => el ? el.textContent.replace(/[\s ]+/g, " ").trim() : "";
  function imageOf2(card, document) {
    const img = card.querySelector("img");
    if (!img) return "";
    const picture = img.closest("picture");
    const desktop = picture && picture.querySelector('source[media*="min-width"][srcset]');
    const desktopSrc = desktop ? desktop.getAttribute("srcset").split(",")[0].trim().split(/\s+/)[0] : "";
    const src = desktopSrc || img.getAttribute("src") || img.getAttribute("data-src");
    if (!src || src.startsWith("data:")) return "";
    const out = document.createElement("img");
    out.src = src;
    out.alt = img.getAttribute("alt") || "";
    return out;
  }
  function parse8(element, { document }) {
    if (!element.parentNode) return;
    const cards = [...element.querySelectorAll(".promo-list-card")].filter((c) => !c.classList.contains("swiper-slide-duplicate"));
    const cells = [];
    cards.forEach((card) => {
      const content = [];
      const cardLink = card.querySelector("a.promo-card-background[href], a[href]");
      const href = cardLink ? cardLink.getAttribute("href") : null;
      const category = textOf7(card.querySelector(".promo-category"));
      if (category) {
        const p = document.createElement("p");
        p.textContent = category;
        content.push(p);
      }
      const titleEl = card.querySelector(".promo-title");
      const title = textOf7(titleEl);
      if (title) {
        const level = titleEl && /^H[1-6]$/.test(titleEl.tagName) ? titleEl.tagName.toLowerCase() : "h4";
        const h = document.createElement(level);
        h.textContent = title;
        content.push(h);
      }
      const ctaEl = card.querySelector(".promo-link");
      const ctaText = textOf7(ctaEl) || (href ? "Explore" : "");
      if (ctaText) {
        const p = document.createElement("p");
        const ctaHref = ctaEl && ctaEl.getAttribute("href") || href;
        if (ctaHref) {
          const a = document.createElement("a");
          a.href = ctaHref;
          a.textContent = ctaText;
          p.append(a);
        } else {
          p.textContent = ctaText;
        }
        content.push(p);
      }
      const image = imageOf2(card, document);
      if (image || content.length) cells.push([image, content]);
    });
    if (!cells.length) return;
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-overlay", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-media.js
  var textOf8 = (el) => el ? el.textContent.replace(/\s+/g, " ").trim() : "";
  function isMediaPromo(el) {
    return !!el && el.nodeType === 1 && (el.classList.contains("individual-promo") && !el.classList.contains("col-md-4") || el.classList.contains("promo-links"));
  }
  function videoCell(promo, document) {
    const video = promo.querySelector(".promo-image video, video");
    if (!video) return null;
    const source = video.querySelector("source[src]");
    let href = source && source.getAttribute("src") || video.getAttribute("src") || "";
    if (!href) {
      const iframe = promo.querySelector("iframe[src]");
      href = iframe ? iframe.getAttribute("src") : "";
    }
    if (!href) return null;
    if (href.startsWith("//")) href = `https:${href}`;
    const embed = href.match(/youtube(?:-nocookie)?\.com\/embed\/([\w-]{6,})/);
    if (embed) href = `https://www.youtube.com/watch?v=${embed[1]}`;
    const a = document.createElement("a");
    a.href = href;
    const posterImg = promo.querySelector(".video-init img");
    let poster = (video.getAttribute("poster") || "").trim();
    if (!poster && posterImg && !(posterImg.getAttribute("src") || "").startsWith("data:")) poster = posterImg.getAttribute("src");
    if (poster) {
      const img = document.createElement("img");
      img.src = poster.startsWith("//") ? `https:${poster}` : poster;
      img.alt = textOf8(promo.querySelector(".promo-title"));
      a.append(img);
    } else {
      a.textContent = "Watch the video";
    }
    return a;
  }
  function buildRow(promo, document) {
    const srcImg = promo.querySelector(".promo-image img, img");
    let imageCell = "";
    const video = promo.classList.contains("video") ? videoCell(promo, document) : null;
    if (video) {
      imageCell = video;
    } else if (srcImg) {
      const img = document.createElement("img");
      img.src = srcImg.getAttribute("src");
      img.alt = srcImg.getAttribute("alt") || "";
      imageCell = img;
    }
    const content = [];
    const category = textOf8(promo.querySelector(".promo-category"));
    if (category) {
      const p = document.createElement("p");
      p.textContent = category;
      content.push(p);
    }
    const title = textOf8(promo.querySelector(".promo-title"));
    if (title) {
      const h = document.createElement("h2");
      h.textContent = title;
      content.push(h);
    }
    const subtitle = textOf8(promo.querySelector(".promo-subtitle"));
    if (subtitle) {
      const p = document.createElement("p");
      p.textContent = subtitle;
      content.push(p);
    }
    const desc = promo.querySelector(".promo-description");
    if (desc && textOf8(desc)) {
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
      const label = textOf8(a);
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
    promo.querySelectorAll(".promo-link-groups .promo-link-group").forEach((group) => {
      const label = textOf8(group.querySelector(".promo-link-group-title"));
      if (label) {
        const p = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = label;
        p.append(strong);
        content.push(p);
      }
      group.querySelectorAll("a").forEach((a) => {
        const text = textOf8(a);
        if (!text) return;
        const p = document.createElement("p");
        const href = a.getAttribute("href");
        if (href) {
          const link = document.createElement("a");
          link.href = href;
          link.textContent = text;
          p.append(link);
        } else {
          p.textContent = text;
        }
        content.push(p);
      });
    });
    const imageRight = !!promo.querySelector(".image-right");
    return imageRight ? [content, imageCell] : [imageCell, content];
  }
  function parse9(element, { document }) {
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

  // tools/importer/parsers/carousel-hotspot.js
  var textOf9 = (el) => el ? el.textContent.replace(/[\s ]+/g, " ").trim() : "";
  function stageImage(element, document) {
    const img = element.querySelector(".hs-stage .hero-container img, .hs-stage picture img, .hs-image picture img");
    if (!img) return "";
    const picture = img.closest("picture");
    const desktop = picture && picture.querySelector('source[media*="min-width"][srcset]');
    const desktopSrc = desktop ? desktop.getAttribute("srcset").split(",")[0].trim().split(/\s+/)[0] : "";
    const src = desktopSrc || img.getAttribute("src") || img.getAttribute("data-src");
    if (!src || src.startsWith("data:")) return "";
    const out = document.createElement("img");
    out.src = src;
    out.alt = img.getAttribute("alt") || "";
    return out;
  }
  function positionOf(marker) {
    const style = marker.getAttribute("style") || "";
    const top = (style.match(/top\s*:\s*(-?[\d.]+)\s*%/i) || [])[1] || (marker.style && marker.style.top && marker.style.top.endsWith("%") ? parseFloat(marker.style.top) : null);
    const left = (style.match(/left\s*:\s*(-?[\d.]+)\s*%/i) || [])[1] || (marker.style && marker.style.left && marker.style.left.endsWith("%") ? parseFloat(marker.style.left) : null);
    if (top == null || left == null) return null;
    return { top: String(top), left: String(left) };
  }
  function hotspotContent(source, document) {
    const content = [];
    if (!source) return content;
    [...source.querySelectorAll("p")].forEach((p) => {
      if (p.parentElement.closest("p")) return;
      const clone = p.cloneNode(true);
      clone.querySelectorAll("img, svg, div").forEach((n) => n.remove());
      while (clone.lastChild && (clone.lastChild.nodeName === "BR" || clone.lastChild.nodeType === 3 && !clone.lastChild.textContent.trim())) clone.lastChild.remove();
      if (!textOf9(clone)) return;
      const out = document.createElement("p");
      out.innerHTML = clone.innerHTML.trim();
      content.push(out);
    });
    return content;
  }
  function parse10(element, { document }) {
    if (!element.parentNode) return;
    const cells = [];
    const headerCell = [];
    const srcHeading = element.querySelector(".hs-controls h1, .hs-controls h2, .hs-controls h3, .headered-content h2");
    if (srcHeading && textOf9(srcHeading)) {
      const h2 = document.createElement("h2");
      h2.textContent = textOf9(srcHeading);
      headerCell.push(h2);
    }
    cells.push([stageImage(element, document), headerCell]);
    const popups = [...element.querySelectorAll(".hs-popup")];
    const details = [...element.querySelectorAll(".hs-detail-slide")].filter((s) => !s.classList.contains("swiper-slide-duplicate"));
    const markers = [...element.querySelectorAll(".hs-targets .target-spot, li.target-spot")];
    markers.forEach((marker, idx) => {
      const pos = positionOf(marker);
      if (!pos) return;
      const n = parseInt(marker.getAttribute("data-slide"), 10) || idx + 1;
      const markerId = marker.getAttribute("id") || "";
      const popupId = markerId.replace(/-target-\d+$/, `-popup-${n}`);
      const popup = popups.find((p) => p.id && p.id === popupId) || popups[n - 1] || null;
      let content = hotspotContent(popup, document);
      if (!content.length) content = hotspotContent(details[n - 1], document);
      cells.push([`top: ${pos.top}%, left: ${pos.left}%`, content]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-hotspot", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-category.js
  var textOf10 = (el) => el ? el.textContent.replace(/\s+/g, " ").trim() : "";
  function parse11(element, { document }) {
    const cells = [];
    const cards = [...element.querySelectorAll(".promo-icon-list-card")].filter((c) => !c.classList.contains("swiper-slide-duplicate"));
    cards.forEach((card) => {
      const labelText = textOf10(card.querySelector(".preview-title"));
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
      const label = textOf10(card.querySelector(".preview-title"));
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
      const action = textOf10(card.querySelector(".learn-more"));
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

  // tools/importer/parsers/accordion-specs.js
  var textOf11 = (el) => el ? el.textContent.replace(/[\s ]+/g, " ").trim() : "";
  var consumed = /* @__PURE__ */ new WeakSet();
  var SKIP_TAGS = /* @__PURE__ */ new Set(["SCRIPT", "STYLE", "NOSCRIPT", "LINK", "TEMPLATE"]);
  var isSpecList = (el) => !!el && el.nodeType === 1 && el.matches("div.spec-list");
  function nextComponent(el) {
    let next = el.nextElementSibling;
    while (next && SKIP_TAGS.has(next.tagName)) next = next.nextElementSibling;
    return next;
  }
  function prevComponent(el) {
    let prev = el.previousElementSibling;
    while (prev && SKIP_TAGS.has(prev.tagName)) prev = prev.previousElementSibling;
    return prev;
  }
  function trimBreaks(el) {
    const isJunk = (n) => n && (n.nodeName === "BR" || n.nodeType === 3 && !n.textContent.replace(/[\s ]+/g, ""));
    while (isJunk(el.lastChild)) el.lastChild.remove();
    while (isJunk(el.firstChild)) el.firstChild.remove();
    return el;
  }
  function values(container, document) {
    const out = [];
    let para3 = null;
    const flush = () => {
      if (para3 && textOf11(trimBreaks(para3))) out.push(para3);
      para3 = null;
    };
    [...container.childNodes].forEach((node) => {
      if (node.nodeType === 1 && /^(P|UL|OL)$/.test(node.tagName)) {
        flush();
        const clone = node.cloneNode(true);
        if (clone.tagName === "P") trimBreaks(clone);
        if (textOf11(clone)) out.push(clone);
        return;
      }
      if (node.nodeType === 1 && node.tagName === "DIV") {
        flush();
        out.push(...values(node, document));
        return;
      }
      if (node.nodeType !== 1 && node.nodeType !== 3) return;
      para3 = para3 || document.createElement("p");
      para3.append(node.cloneNode(true));
    });
    flush();
    return out;
  }
  function wrapped(text, tag, document) {
    const p = document.createElement("p");
    const inner = document.createElement(tag);
    inner.textContent = text;
    p.append(inner);
    return p;
  }
  function panelRow(specList, document) {
    const title = textOf11(specList.querySelector(".specification-title"));
    const body = [];
    specList.querySelectorAll(".spec-content").forEach((spec) => {
      const label = textOf11(spec.querySelector(".spec-heading"));
      if (label) body.push(wrapped(label, "strong", document));
      const data = spec.querySelector(".spec-data");
      if (!data) return;
      [...data.children].forEach((child) => {
        if (child.matches(".sub-spec-heading")) {
          const sub = textOf11(child);
          if (sub) body.push(wrapped(sub, "em", document));
        } else {
          body.push(...values(child, document));
        }
      });
    });
    return [title, body];
  }
  function parse12(element, { document }) {
    if (!element.isConnected || !element.parentNode || consumed.has(element)) return;
    if (isSpecList(prevComponent(element))) return;
    const run = [element];
    let next = nextComponent(element);
    while (isSpecList(next)) {
      run.push(next);
      next = nextComponent(next);
    }
    run.forEach((el) => consumed.add(el));
    const cells = run.map((el) => panelRow(el, document)).filter(([t, b]) => t || b.length);
    run.slice(1).forEach((el) => el.remove());
    if (!cells.length) {
      element.remove();
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "accordion-specs", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/video-poster.js
  var textOf12 = (el) => el ? el.textContent.replace(/[\s ]+/g, " ").trim() : "";
  function absolute(url) {
    if (!url) return "";
    const u = url.trim();
    if (u.startsWith("//")) return `https:${u}`;
    return u;
  }
  function normalizeVideoUrl(url) {
    const u = absolute(url);
    const embed = u.match(/youtube(?:-nocookie)?\.com\/embed\/([\w-]{6,})/);
    if (embed) return `https://www.youtube.com/watch?v=${embed[1]}`;
    return u;
  }
  function videoUrl(element) {
    const candidates = [];
    element.querySelectorAll("video source[src]").forEach((s) => candidates.push(s.getAttribute("src")));
    element.querySelectorAll("video[src]").forEach((v) => candidates.push(v.getAttribute("src")));
    element.querySelectorAll("iframe[src], iframe[data-src]").forEach((f) => candidates.push(f.getAttribute("src") || f.getAttribute("data-src")));
    element.querySelectorAll('[data-video-src], [data-video-url], [data-src*="youtu"], [data-url*="youtu"]').forEach((el) => {
      candidates.push(el.getAttribute("data-video-src") || el.getAttribute("data-video-url") || el.getAttribute("data-src") || el.getAttribute("data-url"));
    });
    element.querySelectorAll('a[href*="youtu"], a[href*="vimeo"]').forEach((a) => candidates.push(a.getAttribute("href")));
    const url = candidates.find((c) => c && /youtu\.?be|vimeo|\.(mp4|webm|ogg)(\?|$)/i.test(c)) || candidates.find((c) => c && !c.startsWith("blob:"));
    return url ? normalizeVideoUrl(url) : "";
  }
  function posterImage(element, document, alt) {
    const video = element.querySelector("video");
    const initImg = element.querySelector(".video-init img, .sxa-video-wrapper img, .video-container img");
    let src = video ? (video.getAttribute("poster") || "").trim() : "";
    if (!src && initImg) {
      const s = initImg.getAttribute("src") || initImg.getAttribute("data-src") || "";
      if (s && !s.startsWith("data:")) src = s;
    }
    if (!src) return null;
    const img = document.createElement("img");
    img.src = absolute(src);
    img.alt = initImg && initImg.getAttribute("alt") || alt || "";
    return img;
  }
  function description2(el, document) {
    if (!el || !textOf12(el)) return [];
    const out = [];
    let para3 = null;
    const flush = () => {
      if (para3 && textOf12(para3)) out.push(para3);
      para3 = null;
    };
    [...el.childNodes].forEach((node) => {
      if (node.nodeType === 1 && /^(P|UL|OL|H[1-6]|BLOCKQUOTE)$/.test(node.tagName)) {
        flush();
        if (textOf12(node)) out.push(node);
        return;
      }
      if (node.nodeType === 1 && node.tagName === "BR") {
        flush();
        return;
      }
      if (node.nodeType !== 1 && node.nodeType !== 3) return;
      if (node.nodeType === 3 && !node.textContent.trim() && !para3) return;
      para3 = para3 || document.createElement("p");
      para3.append(node);
    });
    flush();
    return out;
  }
  function parse13(element, { document }) {
    if (!element.parentNode) return;
    const url = videoUrl(element);
    if (!url) return;
    const title = textOf12(element.querySelector(".video-promo-title"));
    const caption = element.querySelector(".video-caption");
    const captionHeading = caption && caption.querySelector("h1, h2, h3, h4, h5, h6");
    const label = title || textOf12(captionHeading);
    const content = [];
    const poster = posterImage(element, document, label);
    if (poster) content.push(poster);
    const p = document.createElement("p");
    const a = document.createElement("a");
    a.href = url;
    a.textContent = label || url;
    p.append(a);
    content.push(p);
    const before = [];
    if (title) {
      const h3 = document.createElement("h3");
      h3.textContent = title;
      before.push(h3);
    }
    const after = [];
    if (caption && textOf12(caption)) {
      if (captionHeading) {
        const h = document.createElement(captionHeading.tagName.toLowerCase());
        h.textContent = textOf12(captionHeading);
        after.push(h);
      } else {
        after.push(...description2(caption, document));
      }
    }
    after.push(...description2(element.querySelector(".video-description"), document));
    const block = WebImporter.Blocks.createBlock(document, { name: "video-poster", cells: [[content]] });
    element.replaceWith(...before, block, ...after);
  }

  // tools/importer/parsers/quote-large-caps.js
  var textOf13 = (el) => el ? el.textContent.replace(/[\s ]+/g, " ").trim() : "";
  function inlineHtml(el, document) {
    const clone = el.cloneNode(true);
    clone.querySelectorAll("i").forEach((i) => {
      const em = document.createElement("em");
      em.innerHTML = i.innerHTML;
      i.replaceWith(em);
    });
    clone.querySelectorAll("b").forEach((b) => {
      const strong = document.createElement("strong");
      strong.innerHTML = b.innerHTML;
      b.replaceWith(strong);
    });
    clone.querySelectorAll("span, font").forEach((s) => s.replaceWith(...s.childNodes));
    return clone.innerHTML.replace(/^(\s|&nbsp;|<br\s*\/?>)+/i, "").replace(/(\s|&nbsp;|<br\s*\/?>)+$/i, "").trim();
  }
  function paragraphs(el, document) {
    if (!el || !textOf13(el)) return [];
    const nested = [...el.querySelectorAll("p")].filter((p) => textOf13(p));
    const sources = nested.length ? nested : [el];
    return sources.map((src) => {
      const p = document.createElement("p");
      p.innerHTML = inlineHtml(src, document);
      return p;
    }).filter((p) => textOf13(p));
  }
  function parse14(element, { document }) {
    if (!element.parentNode) return;
    const quote = paragraphs(element.querySelector(".quote-text"), document);
    const author = paragraphs(element.querySelector(".quote-author"), document);
    if (!quote.length) return;
    const cells = [[quote]];
    if (author.length) cells.push([author]);
    const block = WebImporter.Blocks.createBlock(document, { name: "quote-large-caps", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-news.js
  var textOf14 = (el) => el ? el.textContent.replace(/[\s ]+/g, " ").trim() : "";
  function backgroundImage(item) {
    const styled = [item, ...item.querySelectorAll('[style*="background"]')];
    for (const el of styled) {
      const style = el.getAttribute("style") || "";
      const m = style.replace(/&quot;/g, '"').match(/url\(\s*["']?([^"')]+)["']?\s*\)/i);
      if (m) return m[1].replace(/&amp;/g, "&").trim();
    }
    return "";
  }
  function imageOf3(item, document) {
    const img = item.querySelector("img");
    let src = img ? img.getAttribute("src") || img.getAttribute("data-src") || "" : "";
    let alt = img ? img.getAttribute("alt") || "" : "";
    if (!src || src.startsWith("data:")) {
      src = backgroundImage(item);
      const link = item.querySelector("a[aria-label]");
      alt = link ? link.getAttribute("aria-label") : "";
    }
    if (!src || src.startsWith("data:")) return "";
    const out = document.createElement("img");
    out.src = src;
    out.alt = alt;
    return out;
  }
  function para2(text, document) {
    const p = document.createElement("p");
    p.textContent = text;
    return p;
  }
  function row(item, document) {
    const content = [];
    const date = textOf14(item.querySelector(".news-release-date"));
    if (date) content.push(para2(date, document));
    const label = textOf14(item.querySelector(".featured-title, .news-label, .news-type"));
    if (label) content.push(para2(label, document));
    const titleEl = item.querySelector(".news-content p, .news-title, :scope > p, p, h3, h4");
    const title = textOf14(titleEl);
    if (title) {
      const h3 = document.createElement("h3");
      h3.textContent = title;
      content.push(h3);
    }
    const link = [...item.querySelectorAll("a[href]")].find((a) => textOf14(a)) || item.querySelector("a[href]");
    if (link) {
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.href = link.getAttribute("href");
      a.textContent = textOf14(link) || "LEARN MORE";
      p.append(a);
      content.push(p);
    }
    return [imageOf3(item, document), content];
  }
  function parse15(element, { document }) {
    if (!element.parentNode) return;
    const items = [
      ...element.querySelectorAll(".news-featured .news-feature"),
      ...element.querySelectorAll(".news-small .news-story")
    ];
    if (!items.length) items.push(...element.querySelectorAll(".news-feature, .news-story"));
    const cells = items.map((item) => row(item, document)).filter(([img, content]) => img || content.some((c) => c.tagName === "H3"));
    if (!cells.length) return;
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-news", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion.js
  var textOf15 = (el) => el ? el.textContent.replace(/[\s ]+/g, " ").trim() : "";
  var BLOCK_TAGS2 = /^(P|UL|OL|H[1-6]|BLOCKQUOTE|TABLE|PICTURE|IMG|FIGURE)$/;
  var hasMedia = (el) => el.nodeType === 1 && (el.matches("img, picture, iframe, video, table") || !!el.querySelector("img, picture, iframe, video, table"));
  function bodyContent(container, document) {
    const out = [];
    let para3 = null;
    const flush = () => {
      if (para3) {
        while (para3.lastChild && para3.lastChild.nodeName === "BR") para3.lastChild.remove();
        if (textOf15(para3) || para3.querySelector("img")) out.push(para3);
      }
      para3 = null;
    };
    [...container.childNodes].forEach((node) => {
      if (node.nodeType === 3) {
        if (!node.textContent.trim() && !para3) return;
        para3 = para3 || document.createElement("p");
        para3.append(node);
        return;
      }
      if (node.nodeType !== 1) return;
      if (BLOCK_TAGS2.test(node.tagName)) {
        flush();
        if (textOf15(node) || hasMedia(node)) out.push(node);
        return;
      }
      if (node.tagName === "DIV" || node.tagName === "SECTION") {
        flush();
        out.push(...bodyContent(node, document));
        return;
      }
      if (node.tagName === "BR" && !para3) return;
      para3 = para3 || document.createElement("p");
      para3.append(node);
    });
    flush();
    return out;
  }
  function parse16(element, { document }) {
    if (!element.parentNode) return;
    const before = [];
    const layout = element.querySelector(".layout") || element;
    const heading2 = [...layout.children].find((c) => /^H[1-6]$/.test(c.tagName));
    if (heading2 && textOf15(heading2)) {
      const h = document.createElement(heading2.tagName.toLowerCase());
      heading2.querySelectorAll("br").forEach((br) => br.replaceWith(document.createTextNode("\0")));
      textOf15(heading2).split("\0").map((s) => s.trim()).filter(Boolean).forEach((part, i) => {
        if (i) h.append(document.createElement("br"));
        h.append(part);
      });
      before.push(h);
    }
    const cells = [];
    element.querySelectorAll("li.item").forEach((item) => {
      const header = item.querySelector(".toggle-header");
      const label = textOf15(header && (header.querySelector(".field-heading") || header));
      const content = item.querySelector(".toggle-content");
      const fields = content ? [...content.querySelectorAll(".field-content")] : [];
      const body = (fields.length ? fields : content ? [content] : []).flatMap((f) => bodyContent(f, document));
      if (!label && !body.length) return;
      cells.push([label, body]);
    });
    if (!cells.length) return;
    const block = WebImporter.Blocks.createBlock(document, { name: "accordion", cells });
    element.replaceWith(...before, block);
  }

  // tools/importer/transformers/international-cleanup.js
  var NEWSLETTER_HREF = "/modals/newsletter";
  var QUOTE_HREF = "/our-company/contact";
  function slugify(value) {
    return String(value || "").toLowerCase().replace(/[^0-9a-z]+/g, "-").replace(/^-+|-+$/g, "");
  }
  function modalTargetOf(el) {
    const raw = el.getAttribute("data-bs-target") || el.getAttribute("data-target") || el.getAttribute("target") || "";
    if (!raw || raw.startsWith("_")) return "";
    return raw.replace(/^#/, "");
  }
  function hasNoRealHref(el) {
    const href = (el.getAttribute("href") || "").trim();
    return !href || href === "#" || href === "/" || /^https?:\/\/(www\.)?international\.com\/?$/i.test(href);
  }
  var textOf16 = (el) => (el.textContent || "").replace(/\s+/g, " ").trim();
  function toLink(el, href) {
    const doc = el.ownerDocument;
    if (el.tagName === "A") {
      el.setAttribute("href", href);
      ["target", "data-bs-target", "data-bs-toggle", "data-target", "data-toggle", "role"].forEach((a2) => el.removeAttribute(a2));
      return;
    }
    const a = doc.createElement("a");
    a.setAttribute("href", href);
    a.textContent = textOf16(el);
    el.replaceWith(a);
  }
  var isEmptyNode = (el) => !textOf16(el).replace(/ /g, "") && !el.querySelector("img, picture, video, iframe, svg, canvas, input, select, textarea");
  function transform(hookName, element, payload) {
    if (hookName === "beforeTransform") {
      const document = element.ownerDocument;
      WebImporter.DOMUtils.remove(element, ["script"]);
      const templateName = payload && payload.template && payload.template.name;
      if (!["home", "landing-page"].includes(templateName)) element.querySelectorAll("a, button").forEach((el) => {
        const target = modalTargetOf(el);
        const text = textOf16(el);
        if (target === "subscribe-modal" || el.classList.contains("subscribe-modal") || /^subscribe( to international)?$/i.test(text) && hasNoRealHref(el)) {
          toLink(el, NEWSLETTER_HREF);
        } else if (/quote/i.test(target) || /^raq$/i.test(target) || /^(request|start) a quote$/i.test(text) && hasNoRealHref(el)) {
          toLink(el, QUOTE_HREF);
        }
      });
      WebImporter.DOMUtils.remove(element, [
        '#PARTS-AND-SERVICE [id^="react_"]',
        "#start-quote",
        ".modal-form-wrapper"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "#subscribe-modal",
        ".modal",
        '[aria-modal="true"]',
        ".sitecore-form",
        '[id^="QSI"]',
        '[class^="QSI"]',
        '[class*=" QSI"]',
        '[id*="qualtrics" i]',
        '[class*="qualtrics" i]'
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
        const h2 = document.createElement("h2");
        h2.innerHTML = div.innerHTML;
        div.replaceWith(h2);
      });
      element.querySelectorAll("div.in-page-navigation").forEach((ipn) => {
        const links = [...ipn.querySelectorAll("a[href]")].filter((a) => textOf16(a));
        if (!links.length) {
          ipn.remove();
          return;
        }
        const ul = document.createElement("ul");
        links.forEach((link) => {
          let href = link.getAttribute("href");
          if (href.startsWith("#")) {
            let frag = href.slice(1);
            try {
              frag = decodeURIComponent(frag);
            } catch (e) {
            }
            href = `#${slugify(frag)}`;
          }
          const li = document.createElement("li");
          const a = document.createElement("a");
          a.setAttribute("href", href);
          a.textContent = textOf16(link);
          li.append(a);
          ul.append(li);
        });
        ipn.replaceChildren(ul);
      });
      element.querySelectorAll("div.component.content").forEach((comp) => {
        if (comp.closest(".title-accordion")) return;
        if (isEmptyNode(comp)) {
          comp.remove();
          return;
        }
        const heading2 = comp.querySelector(":scope > .component-content > .field-heading");
        if (heading2 && textOf16(heading2)) {
          const h3 = document.createElement("h3");
          h3.innerHTML = heading2.innerHTML;
          heading2.replaceWith(h3);
        } else if (heading2) {
          heading2.remove();
        }
      });
      WebImporter.DOMUtils.remove(element, ["div.link-list a svg"]);
      element.querySelectorAll("div.file-list li").forEach((li) => {
        const candidates = [
          ...li.querySelectorAll(".field-linktext a[href]"),
          ...li.querySelectorAll("a[href]")
        ];
        const titleLink = candidates.find((a2) => !a2.closest(".field-filetypeicon") && textOf16(a2) && !/^download$/i.test(textOf16(a2)));
        if (!titleLink) {
          li.remove();
          return;
        }
        const a = document.createElement("a");
        a.setAttribute("href", titleLink.getAttribute("href"));
        a.textContent = textOf16(titleLink).replace(/\s*download$/i, "");
        li.replaceChildren(a);
      });
      element.querySelectorAll("div.blog-promo .promo-header").forEach((div) => {
        if (!textOf16(div)) return;
        const h2 = document.createElement("h2");
        h2.textContent = textOf16(div);
        div.replaceWith(h2);
      });
      WebImporter.DOMUtils.remove(element, [".rich-text svg"]);
      element.querySelectorAll(".rich-text p").forEach((p) => {
        if (isEmptyNode(p)) p.remove();
      });
      WebImporter.DOMUtils.remove(element, [".swiper-notification"]);
      WebImporter.DOMUtils.remove(element, [".waypoint-id-box"]);
      const blockSelectors = (payload && payload.template && payload.template.blocks || []).flatMap((b) => b.instances || []);
      if (blockSelectors.length) {
        element.querySelectorAll(".nav-buttons, .swiper-pagination, .slide-count").forEach((el) => {
          const inBlock = blockSelectors.some((sel) => {
            try {
              return !!el.closest(sel);
            } catch (e) {
              return true;
            }
          });
          if (!inBlock) el.remove();
        });
      }
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

  // tools/importer/transformers/international-content-sections.js
  var STYLE_ATTR = "data-excat-cs-style";
  var FIRST_ATTR = "data-excat-cs-first";
  var SKIP_TAGS2 = /* @__PURE__ */ new Set(["SCRIPT", "STYLE", "LINK", "NOSCRIPT", "TEMPLATE", "HR"]);
  var WRAPPER_COMPONENTS = ".section-container, .container, .waypoint-id-box";
  var isEmpty = (el) => !(el.textContent || "").replace(/[\s ]/g, "") && !el.querySelector("img, picture, video, iframe, svg, canvas, a[href], input, select, textarea");
  function isBlockTarget(el, blockSelectors) {
    return blockSelectors.some((sel) => {
      try {
        return el.matches(sel);
      } catch (e) {
        return false;
      }
    });
  }
  function sectionComponents(row2, blockSelectors) {
    const result = [];
    [...row2.children].forEach((child) => {
      if (SKIP_TAGS2.has(child.tagName) || isEmpty(child)) return;
      const innerRow = child.matches("div.container") ? child.querySelector(":scope > .component-content > .row") : null;
      if (innerRow && !isBlockTarget(child, blockSelectors)) {
        [...innerRow.children].forEach((g) => {
          if (!SKIP_TAGS2.has(g.tagName) && !isEmpty(g)) result.push(g);
        });
      } else {
        result.push(child);
      }
    });
    return result;
  }
  function firstContentComponent(el) {
    if (!el.matches(WRAPPER_COMPONENTS)) return el;
    return [...el.querySelectorAll(".component")].find((c) => !c.matches(WRAPPER_COMPONENTS) && !isEmpty(c)) || null;
  }
  function sectionStyles(el) {
    const styles = [];
    if (el.matches("section.background-asphalt")) styles.push("dark");
    if (el.matches(".in-page-navigation") || el.querySelector(".in-page-navigation")) {
      styles.push("in-page-nav");
    }
    const first = firstContentComponent(el);
    if (first && first.matches("div.title-block") || el.matches("div.related-article-carousel") || el.querySelector("div.related-article-carousel")) {
      styles.push("centered");
    }
    return styles;
  }
  function transform2(hookName, element, payload) {
    const document = element.ownerDocument || payload && payload.document;
    if (hookName === "beforeTransform") {
      const row2 = element.querySelector("#content > div.row") || document.querySelector("#content > div.row");
      if (!row2) return;
      const blockSelectors = (payload && payload.template && payload.template.blocks || []).flatMap((b) => b.instances || []);
      const components = sectionComponents(row2, blockSelectors);
      for (let i = components.length - 1; i >= 0; i -= 1) {
        const el = components[i];
        const styles = sectionStyles(el);
        if (i === 0 && !styles.length) continue;
        const hr = document.createElement("hr");
        if (styles.length) hr.setAttribute(STYLE_ATTR, styles.join(", "));
        if (i === 0) hr.setAttribute(FIRST_ATTR, "true");
        el.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      element.querySelectorAll(`hr[${STYLE_ATTR}]`).forEach((hr) => {
        const style = hr.getAttribute(STYLE_ATTR);
        const metadata = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style }
        });
        hr.after(metadata);
        hr.removeAttribute(STYLE_ATTR);
      });
      element.querySelectorAll(`hr[${FIRST_ATTR}]`).forEach((hr) => hr.remove());
    }
  }

  // tools/importer/import-content-page.js
  var PAGE_TEMPLATE = {
    "name": "content-page",
    "urls": [
      "https://www.international.com/products/trucks/series/lt",
      "https://www.international.com/configurator",
      "https://www.international.com/dealer-network",
      "https://www.international.com/dealer-network/prestige-certified",
      "https://www.international.com/dealer-network/recruitment",
      "https://www.international.com/dealer-network/recruitment/apply-to-dealership-jobs",
      "https://www.international.com/dealer-network/recruitment/become-a-tech",
      "https://www.international.com/dealer-network/recruitment/influence-winners",
      "https://www.international.com/dealer-network/recruitment/influence-winners/2024-technician-of-the-year/rookies",
      "https://www.international.com/dealer-network/recruitment/influence-winners/2024-technician-of-the-year/veterans",
      "https://www.international.com/dealer-network/recruitment/internships",
      "https://www.international.com/dealer-network/recruitment/service-advisors",
      "https://www.international.com/dealer-network/recruitment/top-team-competition",
      "https://www.international.com/fr/our-company",
      "https://www.international.com/fr/products/trucks/classes/heavy",
      "https://www.international.com/fr/products/trucks/classes/medium",
      "https://www.international.com/fr/products/trucks/classes/severe",
      "https://www.international.com/fr/products/trucks/series/cv",
      "https://www.international.com/fr/products/trucks/series/electric-mv",
      "https://www.international.com/fr/products/trucks/series/hv",
      "https://www.international.com/fr/products/trucks/series/hx",
      "https://www.international.com/fr/products/trucks/series/lt",
      "https://www.international.com/fr/products/trucks/series/mv",
      "https://www.international.com/fr/products/trucks/series/rh",
      "https://www.international.com/fr/services/fleet-electrification",
      "https://www.international.com/fr/services/fleet-electrification/charging",
      "https://www.international.com/fr/services/fleet-electrification/consulting",
      "https://www.international.com/fr/services/fleet-electrification/customer-onboarding",
      "https://www.international.com/industries",
      "https://www.international.com/industries/construction",
      "https://www.international.com/industries/construction/concrete-mixers",
      "https://www.international.com/industries/construction/crane-trucks",
      "https://www.international.com/industries/construction/dump-trucks",
      "https://www.international.com/industries/government-and-municipal",
      "https://www.international.com/industries/government-and-municipal/fire-and-rescue",
      "https://www.international.com/industries/government-and-municipal/snow-plows",
      "https://www.international.com/industries/private-and-general-freight",
      "https://www.international.com/industries/private-and-general-freight/local-and-regional-delivery",
      "https://www.international.com/industries/private-and-general-freight/long-haul",
      "https://www.international.com/industries/private-and-general-freight/tankers",
      "https://www.international.com/industries/refuse/waste-and-recycling",
      "https://www.international.com/industries/specialized-hauling",
      "https://www.international.com/industries/specialized-hauling/heavy-haul",
      "https://www.international.com/industries/specialized-hauling/towing-and-recovery",
      "https://www.international.com/industries/utility",
      "https://www.international.com/legal/shy-settlement",
      "https://www.international.com/legal/shy-settlement/important-case-documents",
      "https://www.international.com/legal/shy-settlement/shy-settlement-important-dates",
      "https://www.international.com/our-company",
      "https://www.international.com/our-company/contact",
      "https://www.international.com/our-company/governance",
      "https://www.international.com/our-company/investors",
      "https://www.international.com/our-company/locations",
      "https://www.international.com/our-company/locations/parts-distribution-centers",
      "https://www.international.com/our-company/locations/production-plants",
      "https://www.international.com/our-company/locations/proving-grounds",
      "https://www.international.com/our-company/partnerships",
      "https://www.international.com/our-company/partnerships/loves",
      "https://www.international.com/our-company/partnerships/supplier-diversity",
      "https://www.international.com/our-company/people/dei",
      "https://www.international.com/our-company/people/employee-resource-groups",
      "https://www.international.com/our-company/people/leadership",
      "https://www.international.com/our-company/people/retirees",
      "https://www.international.com/our-company/stories",
      "https://www.international.com/our-company/stories/2022/2022-carb-emissions-regulations",
      "https://www.international.com/our-company/stories/2022/2022-truck-trends",
      "https://www.international.com/our-company/stories/2022/benefits-of-electric",
      "https://www.international.com/our-company/stories/2022/charging-ahead",
      "https://www.international.com/our-company/stories/2022/driver-retention",
      "https://www.international.com/our-company/stories/2022/emv-walkaround",
      "https://www.international.com/our-company/stories/2022/lt-series-enhancements",
      "https://www.international.com/our-company/stories/2022/paving-the-way-for-others",
      "https://www.international.com/our-company/stories/2022/rose-colored-glasses-breast-cancer-survivor-story",
      "https://www.international.com/our-company/stories/2022/s13integrated-dual-stage-aftertreatment",
      "https://www.international.com/our-company/stories/2022/school-busses-will-lead-the-charge-on-electrification",
      "https://www.international.com/our-company/stories/2022/the-circle-of-giving-back",
      "https://www.international.com/our-company/stories/2022/truck-maintenance-tips",
      "https://www.international.com/our-company/stories/2023/2023-truck-trends",
      "https://www.international.com/our-company/stories/2023/charging-whitepaper",
      "https://www.international.com/our-company/stories/2023/deploying-electric-truck",
      "https://www.international.com/our-company/stories/2023/diamond-logic",
      "https://www.international.com/our-company/stories/2023/electric-vehicle-one-million-miles-driven",
      "https://www.international.com/our-company/stories/2023/electric-vehicle-two-million-miles-driven",
      "https://www.international.com/our-company/stories/2023/emv-us-air-conditioning-testimonial",
      "https://www.international.com/our-company/stories/2023/hx-features",
      "https://www.international.com/our-company/stories/2023/mv-series-safety",
      "https://www.international.com/our-company/stories/2023/s13-connected-technologies",
      "https://www.international.com/our-company/stories/2023/supertruck-ii",
      "https://www.international.com/our-company/stories/2023/tackaberry-and-sons",
      "https://www.international.com/our-company/stories/2023/uptime-academy-graduates",
      "https://www.international.com/our-company/stories/2023/warm-weather-maintenance-tips",
      "https://www.international.com/our-company/stories/2024/2024-truck-trends",
      "https://www.international.com/our-company/stories/2024/accelerated-service",
      "https://www.international.com/our-company/stories/2024/an-oems-perspective-on-charging-infrastructure",
      "https://www.international.com/our-company/stories/2024/autonomous-driving-technology",
      "https://www.international.com/our-company/stories/2024/customers-experience-s13-integrated-powertrain",
      "https://www.international.com/our-company/stories/2024/driver-safety",
      "https://www.international.com/our-company/stories/2024/edmonton-parts-distribution-center-success",
      "https://www.international.com/our-company/stories/2024/electric-vehicle-funding",
      "https://www.international.com/our-company/stories/2024/electric-vehicle-onboarding",
      "https://www.international.com/our-company/stories/2024/electric-vehicle-onboarding-part-2",
      "https://www.international.com/our-company/stories/2024/enhancing-customer-uptime",
      "https://www.international.com/our-company/stories/2024/ev-misconceptions",
      "https://www.international.com/our-company/stories/2024/landscape-trucks",
      "https://www.international.com/our-company/stories/2024/leveraging-history-to-support-customer-needs",
      "https://www.international.com/our-company/stories/2024/national-school-bus-safety-week",
      "https://www.international.com/our-company/stories/2024/real-world-testing-the-international-s13-integrated-powertrain",
      "https://www.international.com/our-company/stories/2024/s13-interview",
      "https://www.international.com/our-company/stories/2024/sustainable-solutions-report",
      "https://www.international.com/our-company/stories/2024/the-diesel-to-electric-transition",
      "https://www.international.com/our-company/stories/2024/tmc-annual-meeting",
      "https://www.international.com/our-company/stories/2024/understanding-fleet-electrification-needs",
      "https://www.international.com/our-company/stories/2024/world-of-concrete",
      "https://www.international.com/our-company/stories/2024/year-round-maintenance-plan",
      "https://www.international.com/our-company/stories/2025/a-finance-partner-that-understands-the-truck-business",
      "https://www.international.com/our-company/stories/2025/act-expo-main-stage-panel",
      "https://www.international.com/our-company/stories/2025/building-sustainable-mobility-through-digitalization",
      "https://www.international.com/our-company/stories/2025/docuseries",
      "https://www.international.com/our-company/stories/2025/everything-you-need-to-know-about-adding-bev-trucks-to-your-fleet",
      "https://www.international.com/our-company/stories/2025/fleet-financial-strategies-for-a-volatile-market",
      "https://www.international.com/our-company/stories/2025/hv-series-puts-in-the-work",
      "https://www.international.com/our-company/stories/2025/modernizing-an-american-legacy",
      "https://www.international.com/our-company/stories/2025/mv-series-ready-for-any-job",
      "https://www.international.com/our-company/stories/2025/prairie-farms-fleet",
      "https://www.international.com/our-company/stories/2025/q4-financing-a-new-truck",
      "https://www.international.com/our-company/stories/2025/s13-integrated-powertrain-for-concrete-mixers",
      "https://www.international.com/our-company/stories/2025/s13-solutions-deliver-for-menzel-enterprises",
      "https://www.international.com/our-company/stories/2025/scott-miller-testimonial",
      "https://www.international.com/our-company/stories/2025/the-s13-integrated-powertrain-powers-ready-mix-success",
      "https://www.international.com/our-company/stories/2025/tulsa-bus-plant-250000-unit-milestone",
      "https://www.international.com/our-company/stories/2025/us-air-conditioning",
      "https://www.international.com/our-company/stories/2026/250-years-of-america",
      "https://www.international.com/our-company/stories/2026/a-new-approach-to-service-contracts",
      "https://www.international.com/our-company/stories/2026/buying-your-first-international-truck",
      "https://www.international.com/our-company/stories/2026/director-of-powertrain-engineering-named-2025-sae-international-fellow",
      "https://www.international.com/our-company/stories/2026/how-international-financial-delivers-financing-solutions",
      "https://www.international.com/our-company/stories/2026/how-my-international-redefines-the-customer-ownership-experience",
      "https://www.international.com/our-company/stories/2026/how-proactive-maintenance-can-boost-your-uptime",
      "https://www.international.com/our-company/stories/2026/international-celebrates-5-years-of-social-impact",
      "https://www.international.com/our-company/stories/2026/international-financial-practical-guide",
      "https://www.international.com/our-company/stories/2026/international-named-one-of-the-most-trustworthy-companies",
      "https://www.international.com/our-company/stories/2026/plan-smarter-save-more-with-financing-built-for-your-fleet",
      "https://www.international.com/our-company/stories/2026/pods-moving-and-storage",
      "https://www.international.com/our-company/stories/2026/support-that-goes-beyond-the-sale",
      "https://www.international.com/our-company/stories/2026/t14-transmission-built-for-the-jobsite",
      "https://www.international.com/our-company/stories/2026/testing-for-improved-truck-fuel-efficiency",
      "https://www.international.com/our-company/stories/2026/truck-driver-appreciation",
      "https://www.international.com/our-company/stories/2026/why-international-vocational-trucks-rule-the-jobsite",
      "https://www.international.com/our-company/vision-and-strategy/culture-and-leadership/shared-values",
      "https://www.international.com/our-company/vision-and-strategy/foundations-for-future/digitalization",
      "https://www.international.com/our-company/vision-and-strategy/foundations-for-future/electrification",
      "https://www.international.com/our-company/vision-and-strategy/sustainability/environmental-impact",
      "https://www.international.com/our-company/vision-and-strategy/sustainability/social-impact",
      "https://www.international.com/our-company/whistleblower-reporting",
      "https://www.international.com/parts",
      "https://www.international.com/parts/global-parts-support",
      "https://www.international.com/parts/ih-gascap",
      "https://www.international.com/parts/online-ordering",
      "https://www.international.com/power-take-off-calculator",
      "https://www.international.com/privacy-notice",
      "https://www.international.com/products/resources",
      "https://www.international.com/products/resources/literature",
      "https://www.international.com/products/resources/operator-guides-and-training/bev-training-material",
      "https://www.international.com/products/resources/tem-body-builder",
      "https://www.international.com/products/resources/tem-body-builder/body-resources",
      "https://www.international.com/products/resources/tem-body-builder/cad-data",
      "https://www.international.com/products/resources/tem-body-builder/engine-resources",
      "https://www.international.com/products/resources/tem-body-builder/t14-transmission-resources",
      "https://www.international.com/products/resources/tem-body-builder/tips-and-training",
      "https://www.international.com/products/resources/tem-body-builder/tools-and-software",
      "https://www.international.com/products/trucks",
      "https://www.international.com/products/trucks/all-electric-refrigerated-truck",
      "https://www.international.com/products/trucks/classes/heavy",
      "https://www.international.com/products/trucks/classes/medium",
      "https://www.international.com/products/trucks/classes/severe",
      "https://www.international.com/products/trucks/features",
      "https://www.international.com/products/trucks/features/diamond-logic",
      "https://www.international.com/products/trucks/features/engines-and-powertrains",
      "https://www.international.com/products/trucks/features/engines-and-powertrains/battery-electric-powertrains",
      "https://www.international.com/products/trucks/features/engines-and-powertrains/cummins-b6-7",
      "https://www.international.com/products/trucks/features/engines-and-powertrains/cummins-l9",
      "https://www.international.com/products/trucks/features/engines-and-powertrains/cummins-x15",
      "https://www.international.com/products/trucks/inventory",
      "https://www.international.com/products/trucks/legacy-trucks",
      "https://www.international.com/products/trucks/legacy-trucks/proven-trucks",
      "https://www.international.com/products/trucks/series/cv",
      "https://www.international.com/products/trucks/series/electric-mv",
      "https://www.international.com/products/trucks/series/hv",
      "https://www.international.com/products/trucks/series/hx",
      "https://www.international.com/products/trucks/series/mv",
      "https://www.international.com/products/trucks/series/rh",
      "https://www.international.com/services",
      "https://www.international.com/services/financing",
      "https://www.international.com/services/financing/ev-fleet",
      "https://www.international.com/services/financing/financing-canada",
      "https://www.international.com/services/financing/leasing",
      "https://www.international.com/services/financing/loans",
      "https://www.international.com/services/financing/municipal-financing",
      "https://www.international.com/services/financing/used-vehicles",
      "https://www.international.com/services/financing/year-end-cash-in-hand",
      "https://www.international.com/services/fleet-electrification",
      "https://www.international.com/services/fleet-electrification/charging",
      "https://www.international.com/services/fleet-electrification/consulting",
      "https://www.international.com/services/fleet-electrification/customer-onboarding",
      "https://www.international.com/services/fleet-electrification/ev-podcast",
      "https://www.international.com/services/fleet-electrification/faq",
      "https://www.international.com/services/fleet-resources",
      "https://www.international.com/services/fleet-resources/emergency-breakdown",
      "https://www.international.com/services/fleet-resources/parts-information",
      "https://www.international.com/services/fleet-resources/parts-return-program",
      "https://www.international.com/services/fleet-resources/service-information",
      "https://www.international.com/services/fleet-resources/technician-education",
      "https://www.international.com/services/global-service-support",
      "https://www.international.com/services/maintenance-services",
      "https://www.international.com/services/maintenance-services/accelerated-service",
      "https://www.international.com/services/my-international",
      "https://www.international.com/services/my-international/advanced-remote-diagnostics",
      "https://www.international.com/services/my-international/fuel-analytics",
      "https://www.international.com/services/my-international/integrations",
      "https://www.international.com/services/my-international/over-the-air-programming",
      "https://www.international.com/services/my-international/qrcode",
      "https://www.international.com/services/my-international/remote-lock-unlock",
      "https://www.international.com/services/my-international/service-communications",
      "https://www.international.com/services/my-international/telematics-opt-out",
      "https://www.international.com/services/my-international/terms-of-use-and-privacy-policy",
      "https://www.international.com/services/promotions",
      "https://www.international.com/services/promotions/ready-to-roll",
      "https://www.international.com/services/sourcewell",
      "https://www.international.com/services/sourcewell/sourcewell-parts",
      "https://www.international.com/services/sourcewell/sourcewell-truck",
      "https://www.international.com/services/uptime-advocate",
      "https://www.international.com/services/warranties",
      "https://www.international.com/terms-of-use"
    ],
    "coverageGaps": [],
    "description": "Standard component page: hero banner, mixed text/media sections, promo card lists and CTA bands",
    "blocks": [
      {
        "name": "hero-banner",
        "instances": [
          "div.main-hero"
        ]
      },
      {
        "name": "columns-cta-band",
        "instances": [
          "div.component.container:has(> .component-content > .row > .button-link)"
        ]
      },
      {
        "name": "columns-headline",
        "instances": [
          "div.page-preview"
        ]
      },
      {
        "name": "carousel-hero",
        "instances": [
          "div.hero-slider:has(.hero-swiper-arrows)"
        ]
      },
      {
        "name": "carousel-thumbnails",
        "instances": [
          "div.hero-slider:has(.hero-swiper-thumbnails)"
        ]
      },
      {
        "name": "cards-promo",
        "instances": [
          "div.promo-list:has(.promo-list-items.vertical-card:not(.row-slider))"
        ]
      },
      {
        "name": "carousel-cards",
        "instances": [
          "div.progress-slider",
          "div.promo-list:has(.promo-list-items.row-slider)",
          "div.related-article-carousel"
        ]
      },
      {
        "name": "cards-overlay",
        "instances": [
          "div.promo-list:has(.promo-list-items.row-two-across)"
        ]
      },
      {
        "name": "columns-media",
        "instances": [
          "div.individual-promo",
          "div.promo-links"
        ]
      },
      {
        "name": "carousel-hotspot",
        "instances": [
          "div.swiper-hotspot"
        ]
      },
      {
        "name": "cards-category",
        "instances": [
          "div.promo-icon-list"
        ]
      },
      {
        "name": "accordion-specs",
        "instances": [
          "div.spec-list"
        ]
      },
      {
        "name": "video-poster",
        "instances": [
          "div.video"
        ]
      },
      {
        "name": "quote-large-caps",
        "instances": [
          "div.promo.quote-promo"
        ]
      },
      {
        "name": "cards-news",
        "instances": [
          "div.news-promo"
        ]
      },
      {
        "name": "accordion",
        "instances": [
          "div.title-accordion"
        ]
      }
    ],
    "representativeUrl": "https://www.international.com/products/trucks/series/lt",
    "sections": [
      {
        "id": "rc2",
        "name": "Hero - LT Series",
        "selector": [
          "#content > div.row > div.main-hero:nth-of-type(1)"
        ],
        "style": null,
        "blocks": [
          "hero-banner"
        ],
        "defaultContent": []
      },
      {
        "id": "rc3",
        "name": "Fuel Economy Claim + Quote CTA",
        "selector": [
          "#content > div.row > section.section-container:has(div.button-link)"
        ],
        "style": null,
        "blocks": [
          "columns-cta-band"
        ],
        "defaultContent": []
      },
      {
        "id": "rc4",
        "name": "Intro - Long Haul",
        "selector": [
          "#content > div.row > section.section-container:has(div.page-preview)"
        ],
        "style": null,
        "blocks": [
          "columns-headline"
        ],
        "defaultContent": []
      },
      {
        "id": "rc5",
        "name": "In-page Navigation",
        "selector": [
          "#content > div.row > div.react-component:has(.in-page-navigation)",
          "div.in-page-navigation"
        ],
        "style": "in-page-nav",
        "blocks": [],
        "defaultContent": [
          "div.in-page-navigation"
        ]
      },
      {
        "id": "rc6",
        "name": "The Cabs",
        "selector": [
          "#the-cabs"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": [
          "div.section-title",
          "div.advanced-image"
        ]
      },
      {
        "id": "rc7",
        "name": "Powertrain Slider",
        "selector": [
          "#content > div.row > div.hero-slider"
        ],
        "style": null,
        "blocks": [
          "carousel-hero"
        ],
        "defaultContent": []
      },
      {
        "id": "rc8",
        "name": "The Trim",
        "selector": [
          "#the-trim"
        ],
        "style": null,
        "blocks": [
          "cards-promo"
        ],
        "defaultContent": [
          "div.section-title"
        ]
      },
      {
        "id": "rc9",
        "name": "Features - A Vision for Safety",
        "selector": [
          "#features"
        ],
        "style": null,
        "blocks": [
          "columns-media",
          "carousel-cards"
        ],
        "defaultContent": [
          "div.section-title",
          "div.title-block"
        ]
      },
      {
        "id": "rc10",
        "name": "Interior Hotspots",
        "selector": [
          "#content > div.row > div.swiper-hotspot"
        ],
        "style": null,
        "blocks": [
          "carousel-hotspot"
        ],
        "defaultContent": []
      },
      {
        "id": "rc11",
        "name": "Room to Roam",
        "selector": [
          "#content > div.row > section.section-container:not([id]):has(> .bg-effect div.individual-promo)"
        ],
        "style": null,
        "blocks": [
          "columns-media"
        ],
        "defaultContent": []
      },
      {
        "id": "rc12",
        "name": "Build Your Own",
        "selector": [
          "#build-your-own"
        ],
        "style": null,
        "blocks": [
          "hero-banner"
        ],
        "defaultContent": []
      },
      {
        "id": "rc13",
        "name": "Quick Links Tiles",
        "selector": [
          "#content > div.row > section.section-container:has(div.promo-icon-list)"
        ],
        "style": null,
        "blocks": [
          "cards-category"
        ],
        "defaultContent": []
      },
      {
        "id": "rc14",
        "name": "Resources",
        "selector": [
          "#resources",
          "#content > div.row > section.section-container:has(div.file-list)"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": [
          "div.file-list"
        ]
      },
      {
        "id": "rc15",
        "name": "Specifications",
        "selector": [
          "#specifications",
          "#content > div.row > section.section-container:has(div.spec-list)"
        ],
        "style": null,
        "blocks": [
          "accordion-specs"
        ],
        "defaultContent": [
          "div.section-title"
        ]
      },
      {
        "id": "rc16",
        "name": "Financing & Services",
        "selector": [
          "#financing-\\&-services"
        ],
        "style": null,
        "blocks": [
          "carousel-cards"
        ],
        "defaultContent": [
          "div.section-title"
        ]
      },
      {
        "id": "rc17",
        "name": "Explore More Trucks",
        "selector": [
          "#DOCUMENTATION",
          "#content > div.row > section.section-container:has(div.promo-list .row-two-across)"
        ],
        "style": "centered",
        "blocks": [
          "cards-overlay"
        ],
        "defaultContent": [
          "div.title-block"
        ]
      },
      {
        "id": "rc18",
        "name": "Dealer Network CTA",
        "selector": [
          "#content > div.row > div.main-hero:last-of-type"
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
    "columns-cta-band": parse2,
    "columns-headline": parse3,
    "carousel-hero": parse4,
    "carousel-thumbnails": parse5,
    "cards-promo": parse6,
    "carousel-cards": parse7,
    "cards-overlay": parse8,
    "columns-media": parse9,
    "carousel-hotspot": parse10,
    "cards-category": parse11,
    "accordion-specs": parse12,
    "video-poster": parse13,
    "quote-large-caps": parse14,
    "cards-news": parse15,
    "accordion": parse16
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
  var import_content_page_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode || !block.element.isConnected) return;
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
  return __toCommonJS(import_content_page_exports);
})();
