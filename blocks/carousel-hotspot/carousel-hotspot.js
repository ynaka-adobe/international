import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * carousel-hotspot
 * Authoring:
 *   row 1 (stage): image | heading (e.g. h2 INTERIOR), optional paragraph
 *   one row per hotspot: position | title + text
 *     position cell: percentages measured on the image, e.g.
 *       "top: 85%, left: 58%"  (labels: top/left or y/x, any order)
 *       "85%, 58%"             (unlabelled = top, then left)
 *     content cell: title (heading or first paragraph) + paragraphs
 *
 * Behaviour: each "+" marker is a button that opens a popup with the
 * hotspot text (Escape or the close button closes it and returns focus).
 * A "Hotspots" switch shows/hides the markers. Prev/next buttons and a
 * counter step through the hotspots like a carousel (shown under the
 * image on small screens), and a polite live region announces changes.
 */

const BLOCK = 'carousel-hotspot';

const clamp = (n) => Math.max(0, Math.min(100, n));

export function parsePosition(text) {
  const t = (text || '').toLowerCase();
  const num = '(-?\\d+(?:\\.\\d+)?)';
  const top = t.match(new RegExp(`(?:top|y)\\s*[:=]?\\s*${num}`));
  const left = t.match(new RegExp(`(?:left|x)\\s*[:=]?\\s*${num}`));
  if (top && left) return { top: clamp(parseFloat(top[1])), left: clamp(parseFloat(left[1])) };
  const nums = t.match(/-?\d+(?:\.\d+)?/g);
  if (!nums || nums.length < 2) return null;
  return { top: clamp(parseFloat(nums[0])), left: clamp(parseFloat(nums[1])) };
}

function isPositionCell(cell) {
  if (!cell || cell.querySelector('picture, img, a, h1, h2, h3, h4, h5, h6')) return false;
  const text = cell.textContent.trim();
  return text.length > 0 && text.length <= 40 && !!parsePosition(text);
}

function makeButton(className, label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.setAttribute('aria-label', label);
  return button;
}

function buildStage(row) {
  const media = document.createElement('div');
  media.className = `${BLOCK}-media`;
  const header = document.createElement('div');
  header.className = `${BLOCK}-header`;

  [...row.children].forEach((cell) => {
    const img = cell.querySelector('img');
    if (img && !media.querySelector('picture')) {
      const pic = img.closest('picture');
      const optimized = createOptimizedPicture(img.src, img.alt, false, [{ media: '(min-width: 900px)', width: '2000' }, { width: '900' }]);
      (pic || img).remove();
      media.prepend(optimized);
    }
    const content = document.createElement('div');
    content.className = `${BLOCK}-header-content`;
    content.append(...[...cell.children].filter((el) => el.textContent.trim()));
    if (content.children.length) header.append(content);
  });

  return { media, header };
}

function buildHotspot(row, idx, id) {
  const cells = [...row.children];
  const posCell = cells.find(isPositionCell);
  if (!posCell) return null;
  const position = parsePosition(posCell.textContent);
  const contentCell = cells.find((c) => c !== posCell) || document.createElement('div');

  const popup = document.createElement('div');
  popup.className = `${BLOCK}-popup`;
  popup.id = `${id}-popup-${idx}`;
  popup.setAttribute('role', 'dialog');
  popup.tabIndex = -1;
  popup.hidden = true;
  popup.style.setProperty('--hotspot-top', `${position.top}%`);
  popup.style.setProperty('--hotspot-left', `${position.left}%`);
  if (position.left > 60) popup.classList.add('align-end');
  if (position.top > 50) popup.classList.add('align-top');

  const body = document.createElement('div');
  body.className = `${BLOCK}-popup-body`;
  body.append(...contentCell.childNodes);
  const title = body.querySelector('h1, h2, h3, h4, h5, h6') || body.querySelector('p');
  const titleText = title ? title.textContent.trim() : `Hotspot ${idx + 1}`;
  if (title) {
    title.classList.add(`${BLOCK}-popup-title`);
    title.id = `${popup.id}-title`;
    popup.setAttribute('aria-labelledby', title.id);
  } else {
    popup.setAttribute('aria-label', titleText);
  }

  const close = makeButton(`${BLOCK}-close`, `Close ${titleText}`);
  popup.append(body, close);

  const marker = makeButton(`${BLOCK}-marker`, titleText);
  marker.id = `${id}-marker-${idx}`;
  marker.setAttribute('aria-expanded', 'false');
  marker.setAttribute('aria-controls', popup.id);
  marker.style.setProperty('--hotspot-top', `${position.top}%`);
  marker.style.setProperty('--hotspot-left', `${position.left}%`);
  marker.dataset.index = idx;

  return { marker, popup, titleText };
}

