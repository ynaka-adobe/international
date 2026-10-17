import { createOptimizedPicture } from '../../scripts/aem.js';
import { disambiguateLinks } from '../../scripts/scripts.js';

/*
 * columns-media
 * Authoring: one row per image/text pair, two cells.
 *   image cell + text cell (heading, paragraphs/list, CTA link)
 * Put the image in the second cell to place it on the right; the
 * authored order is preserved on desktop and the image stacks first on mobile.
 */

const BLOCK = 'columns-media';

function isImageCell(cell) {
  const pic = cell.querySelector('picture, img');
  if (!pic) return false;
  return cell.textContent.trim() === '';
}

export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add(`${BLOCK}-row`);
    const cells = [...row.children];
    let imageIndex = -1;

    cells.forEach((cell, idx) => {
      if (imageIndex === -1 && isImageCell(cell)) {
        imageIndex = idx;
        cell.classList.add(`${BLOCK}-image`);
        cell.querySelectorAll('img').forEach((img) => {
          const pic = img.closest('picture');
          const optimized = createOptimizedPicture(img.src, img.alt, false, [{ media: '(min-width: 900px)', width: '1200' }, { width: '750' }]);
          (pic || img).replaceWith(optimized);
        });
      } else {
        cell.classList.add(`${BLOCK}-text`);
      }
    });

    if (imageIndex === -1) {
      row.classList.add(`${BLOCK}-text-only`);
    } else if (imageIndex > 0) {
      row.classList.add(`${BLOCK}-image-right`);
    } else {
      row.classList.add(`${BLOCK}-image-left`);
    }
  });
  disambiguateLinks(block, `.${BLOCK}-row`);
}
