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
 * Behaviour (source: international.com .swiper-hotspot):
 *   desktop - "+" markers over the image open a popup beside the marker
 *             (Escape / close button / outside click close it and return
 *             focus). A "Hotspots" switch shows or hides the markers.
 *   mobile  - the hotspot texts become slides under the image with a
 *             progress bar, a counter and prev/next buttons; only the
 *             current slide's marker is shown on the image.
 */

const BLOCK = 'carousel-hotspot';
const DESKTOP = '(width >= 900px)';
const POPUP_OFFSET = 8;
const SVG_NS = 'http://www.w3.org/2000/svg';
const ICONS = {
  plus: '17 15 17 6 15 6 15 15 6 15 6 17 15 17 15 26 17 26 17 17 26 17 26 15 17 15',
  close: '25 8.414 23.586 7 16 14.586 8.414 7 7 8.414 14.586 16 7 23.586 8.414 25 16 17.414 23.586 25 25 23.586 17.414 16 25 8.414',
  prev: '21.414 24.586 12.828 16 21.414 7.414 20 6 10 16 20 26 21.414 24.586',
  next: '10.586 24.586 19.172 16 10.586 7.414 12 6 22 16 12 26 10.586 24.586',
};

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

function icon(name) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 32 32');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const polygon = document.createElementNS(SVG_NS, 'polygon');
  polygon.setAttribute('points', ICONS[name]);
  svg.append(polygon);
  return svg;
}

function makeButton(className, label, iconName) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.setAttribute('aria-label', label);
  if (iconName) button.append(icon(iconName));
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
      // hotspot positions are measured on the authored rendition, so keep
      // external (CDN-cropped) images as-is; only optimise same-origin media
      const sameOrigin = new URL(img.src, window.location.href).origin === window.location.origin;
      const picture = sameOrigin
        ? createOptimizedPicture(img.src, img.alt, false, [{ media: '(min-width: 900px)', width: '2000' }, { width: '900' }])
        : pic || img;
      if (!sameOrigin && !img.hasAttribute('loading')) img.loading = 'lazy';
      (pic || img).remove();
      media.prepend(picture);
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

  const close = makeButton(`${BLOCK}-close`, `Close ${titleText}`, 'close');
  popup.append(body, close);

  const marker = makeButton(`${BLOCK}-marker`, titleText, 'plus');
  marker.id = `${id}-marker-${idx}`;
  marker.setAttribute('aria-expanded', 'false');
  marker.setAttribute('aria-controls', popup.id);
  marker.style.setProperty('--hotspot-top', `${position.top}%`);
  marker.style.setProperty('--hotspot-left', `${position.left}%`);
  marker.dataset.index = idx;

  return { marker, popup, titleText };
}

