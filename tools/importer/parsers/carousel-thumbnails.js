/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel-thumbnails.
 * Source: div.hero-slider (international.com truck class slider)
 * Target table (2 columns), one row per slide:
 *   image | heading + tagline + CTA link
 * Skips swiper duplicate clones and the thumbnail nav (labels are derived by the block JS).
 */
export default function parse(element, { document }) {
  const cells = [];

  // Main slider only (exclude .thumb-nav), skip loop clones
  const slides = [...element.querySelectorAll('.hero-swiper-thumbnails .swiper-wrapper > .swiper-slide')]
    .filter((s) => !s.classList.contains('swiper-slide-duplicate') && !s.closest('.thumb-nav'));

  slides.forEach((slide) => {
    const img = slide.querySelector('.hero-container > picture img, picture img');
    let imageCell = '';
    if (img) {
      const pic = document.createElement('img');
      pic.src = img.getAttribute('src');
      pic.alt = img.getAttribute('alt') || '';
      imageCell = pic;
    }

    const content = [];
    const srcHeading = slide.querySelector('.hero-headline h1, .hero-headline h2, .hero-headline h3');
    if (srcHeading) {
      const tagEl = srcHeading.querySelector('.h2-light');
      const tagline = tagEl ? tagEl.textContent.replace(/\s+/g, ' ').trim() : '';
      const clone = srcHeading.cloneNode(true);
      clone.querySelectorAll('.h2-light').forEach((s) => s.remove());
      const title = clone.textContent.replace(/\s+/g, ' ').trim();
      if (title) {
        const h = document.createElement('h2');
        h.textContent = title;
        content.push(h);
      }
      if (tagline) {
        const p = document.createElement('p');
        p.textContent = tagline;
        content.push(p);
      }
    }

    slide.querySelectorAll('.caption-content p').forEach((p) => {
      if (p.textContent.trim()) content.push(p);
    });

    slide.querySelectorAll('.caption-content a').forEach((a) => {
      const label = a.textContent.replace(/\s+/g, ' ').trim();
      if (!label) return;
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
      content.push(p);
    });

    cells.push([imageCell, content]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-thumbnails', cells });
  element.replaceWith(block);
}
