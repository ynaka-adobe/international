/*
 * Video Poster Block
 * Poster image with a play button; the video embed (YouTube, Vimeo or a
 * video file) is only created when the visitor clicks play, so no
 * third-party scripts load up front.
 *
 * Authoring: one row, one cell: poster picture (optional) + link to the video.
 * The link text (when it is not just the URL) or the poster alt text is used
 * as the video title for the play button label and the iframe title.
 */
import { createOptimizedPicture } from '../../scripts/aem.js';

function getYoutubeId(url) {
  const host = url.hostname.replace(/^www\./, '');
  if (host === 'youtu.be') return url.pathname.split('/')[1] || '';
  if (!host.endsWith('youtube.com') && !host.endsWith('youtube-nocookie.com')) return '';
  if (url.searchParams.get('v')) return url.searchParams.get('v');
  const match = url.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/);
  return match ? match[1] : '';
}

function getVimeoId(url) {
  if (!url.hostname.endsWith('vimeo.com')) return '';
  const match = url.pathname.match(/\/(?:video\/)?(\d+)/);
  return match ? match[1] : '';
}

function createIframe(src, title) {
  const iframe = document.createElement('iframe');
  iframe.src = src;
  iframe.title = title;
  iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope');
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
  return iframe;
}

function createPlayer(url, title) {
  const youtubeId = getYoutubeId(url);
  if (youtubeId) {
    const params = new URLSearchParams({ autoplay: '1', rel: '0', playsinline: '1' });
    const start = url.searchParams.get('t') || url.searchParams.get('start');
    if (start) params.set('start', String(parseInt(start, 10) || 0));
    return createIframe(`https://www.youtube.com/embed/${encodeURIComponent(youtubeId)}?${params}`, title);
  }

  const vimeoId = getVimeoId(url);
  if (vimeoId) {
    return createIframe(`https://player.vimeo.com/video/${encodeURIComponent(vimeoId)}?autoplay=1`, title);
  }

  const video = document.createElement('video');
  video.controls = true;
  video.autoplay = true;
  video.playsInline = true;
  video.setAttribute('aria-label', title);
  const source = document.createElement('source');
  source.src = url.href;
  const ext = url.pathname.split('.').pop().toLowerCase();
  if (['mp4', 'webm', 'ogg'].includes(ext)) source.type = `video/${ext}`;
  video.append(source);
  return video;
}

function getTitle(link, img) {
  const text = link.textContent.trim();
  const looksLikeUrl = !text || /^(https?:)?\/\//i.test(text) || text === link.href;
  if (!looksLikeUrl) return text;
  if (link.title) return link.title.trim();
  return img?.alt?.trim() || '';
}

export default function decorate(block) {
  const link = block.querySelector('a[href]');
  if (!link) return;

  const img = block.querySelector('picture img, img');
  const title = getTitle(link, img);
  let url;
  try {
    url = new URL(link.getAttribute('href'), window.location.href);
  } catch (e) {
    return;
  }

  const frame = document.createElement('div');
  frame.className = 'video-poster-frame';

  if (img) {
    // createOptimizedPicture keeps only the path, so reuse cross-origin pictures as authored
    const sameOrigin = new URL(img.src, window.location.href).origin === window.location.origin;
    const picture = sameOrigin
      ? createOptimizedPicture(img.src, img.alt || '', false, [
        { media: '(min-width: 600px)', width: '2000' },
        { width: '750' },
      ])
      : img.closest('picture') || img;
    picture.classList.add('video-poster-image');
    frame.append(picture);
  } else {
    block.classList.add('no-poster');
  }

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'video-poster-play';
  button.setAttribute('aria-label', title ? `Play video: ${title}` : 'Play video');
  frame.append(button);

  button.addEventListener('click', () => {
    const player = createPlayer(url, title || 'Video player');
    player.classList.add('video-poster-player');
    frame.replaceChildren(player);
    block.classList.add('is-playing');
    player.focus();
  }, { once: true });

  block.replaceChildren(frame);
}
