import { createOptimizedPicture } from '../../scripts/aem.js';
import { disambiguateLinks, isInFirstSection } from '../../scripts/scripts.js';

/*
 * carousel-thumbnails
 * Authoring: one row per slide.
 *   cell 1: slide image
 *   cell 2: heading (h2), tagline paragraph, CTA link
 *   cell 3 (optional): thumbnail label; defaults to the first word of the heading
 *
 * Behaviour mirrors the source swiper: cross-fade between slides (no loop,
 * no autoplay), thumbnail navigation, swipe and arrow-key support.
 */

const BLOCK = 'carousel-thumbnails';
const SWIPE_THRESHOLD = 40;

function thumbLabel(row, content) {
  const labelCell = row.children[2];
  const explicit = labelCell?.textContent.trim();
  if (explicit) return explicit;
  const heading = content?.querySelector('h1, h2, h3, h4, h5, h6');
  const text = (heading?.textContent || '').trim();
  return text.split(/\s+/)[0] || '';
}

function setActive(block, index) {
  const slides = [...block.querySelectorAll(`.${BLOCK}-slide`)];
  const thumbs = [...block.querySelectorAll(`.${BLOCK}-thumb`)];
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
  thumbs.forEach((thumb, idx) => {
    const active = idx === index;
    thumb.classList.toggle('active', active);
    thumb.setAttribute('aria-current', active ? 'true' : 'false');
  });
}

export function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll(`.${BLOCK}-slide`);
  if (!slides.length) return;
  // source swiper does not loop: clamp to the first/last slide
  const idx = Math.max(0, Math.min(slides.length - 1, slideIndex));
  setActive(block, idx);
}

function bindEvents(block) {
  const current = () => parseInt(block.dataset.activeSlide, 10) || 0;

  block.querySelector(`.${BLOCK}-thumbs`).addEventListener('click', (e) => {
    const thumb = e.target.closest(`.${BLOCK}-thumb`);
    if (thumb) showSlide(block, parseInt(thumb.dataset.targetSlide, 10));
  });

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

function buildContent(contentCell, idx, total, isSingle) {
  contentCell.className = `${BLOCK}-slide-content`;
  const heading = contentCell.querySelector('h1, h2, h3, h4, h5, h6');

  const headline = document.createElement('div');
  headline.className = `${BLOCK}-headline`;
  const caption = document.createElement('div');
  caption.className = `${BLOCK}-caption`;

  if (!isSingle) {
    const count = document.createElement('p');
    count.className = `${BLOCK}-count`;
    count.textContent = `${idx + 1}/${total}`;
    caption.append(count);
  }

  [...contentCell.children].forEach((child) => {
    const isButton = child.classList.contains('button-container') || child.querySelector('a');
    if (child === heading) {
      headline.append(child);
    } else if (!isButton && heading && !headline.querySelector(`.${BLOCK}-tagline`)
      && child.tagName === 'P') {
      // the first plain paragraph is the light-weight tagline beside the heading
      child.classList.add(`${BLOCK}-tagline`);
      headline.append(child);
    } else {
      caption.append(child);
    }
  });

  contentCell.append(headline, caption);
  return heading;
}

let instance = 0;

export default async function decorate(block) {
  instance += 1;
  const id = `${BLOCK}-${instance}`;
  block.id = id;

  const rows = [...block.querySelectorAll(':scope > div')];
  const isSingle = rows.length < 2;
  // no placeholders sheet on this site yet; labels fall back to English defaults
  const placeholders = {};
  const { carousel: carouselLabel, carouselSlideControls } = placeholders;

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', carouselLabel || 'Carousel');

  const container = document.createElement('div');
  container.className = `${BLOCK}-slides-container`;
  const slidesList = document.createElement('ul');
  slidesList.className = `${BLOCK}-slides`;

  let thumbList;
  if (!isSingle) {
    const nav = document.createElement('nav');
    nav.className = `${BLOCK}-nav`;
    nav.setAttribute('aria-label', carouselSlideControls || 'Carousel Slide Controls');
    thumbList = document.createElement('ol');
    thumbList.className = `${BLOCK}-thumbs`;
    nav.append(thumbList);
    block.append(nav);
  }

  rows.forEach((row, idx) => {
    const [imageCell, contentCell] = row.children;
    const label = thumbLabel(row, contentCell);

    const slide = document.createElement('li');
    slide.className = `${BLOCK}-slide`;
    slide.dataset.slideIndex = idx;
    slide.id = `${id}-slide-${idx}`;
    slide.setAttribute('aria-roledescription', 'slide');

    let thumbImg;
    if (imageCell) {
      imageCell.className = `${BLOCK}-slide-image`;
      const img = imageCell.querySelector('img');
      if (img) {
        const pic = img.closest('picture');
        const isLcp = idx === 0 && isInFirstSection(block);
        const optimized = createOptimizedPicture(img.src, img.alt, isLcp, [{ media: '(min-width: 900px)', width: '2000' }, { width: '900' }]);
        if (isLcp) optimized.querySelector('img').setAttribute('fetchpriority', 'high');
        (pic || img).replaceWith(optimized);
        thumbImg = createOptimizedPicture(img.src, '', false, [{ width: '400' }]);
      }
      slide.append(imageCell);
    }

    if (contentCell) {
      const heading = buildContent(contentCell, idx, rows.length, isSingle);
      if (heading) {
        if (!heading.id) heading.id = `${id}-heading-${idx}`;
        slide.setAttribute('aria-labelledby', heading.id);
      }
      slide.append(contentCell);
    }
    slidesList.append(slide);

    if (thumbList) {
      const li = document.createElement('li');
      const thumb = document.createElement('button');
      thumb.type = 'button';
      thumb.className = `${BLOCK}-thumb`;
      thumb.dataset.targetSlide = idx;
      thumb.setAttribute('aria-controls', slide.id);
      thumb.setAttribute('aria-label', `${placeholders.showSlide || 'Show Slide'} ${idx + 1} ${placeholders.of || 'of'} ${rows.length}${label ? `: ${label}` : ''}`);
      const span = document.createElement('span');
      span.className = `${BLOCK}-thumb-label`;
      span.textContent = label;
      thumb.append(span);
      if (thumbImg) {
        const frame = document.createElement('span');
        frame.className = `${BLOCK}-thumb-image`;
        frame.append(thumbImg);
        thumb.append(frame);
      }
      li.append(thumb);
      thumbList.append(li);
    }
    row.remove();
  });

  container.append(slidesList);
  block.prepend(container);
  disambiguateLinks(block, `.${BLOCK}-slide`);
  setActive(block, 0);
  if (!isSingle) bindEvents(block);
}
