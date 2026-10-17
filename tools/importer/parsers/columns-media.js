/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-media.
 * Source: section.background-asphalt div.individual-promo:not(.col-md-4)
 *   - award section: a single element -> one-row block
 *   - #WHAT-DRIVES-US: 3 adjacent sibling elements -> grouped into one 3-row block
 * Target table (2 columns), one row per promo:
 *   image | heading + subtitle + description (paragraphs/list) + CTA link
 *   For source ".image-right" promos the cells are swapped (text | image) so the
 *   block renders the image on the right.
 */

const textOf = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');

function isMediaPromo(el) {
  return !!el && el.nodeType === 1
    && el.classList.contains('individual-promo')
    && !el.classList.contains('col-md-4');
}

function buildRow(promo, document) {
  const srcImg = promo.querySelector('.promo-image img, img');
  let imageCell = '';
  if (srcImg) {
    const img = document.createElement('img');
    img.src = srcImg.getAttribute('src');
    img.alt = srcImg.getAttribute('alt') || '';
    imageCell = img;
  }

  const content = [];
  const category = textOf(promo.querySelector('.promo-category'));
  if (category) {
    const p = document.createElement('p');
    p.textContent = category;
    content.push(p);
  }

  const title = textOf(promo.querySelector('.promo-title'));
  if (title) {
    const h = document.createElement('h2');
    h.textContent = title;
    content.push(h);
  }

  const subtitle = textOf(promo.querySelector('.promo-subtitle'));
  if (subtitle) {
    const p = document.createElement('p');
    p.textContent = subtitle;
    content.push(p);
  }

  const desc = promo.querySelector('.promo-description');
  if (desc && textOf(desc)) {
    const blockChildren = [...desc.children].filter((c) => /^(P|UL|OL|H[1-6]|BLOCKQUOTE)$/.test(c.tagName));
    if (blockChildren.length) {
      blockChildren.forEach((c) => content.push(c));
    } else {
      const p = document.createElement('p');
      p.innerHTML = desc.innerHTML;
      content.push(p);
    }
  }

  promo.querySelectorAll('.cta-buttons a').forEach((a) => {
    const label = textOf(a);
    if (!label) return;
    const p = document.createElement('p');
    const href = a.getAttribute('href');
    if (href) {
      const link = document.createElement('a');
      link.href = href;
      link.textContent = label;
      p.append(link);
    } else {
      p.textContent = label;
    }
    content.push(p);
  });

  const imageRight = !!promo.querySelector('.image-right');
  return imageRight ? [content, imageCell] : [imageCell, content];
}

export default function parse(element, { document }) {
  // Already consumed by a preceding sibling's grouping
  if (!element.parentNode) return;
  // Let the first sibling of a run own the block
  if (isMediaPromo(element.previousElementSibling)) return;

  const group = [element];
  let next = element.nextElementSibling;
  while (isMediaPromo(next)) {
    group.push(next);
    next = next.nextElementSibling;
  }

  const cells = group.map((promo) => buildRow(promo, document));
  group.slice(1).forEach((sib) => sib.remove());

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-media', cells });
  element.replaceWith(block);
}
