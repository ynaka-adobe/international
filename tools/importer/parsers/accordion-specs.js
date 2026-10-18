/* eslint-disable */
/* global WebImporter */

/**
 * Parser for accordion-specs.
 * Source: runs of sibling div.spec-list components (one per panel):
 *   .specification-title h3|h4 (panel title)
 *   ul > li > .spec-content > .spec-heading (label)
 *                           + .spec-data > .sub-spec (values: p, or text with <br>)
 *                                        | .sub-spec-heading + .sub-spec-body pairs
 * The template selector matches every spec-list of a run. The FIRST one builds
 * the whole block (one row per spec-list) and removes the following siblings;
 * later calls for the removed / already consumed elements return untouched.
 * Target table (2 columns), one row per panel:
 *   title | per spec: bold label paragraph, then value paragraphs;
 *           sub-spec headings become wholly italic sub-label paragraphs
 */

const textOf = (el) => (el ? el.textContent.replace(/[\s ]+/g, ' ').trim() : '');
const consumed = new WeakSet();
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'LINK', 'TEMPLATE']);

const isSpecList = (el) => !!el && el.nodeType === 1 && el.matches('div.spec-list');

function nextComponent(el) {
  let next = el.nextElementSibling;
  while (next && SKIP_TAGS.has(next.tagName)) next = next.nextElementSibling;
  return next;
}

function prevComponent(el) {
  let prev = el.previousElementSibling;
  while (prev && SKIP_TAGS.has(prev.tagName)) prev = prev.previousElementSibling;
  return prev;
}

/** Trim leading/trailing <br> and whitespace nodes. */
function trimBreaks(el) {
  const isJunk = (n) => n && (n.nodeName === 'BR' || (n.nodeType === 3 && !n.textContent.replace(/[\s ]+/g, '')));
  while (isJunk(el.lastChild)) el.lastChild.remove();
  while (isJunk(el.firstChild)) el.firstChild.remove();
  return el;
}

/** Value container -> paragraphs/lists (inline content with <br> stays one paragraph). */
function values(container, document) {
  const out = [];
  let para = null;
  const flush = () => {
    if (para && textOf(trimBreaks(para))) out.push(para);
    para = null;
  };
  [...container.childNodes].forEach((node) => {
    if (node.nodeType === 1 && /^(P|UL|OL)$/.test(node.tagName)) {
      flush();
      const clone = node.cloneNode(true);
      if (clone.tagName === 'P') trimBreaks(clone);
      if (textOf(clone)) out.push(clone);
      return;
    }
    if (node.nodeType === 1 && node.tagName === 'DIV') {
      flush();
      out.push(...values(node, document));
      return;
    }
    if (node.nodeType !== 1 && node.nodeType !== 3) return;
    para = para || document.createElement('p');
    para.append(node.cloneNode(true));
  });
  flush();
  return out;
}

function wrapped(text, tag, document) {
  const p = document.createElement('p');
  const inner = document.createElement(tag);
  inner.textContent = text;
  p.append(inner);
  return p;
}

function panelRow(specList, document) {
  const title = textOf(specList.querySelector('.specification-title'));
  const body = [];
  specList.querySelectorAll('.spec-content').forEach((spec) => {
    const label = textOf(spec.querySelector('.spec-heading'));
    if (label) body.push(wrapped(label, 'strong', document));
    const data = spec.querySelector('.spec-data');
    if (!data) return;
    [...data.children].forEach((child) => {
      if (child.matches('.sub-spec-heading')) {
        const sub = textOf(child);
        if (sub) body.push(wrapped(sub, 'em', document));
      } else {
        body.push(...values(child, document));
      }
    });
  });
  return [title, body];
}

export default function parse(element, { document }) {
  if (!element.isConnected || !element.parentNode || consumed.has(element)) return;
  // A spec-list after another one belongs to the run owned by the first
  if (isSpecList(prevComponent(element))) return;

  const run = [element];
  let next = nextComponent(element);
  while (isSpecList(next)) {
    run.push(next);
    next = nextComponent(next);
  }
  run.forEach((el) => consumed.add(el));

  const cells = run.map((el) => panelRow(el, document)).filter(([t, b]) => t || b.length);
  run.slice(1).forEach((el) => el.remove());
  if (!cells.length) {
    element.remove();
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-specs', cells });
  element.replaceWith(block);
}
