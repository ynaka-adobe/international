/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-promo.
 * Sources:
 *   - div.promo-list: one block containing several div.promo-list-card items
 *   - div.individual-promo.col-md-4: each element is ONE card; adjacent matching
 *     siblings are grouped into a single cards-promo block (processed on the first
 *     sibling, following siblings are collected and removed).
 * Target table (2 columns), one row per card:
 *   image | title (h3) + description + CTA link
 */

const textOf = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');

function isIndividualCard(el) {
  return !!el && el.nodeType === 1
    && el.classList.contains('individual-promo')
    && el.classList.contains('col-md-4');
}

function buildCard(card, document) {
  // Image cell
  const srcImg = card.querySelector('.promo-image img, :scope > img, img');
  let imageCell = '';
  if (srcImg) {
    const img = document.createElement('img');
    img.src = srcImg.getAttribute('src');
    img.alt = srcImg.getAttribute('alt') || '';
    imageCell = img;
  }

  // Text cell
  const content = [];
  const titleText = textOf(card.querySelector('.promo-title'));
  if (titleText) {
    const h = document.createElement('h3');
    h.textContent = titleText;
    content.push(h);
  }

  const subtitle = textOf(card.querySelector('.promo-subtitle'));
  if (subtitle) {
    const p = document.createElement('p');
    p.textContent = subtitle;
    content.push(p);
  }

  const desc = card.querySelector('.promo-description');
  if (desc && textOf(desc)) {
    const p = document.createElement('p');
    p.innerHTML = desc.innerHTML;
    // drop trailing <br> left by the CMS
    p.querySelectorAll('br').forEach((br) => { if (!br.nextSibling) br.remove(); });
    content.push(p);
  }

  const links = [...card.querySelectorAll('.cta-buttons a, a.promo-link')];
  links.forEach((a) => {
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

  return [imageCell, content];
}

export default function parse(element, { document }) {
  // Already consumed by a preceding sibling's grouping
  if (!element.parentNode) return;

  const cells = [];

  if (isIndividualCard(element)) {
    // Let the first sibling of the run own the block
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
    // div.promo-list: each .promo-list-card is a card
    const cards = [...element.querySelectorAll('.promo-list-card')];
    cards.forEach((card) => cells.push(buildCard(card, document)));
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-promo', cells });
  element.replaceWith(block);
}
