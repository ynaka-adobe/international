/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-headline.
 * Source: div.page-preview (Sitecore page preview: headline left, copy right)
 *   - .preview-titles > div.h3-medium (the cleanup transformer may already have
 *     turned it into an h2), optional div.h3-light tagline
 *   - or div.preview-title.h3
 *   - .preview-content-container > .preview-content (p, ul, div.p-small footnote,
 *     loose inline text) + a.btn.btn-primary / a.btn.btn-secondary
 *   - .page-preview-split: titles column also holds a list, content column has
 *     a category eyebrow and an h3-light sub heading
 * Target table (2 columns), one row:
 *   headline (h2) | body paragraphs/lists + footnote + CTA links
 *   (primary button = bold link, secondary button = italic link)
 * A preview without a headline is not a two-column layout; it becomes default
 * content (body + links) instead of a block.
 */

const textOf = (el) => (el ? el.textContent.replace(/[\s ]+/g, ' ').trim() : '');
const BLOCK_TAGS = /^(P|UL|OL|H[1-6]|BLOCKQUOTE|TABLE)$/;

/** Turn mixed rich-text markup into a flat list of block elements. */
function richText(container, document) {
  const out = [];
  let para = null;
  const flush = () => {
    if (para) {
      while (para.lastChild && para.lastChild.nodeName === 'BR') para.lastChild.remove();
      while (para.firstChild && para.firstChild.nodeName === 'BR') para.firstChild.remove();
      if (textOf(para) || para.querySelector('img')) out.push(para);
    }
    para = null;
  };
  [...container.childNodes].forEach((node) => {
    if (node.nodeType === 3) {
      if (!node.textContent.trim()) {
        if (para) para.append(node);
        return;
      }
      para = para || document.createElement('p');
      para.append(node);
      return;
    }
    if (node.nodeType !== 1) return;
    if (BLOCK_TAGS.test(node.tagName)) {
      flush();
      if (textOf(node) || node.querySelector('img')) {
        if (node.tagName === 'P') {
          while (node.lastChild && node.lastChild.nodeName === 'BR') node.lastChild.remove();
        }
        out.push(node);
      }
      return;
    }
    if (node.tagName === 'LI') {
      flush();
      const last = out[out.length - 1];
      if (last && last.tagName === 'UL' && last.dataset.loose) {
        last.append(node);
      } else {
        const ul = document.createElement('ul');
        ul.dataset.loose = '1';
        ul.append(node);
        out.push(ul);
      }
      return;
    }
    if (node.tagName === 'DIV' || node.tagName === 'SMALL' || node.tagName === 'SECTION') {
      flush();
      if ([...node.children].some((c) => BLOCK_TAGS.test(c.tagName) || c.tagName === 'DIV')) {
        out.push(...richText(node, document));
      } else if (textOf(node)) {
        const p = document.createElement('p');
        p.innerHTML = node.innerHTML.trim();
        while (p.lastChild && p.lastChild.nodeName === 'BR') p.lastChild.remove();
        out.push(p);
      }
      return;
    }
    if (node.tagName === 'BR' && !para) return;
    para = para || document.createElement('p');
    para.append(node);
  });
  flush();
  out.forEach((el) => { if (el.dataset) delete el.dataset.loose; });
  return out;
}

function buttonParagraph(a, document) {
  const label = textOf(a);
  if (!label) return null;
  const href = a.getAttribute('href');
  const p = document.createElement('p');
  let target = p;
  if (a.classList.contains('btn-secondary')) {
    target = document.createElement('em');
    p.append(target);
  } else if (a.classList.contains('btn-primary') || a.classList.contains('btn')) {
    target = document.createElement('strong');
    p.append(target);
  }
  if (href) {
    const link = document.createElement('a');
    link.href = href;
    link.textContent = label;
    target.append(link);
  } else {
    target.textContent = label;
  }
  return p;
}

/** Headline markup without nested headings / wrappers. */
function headlineHtml(el) {
  const clone = el.cloneNode(true);
  clone.querySelectorAll('h1, h2, h3, h4, h5, h6, span, div').forEach((n) => n.replaceWith(...n.childNodes));
  return clone.innerHTML.replace(/^(\s|<br>)+|(\s|<br>)+$/g, '').trim();
}

export default function parse(element, { document }) {
  if (!element.parentNode) return;

  const root = element.querySelector(':scope > .component-content') || element;
  const titles = root.querySelector('.preview-titles');
  const container = root.querySelector('.preview-content-container');

  // Headline: h3-medium (or the h2 the cleanup transformer made of it) or .preview-title
  const titleEl = (titles && titles.querySelector(':scope > .h3-medium, :scope > h2, :scope > h1, :scope > h3'))
    || root.querySelector('.preview-title');
  const tagline = titles ? titles.querySelector(':scope > .h3-light') : null;

  const headingCell = [];
  if (titleEl && textOf(titleEl)) {
    const h2 = document.createElement('h2');
    h2.innerHTML = headlineHtml(titleEl);
    if (tagline && textOf(tagline)) {
      h2.append(document.createElement('br'));
      h2.insertAdjacentHTML('beforeend', headlineHtml(tagline));
    }
    headingCell.push(h2);
  }
  // split layout: extra content under the headline (e.g. a list)
  if (titles) {
    titles.querySelectorAll(':scope > .preview-content').forEach((c) => headingCell.push(...richText(c, document)));
  }

  const bodyCell = [];
  if (container) {
    [...container.children].forEach((child) => {
      if (child.matches('a.btn, a.btn-primary, a.btn-secondary')) {
        const p = buttonParagraph(child, document);
        if (p) bodyCell.push(p);
      } else if (child.matches('.preview-category')) {
        if (textOf(child)) {
          const p = document.createElement('p');
          p.textContent = textOf(child);
          bodyCell.push(p);
        }
      } else if (child.matches('.h3-light, .h3-medium, h2, h3')) {
        if (textOf(child)) {
          const h3 = document.createElement('h3');
          h3.innerHTML = headlineHtml(child);
          bodyCell.push(h3);
        }
      } else if (child.matches('.preview-content')) {
        bodyCell.push(...richText(child, document));
      } else if (textOf(child)) {
        bodyCell.push(...richText(child, document));
      }
    });
  }

  if (!headingCell.length) {
    // no headline: keep the copy as default content
    if (!bodyCell.length) {
      element.remove();
      return;
    }
    const frag = document.createElement('div');
    frag.append(...bodyCell);
    element.replaceWith(...frag.childNodes);
    return;
  }

  const cells = [[headingCell, bodyCell]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-headline', cells });
  element.replaceWith(block);
}
