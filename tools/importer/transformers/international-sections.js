/* eslint-disable */
/* global WebImporter */

/**
 * Sections transformer for www.international.com
 * Inserts section breaks (<hr>) and Section Metadata blocks based on
 * payload.template.sections.
 */
const MARKER = 'data-excat-section-id';

function findSection(root, document, section) {
  const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
  for (const sel of selectors) {
    if (!sel) continue;
    try {
      const el = root.querySelector(sel) || document.querySelector(sel);
      if (el) return el;
    } catch (e) {
      // invalid selector, try next
    }
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const template = payload && payload.template;
  const sections = template && template.sections;
  if (!sections || sections.length < 2) return;
  const document = element.ownerDocument || payload.document;

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const el = findSection(element, document, section);
      if (!el) continue;
      // first section only gets a (temporary) break if it is styled
      if (i === 0 && !section.style) continue;
      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(MARKER, section.id);
      if (i === 0) hr.setAttribute('data-excat-first', 'true');
      el.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;
      const metadata = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`)
        || document.querySelector(`hr[${MARKER}="${section.id}"]`);
      if (marker) {
        marker.after(metadata);
        marker.removeAttribute(MARKER);
        if (marker.hasAttribute('data-excat-first')) marker.remove();
      } else {
        const el = findSection(element, document, section);
        if (el) el.after(metadata);
      }
    }
    // remove any leftover temporary first-section break
    element.querySelectorAll('hr[data-excat-first]').forEach((hr) => hr.remove());
  }
}
