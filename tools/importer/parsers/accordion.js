/* eslint-disable */
/* global WebImporter */

/**
 * Parser for accordion.
 * Source: Sitecore SXA div.title-accordion
 *   .layout > h3 (optional heading; .no-title layouts have none)
 *   ul.items > li.item
 *     .toggle-header .field-heading (label, sometimes wrapped in <p>)
 *     .toggle-content .field-content (rich text body)
 * The heading is moved before the block as default content.
 * Target table (2 columns), one row per li.item:
 *   label text | body content (empty &nbsp; paragraphs dropped)
 */

const textOf = (el) => (el ? el.textContent.replace(/[\s ]+/g, ' ').trim() : '');
const BLOCK_TAGS = /^(P|UL|OL|H[1-6]|BLOCKQUOTE|TABLE|PICTURE|IMG|FIGURE)$/;
const hasMedia = (el) => el.nodeType === 1 && (el.matches('img, picture, iframe, video, table') || !!el.querySelector('img, picture, iframe, video, table'));

/** Body markup -> block-level elements; loose inline content is wrapped in <p>. */
function bodyContent(container, document) {
  const out = [];
  let para = null;
  const flush = () => {
    if (para) {
      while (para.lastChild && para.lastChild.nodeName === 'BR') para.lastChild.remove();
      if (textOf(para) || para.querySelector('img')) out.push(para);
    }
    para = null;
  };
  [...container.childNodes].forEach((node) => {
    if (node.nodeType === 3) {
      if (!node.textContent.trim() && !para) return;
      para = para || document.createElement('p');
      para.append(node);
      return;
    }
    if (node.nodeType !== 1) return;
    if (BLOCK_TAGS.test(node.tagName)) {
      flush();
      if (textOf(node) || hasMedia(node)) out.push(node);
      return;
    }
    if (node.tagName === 'DIV' || node.tagName === 'SECTION') {
      flush();
      out.push(...bodyContent(node, document));
      return;
    }
    if (node.tagName === 'BR' && !para) return;
    para = para || document.createElement('p');
    para.append(node);
  });
  flush();
  return out;
}

export default function parse(element, { document }) {
  if (!element.parentNode) return;

  const before = [];
  const layout = element.querySelector('.layout') || element;
  const heading = [...layout.children].find((c) => /^H[1-6]$/.test(c.tagName));
  if (heading && textOf(heading)) {
    const h = document.createElement(heading.tagName.toLowerCase());
    h.textContent = textOf(heading);
    before.push(h);
  }

  const cells = [];
  element.querySelectorAll('li.item').forEach((item) => {
    const header = item.querySelector('.toggle-header');
    const label = textOf(header && (header.querySelector('.field-heading') || header));
    const content = item.querySelector('.toggle-content');
    const fields = content ? [...content.querySelectorAll('.field-content')] : [];
    const body = (fields.length ? fields : (content ? [content] : []))
      .flatMap((f) => bodyContent(f, document));
    if (!label && !body.length) return;
    cells.push([label, body]);
  });

  if (!cells.length) return;
  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion', cells });
  element.replaceWith(...before, block);
}
