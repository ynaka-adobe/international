/* eslint-disable */
/* global WebImporter */

/**
 * Content-page sections transformer for www.international.com
 *
 * Every section-level SXA component becomes its own EDS section:
 * the element children of `#content > div.row` (story pages wrap several of
 * them in a `div.container > .component-content > .row`, whose children are
 * used instead). Section Metadata styles:
 *   - dark        : section.background-asphalt
 *   - in-page-nav : the component holding the in-page anchor menu
 *   - centered    : first content component is div.title-block, or the
 *                   section contains div.related-article-carousel
 *
 * beforeTransform inserts the <hr> breaks (no break before the first section)
 * and marks them with data-excat-cs-* attributes; afterTransform looks the
 * markers up again (parsers may have replaced elements in between) and adds
 * the Section Metadata blocks.
 */

const STYLE_ATTR = 'data-excat-cs-style';
const FIRST_ATTR = 'data-excat-cs-first';
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'LINK', 'NOSCRIPT', 'TEMPLATE', 'HR']);
const WRAPPER_COMPONENTS = '.section-container, .container, .waypoint-id-box';

const isEmpty = (el) => !(el.textContent || '').replace(/[\s ]/g, '')
  && !el.querySelector('img, picture, video, iframe, svg, canvas, a[href], input, select, textarea');

/** Element matched by any block selector of the template (parser target). */
function isBlockTarget(el, blockSelectors) {
  return blockSelectors.some((sel) => {
    try { return el.matches(sel); } catch (e) { return false; }
  });
}

function sectionComponents(row, blockSelectors) {
  const result = [];
  [...row.children].forEach((child) => {
    if (SKIP_TAGS.has(child.tagName) || isEmpty(child)) return;
    const innerRow = child.matches('div.container')
      ? child.querySelector(':scope > .component-content > .row')
      : null;
    // A container a parser targets (e.g. columns-cta-band) must stay whole:
    // breaks inserted inside it would be lost when the parser replaces it.
    if (innerRow && !isBlockTarget(child, blockSelectors)) {
      [...innerRow.children].forEach((g) => {
        if (!SKIP_TAGS.has(g.tagName) && !isEmpty(g)) result.push(g);
      });
    } else {
      result.push(child);
    }
  });
  return result;
}

function firstContentComponent(el) {
  if (!el.matches(WRAPPER_COMPONENTS)) return el;
  return [...el.querySelectorAll('.component')]
    .find((c) => !c.matches(WRAPPER_COMPONENTS) && !isEmpty(c)) || null;
}

function sectionStyles(el) {
  const styles = [];
  if (el.matches('section.background-asphalt')) styles.push('dark');
  if (el.matches('.in-page-navigation') || el.querySelector('.in-page-navigation')) {
    styles.push('in-page-nav');
  }
  const first = firstContentComponent(el);
  if ((first && first.matches('div.title-block'))
    || el.matches('div.related-article-carousel')
    || el.querySelector('div.related-article-carousel')) {
    styles.push('centered');
  }
  return styles;
}

export default function transform(hookName, element, payload) {
  const document = element.ownerDocument || (payload && payload.document);

  if (hookName === 'beforeTransform') {
    const row = element.querySelector('#content > div.row')
      || document.querySelector('#content > div.row');
    if (!row) return;
    const blockSelectors = ((payload && payload.template && payload.template.blocks) || [])
      .flatMap((b) => b.instances || []);
    const components = sectionComponents(row, blockSelectors);

    for (let i = components.length - 1; i >= 0; i -= 1) {
      const el = components[i];
      const styles = sectionStyles(el);
      // first section only gets a temporary break, and only if it is styled
      if (i === 0 && !styles.length) continue;
      const hr = document.createElement('hr');
      if (styles.length) hr.setAttribute(STYLE_ATTR, styles.join(', '));
      if (i === 0) hr.setAttribute(FIRST_ATTR, 'true');
      el.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    // re-query: parsers may have replaced the section elements
    element.querySelectorAll(`hr[${STYLE_ATTR}]`).forEach((hr) => {
      const style = hr.getAttribute(STYLE_ATTR);
      const metadata = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style },
      });
      hr.after(metadata);
      hr.removeAttribute(STYLE_ATTR);
    });
    // the first section's temporary break must not open an empty section
    element.querySelectorAll(`hr[${FIRST_ATTR}]`).forEach((hr) => hr.remove());
  }
}
