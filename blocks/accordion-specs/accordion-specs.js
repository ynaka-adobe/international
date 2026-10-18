/*
 * accordion-specs
 * Authoring: one row per panel, two cells.
 *   cell 1: panel title (e.g. Strength, Drivetrain)
 *   cell 2: specification groups. Each group starts with a label, either a
 *           heading (h3-h6) or a paragraph that is entirely bold, followed by
 *           its value paragraphs/lists. A paragraph that is entirely italic
 *           is a sub-label inside a group (e.g. a chassis variant).
 * Panels use native <details>/<summary>, so they are keyboard accessible.
 */

const BLOCK = 'accordion-specs';

function isWhollyWrapped(el, tag) {
  if (el.tagName !== 'P') return false;
  const inner = el.querySelector(tag);
  return !!inner && el.textContent.trim() !== '' && inner.textContent.trim() === el.textContent.trim();
}

function isSpecLabel(el) {
  return /^H[3-6]$/.test(el.tagName) || isWhollyWrapped(el, 'strong, b');
}

function groupSpecs(body) {
  const children = [...body.children];
  if (!children.some(isSpecLabel)) return;

  const list = document.createElement('div');
  list.className = `${BLOCK}-specs`;
  let data = null;

  children.forEach((child) => {
    if (isSpecLabel(child)) {
      const spec = document.createElement('div');
      spec.className = `${BLOCK}-spec`;
      const label = document.createElement('div');
      label.className = `${BLOCK}-spec-label`;
      label.append(child);
      data = document.createElement('div');
      data.className = `${BLOCK}-spec-data`;
      spec.append(label, data);
      list.append(spec);
      return;
    }
    if (isWhollyWrapped(child, 'em, i')) child.classList.add(`${BLOCK}-sub-label`);
    if (data) data.append(child);
    else list.append(child); // intro content before the first label
  });

  body.replaceChildren(list);
}

export default function decorate(block) {
  [...block.children].forEach((row) => {
    const [label, body = document.createElement('div')] = row.children;
    const summary = document.createElement('summary');
    summary.className = `${BLOCK}-item-label`;
    summary.append(...label.childNodes);

    body.className = `${BLOCK}-item-body`;
    groupSpecs(body);

    const details = document.createElement('details');
    details.className = `${BLOCK}-item`;
    details.append(summary, body);
    row.replaceWith(details);
  });
}
