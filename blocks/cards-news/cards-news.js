import { createOptimizedPicture } from '../../scripts/aem.js';
import { disambiguateLinks } from '../../scripts/scripts.js';

/*
 * cards-news
 * Authoring: one row per news item, two cells.
 *   cell 1: image
 *   cell 2: date paragraph, optional label paragraph (e.g. NEWS RELEASE),
 *           title heading (e.g. h3), link (e.g. LEARN MORE)
 * The first row renders as a tall featured card with the text over the image;
 * the remaining rows render as a stacked list of compact items beside it
 * (tablet/desktop) or below it (mobile).
 */

const BLOCK = 'cards-news';

function decorateBody(cell) {
  cell.className = `${BLOCK}-card-body`;
  const heading = cell.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) heading.classList.add(`${BLOCK}-title`);
  // plain paragraphs before the title: first is the date, any others are labels
  const meta = [];
  let prev = heading ? heading.previousElementSibling : null;
  while (prev) {
    if (prev.tagName === 'P' && !prev.querySelector('a')) meta.unshift(prev);
    prev = prev.previousElementSibling;
  }
  meta.forEach((p, i) => p.classList.add(i === 0 ? `${BLOCK}-date` : `${BLOCK}-label`));
}

function decorateImage(cell, featured) {
  cell.className = `${BLOCK}-card-image`;
  const img = cell.querySelector('img');
  // only same-origin media can go through the optimizer; it drops the query
  // string, which on external (imgix etc.) URLs carries the crop and darkening
  const url = new URL(img.src, window.location.href);
  if (url.origin !== window.location.origin) return;
  const breakpoints = featured
    ? [{ media: '(min-width: 600px)', width: '1200' }, { width: '750' }]
    : [{ width: '400' }];
  (img.closest('picture') || img).replaceWith(
    createOptimizedPicture(img.src, img.alt, false, breakpoints),
  );
}

function buildCard(row, featured) {
  const li = document.createElement('li');
  li.className = `${BLOCK}-card`;
  while (row.firstElementChild) li.append(row.firstElementChild);

  [...li.children].forEach((cell) => {
    if (cell.querySelector('img') && cell.textContent.trim() === '') {
      decorateImage(cell, featured);
    } else {
      decorateBody(cell);
    }
  });

  const link = li.querySelector(`.${BLOCK}-card-body a[href]`);
  if (link) {
    link.classList.add(`${BLOCK}-link`);
    link.closest('p')?.classList.add(`${BLOCK}-cta`);
  }
  return li;
}

export default function decorate(block) {
  const rows = [...block.children];
  const wrapper = document.createElement('div');
  wrapper.className = `${BLOCK}-grid`;

  if (rows.length) {
    const featured = document.createElement('ul');
    featured.className = `${BLOCK}-featured`;
    const card = buildCard(rows[0], true);
    card.classList.add(`${BLOCK}-card-featured`);
    featured.append(card);
    wrapper.append(featured);
  }

  if (rows.length > 1) {
    const list = document.createElement('ul');
    list.className = `${BLOCK}-list`;
    rows.slice(1).forEach((row) => list.append(buildCard(row, false)));
    wrapper.append(list);
  }

  block.replaceChildren(wrapper);
  disambiguateLinks(block, `.${BLOCK}-card`);
}
