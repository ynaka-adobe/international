import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * cards-overlay
 * Authoring: one row per card, two cells.
 *   cell 1: card image
 *   cell 2: optional eyebrow paragraph (e.g. HEAVY DUTY), heading (e.g. h4),
 *           link (e.g. Explore) - the link makes the whole card clickable
 * Text is laid over the bottom of the image. As on the source, the whole card is
 * one anchor (its accessible name is the eyebrow + title + link text); the authored
 * link text becomes a span so it can keep its own hover colour.
 */

const BLOCK = 'cards-overlay';

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = `${BLOCK}-card`;
    const cells = [...row.children];

    cells.forEach((cell) => {
      const img = cell.querySelector('img');
      if (img && cell.textContent.trim() === '') {
        cell.className = `${BLOCK}-card-image`;
        // only same-origin (media bus) images take EDS rendition params; external
        // CDN images (imgix) keep their authored URL and its crop/size params
        if (new URL(img.src, window.location.href).origin === window.location.origin) {
          const pic = img.closest('picture');
          (pic || img).replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ media: '(min-width: 900px)', width: '1200' }, { width: '750' }]));
        } else {
          img.loading = 'lazy';
        }
        return;
      }
      cell.className = `${BLOCK}-card-body`;
      const heading = cell.querySelector('h1, h2, h3, h4, h5, h6');
      let prev = heading?.previousElementSibling;
      while (prev) {
        if (prev.tagName === 'P' && !prev.querySelector('a')) prev.classList.add(`${BLOCK}-eyebrow`);
        prev = prev.previousElementSibling;
      }
    });

    const link = row.querySelector(`.${BLOCK}-card-body a[href]`);
    if (link) {
      // the authored link becomes the card anchor; its text stays as the visible CTA
      const anchor = document.createElement('a');
      anchor.className = `${BLOCK}-card-link`;
      anchor.href = link.href;
      if (link.target) anchor.target = link.target;
      if (link.rel) anchor.rel = link.rel;

      const cta = document.createElement('span');
      cta.className = `${BLOCK}-cta`;
      cta.textContent = link.textContent.trim();
      const wrapper = link.closest('p');
      if (wrapper && wrapper.textContent.trim() === link.textContent.trim()) {
        const p = document.createElement('p');
        p.className = `${BLOCK}-cta-wrapper`;
        p.append(cta);
        wrapper.replaceWith(p);
      } else {
        link.replaceWith(cta);
      }

      anchor.append(...cells);
      li.append(anchor);
    } else {
      li.append(...cells);
    }
    ul.append(li);
  });
  block.replaceChildren(ul);
}
