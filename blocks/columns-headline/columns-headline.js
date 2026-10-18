import { disambiguateLinks } from '../../scripts/scripts.js';

/*
 * columns-headline
 * Authoring: one row, two cells.
 *   cell 1: headline (h2)
 *   cell 2: body paragraphs, optional footnote, CTA links
 *           (bold link = primary button, italic link = secondary button)
 * A paragraph starting with "*" is styled as a footnote.
 */

const BLOCK = 'columns-headline';

function isHeadingCell(cell) {
  const heading = cell.querySelector('h1, h2, h3, h4, h5, h6');
  return !!heading && cell.textContent.trim() === heading.textContent.trim();
}

export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add(`${BLOCK}-row`);
    [...row.children].forEach((cell) => {
      if (isHeadingCell(cell)) {
        cell.classList.add(`${BLOCK}-heading`);
        return;
      }
      cell.classList.add(`${BLOCK}-body`);
      cell.querySelectorAll(':scope > p').forEach((p) => {
        if (p.textContent.trim().startsWith('*')) p.classList.add(`${BLOCK}-footnote`);
      });
      const buttons = cell.querySelectorAll(':scope > .button-container');
      if (buttons.length > 1) {
        const group = document.createElement('div');
        group.className = `${BLOCK}-actions`;
        buttons[0].before(group);
        group.append(...buttons);
      }
    });
  });
  // repeated generic CTAs get the row headline appended for screen readers
  disambiguateLinks(block, `.${BLOCK}-row`);
}
