/* eslint-disable */
/* global WebImporter */

/**
 * Cleanup transformer for www.international.com
 * Removes non-authorable chrome (header, footer, cookie banner, tracking pixels,
 * React popup forms) and converts styled preview titles into real headings.
 */
export default function transform(hookName, element, payload) {
  if (hookName === 'beforeTransform') {
    // "Start a Quote" React popup form (and any other React modal widgets) inside content
    WebImporter.DOMUtils.remove(element, [
      '#PARTS-AND-SERVICE [id^="react_"]',
      '#start-quote',
      '.modal-form-wrapper',
    ]);

    // Cookie consent banner
    WebImporter.DOMUtils.remove(element, ['.privacy-warning']);

    // Tracking pixels / beacons (Clarity, Bing UET, Trade Desk, Qualtrics)
    WebImporter.DOMUtils.remove(element, [
      '[id^="ZN_"]',
      '[id^="batBeacon"]',
      '[id^="universal_pixel"]',
      'iframe[src*="adsrvr.org"]',
      'iframe[src*="clarity.ms"]',
      'img[src*="clarity.ms"]',
      'img[src*="bat.bing.com"]',
      'img[src*="facebook.com/tr"]',
      'script[src*="clarity"]',
    ]);

    // Styled preview titles -> h2 so they become default-content headings
    element.querySelectorAll('div.page-preview .preview-titles > div.h3-medium').forEach((div) => {
      const h2 = element.ownerDocument.createElement('h2');
      h2.innerHTML = div.innerHTML;
      div.replaceWith(h2);
    });

    // Slider screen-reader notifications
    WebImporter.DOMUtils.remove(element, ['.swiper-notification']);

    // In-page anchor markers ("Waypoint PARTS-AND-SERVICE")
    WebImporter.DOMUtils.remove(element, ['.waypoint-id-box']);
  }

  if (hookName === 'afterTransform') {
    // Global header and footer chrome
    WebImporter.DOMUtils.remove(element, [
      '#wrapper > header',
      '#header',
      '#wrapper > footer',
      '#footer',
      'header',
      'footer',
      'nav',
      '.breadcrumb',
      'a.skip-link',
      '.modal',
      '.privacy-warning',
    ]);

    // Non-authorable elements
    WebImporter.DOMUtils.remove(element, [
      'script',
      'style',
      'noscript',
      'link',
      'iframe',
    ]);

    // Strip tracking / framework attributes
    element.querySelectorAll('*').forEach((el) => {
      [...el.attributes].forEach((attr) => {
        const n = attr.name;
        // keep data-excat-* markers used by the sections transformer
        if (n.startsWith('data-excat')) return;
        if (n.startsWith('data-') || n.startsWith('on') || n === 'tabindex') {
          el.removeAttribute(n);
        }
      });
    });
  }
}
