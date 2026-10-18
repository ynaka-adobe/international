import { createOptimizedPicture } from '../../scripts/aem.js';
import { disambiguateLinks } from '../../scripts/scripts.js';

/*
 * cards-overlay
 * Authoring: one row per card, two cells.
 *   cell 1: card image
 *   cell 2: optional eyebrow paragraph (e.g. HEAVY DUTY), heading (e.g. h4),
 *           link (e.g. Explore) - the link makes the whole card clickable
 * Text is laid over the bottom of the image.
 */

const BLOCK = 'cards-overlay';

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = `${BLOCK}-card`;
    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((cell) => {
      const img = cell.querySelector('img');
      if (img && cell.textContent.trim() === '') {
        cell.className = `${BLOCK}-card-image`;
        const pic = img.closest('picture');
        (pic || img).replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ media: '(min-width: 900px)', width: '1200' }, { width: '750' }]));
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

    // the first link stretches over the whole card (see CSS ::after)
    const link = li.querySelector(`.${BLOCK}-card-body a[href]`);
    if (link) {
      link.classList.add(`${BLOCK}-link`);
      li.classList.add(`${BLOCK}-linked`);
    }
    ul.append(li);
  });
  block.replaceChildren(ul);
  disambiguateLinks(block, `.${BLOCK}-card`);
}
