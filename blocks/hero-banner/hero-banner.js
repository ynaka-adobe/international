import { disambiguateLinks, isInFirstSection } from '../../scripts/scripts.js';

export default function decorate(block) {
  // Layout is CSS-only (image row underlay, text row overlay).
  // Prioritise the image of a hero in the first section (LCP); lazy-load the rest.
  const img = block.querySelector('img');
  if (img) {
    if (isInFirstSection(block)) {
      img.loading = 'eager';
      img.setAttribute('fetchpriority', 'high');
    } else {
      img.loading = 'lazy';
    }
  }
  disambiguateLinks(block.parentElement, ':scope > .hero-banner');
}
