/* eslint-disable */
/* global WebImporter */

/**
 * Cleanup transformer for www.international.com
 * Removes non-authorable chrome (header, footer, cookie banner, tracking pixels,
 * React popup forms, modals) and normalizes Sitecore SXA widgets into
 * authorable default content (anchor menu, downloads list, link lists,
 * standalone headings, modal-opening CTAs).
 */

const NEWSLETTER_HREF = '/modals/newsletter';
// No standalone quote page exists on the source site; the contact page is the closest real target.
const QUOTE_HREF = '/our-company/contact';

/** Same rule EDS uses for heading ids: lowercase, non-alphanumerics -> '-', trim dashes. */
function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^0-9a-z]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Modal id an element opens (Bootstrap data-bs-target / data-target or SXA target="<modal-id>"). */
function modalTargetOf(el) {
  const raw = el.getAttribute('data-bs-target')
    || el.getAttribute('data-target')
    || el.getAttribute('target')
    || '';
  if (!raw || raw.startsWith('_')) return '';
  return raw.replace(/^#/, '');
}

/** True when an href does not point anywhere meaningful (modal triggers use "/", "#" or the site root). */
function hasNoRealHref(el) {
  const href = (el.getAttribute('href') || '').trim();
  return !href || href === '#' || href === '/'
    || /^https?:\/\/(www\.)?international\.com\/?$/i.test(href);
}

const textOf = (el) => (el.textContent || '').replace(/\s+/g, ' ').trim();

/** Turn a modal trigger (a/button) into a plain link, keeping its text. */
function toLink(el, href) {
  const doc = el.ownerDocument;
  if (el.tagName === 'A') {
    el.setAttribute('href', href);
    ['target', 'data-bs-target', 'data-bs-toggle', 'data-target', 'data-toggle', 'role']
      .forEach((a) => el.removeAttribute(a));
    return;
  }
  const a = doc.createElement('a');
  a.setAttribute('href', href);
  a.textContent = textOf(el);
  el.replaceWith(a);
}

const isEmptyNode = (el) => !textOf(el).replace(/ /g, '')
  && !el.querySelector('img, picture, video, iframe, svg, canvas, input, select, textarea');

export default function transform(hookName, element, payload) {
  if (hookName === 'beforeTransform') {
    const document = element.ownerDocument;

    // Scripts first: inline React hydration scripts sit between components
    WebImporter.DOMUtils.remove(element, ['script']);

    // Modal triggers -> plain links (before modals are removed).
    // Skipped for the already-migrated homepage templates (home / landing-page), whose
    // parsers handle these links themselves; keeps its output unchanged.
    const templateName = payload && payload.template && payload.template.name;
    if (!['home', 'landing-page'].includes(templateName)) element.querySelectorAll('a, button').forEach((el) => {
      const target = modalTargetOf(el);
      const text = textOf(el);
      if (target === 'subscribe-modal' || el.classList.contains('subscribe-modal')
        || (/^subscribe( to international)?$/i.test(text) && hasNoRealHref(el))) {
        toLink(el, NEWSLETTER_HREF);
      } else if (/quote/i.test(target) || /^raq$/i.test(target)
        || (/^(request|start) a quote$/i.test(text) && hasNoRealHref(el))) {
        toLink(el, QUOTE_HREF);
      }
    });

    // "Start a Quote" React popup form (and any other React modal widgets) inside content
    WebImporter.DOMUtils.remove(element, [
      '#PARTS-AND-SERVICE [id^="react_"]',
      '#start-quote',
      '.modal-form-wrapper',
    ]);

    // Modals, popup forms and the Qualtrics survey dialog
    WebImporter.DOMUtils.remove(element, [
      '#subscribe-modal',
      '.modal',
      '[aria-modal="true"]',
      '.sitecore-form',
      '[id^="QSI"]',
      '[class^="QSI"]',
      '[class*=" QSI"]',
      '[id*="qualtrics" i]',
      '[class*="qualtrics" i]',
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
      const h2 = document.createElement('h2');
      h2.innerHTML = div.innerHTML;
      div.replaceWith(h2);
    });

    // In-page anchor menu -> plain list of links with EDS-style heading-id anchors.
    // Kept inside div.in-page-navigation (outside the <nav>, which afterTransform removes)
    // so the content-sections transformer can still find it.
    element.querySelectorAll('div.in-page-navigation').forEach((ipn) => {
      const links = [...ipn.querySelectorAll('a[href]')].filter((a) => textOf(a));
      if (!links.length) {
        ipn.remove();
        return;
      }
      const ul = document.createElement('ul');
      links.forEach((link) => {
        let href = link.getAttribute('href');
        if (href.startsWith('#')) {
          let frag = href.slice(1);
          try { frag = decodeURIComponent(frag); } catch (e) { /* keep raw */ }
          href = `#${slugify(frag)}`;
        }
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.setAttribute('href', href);
        a.textContent = textOf(link);
        li.append(a);
        ul.append(li);
      });
      ipn.replaceChildren(ul);
    });

    // Standalone SXA content components (accordion label/content wrappers inside
    // .title-accordion are left for the accordion parser)
    element.querySelectorAll('div.component.content').forEach((comp) => {
      if (comp.closest('.title-accordion')) return;
      if (isEmptyNode(comp)) {
        comp.remove();
        return;
      }
      const heading = comp.querySelector(':scope > .component-content > .field-heading');
      if (heading && textOf(heading)) {
        const h3 = document.createElement('h3');
        h3.innerHTML = heading.innerHTML;
        heading.replaceWith(h3);
      } else if (heading) {
        heading.remove();
      }
    });

    // Link lists: drop inline svg icons from the links
    WebImporter.DOMUtils.remove(element, ['div.link-list a svg']);

    // Downloads list: one link per item (human-readable title -> file)
    element.querySelectorAll('div.file-list li').forEach((li) => {
      const candidates = [
        ...li.querySelectorAll('.field-linktext a[href]'),
        ...li.querySelectorAll('a[href]'),
      ];
      const titleLink = candidates.find((a) => !a.closest('.field-filetypeicon')
        && textOf(a) && !/^download$/i.test(textOf(a)));
      if (!titleLink) {
        li.remove();
        return;
      }
      const a = document.createElement('a');
      a.setAttribute('href', titleLink.getAttribute('href'));
      // the live DOM nests the "Download" label inside the title link
      a.textContent = textOf(titleLink).replace(/\s*download$/i, '');
      li.replaceChildren(a);
    });

    // Story subsection titles (blog-promo header) -> h2
    element.querySelectorAll('div.blog-promo .promo-header').forEach((div) => {
      if (!textOf(div)) return;
      const h2 = document.createElement('h2');
      h2.textContent = textOf(div);
      div.replaceWith(h2);
    });

    // Rich text: decorative inline svgs and empty (&nbsp;) paragraphs
    WebImporter.DOMUtils.remove(element, ['.rich-text svg']);
    element.querySelectorAll('.rich-text p').forEach((p) => {
      if (isEmptyNode(p)) p.remove();
    });

    // Slider screen-reader notifications
    WebImporter.DOMUtils.remove(element, ['.swiper-notification']);

    // In-page anchor markers ("Waypoint PARTS-AND-SERVICE")
    WebImporter.DOMUtils.remove(element, ['.waypoint-id-box']);

    // Slider chrome (arrows, pagination, counters) only outside elements a block
    // parser will handle; parsers may rely on it and ignore it themselves.
    const blockSelectors = ((payload && payload.template && payload.template.blocks) || [])
      .flatMap((b) => b.instances || []);
    if (blockSelectors.length) {
      element.querySelectorAll('.nav-buttons, .swiper-pagination, .slide-count').forEach((el) => {
        const inBlock = blockSelectors.some((sel) => {
          try { return !!el.closest(sel); } catch (e) { return true; }
        });
        if (!inBlock) el.remove();
      });
    }
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
        // keep data-excat-* markers used by the sections transformers
        if (n.startsWith('data-excat')) return;
        if (n.startsWith('data-') || n.startsWith('on') || n === 'tabindex') {
          el.removeAttribute(n);
        }
      });
    });
  }
}
