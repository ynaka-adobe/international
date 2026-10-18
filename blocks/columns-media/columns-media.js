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

/*
 * A short, all-caps paragraph right after the heading is the light-weight
 * subtitle (e.g. "SHARED HISTORY"); sentence-case copy is the description.
 */
function decorateSubtitle(cell) {
  const heading = cell.querySelector(':scope > :is(h1, h2, h3, h4, h5, h6)');
  const next = heading?.nextElementSibling;
  if (!next || next.tagName !== 'P' || next.querySelector('a, img, picture')) return;
  const text = next.textContent.trim();
  if (!text || text.length > 80 || !/[A-Z]/.test(text) || text !== text.toUpperCase()) return;
  next.classList.add(`${BLOCK}-subtitle`);
}

/* group consecutive CTA paragraphs so several links sit side by side */
function groupCtas(cell) {
  cell.querySelectorAll(':scope > .button-container').forEach((p) => {
    const prev = p.previousElementSibling;
    if (prev?.classList.contains(`${BLOCK}-ctas`)) {
      prev.append(p);
      return;
    }
    const group = document.createElement('div');
    group.className = `${BLOCK}-ctas`;
    p.replaceWith(group);
    group.append(p);
  });
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
        decorateSubtitle(cell);
        groupCtas(cell);
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