/* popper-like placement: top (centred), then bottom, left, right */
function placePopup(popup, marker, frame) {
  const fw = frame.clientWidth;
  const fh = frame.clientHeight;
  const fr = frame.getBoundingClientRect();
  const mr = marker.getBoundingClientRect();
  const m = {
    x: mr.left - fr.left, y: mr.top - fr.top, w: mr.width, h: mr.height,
  };
  const pw = popup.offsetWidth;
  const ph = popup.offsetHeight;
  const cx = m.x + m.w / 2 - pw / 2;
  const cy = m.y + m.h / 2 - ph / 2;
  const options = [
    ['top', cx, m.y - POPUP_OFFSET - ph],
    ['bottom', cx, m.y + m.h + POPUP_OFFSET],
    ['left', m.x - POPUP_OFFSET - pw, cy],
    ['right', m.x + m.w + POPUP_OFFSET, cy],
  ];
  const fits = ([, x, y]) => x >= 0 && y >= 0 && x + pw <= fw && y + ph <= fh;
  const [placement, x, y] = options.find(fits)
    || options.find(([, , y0]) => y0 >= 0 && y0 + ph <= fh)
    || options[0];
  const left = Math.round(Math.max(0, Math.min(x, fw - pw)));
  const top = Math.round(Math.max(0, Math.min(y, fh - ph)));
  popup.dataset.placement = placement;
  popup.style.left = `${left}px`;
  popup.style.top = `${top}px`;
  // arrow points at the marker centre
  const vertical = placement === 'top' || placement === 'bottom';
  const arrow = vertical ? m.x + m.w / 2 - left : m.y + m.h / 2 - top;
  popup.style.setProperty('--arrow-offset', `${Math.round(arrow)}px`);
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

  media.append(markerList);

  const stage = document.createElement('div');
  stage.className = `${BLOCK}-stage`;
  stage.append(media, header, details);
  block.append(stage);

  if (!hotspots.length) return;

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');
  const heading = header.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    if (!heading.id) heading.id = `${id}-heading`;
    block.setAttribute('aria-labelledby', heading.id);
  }

  // hotspots switch (desktop)
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = `${BLOCK}-toggle`;
  toggle.setAttribute('role', 'switch');
  toggle.setAttribute('aria-checked', 'true');
  toggle.textContent = 'Hotspots';
  header.append(toggle);

  // slide controls (mobile): progress, counter, prev/next
  const nav = document.createElement('div');
  nav.className = `${BLOCK}-navigation`;
  const progress = document.createElement('div');
  progress.className = `${BLOCK}-progress`;
  progress.setAttribute('aria-hidden', 'true');
  const fill = document.createElement('span');
  progress.append(fill);
  const count = document.createElement('p');
  count.className = `${BLOCK}-count`;
  count.setAttribute('aria-hidden', 'true');
  const arrows = document.createElement('div');
  arrows.className = `${BLOCK}-arrows`;
  const prev = makeButton(`${BLOCK}-prev`, 'Previous Hotspot', 'prev');
  const next = makeButton(`${BLOCK}-next`, 'Next Hotspot', 'next');
  arrows.append(prev, next);
  nav.append(progress, count, arrows);
  details.append(nav);

  const live = document.createElement('div');
  live.className = `${BLOCK}-live visually-hidden`;
  live.setAttribute('aria-live', 'polite');
  live.setAttribute('aria-atomic', 'true');
  block.append(live);

  const mq = window.matchMedia(DESKTOP);
  let current = 0; // slide shown on mobile / popup shown on desktop
  let open = false; // desktop popup open

  const render = () => {
    const desktop = mq.matches;
    hotspots.forEach(({ marker, popup }, idx) => {
      const isCurrent = idx === current;
      const expanded = desktop && open && isCurrent;
      popup.hidden = desktop ? !expanded : !isCurrent;
      marker.setAttribute('aria-expanded', expanded);
      marker.classList.toggle('active', desktop ? expanded : isCurrent);
      if (expanded) placePopup(popup, marker, media);
    });
    block.classList.toggle('has-active', desktop && open);
    count.textContent = `${current + 1} / ${hotspots.length}`;
    fill.style.width = `${((current + 1) / hotspots.length) * 100}%`;
    prev.disabled = current === 0;
    next.disabled = current === hotspots.length - 1;
  };

  const show = (idx, { focus = false } = {}) => {
    current = Math.max(0, Math.min(hotspots.length - 1, idx));
    open = mq.matches;
    render();
    live.textContent = `Hotspot ${current + 1} of ${hotspots.length}: ${hotspots[current].titleText}`;
    if (focus && open) hotspots[current].popup.focus();
  };

  const close = ({ restoreFocus = false } = {}) => {
    if (!open) return;
    open = false;
    render();
    if (restoreFocus) hotspots[current].marker.focus();
  };

  hotspots.forEach(({ marker, popup }, idx) => {
    marker.addEventListener('click', () => {
      if (open && current === idx) close();
      else show(idx, { focus: true });
    });
    popup.querySelector(`.${BLOCK}-close`).addEventListener('click', () => close({ restoreFocus: true }));
  });

  prev.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));

  toggle.addEventListener('click', () => {
    const on = toggle.getAttribute('aria-checked') !== 'true';
    toggle.setAttribute('aria-checked', on);
    block.classList.toggle('hotspots-hidden', !on);
    if (!on) close();
  });

  block.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open) {
      e.preventDefault();
      close({ restoreFocus: true });
    }
  });

  document.addEventListener('click', (e) => {
    if (!open) return;
    if (e.target.closest(`.${BLOCK}-popup, .${BLOCK}-marker`)) return;
    close();
  });

  // popups only exist on desktop; the open state is simply not rendered on mobile
  mq.addEventListener('change', render);

  if (window.ResizeObserver) {
    new ResizeObserver(() => { if (open) render(); }).observe(media);
  }

  render();
}
