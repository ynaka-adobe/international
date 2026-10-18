/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel-hero.
 * Source: div.hero-slider with .hero-swiper-arrows (fading slides, prev/next arrows)
 *   slide: .hero-container > .middle|.top > .hero-headline h2 (+ span.h2-light tagline)
 *          + .hero-caption .caption-content (p + a.btn), picture (mobile + desktop sources)
 *   Story pages use the same slider as an image gallery (empty headline/caption).
 * Target table (2 columns), one row per slide:
 *   image | heading (h2) + optional tagline paragraph + body paragraph(s) + CTA link
 * Slider chrome (arrows, counters, autoplay inputs, loop clones) is ignored.
 */

const textOf = (el) => (el ? el.textContent.replace(/[\s ]+/g, ' ').trim() : '');

/** Desktop (min-width) source when present, else the img src (absolute URL kept). */
function slideImage(scope, document) {
  const img = scope.querySelector('.hero-container > picture img, picture img, img');
  if (!img) return '';
  const picture = img.closest('picture');
  const desktop = picture && picture.querySelector('source[media*="min-width"][srcset]');
  const desktopSrc = desktop ? desktop.getAttribute('srcset').split(',')[0].trim().split(/\s+/)[0] : '';
  const src = desktopSrc || img.getAttribute('src') || img.getAttribute('data-src');
  if (!src) return '';
  const out = document.createElement('img');
  out.src = src;
  out.alt = img.getAttribute('alt') || '';
  return out;
}

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

export default function parse(element, { document }) {
  if (!element.parentNode) return;

  const slides = [...element.querySelectorAll('.swiper-wrapper > .swiper-slide')]
    .filter((s) => !s.classList.contains('swiper-slide-duplicate'));

  const cells = [];
  slides.forEach((slide) => {
    const imageCell = slideImage(slide, document);
    const content = [];

    const srcHeading = slide.querySelector('.hero-headline h1, .hero-headline h2, .hero-headline h3');
    if (srcHeading) {
      const tagEl = srcHeading.querySelector('.h2-light');
      const tagline = textOf(tagEl);
      const clone = srcHeading.cloneNode(true);
      clone.querySelectorAll('.h2-light').forEach((s) => s.remove());
      const title = textOf(clone);
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
      if (!textOf(p)) return;
      const para = document.createElement('p');
      para.innerHTML = p.innerHTML.trim();
      content.push(para);
    });

    slide.querySelectorAll('.caption-content a.btn, .caption-content > a').forEach((a) => {
      const p = linkParagraph(a, document);
      if (p) content.push(p);
    });

    if (!imageCell && !content.length) return;
    cells.push([imageCell, content]);
  });

  if (!cells.length) return;
  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