export default function decorate(block) {
  const id = block.id || `${BLOCK}-${[...document.querySelectorAll(`.${BLOCK}`)].indexOf(block) + 1}`;
  block.id = id;

  const rows = [...block.querySelectorAll(':scope > div')];
  const stageRow = rows.find((row) => row.querySelector('img'));
  const { media, header } = buildStage(stageRow || document.createElement('div'));

  const markerList = document.createElement('ul');
  markerList.className = `${BLOCK}-markers`;
  const details = document.createElement('div');
  details.className = `${BLOCK}-details`;

  const hotspots = [];
  rows.filter((row) => row !== stageRow).forEach((row) => {
    const hotspot = buildHotspot(row, hotspots.length, id);
    if (!hotspot) return;
    const li = document.createElement('li');
    li.append(hotspot.marker);
    markerList.append(li);
    details.append(hotspot.popup);
    hotspots.push(hotspot);
  });
  rows.forEach((row) => row.remove());

  media.append(markerList, header);

  const stage = document.createElement('div');
  stage.className = `${BLOCK}-stage`;
  stage.append(media, details);
  block.append(stage);

  if (!hotspots.length) return;

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');
  const heading = header.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    if (!heading.id) heading.id = `${id}-heading`;
    block.setAttribute('aria-labelledby', heading.id);
  }

  // hotspots switch
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = `${BLOCK}-toggle`;
  toggle.setAttribute('role', 'switch');
  toggle.setAttribute('aria-checked', 'true');
  toggle.textContent = 'Hotspots';
  header.append(toggle);

  // carousel-style stepping through the hotspots
  const nav = document.createElement('div');
  nav.className = `${BLOCK}-navigation`;
  const prev = makeButton(`${BLOCK}-prev`, 'Previous Hotspot');
  const next = makeButton(`${BLOCK}-next`, 'Next Hotspot');
  const count = document.createElement('p');
  count.className = `${BLOCK}-count`;
  count.setAttribute('aria-hidden', 'true');
  nav.append(prev, count, next);
  details.append(nav);

  const live = document.createElement('div');
  live.className = `${BLOCK}-live visually-hidden`;
  live.setAttribute('aria-live', 'polite');
  live.setAttribute('aria-atomic', 'true');
  block.append(live);

  let active = -1;

  const render = () => {
    hotspots.forEach(({ marker, popup }, idx) => {
      const isActive = idx === active;
      popup.hidden = !isActive;
      marker.setAttribute('aria-expanded', isActive);
      marker.classList.toggle('active', isActive);
    });
    block.classList.toggle('has-active', active > -1);
    count.textContent = active > -1 ? `${active + 1} / ${hotspots.length}` : `${hotspots.length} hotspots`;
  };

  const open = (idx, { focus = false, announce = true } = {}) => {
    active = (idx + hotspots.length) % hotspots.length;
    render();
    if (announce) live.textContent = `Hotspot ${active + 1} of ${hotspots.length}: ${hotspots[active].titleText}`;
    if (focus) hotspots[active].popup.focus();
  };

  const close = ({ restoreFocus = false } = {}) => {
    if (active < 0) return;
    const { marker } = hotspots[active];
    active = -1;
    render();
    if (restoreFocus) marker.focus();
  };

  hotspots.forEach(({ marker, popup }, idx) => {
    marker.addEventListener('click', () => {
      if (active === idx) close();
      else open(idx, { focus: true });
    });
    popup.querySelector(`.${BLOCK}-close`).addEventListener('click', () => close({ restoreFocus: true }));
  });

  prev.addEventListener('click', () => open(active < 0 ? hotspots.length - 1 : active - 1));
  next.addEventListener('click', () => open(active + 1));

  toggle.addEventListener('click', () => {
    const on = toggle.getAttribute('aria-checked') !== 'true';
    toggle.setAttribute('aria-checked', on);
    block.classList.toggle('hotspots-hidden', !on);
    if (!on) close();
  });

  block.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && active > -1) {
      e.preventDefault();
      close({ restoreFocus: true });
    }
  });

  document.addEventListener('click', (e) => {
    if (active < 0) return;
    if (e.target.closest(`.${BLOCK}-popup, .${BLOCK}-marker, .${BLOCK}-navigation`)) return;
    close();
  });

  render();
}
