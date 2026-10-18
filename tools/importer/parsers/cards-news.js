/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-news.
 * Source: div.news-promo (React news feed, /our-company)
 *   .news-featured .news-feature: img + .news-release-date + .featured-title
 *     ("NEWS RELEASE" label) + p (title) + a (LEARN MORE)
 *   .news-small .news-story: .news-image img + .news-content
 *     (.news-release-date + p (title) + a (LEARN MORE))
 * The server HTML only holds a loading skeleton; the items exist in the
 * rendered (browser) DOM. Without items the element is left untouched.
 * Target table (2 columns), one row per item (featured item first):
 *   image | date paragraph + optional label paragraph + title (h3) + LEARN MORE link
 */

const textOf = (el) => (el ? el.textContent.replace(/[\s ]+/g, ' ').trim() : '');

/** Background image of the item itself or a descendant (live featured card). */
function backgroundImage(item) {
  const styled = [item, ...item.querySelectorAll('[style*="background"]')];
  for (const el of styled) {
    const style = el.getAttribute('style') || '';
    const m = style.replace(/&quot;/g, '"').match(/url\(\s*["']?([^"')]+)["']?\s*\)/i);
    if (m) return m[1].replace(/&amp;/g, '&').trim();
  }
  return '';
}

function imageOf(item, document) {
  const img = item.querySelector('img');
  let src = img ? (img.getAttribute('src') || img.getAttribute('data-src') || '') : '';
  let alt = img ? (img.getAttribute('alt') || '') : '';
  if (!src || src.startsWith('data:')) {
    // featured card: the live DOM renders the photo as a CSS background
    src = backgroundImage(item);
    const link = item.querySelector('a[aria-label]');
    alt = link ? link.getAttribute('aria-label') : '';
  }
  if (!src || src.startsWith('data:')) return '';
  const out = document.createElement('img');
  out.src = src;
  out.alt = alt;
  return out;
}

function para(text, document) {
  const p = document.createElement('p');
  p.textContent = text;
  return p;
}

function row(item, document) {
  const content = [];
  const date = textOf(item.querySelector('.news-release-date'));
  if (date) content.push(para(date, document));

  const label = textOf(item.querySelector('.featured-title, .news-label, .news-type'));
  if (label) content.push(para(label, document));

  const titleEl = item.querySelector('.news-content p, .news-title, :scope > p, p, h3, h4');
  const title = textOf(titleEl);
  if (title) {
    const h3 = document.createElement('h3');
    h3.textContent = title;
    content.push(h3);
  }

  const link = [...item.querySelectorAll('a[href]')].find((a) => textOf(a)) || item.querySelector('a[href]');
  if (link) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = link.getAttribute('href');
    a.textContent = textOf(link) || 'LEARN MORE';
    p.append(a);
    content.push(p);
  }
  return [imageOf(item, document), content];
}

export default function parse(element, { document }) {
  if (!element.parentNode) return;

  const items = [
    ...element.querySelectorAll('.news-featured .news-feature'),
    ...element.querySelectorAll('.news-small .news-story'),
  ];
  // fallback for markup without the featured/small wrappers
  if (!items.length) items.push(...element.querySelectorAll('.news-feature, .news-story'));

  const cells = items
    .map((item) => row(item, document))
    .filter(([img, content]) => img || content.some((c) => c.tagName === 'H3'));
  if (!cells.length) return; // loading skeleton only

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-news', cells });
  element.replaceWith(block);
}
