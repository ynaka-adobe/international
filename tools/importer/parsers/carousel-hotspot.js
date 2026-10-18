/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel-hotspot.
 * Source: div.swiper-hotspot
 *   .hs-stage > .hero-container > picture (stage image)
 *   ul.hs-targets > li.target-spot[data-slide][style="top: 85%; left: 58%;"] (markers)
 *   .hs-popup#<id>-popup-N > p.p-large (title) + p (text)   (one per marker)
 *   .hs-controls h2 (stage heading, e.g. INTERIOR)
 *   .detail-slides .hs-detail-slide (same texts again, used as a fallback)
 * Target table (2 columns):
 *   row 1: image | heading (h2)
 *   one row per hotspot: "top: 85%, left: 58%" | title paragraph + text paragraph(s)
 * Toggle switch, popup close icons, arrows and counters are ignored.
 */

const textOf = (el) => (el ? el.textContent.replace(/[\s ]+/g, ' ').trim() : '');

function stageImage(element, document) {
  const img = element.querySelector('.hs-stage .hero-container img, .hs-stage picture img, .hs-image picture img');
  if (!img) return '';
  const picture = img.closest('picture');
  const desktop = picture && picture.querySelector('source[media*="min-width"][srcset]');
  const desktopSrc = desktop ? desktop.getAttribute('srcset').split(',')[0].trim().split(/\s+/)[0] : '';
  const src = desktopSrc || img.getAttribute('src') || img.getAttribute('data-src');
  if (!src || src.startsWith('data:')) return '';
  const out = document.createElement('img');
  out.src = src;
  out.alt = img.getAttribute('alt') || '';
  return out;
}

/** "top: 85%; left: 58%;" -> { top: '85', left: '58' } */
function positionOf(marker) {
  const style = marker.getAttribute('style') || '';
  const top = (style.match(/top\s*:\s*(-?[\d.]+)\s*%/i) || [])[1]
    || (marker.style && marker.style.top && marker.style.top.endsWith('%') ? parseFloat(marker.style.top) : null);
  const left = (style.match(/left\s*:\s*(-?[\d.]+)\s*%/i) || [])[1]
    || (marker.style && marker.style.left && marker.style.left.endsWith('%') ? parseFloat(marker.style.left) : null);
  if (top == null || left == null) return null;
  return { top: String(top), left: String(left) };
}

/** Title + text paragraphs of a popup / detail slide (no icons or images). */
function hotspotContent(source, document) {
  const content = [];
  if (!source) return content;
  [...source.querySelectorAll('p')].forEach((p) => {
    if (p.parentElement.closest('p')) return;
    const clone = p.cloneNode(true);
    clone.querySelectorAll('img, svg, div').forEach((n) => n.remove());
    while (clone.lastChild && (clone.lastChild.nodeName === 'BR'
      || (clone.lastChild.nodeType === 3 && !clone.lastChild.textContent.trim()))) clone.lastChild.remove();
    if (!textOf(clone)) return;
    const out = document.createElement('p');
    out.innerHTML = clone.innerHTML.trim();
    content.push(out);
  });
  return content;
}

export default function parse(element, { document }) {
  if (!element.parentNode) return;

  const cells = [];

  // Stage row: image | heading
  const headerCell = [];
  const srcHeading = element.querySelector('.hs-controls h1, .hs-controls h2, .hs-controls h3, .headered-content h2');
  if (srcHeading && textOf(srcHeading)) {
    const h2 = document.createElement('h2');
    h2.textContent = textOf(srcHeading);
    headerCell.push(h2);
  }
  cells.push([stageImage(element, document), headerCell]);

  // Hotspot rows, paired with their popup by data-slide (fallback: document order)
  const popups = [...element.querySelectorAll('.hs-popup')];
  const details = [...element.querySelectorAll('.hs-detail-slide')]
    .filter((s) => !s.classList.contains('swiper-slide-duplicate'));
  const markers = [...element.querySelectorAll('.hs-targets .target-spot, li.target-spot')];

  markers.forEach((marker, idx) => {
    const pos = positionOf(marker);
    if (!pos) return;
    const n = parseInt(marker.getAttribute('data-slide'), 10) || idx + 1;
    const markerId = marker.getAttribute('id') || '';
    const popupId = markerId.replace(/-target-\d+$/, `-popup-${n}`);
    const popup = popups.find((p) => p.id && p.id === popupId) || popups[n - 1] || null;
    let content = hotspotContent(popup, document);
    if (!content.length) content = hotspotContent(details[n - 1], document);
    cells.push([`top: ${pos.top}%, left: ${pos.left}%`, content]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hotspot', cells });
  element.replaceWith(block);
}
