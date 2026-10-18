import { createOptimizedPicture } from '../../scripts/aem.js';
import { disambiguateLinks } from '../../scripts/scripts.js';

/*
 * carousel-cards
 * Authoring: one row per card, two cells.
 *   cell 1: card image
 *   cell 2: optional eyebrow paragraph, heading (e.g. h5), paragraph, optional CTA link
 * A plain paragraph placed before the heading is the eyebrow label.
 *
 * Behaviour: horizontally scrolling, scroll-snapped track showing several
 * cards at once; prev/next buttons move one card, a progress bar and counter
 * track position, arrow keys work on the track, and a polite live region
 * announces the current card. Respects prefers-reduced-motion.
 */

const BLOCK = 'carousel-cards';

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function buildCard(row, idx, total, id) {
  const card = document.createElement('li');
  card.className = `${BLOCK}-card`;
  card.id = `${id}-card-${idx}`;
  card.setAttribute('role', 'group');
  card.setAttribute('aria-roledescription', 'slide');

  [...row.children].forEach((cell) => {
    const img = cell.querySelector('img');
    if (img && cell.textContent.trim() === '') {
      cell.className = `${BLOCK}-card-image`;
      const pic = img.closest('picture');
      (pic || img).replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ media: '(min-width: 900px)', width: '900' }, { width: '600' }]));
    } else {
      cell.className = `${BLOCK}-card-body`;
      const heading = cell.querySelector('h1, h2, h3, h4, h5, h6');
      if (heading) {
        let prev = heading.previousElementSibling;
        while (prev) {
          if (prev.tagName === 'P' && !prev.querySelector('a')) prev.classList.add(`${BLOCK}-eyebrow`);
          prev = prev.previousElementSibling;
        }
        if (!heading.id) heading.id = `${id}-heading-${idx}`;
        card.setAttribute('aria-labelledby', heading.id);
      }
    }
    card.append(cell);
  });

  if (!card.hasAttribute('aria-labelledby')) card.setAttribute('aria-label', `${idx + 1} of ${total}`);
  return card;
}

function cardStep(track) {
  const cards = track.children;
  if (cards.length < 2) return track.clientWidth;
  return cards[1].offsetLeft - cards[0].offsetLeft;
}

function currentIndex(track) {
  const step = cardStep(track) || 1;
  return Math.round(track.scrollLeft / step);
}

/*
 * Like the source slider, cards run past the content edges to the viewport
 * edges. The distances are measured (not 100vw) so the page never gains a
 * horizontal scrollbar; CSS turns them into negative margins + padding.
 */
function setBleed(block) {
  const rect = block.getBoundingClientRect();
  if (!rect.width) return;
  const viewport = document.documentElement.clientWidth;
  block.style.setProperty('--carousel-cards-bleed-start', `${Math.max(0, Math.floor(rect.left))}px`);
  block.style.setProperty('--carousel-cards-bleed-end', `${Math.max(0, Math.floor(viewport - rect.right))}px`);
}

function update(block) {
  const track = block.querySelector(`.${BLOCK}-track`);
  if (!track.clientWidth) return; // not laid out yet
  const cards = [...track.children];
  const total = cards.length;
  const maxScroll = track.scrollWidth - track.clientWidth;
  const atEnd = maxScroll <= 1 || track.scrollLeft >= maxScroll - 1;
  const idx = atEnd ? total - 1 : Math.min(total - 1, currentIndex(track));

  const progress = maxScroll > 0 ? track.scrollLeft / maxScroll : 1;
  const fill = block.querySelector(`.${BLOCK}-progress-fill`);
  if (fill) fill.style.setProperty('--progress', `${Math.max(1 / total, progress) * 100}%`);

  const prev = block.querySelector(`.${BLOCK}-prev`);
  const next = block.querySelector(`.${BLOCK}-next`);
  if (prev) prev.setAttribute('aria-disabled', track.scrollLeft <= 1);
  if (next) next.setAttribute('aria-disabled', atEnd);

  if (String(idx) === block.dataset.activeCard) return;
  block.dataset.activeCard = idx;

  const count = block.querySelector(`.${BLOCK}-count`);
  if (count) count.textContent = `${idx + 1}/${total}`;

  const live = block.querySelector(`.${BLOCK}-live`);
  if (live) {
    const heading = cards[idx].querySelector('h1, h2, h3, h4, h5, h6');
    live.textContent = `Item ${idx + 1} of ${total}${heading ? `: ${heading.textContent.trim()}` : ''}`;
  }
}

