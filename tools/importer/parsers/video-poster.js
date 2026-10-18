/* eslint-disable */
/* global WebImporter */

/**
 * Parser for video-poster.
 * Source: Sitecore SXA div.video (div.component.video, div.video.video-promo)
 *   .video-promo-title (optional title above the player)
 *   .sxa-video-wrapper > video[poster] > source[type="video/youtube"][src="//www.youtube.com/watch?v=..."]
 *     + .video-init (play overlay; in the live DOM it may hold the poster <img>)
 *   .video-caption (optional h5 caption) + .video-description (optional copy)
 * Every video on the site is a YouTube video; the URL comes from the <source>
 * (fallbacks: video[src], iframe[src], data attributes, YouTube links).
 * Target table (1 column), one row:
 *   poster image (when the source has one) + link to the video URL
 *   (link text = video title when known, else the URL)
 * The title goes before the block, caption and description after it, as default content.
 */

const textOf = (el) => (el ? el.textContent.replace(/[\s ]+/g, ' ').trim() : '');

function absolute(url) {
  if (!url) return '';
  const u = url.trim();
  if (u.startsWith('//')) return `https:${u}`;
  return u;
}

/** YouTube embed / short URLs -> canonical watch URL. */
function normalizeVideoUrl(url) {
  const u = absolute(url);
  const embed = u.match(/youtube(?:-nocookie)?\.com\/embed\/([\w-]{6,})/);
  if (embed) return `https://www.youtube.com/watch?v=${embed[1]}`;
  return u;
}

function videoUrl(element) {
  const candidates = [];
  element.querySelectorAll('video source[src]').forEach((s) => candidates.push(s.getAttribute('src')));
  element.querySelectorAll('video[src]').forEach((v) => candidates.push(v.getAttribute('src')));
  element.querySelectorAll('iframe[src], iframe[data-src]').forEach((f) => candidates.push(f.getAttribute('src') || f.getAttribute('data-src')));
  element.querySelectorAll('[data-video-src], [data-video-url], [data-src*="youtu"], [data-url*="youtu"]').forEach((el) => {
    candidates.push(el.getAttribute('data-video-src') || el.getAttribute('data-video-url')
      || el.getAttribute('data-src') || el.getAttribute('data-url'));
  });
  element.querySelectorAll('a[href*="youtu"], a[href*="vimeo"]').forEach((a) => candidates.push(a.getAttribute('href')));
  const url = candidates.find((c) => c && /youtu\.?be|vimeo|\.(mp4|webm|ogg)(\?|$)/i.test(c))
    || candidates.find((c) => c && !c.startsWith('blob:'));
  return url ? normalizeVideoUrl(url) : '';
}

function posterImage(element, document, alt) {
  const video = element.querySelector('video');
  const initImg = element.querySelector('.video-init img, .sxa-video-wrapper img, .video-container img');
  let src = video ? (video.getAttribute('poster') || '').trim() : '';
  if (!src && initImg) {
    const s = initImg.getAttribute('src') || initImg.getAttribute('data-src') || '';
    if (s && !s.startsWith('data:')) src = s;
  }
  if (!src) return null;
  const img = document.createElement('img');
  img.src = absolute(src);
  img.alt = (initImg && initImg.getAttribute('alt')) || alt || '';
  return img;
}

/** Description markup -> paragraphs (drops empty / &nbsp; paragraphs). */
function description(el, document) {
  if (!el || !textOf(el)) return [];
  const out = [];
  let para = null;
  const flush = () => {
    if (para && textOf(para)) out.push(para);
    para = null;
  };
  [...el.childNodes].forEach((node) => {
    if (node.nodeType === 1 && /^(P|UL|OL|H[1-6]|BLOCKQUOTE)$/.test(node.tagName)) {
      flush();
      if (textOf(node)) out.push(node);
      return;
    }
    if (node.nodeType === 1 && node.tagName === 'BR') {
      flush();
      return;
    }
    if (node.nodeType !== 1 && node.nodeType !== 3) return;
    if (node.nodeType === 3 && !node.textContent.trim() && !para) return;
    para = para || document.createElement('p');
    para.append(node);
  });
  flush();
  return out;
}

export default function parse(element, { document }) {
  if (!element.parentNode) return;

  const url = videoUrl(element);
  if (!url) return; // nothing playable: leave the markup for default content

  const title = textOf(element.querySelector('.video-promo-title'));
  const caption = element.querySelector('.video-caption');
  const captionHeading = caption && caption.querySelector('h1, h2, h3, h4, h5, h6');
  const label = title || textOf(captionHeading);

  const content = [];
  const poster = posterImage(element, document, label);
  if (poster) content.push(poster);
  const p = document.createElement('p');
  const a = document.createElement('a');
  a.href = url;
  a.textContent = label || url;
  p.append(a);
  content.push(p);

  const before = [];
  if (title) {
    const h3 = document.createElement('h3');
    h3.textContent = title;
    before.push(h3);
  }

  const after = [];
  if (caption && textOf(caption)) {
    if (captionHeading) {
      const h = document.createElement(captionHeading.tagName.toLowerCase());
      h.textContent = textOf(captionHeading);
      after.push(h);
    } else {
      after.push(...description(caption, document));
    }
  }
  after.push(...description(element.querySelector('.video-description'), document));

  const block = WebImporter.Blocks.createBlock(document, { name: 'video-poster', cells: [[content]] });
  element.replaceWith(...before, block, ...after);
}
