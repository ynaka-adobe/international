/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel-cards.
 * Sources (all horizontally scrolling card sliders):
 *   - div.progress-slider: .swiper-slide = img + div.eyebrow + h5 + p.caption
 *   - div.promo-list with .promo-list-items.row-slider: .promo-list-card =
 *       img + .card-content (p.promo-category?, h4/h5.promo-title,
 *       .promo-description, a.promo-link); the configurator variant wraps the
 *       whole card in a.promo-card-background
 *   - div.related-article-carousel (story "other articles"): .related-article =
 *       a > img, .related-article-date, h3.related-article-title > a,
 *       .related-article-preview, a "Read More". Its h2.related-title is moved
 *       before the block as default content.
 * Target table (2 columns), one row per card:
 *   image | optional eyebrow paragraph + heading + paragraph + optional CTA link
 * Slider chrome (arrows, progress bar, counters, inputs, loop clones) is ignored.
 */

const textOf = (el) => (el ? el.textContent.replace(/[\s ]+/g, ' ').trim() : '');

function imageOf(card, document) {
  const img = card.querySelector('img');
  if (!img) return '';
  const picture = img.closest('picture');
  const desktop = picture && picture.querySelector('source[media*="min-width"][srcset]');
  const desktopSrc = desktop ? desktop.getAttribute('srcset').split(',')[0].trim().split(/\s+/)[0] : '';
  const src = desktopSrc || img.getAttribute('src') || img.getAttribute('data-src');
  if (!src || src.startsWith('data:')) return '';
  const out = document.createElement('img');
  out.src = src;
  out.alt = img.getAttribute('alt') || '';
  return out;
}

function para(text, document) {
  const p = document.createElement('p');
  p.textContent = text;
  return p;
}

function linkPara(label, href, document) {
  const p = document.createElement('p');
  if (href) {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = label;
    p.append(a);
  } else {
    p.textContent = label;
  }
  return p;
}

/** Rich description -> paragraphs (keeps inline links/formatting). */
function description(el, document) {
  if (!el || !textOf(el)) return [];
  const blocks = [...el.children].filter((c) => /^(P|UL|OL)$/.test(c.tagName) && textOf(c));
  if (blocks.length) return blocks;
  const p = document.createElement('p');
  p.innerHTML = el.innerHTML.trim();
  while (p.lastChild && (p.lastChild.nodeName === 'BR' || (p.lastChild.nodeType === 3 && !p.lastChild.textContent.trim()))) p.lastChild.remove();
  return textOf(p) ? [p] : [];
}

function heading(el, level, href, document) {
  const h = document.createElement(level);
  if (href) {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = textOf(el);
    h.append(a);
  } else {
    h.textContent = textOf(el);
  }
  return h;
}

/** div.related-article */
function relatedCard(card, document) {
  const content = [];
  const titleEl = card.querySelector('.related-article-title');
  const titleLink = titleEl && titleEl.querySelector('a[href]');
  const href = (titleLink && titleLink.getAttribute('href'))
    || [...card.querySelectorAll('a[href]')].map((a) => a.getAttribute('href'))[0];

  const date = textOf(card.querySelector('.related-article-date'));
  if (date) content.push(para(date, document));
  if (titleEl && textOf(titleEl)) content.push(heading(titleEl, 'h3', href, document));
  content.push(...description(card.querySelector('.related-article-preview'), document));
  const more = [...card.querySelectorAll(':scope > a[href], a.detail-medium')]
    .find((a) => textOf(a) && !a.closest('.related-article-title'));
  if (more) content.push(linkPara(textOf(more), more.getAttribute('href'), document));
  return [imageOf(card, document), content];
}

/** div.promo-list-card */
function promoCard(card, document) {
  const content = [];
  const wrapLink = card.querySelector(':scope > a.promo-card-background[href], :scope > a[href]');
  const category = textOf(card.querySelector('.promo-category'));
  if (category) content.push(para(category, document));

  const link = card.querySelector('.promo-link');
  const hasCta = !!(link && textOf(link));
  const wrapHref = wrapLink ? wrapLink.getAttribute('href') : null;

  const titleEl = card.querySelector('.promo-title');
  if (titleEl && textOf(titleEl)) {
    const level = /^H[1-6]$/.test(titleEl.tagName) ? titleEl.tagName.toLowerCase() : 'h5';
    // whole-card link without a visible CTA: link the title instead
    content.push(heading(titleEl, level, hasCta ? null : wrapHref, document));
  }
  content.push(...description(card.querySelector('.promo-description'), document));

  if (hasCta) {
    content.push(linkPara(textOf(link), link.getAttribute('href') || wrapHref, document));
  }
  return [imageOf(card, document), content];
}

/** div.progress-slider .swiper-slide */
function progressCard(card, document) {
  const content = [];
  const eyebrow = textOf(card.querySelector('.eyebrow'));
  if (eyebrow) content.push(para(eyebrow, document));
  const titleEl = card.querySelector('h1, h2, h3, h4, h5, h6');
  if (titleEl && textOf(titleEl)) content.push(heading(titleEl, titleEl.tagName.toLowerCase(), null, document));
  card.querySelectorAll(':scope > p, .caption').forEach((p) => content.push(...description(p, document)));
  card.querySelectorAll(':scope > a[href]').forEach((a) => {
    if (textOf(a)) content.push(linkPara(textOf(a), a.getAttribute('href'), document));
  });
  return [imageOf(card, document), content];
}

export default function parse(element, { document }) {
  if (!element.parentNode) return;

  const notClone = (s) => !s.classList.contains('swiper-slide-duplicate');
  let cells = [];
  let before = [];

  if (element.matches('.related-article-carousel')) {
    const title = element.querySelector('.related-title');
    if (title && textOf(title)) {
      const h2 = document.createElement('h2');
      h2.textContent = textOf(title);
      before.push(h2);
    }
    cells = [...element.querySelectorAll('.related-article')].filter(notClone)
      .map((card) => relatedCard(card, document));
  } else if (element.querySelector('.promo-list-card')) {
    cells = [...element.querySelectorAll('.promo-list-card')].filter(notClone)
      .map((card) => promoCard(card, document));
  } else {
    cells = [...element.querySelectorAll('.swiper-wrapper > .swiper-slide')].filter(notClone)
      .map((card) => progressCard(card, document));
  }

  cells = cells.filter(([img, content]) => img || content.length);
  if (!cells.length) return;

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-cards', cells });
  element.replaceWith(...before, block);
}
