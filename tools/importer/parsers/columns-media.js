/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-media.
 * Sources:
 *   - homepage: section.background-asphalt div.individual-promo:not(.col-md-4)
 *     (award section: one-row block; #WHAT-DRIVES-US: 3 siblings -> one 3-row block)
 *   - content pages: div.individual-promo on any background, plus div.promo-links
 *     (image + h4 title + description + .promo-link-groups: optional h5 group
 *     label + several links) and div.individual-promo.video (poster linked to
 *     the YouTube video in the image cell)
 *   Adjacent matching siblings are grouped into one block (first sibling owns it).
 *   The title always becomes an h2, so in-page anchor menus (e.g.
 *   #vision-and-strategy on /our-company) resolve to the row heading id.
 * Target table (2 columns), one row per promo:
 *   image | heading + subtitle + description (paragraphs/list) + CTA link
 *   For source ".image-right" promos the cells are swapped (text | image) so the
 *   block renders the image on the right.
 */

const textOf = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');

function isMediaPromo(el) {
  return !!el && el.nodeType === 1
    && ((el.classList.contains('individual-promo') && !el.classList.contains('col-md-4'))
      || el.classList.contains('promo-links'));
}

/** div.individual-promo.video: poster image linked to the (YouTube) video. */
function videoCell(promo, document) {
  const video = promo.querySelector('.promo-image video, video');
  if (!video) return null;
  const source = video.querySelector('source[src]');
  let href = (source && source.getAttribute('src')) || video.getAttribute('src') || '';
  if (!href) {
    const iframe = promo.querySelector('iframe[src]');
    href = iframe ? iframe.getAttribute('src') : '';
  }
  if (!href) return null;
  if (href.startsWith('//')) href = `https:${href}`;
  const embed = href.match(/youtube(?:-nocookie)?\.com\/embed\/([\w-]{6,})/);
  if (embed) href = `https://www.youtube.com/watch?v=${embed[1]}`;

  const a = document.createElement('a');
  a.href = href;
  const posterImg = promo.querySelector('.video-init img');
  let poster = (video.getAttribute('poster') || '').trim();
  if (!poster && posterImg && !(posterImg.getAttribute('src') || '').startsWith('data:')) poster = posterImg.getAttribute('src');
  if (poster) {
    const img = document.createElement('img');
    img.src = poster.startsWith('//') ? `https:${poster}` : poster;
    img.alt = textOf(promo.querySelector('.promo-title'));
    a.append(img);
  } else {
    a.textContent = 'Watch the video';
  }
  return a;
}

function buildRow(promo, document) {
  const srcImg = promo.querySelector('.promo-image img, img');
  let imageCell = '';
  const video = promo.classList.contains('video') ? videoCell(promo, document) : null;
  if (video) {
    imageCell = video;
  } else if (srcImg) {
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

  // div.promo-links: optional group labels + one link per item
  promo.querySelectorAll('.promo-link-groups .promo-link-group').forEach((group) => {
    const label = textOf(group.querySelector('.promo-link-group-title'));
    if (label) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = label;
      p.append(strong);
      content.push(p);
    }
    group.querySelectorAll('a').forEach((a) => {
      const text = textOf(a);
      if (!text) return;
      const p = document.createElement('p');
      const href = a.getAttribute('href');
      if (href) {
        const link = document.createElement('a');
        link.href = href;
        link.textContent = text;
        p.append(link);
      } else {
        p.textContent = text;
      }
      content.push(p);
    });
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
