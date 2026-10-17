/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-banner.
 * Source: div.main-hero (international.com)
 * Target table (1 column):
 *   row 1: background image
 *   row 2: heading + paragraph + CTA links
 */
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
    const text = srcHeading.textContent.replace(/\s+/g, ' ').trim();
    if (text) {
      const h = document.createElement('h2');
      h.textContent = text;
      content.push(h);
    }
  }

  element.querySelectorAll('.hero-caption p').forEach((p) => {
    if (p.textContent.trim()) content.push(p);
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
