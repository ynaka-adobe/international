/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-category.
 * Source: div.promo-icon-list (icon tiles: Dealer Locator, Inventory, Promotions, Start a Quote)
 * Target table (2 columns), one row per tile:
 *   icon image | linked label (h3) + action text
 * Swiper chrome (notifications, duplicate loop clones) is ignored.
 */

const textOf = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');

export default function parse(element, { document }) {
  const cells = [];

  const cards = [...element.querySelectorAll('.promo-icon-list-card')]
    .filter((c) => !c.classList.contains('swiper-slide-duplicate'));

  cards.forEach((card) => {
    // Icon: live DOM has an inline <svg>; cleaned snapshots have <img src="data:image/svg+xml...">
    const labelText = textOf(card.querySelector('.preview-title'));
    const srcImg = card.querySelector('.item-content-container img, img');
    const srcSvg = card.querySelector('.item-content-container svg, svg');
    let imageCell = '';
    if (srcImg && srcImg.getAttribute('src')) {
      const img = document.createElement('img');
      img.src = srcImg.getAttribute('src');
      img.alt = srcImg.getAttribute('alt') || labelText;
      imageCell = img;
    } else if (srcSvg) {
      const svg = srcSvg.cloneNode(true);
      if (!svg.getAttribute('xmlns')) svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      const markup = svg.outerHTML;
      let encoded;
      try {
        encoded = btoa(unescape(encodeURIComponent(markup)));
      } catch (e) {
        encoded = null;
      }
      const img = document.createElement('img');
      img.src = encoded
        ? `data:image/svg+xml;base64,${encoded}`
        : `data:image/svg+xml;utf8,${encodeURIComponent(markup)}`;
      img.alt = labelText;
      imageCell = img;
    }

    const content = [];
    const link = card.querySelector('a.promo-icon-list-item, a');
    const href = link ? link.getAttribute('href') : null;

    const label = textOf(card.querySelector('.preview-title'));
    if (label) {
      const h = document.createElement('h3');
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = label;
        h.append(a);
      } else {
        h.textContent = label;
      }
      content.push(h);
    }

    const action = textOf(card.querySelector('.learn-more'));
    if (action) {
      const p = document.createElement('p');
      p.textContent = action;
      content.push(p);
    }

    cells.push([imageCell, content]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-category', cells });
  element.replaceWith(block);
}