export function showCard(block, index) {
  const track = block.querySelector(`.${BLOCK}-track`);
  const cards = track.children;
  if (!cards.length) return;
  const idx = Math.max(0, Math.min(cards.length - 1, index));
  track.scrollTo({
    left: cards[idx].offsetLeft - cards[0].offsetLeft,
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
  });
}

function bindEvents(block) {
  const track = block.querySelector(`.${BLOCK}-track`);
  const idx = () => parseInt(block.dataset.activeCard, 10) || 0;

  block.querySelector(`.${BLOCK}-prev`).addEventListener('click', () => showCard(block, idx() - 1));
  block.querySelector(`.${BLOCK}-next`).addEventListener('click', () => showCard(block, idx() + 1));

  track.addEventListener('keydown', (e) => {
    if (e.target !== track) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); showCard(block, idx() + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); showCard(block, idx() - 1); }
  });

  // keep keyboard focus visible: tabbing into a card scrolls it into view
  track.addEventListener('focusin', (e) => {
    const card = e.target.closest(`.${BLOCK}-card`);
    if (card) showCard(block, [...track.children].indexOf(card));
  });

  let ticking = false;
  track.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      ticking = false;
      update(block);
    });
  }, { passive: true });

  // runs once the block gets layout (sections are hidden while loading) and on resize;
  // body is observed too because the block keeps its max width on wide viewports
  const observer = new ResizeObserver(() => {
    setBleed(block);
    update(block);
  });
  observer.observe(block);
  observer.observe(document.body);
}

function createNavButton(direction, label, controls) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `${BLOCK}-${direction}`;
  button.setAttribute('aria-label', label);
  button.setAttribute('aria-controls', controls);
  return button;
}

let instance = 0;

export default function decorate(block) {
  instance += 1;
  const id = `${BLOCK}-${instance}`;
  block.id = id;

  const rows = [...block.querySelectorAll(':scope > div')];
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const track = document.createElement('ul');
  track.className = `${BLOCK}-track`;
  track.id = `${id}-track`;
  rows.forEach((row, idx) => {
    track.append(buildCard(row, idx, rows.length, id));
    row.remove();
  });
  block.append(track);
  disambiguateLinks(block, `.${BLOCK}-card`);

  if (rows.length < 2) return;

  track.tabIndex = 0;
  track.setAttribute('aria-label', 'Carousel items; use the arrow keys to scroll');

  const controls = document.createElement('div');
  controls.className = `${BLOCK}-controls`;

  const progress = document.createElement('div');
  progress.className = `${BLOCK}-progress`;
  progress.setAttribute('aria-hidden', 'true');
  const fill = document.createElement('span');
  fill.className = `${BLOCK}-progress-fill`;
  progress.append(fill);

  const count = document.createElement('p');
  count.className = `${BLOCK}-count`;
  count.setAttribute('aria-hidden', 'true');

  const nav = document.createElement('div');
  nav.className = `${BLOCK}-navigation`;
  nav.append(
    createNavButton('prev', 'Previous Item', track.id),
    createNavButton('next', 'Next Item', track.id),
  );

  controls.append(progress, count, nav);
  block.append(controls);

  const live = document.createElement('div');
  live.className = `${BLOCK}-live visually-hidden`;
  live.setAttribute('aria-live', 'polite');
  live.setAttribute('aria-atomic', 'true');
  block.append(live);

  bindEvents(block);
  // initial state (layout may not exist yet); nothing is announced on load
  block.dataset.activeCard = '0';
  count.textContent = `1/${rows.length}`;
  fill.style.setProperty('--progress', `${100 / rows.length}%`);
  nav.querySelector(`.${BLOCK}-prev`).setAttribute('aria-disabled', 'true');
  nav.querySelector(`.${BLOCK}-next`).setAttribute('aria-disabled', 'false');
}
