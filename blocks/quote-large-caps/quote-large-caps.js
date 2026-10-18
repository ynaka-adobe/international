/*
 * Quote Large Caps Block
 * Centered, large uppercase pull quote with a decorative opening quote mark
 * and an optional attribution line.
 *
 * Authoring: row 1 = quotation, row 2 (optional) = attribution.
 * Italic text in the attribution becomes <cite>.
 */
export default function decorate(block) {
  const [quotationRow, attributionRow] = [...block.children];
  if (!quotationRow) return;

  const figure = document.createElement('figure');
  figure.className = 'quote-large-caps-figure';

  const blockquote = document.createElement('blockquote');
  blockquote.className = 'quote-large-caps-quotation';
  const quotationCell = quotationRow.firstElementChild || quotationRow;
  if (quotationCell.children.length) {
    blockquote.append(...quotationCell.childNodes);
  } else {
    const p = document.createElement('p');
    p.textContent = quotationCell.textContent.trim();
    blockquote.append(p);
  }
  figure.append(blockquote);

  const attributionCell = attributionRow?.firstElementChild || attributionRow;
  if (attributionCell && attributionCell.textContent.trim()) {
    const figcaption = document.createElement('figcaption');
    figcaption.className = 'quote-large-caps-attribution';
    attributionCell.querySelectorAll('em').forEach((em) => {
      const cite = document.createElement('cite');
      cite.innerHTML = em.innerHTML;
      em.replaceWith(cite);
    });
    // unwrap a single paragraph so figcaption holds phrasing content
    const only = attributionCell.children.length === 1 ? attributionCell.firstElementChild : null;
    if (only && only.tagName === 'P') {
      figcaption.append(...only.childNodes);
    } else {
      figcaption.append(...attributionCell.childNodes);
    }
    figure.append(figcaption);
  }

  block.replaceChildren(figure);
}
