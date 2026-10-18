import { createOptimizedPicture } from '../../scripts/aem.js';
import { disambiguateLinks, isInFirstSection } from '../../scripts/scripts.js';

/*
 * carousel-hero
 * Authoring: one row per slide, two cells.
 *   cell 1: slide image
 *   cell 2: heading (h2), optional tagline paragraph, body paragraph, CTA link
 * When the text cell has two or more plain paragraphs, the first one is the
 * light-weight tagline shown under the heading.
 *
 * Behaviour: cross-fading slides (no autoplay, no loop), prev/next buttons,
 * slide counter, arrow keys and swipe, polite live region announcing changes.
 */

const BLOCK = 'carousel-hero';
const SWIPE_THRESHOLD = 40;

function isButtonParagraph(el) {
  return el.classList.contains('button-container') || (el.querySelector('a') && el.textContent.trim() === el.querySelector('a').textContent.trim());
}

function buildContent(contentCell) {
  contentCell.className = `${BLOCK}-slide-content`;
  const heading = contentCell.querySelector('h1, h2, h3, h4, h5, h6');

  const headline = document.createElement('div');
  headline.className = `${BLOCK}-headline`;
  const caption = document.createElement('div');
  caption.className = `${BLOCK}-caption`;

  const plainParagraphs = [...contentCell.children]
    .filter((el) => el.tagName === 'P' && !isButtonParagraph(el));
  const tagline = heading && plainParagraphs.length > 1 ? plainParagraphs[0] : null;
  if (tagline) tagline.classList.add(`${BLOCK}-tagline`);

  [...contentCell.children].forEach((child) => {
    if (child === heading || child === tagline) headline.append(child);
    else caption.append(child);
  });

  contentCell.append(headline, caption);
  return heading;
}

function setActive(block, index, announce = false) {
  const slides = [...block.querySelectorAll(`.${BLOCK}-slide`)];
  block.dataset.activeSlide = index;
  slides.forEach((slide, idx) => {
    const active = idx === index;
    slide.classList.toggle('active', active);
    slide.setAttribute('aria-hidden', !active);
    if (active) {
      slide.querySelectorAll('img[loading="lazy"]').forEach((img) => { img.loading = 'eager'; });
    }
    slide.querySelectorAll('a, button').forEach((el) => {
      if (active) el.removeAttribute('tabindex');
      else el.setAttribute('tabindex', '-1');
    });
  });

  const prev = block.querySelector(`.${BLOCK}-prev`);
  const next = block.querySelector(`.${BLOCK}-next`);
  // aria-disabled (not disabled) keeps keyboard focus on the button at either end
  if (prev) prev.setAttribute('aria-disabled', index === 0);
  if (next) next.setAttribute('aria-disabled', index === slides.length - 1);

  block.querySelectorAll(`.${BLOCK}-count`).forEach((count) => {
    count.textContent = `${index + 1}/${slides.length}`;
  });

  const live = block.querySelector(`.${BLOCK}-live`);
  if (live && announce) {
    const heading = slides[index].querySelector('h1, h2, h3, h4, h5, h6');
    const label = heading ? `: ${heading.textContent.trim()}` : '';
    live.textContent = `Slide ${index + 1} of ${slides.length}${label}`;
  }
}

export function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll(`.${BLOCK}-slide`);
  if (!slides.length) return;
  const idx = Math.max(0, Math.min(slides.length - 1, slideIndex));
  setActive(block, idx, true);
}

function bindEvents(block) {
  const current = () => parseInt(block.dataset.activeSlide, 10) || 0;

  block.querySelector(`.${BLOCK}-prev`).addEventListener('click', () => showSlide(block, current() - 1));
  block.querySelector(`.${BLOCK}-next`).addEventListener('click', () => showSlide(block, current() + 1));

  block.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') showSlide(block, current() + 1);
    if (e.key === 'ArrowLeft') showSlide(block, current() - 1);
  });

  const slidesList = block.querySelector(`.${BLOCK}-slides`);
  let startX = null;
  slidesList.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    startX = e.clientX;
  });
  slidesList.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const delta = e.clientX - startX;
    startX = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    showSlide(block, current() + (delta < 0 ? 1 : -1));
  });
  slidesList.addEventListener('pointercancel', () => { startX = null; });
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

export default async function decorate(block) {
  instance += 1;
  const id = `${BLOCK}-${instance}`;
  block.id = id;

  const rows = [...block.querySelectorAll(':scope > div')];
  const isSingle = rows.length < 2;

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const container = document.createElement('div');
  container.className = `${BLOCK}-slides-container`;
  const slidesList = document.createElement('ul');
  slidesList.className = `${BLOCK}-slides`;
  slidesList.id = `${id}-slides`;

  rows.forEach((row, idx) => {
    const [imageCell, contentCell] = row.children;
    const slide = document.createElement('li');
    slide.className = `${BLOCK}-slide`;
    slide.dataset.slideIndex = idx;
    slide.id = `${id}-slide-${idx}`;
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');

    if (imageCell) {
      imageCell.className = `${BLOCK}-slide-image`;
      const img = imageCell.querySelector('img');
      if (img) {
        const pic = img.closest('picture');
        const isLcp = idx === 0 && isInFirstSection(block);
        const optimized = createOptimizedPicture(img.src, img.alt, isLcp, [{ media: '(min-width: 900px)', width: '2000' }, { width: '900' }]);
        if (isLcp) optimized.querySelector('img').setAttribute('fetchpriority', 'high');
        (pic || img).replaceWith(optimized);
      }
      slide.append(imageCell);
    }

    if (contentCell) {
      const heading = buildContent(contentCell);
      if (heading) {
        if (!heading.id) heading.id = `${id}-heading-${idx}`;
        slide.setAttribute('aria-labelledby', heading.id);
      } else {
        slide.setAttribute('aria-label', `${idx + 1} of ${rows.length}`);
      }
      if (!isSingle) {
        const count = document.createElement('p');
        count.className = `${BLOCK}-count`;
        count.setAttribute('aria-hidden', 'true');
        contentCell.querySelector(`.${BLOCK}-caption`).prepend(count);
      }
      slide.append(contentCell);
    }
    slidesList.append(slide);
    row.remove();
  });

  container.append(slidesList);

  if (!isSingle) {
    const nav = document.createElement('div');
    nav.className = `${BLOCK}-navigation`;
    nav.append(
      createNavButton('prev', 'Previous Slide', slidesList.id),
      createNavButton('next', 'Next Slide', slidesList.id),
    );
    container.append(nav);

    const live = document.createElement('div');
    live.className = `${BLOCK}-live visually-hidden`;
    live.setAttribute('aria-live', 'polite');
    live.setAttribute('aria-atomic', 'true');
    block.append(live);
  }

  block.prepend(container);
  disambiguateLinks(block, `.${BLOCK}-slide`);
  setActive(block, 0);
  if (!isSingle) bindEvents(block);
}
