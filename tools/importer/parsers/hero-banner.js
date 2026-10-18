/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-banner.
 * Source: div.main-hero (international.com)
 *   - homepage / "stacked" and "two-column" heroes: .hero-headline h2 (with an
 *     inline span.h2-light tagline) + .hero-caption (p, CTA links)
 *   - page-title heroes (content pages, story pages inside div.container):
 *     .hero-headline h1 + sibling span.h1-light tagline, no caption
 * Target table (1 column):
 *   row 1: background image
 *   row 2: heading + paragraph + CTA links
 *     h2 heroes: one h2 (tagline text kept inline, as on the homepage)
 *     h1 heroes: the page title stays an h1, the tagline becomes a paragraph
 *     <br> line breaks inside the heading are kept
 */

const textOf = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');

/** Heading text with source <br> line breaks kept as <br>. */
function headingHtml(heading, document) {
  const clone = heading.cloneNode(true);
  const parts = [];
  let current = '';
  const walk = (node) => {
    node.childNodes.forEach((n) => {
      if (n.nodeName === 'BR') {
        parts.push(current);
        current = '';
      } else if (n.nodeType === 3) {
        current += n.textContent;
      } else if (n.nodeType === 1) {
        walk(n);
      }
    });
  };
  walk(clone);
  parts.push(current);
  const lines = parts.map((p) => p.replace(/\s+/g, ' ').trim()).filter(Boolean);
  const holder = document.createElement('div');
  lines.forEach((line, i) => {
    if (i) holder.append(document.createElement('br'));
    holder.append(document.createTextNode(line));
  });
  return holder;
}

export default function parse(element, { document }) {
  const cells = [];

  // Row 1: background image
  const img = element.querySelector('.hero-container > picture img, picture img');
  if (img) {
    // Prefer the desktop (min-width) source over the mobile 5:7 crop in img src
    const desktop = img.closest('picture')?.querySelector('source[media*="min-width"][srcset]');
    const desktopSrc = desktop?.getAttribute('srcset').split(',')[0].trim().split(/\s+/)[0];
    const pic = document.createElement('img');
    pic.src = desktopSrc || img.getAttribute('src');
    pic.alt = img.getAttribute('alt') || '';
    cells.push([pic]);
  } else {
    cells.push(['']);
  }

  // Row 2: heading, body, CTAs
  const content = [];
  const srcHeading = element.querySelector('.hero-headline h1, .hero-headline h2, .hero-headline h3');
  if (srcHeading) {
    const text = textOf(srcHeading);
    if (text) {
      // a page-title hero keeps its h1; all other heroes author an h2
      const h = document.createElement(srcHeading.tagName === 'H1' ? 'h1' : 'h2');
      h.append(...headingHtml(srcHeading, document).childNodes);
      content.push(h);
    }
    // h1 heroes: the light tagline is a sibling of the h1, not inside it
    if (srcHeading.tagName === 'H1') {
      const headline = srcHeading.closest('.hero-headline');
      const tagline = headline && [...headline.querySelectorAll('.h1-light')]
        .find((t) => !srcHeading.contains(t));
      if (tagline && textOf(tagline)) {
        const p = document.createElement('p');
        p.append(...headingHtml(tagline, document).childNodes);
        content.push(p);
      }
    }
  }

  // caption copy in document order (paragraphs and any sub headings), CTAs last
  element.querySelectorAll('.hero-caption p, .hero-caption h1, .hero-caption h2, .hero-caption h3, .hero-caption h4, .hero-caption h5, .hero-caption h6').forEach((el) => {
    if (el.closest('.link-container')) return;
    if (el.tagName !== 'P') {
      if (!textOf(el)) return;
      const h = document.createElement(el.tagName === 'H1' || el.tagName === 'H2' ? 'h3' : el.tagName.toLowerCase());
      h.textContent = textOf(el);
      content.push(h);
      return;
    }
    if (el.textContent.trim()) content.push(el);
  });

  element.querySelectorAll('.hero-caption .link-container a').forEach((a) => {
    const label = a.textContent.replace(/\s+/g, ' ').trim();
    if (!label) return;
    const p = document.createElement('p');
    // source CTAs that open the newsletter modal map to the EDS modal fragment
    const opensSubscribeModal = a.getAttribute('target') === 'subscribe-modal'
      || a.getAttribute('data-bs-target') === '#subscribe-modal'
      || a.classList.contains('subscribe-modal');
    const href = opensSubscribeModal ? '/modals/newsletter' : a.getAttribute('href');
    if (href) {
      const link = document.createElement('a');
      link.href = href;
      link.textContent = label;
      p.append(link);
    } else {
      p.textContent = label;
    }
    content.push(p);
  });

  cells.push([content]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-banner', cells });
  element.replaceWith(block);
}
