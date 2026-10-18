/*
 * columns-cta-band
 * Authoring: one row, two cells.
 *   cell 1: claim / statement text (paragraphs; bold is kept as authored)
 *   cell 2: CTA link (e.g. REQUEST A QUOTE)
 * Any cell that holds only links is treated as the CTA cell, so the
 * cells may be authored in either order. Further rows are laid out the same way.
 */

const BLOCK = 'columns-cta-band';

function isCtaCell(cell) {
  const links = cell.querySelectorAll('a');
  if (!links.length) return false;
  const linkText = [...links].map((a) => a.textContent).join('').trim();
  return cell.textContent.trim() === linkText;
}

export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add(`${BLOCK}-row`);
    [...row.children].forEach((cell) => {
      if (isCtaCell(cell)) {
        cell.classList.add(`${BLOCK}-cta`);
      } else {
        cell.classList.add(`${BLOCK}-text`);
      }
    });
  });
}
