/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-cta-band.
 * Source: div.component.container whose inner row holds a text component
 *   (div.section-title h4 or div.rich-text) beside a div.button-link
 *   (e.g. LT "... FUEL ECONOMY BY AT LEAST 5%.*" | REQUEST A QUOTE).
 * Target table (2 columns), one row:
 *   claim text (bold paragraph) | CTA link(s)
 *
 * The template selector also matches other containers that merely end with a
 * button (story bodies with a video, chart images + button). Those are not a
 * CTA band, so the parser leaves them untouched for the other parsers /
 * default content.
 */

const textOf = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
const MEDIA = 'img, picture, video, iframe, svg, canvas, .video, .main-hero, .hero-slider, .promo-list, .individual-promo';

function linkParagraph(a, document) {
  const label = textOf(a);
  if (!label) return null;
  const p = document.createElement('p');
  const href = a.getAttribute('href');
  if (href) {
    const link = document.createElement('a');
    link.href = href;
    link.textContent = label;
    p.append(link);
  } else {
    p.textContent = label;
  }
  return p;
}

/** Claim text: headings become wholly bold paragraphs, paragraphs are kept. */
function textContent(component, document) {
  const content = [];
  const root = component.querySelector(':scope > .component-content') || component;
  const blocks = [...root.querySelectorAll('h1, h2, h3, h4, h5, h6, p, ul, ol')]
    .filter((el) => !el.parentElement.closest('h1, h2, h3, h4, h5, h6, p, ul, ol'));
  if (!blocks.length && textOf(root)) {
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = textOf(root);
    p.append(strong);
    return [p];
  }
  blocks.forEach((el) => {
    if (!textOf(el)) return;
    if (/^H[1-6]$/.test(el.tagName)) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.innerHTML = el.innerHTML.trim();
      p.append(strong);
      content.push(p);
    } else {
      content.push(el);
    }
  });
  return content;
}

export default function parse(element, { document }) {
  if (!element.isConnected && !element.parentNode) return;

  const row = element.querySelector(':scope > .component-content > .row');
  if (!row) return;
  const parts = [...row.children].filter((c) => textOf(c) || c.querySelector(MEDIA));
  const buttons = parts.filter((c) => c.matches('.button-link'));
  const texts = parts.filter((c) => !c.matches('.button-link'));

  // Only a text component + button(s), no media or nested components
  const isBand = buttons.length > 0 && texts.length > 0
    && texts.every((c) => c.matches('.section-title, .rich-text, .title-block')
      && !c.querySelector(MEDIA) && !c.querySelector('.button-link'));
  if (!isBand) return;

  const textCell = texts.flatMap((c) => textContent(c, document));
  const ctaCell = buttons
    .flatMap((b) => [...b.querySelectorAll('a, button')])
    .map((a) => linkParagraph(a, document))
    .filter(Boolean);

  const cells = [[textCell, ctaCell]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-cta-band', cells });
  element.replaceWith(block);
}
