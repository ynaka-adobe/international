/* eslint-disable */
/* global WebImporter */

/**
 * Parser for quote-large-caps.
 * Source: div.promo.quote-promo > .quote-container
 *   h3.quote-text (quotation; sometimes wraps one or more <p>)
 *   h4.quote-author (optional attribution; may hold <i>, <p> or <br>)
 * The source headings are styling only, so both become paragraphs.
 * Target table (1 column):
 *   row 1: quotation paragraph(s)
 *   row 2 (when present): attribution paragraph (italic text is kept -> <cite>)
 */

const textOf = (el) => (el ? el.textContent.replace(/[\s ]+/g, ' ').trim() : '');

/** Inline markup of a node with <i>/<b> normalised and edge <br>s trimmed. */
function inlineHtml(el, document) {
  const clone = el.cloneNode(true);
  clone.querySelectorAll('i').forEach((i) => {
    const em = document.createElement('em');
    em.innerHTML = i.innerHTML;
    i.replaceWith(em);
  });
  clone.querySelectorAll('b').forEach((b) => {
    const strong = document.createElement('strong');
    strong.innerHTML = b.innerHTML;
    b.replaceWith(strong);
  });
  clone.querySelectorAll('span, font').forEach((s) => s.replaceWith(...s.childNodes));
  return clone.innerHTML
    .replace(/^(\s|&nbsp;|<br\s*\/?>)+/i, '')
    .replace(/(\s|&nbsp;|<br\s*\/?>)+$/i, '')
    .trim();
}

/** Heading content -> paragraphs (nested <p> kept apart, otherwise one paragraph). */
function paragraphs(el, document) {
  if (!el || !textOf(el)) return [];
  const nested = [...el.querySelectorAll('p')].filter((p) => textOf(p));
  const sources = nested.length ? nested : [el];
  return sources.map((src) => {
    const p = document.createElement('p');
    p.innerHTML = inlineHtml(src, document);
    return p;
  }).filter((p) => textOf(p));
}

export default function parse(element, { document }) {
  if (!element.parentNode) return;

  const quote = paragraphs(element.querySelector('.quote-text'), document);
  const author = paragraphs(element.querySelector('.quote-author'), document);
  if (!quote.length) return;

  const cells = [[quote]];
  if (author.length) cells.push([author]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'quote-large-caps', cells });
  element.replaceWith(block);
}
