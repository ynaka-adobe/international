/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-overlay.
 * Source: div.promo-list with .promo-list-items.row-two-across
 *   .promo-list-card > a.promo-card-background[href] > img + .card-content
 *     (p.promo-category, h4.promo-title, p.promo-link "Explore" - text only,
 *      the whole card is the link)
 * Target table (2 columns), one row per card:
 *   image | eyebrow paragraph + heading (h4) + link (card href, CTA text)
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

export default function parse(element, { document }) {
  if (!element.parentNode) return;

  const cards = [...element.querySelectorAll('.promo-list-card')]
    .filter((c) => !c.classList.contains('swiper-slide-duplicate'));

  const cells = [];
  cards.forEach((card) => {
    const content = [];
    const cardLink = card.querySelector('a.promo-card-background[href], a[href]');
    const href = cardLink ? cardLink.getAttribute('href') : null;

    const category = textOf(card.querySelector('.promo-category'));
    if (category) {
      const p = document.createElement('p');
      p.textContent = category;
      content.push(p);
    }

    const titleEl = card.querySelector('.promo-title');
    const title = textOf(titleEl);
    if (title) {
      const level = titleEl && /^H[1-6]$/.test(titleEl.tagName) ? titleEl.tagName.toLowerCase() : 'h4';
      const h = document.createElement(level);
      h.textContent = title;
      content.push(h);
    }

    const ctaEl = card.querySelector('.promo-link');
    const ctaText = textOf(ctaEl) || (href ? 'Explore' : '');
    if (ctaText) {
      const p = document.createElement('p');
      const ctaHref = (ctaEl && ctaEl.getAttribute('href')) || href;
      if (ctaHref) {
        const a = document.createElement('a');
        a.href = ctaHref;
        a.textContent = ctaText;
        p.append(a);
      } else {
        p.textContent = ctaText;
      }
      content.push(p);
    }

    const image = imageOf(card, document);
    if (image || content.length) cells.push([image, content]);
  });

  if (!cells.length) return;
  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-overlay', cells });
  element.replaceWith(block);
}
