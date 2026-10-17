// desktop nav (inline bar + hover flyouts) from 1200px; hamburger menu below
const isDesktop = window.matchMedia('(width >= 1200px)');

/**
 * Loads the nav fragment. Metadata-independent: /content first (local preview),
 * then the site root (DA/EDS publish).
 * @returns {Promise<Element|null>} wrapper holding the fragment sections
 */
async function loadNavFragment() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = await resp.text();
  // resolve relative image paths against the fragment location
  wrapper.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), resp.url).href;
  });
  return wrapper;
}

function isExternal(a) {
  try {
    return new URL(a.href, window.location.href).host !== window.location.host
      && /^https?:/.test(a.getAttribute('href'));
  } catch (e) {
    return false;
  }
}

function markExternalLinks(scope) {
  scope.querySelectorAll('a[href]').forEach((a) => {
    if (!isExternal(a)) return;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.classList.add('nav-external');
    a.setAttribute('aria-describedby', 'nav-new-tab-hint');
  });
}

function closeFlyouts(navBar, except) {
  navBar.querySelectorAll('.nav-item[aria-expanded="true"], .nav-item.is-open').forEach((item) => {
    if (item === except) return;
    item.classList.remove('is-open');
    item.querySelector('.nav-item-toggle')?.setAttribute('aria-expanded', 'false');
  });
}

/**
 * Turns each top-level list item (link + nested list + optional image) into a
 * nav item with a flyout panel.
 */
/**
 * Published fragments wrap a list item's link in a <p> when the item also holds a
 * sub-list; unwrap it so the link is a direct child (same as local plain HTML).
 */
function unwrapItemLink(li) {
  const p = li.querySelector(':scope > p');
  if (p && p.children.length === 1 && p.firstElementChild.tagName === 'A' && p.textContent.trim() === p.firstElementChild.textContent.trim()) {
    p.replaceWith(p.firstElementChild);
  }
  return li.querySelector(':scope > a');
}

function buildNavItems(list) {
  const items = [...list.children];
  items.forEach((li, idx) => {
    li.className = 'nav-item';
    const link = unwrapItemLink(li);
    const subList = li.querySelector(':scope > ul');
    if (link) link.className = 'nav-item-link';
    if (!subList) return;

    const flyoutId = `nav-flyout-${idx}`;
    const flyout = document.createElement('div');
    flyout.className = 'nav-flyout';
    flyout.id = flyoutId;
    subList.className = 'nav-flyout-links';
    // content wrapper > items column + image column (mirrors source flyout structure)
    const content = document.createElement('div');
    content.className = 'nav-flyout-content';
    const itemsCol = document.createElement('div');
    itemsCol.className = 'nav-flyout-items';
    itemsCol.append(subList);
    content.append(itemsCol);
    flyout.append(content);
    const pic = li.querySelector(':scope > p img');
    if (pic) {
      const imageWrap = document.createElement('div');
      imageWrap.className = 'nav-flyout-image';
      pic.loading = 'lazy';
      pic.setAttribute('fetchpriority', 'low');
      const picP = pic.closest('p');
      imageWrap.append(pic.closest('picture') || pic);
      content.append(imageWrap);
      picP?.remove();
    }
    li.append(flyout);
    li.classList.add('nav-item-parent');

    // the label stays a link (navigates); a separate toggle exposes the panel to keyboard/touch
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'nav-item-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', flyoutId);
    toggle.setAttribute('aria-label', `${link?.textContent.trim() || ''} menu`);
    link?.after(toggle);

    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      if (isDesktop.matches) closeFlyouts(list, li);
      toggle.setAttribute('aria-expanded', String(open));
      li.classList.toggle('is-open', open);
    });

    li.addEventListener('mouseenter', () => {
      if (!isDesktop.matches) return;
      closeFlyouts(list, li);
      li.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
    });
    li.addEventListener('mouseleave', () => {
      if (!isDesktop.matches) return;
      li.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/**
 * Builds the search drawer (native modal dialog) from the tools section:
 * first image = trigger icon, h2 = drawer title, h3 + ul = quick-link groups.
 */
function buildSearch(tools) {
  const icon = tools.querySelector('img');
  const title = tools.querySelector('h2');

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'nav-search-trigger';
  trigger.setAttribute('aria-label', icon?.alt || title?.textContent || 'Search');
  trigger.setAttribute('aria-haspopup', 'dialog');
  if (icon) {
    icon.alt = '';
    icon.closest('p')?.remove();
    trigger.append(icon);
  }

  const dialog = document.createElement('dialog');
  dialog.className = 'nav-search';
  const titleId = 'nav-search-title';
  dialog.setAttribute('aria-labelledby', titleId);

  const head = document.createElement('div');
  head.className = 'nav-search-head';
  const heading = document.createElement('h2');
  heading.id = titleId;
  heading.textContent = title?.textContent.trim() || 'Search';
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'nav-search-close';
  close.setAttribute('aria-label', `Close ${heading.textContent}`);
  head.append(heading, close);

  const form = document.createElement('form');
  form.className = 'nav-search-form';
  form.setAttribute('role', 'search');
  form.action = '/search';
  const label = document.createElement('label');
  label.className = 'visually-hidden';
  label.htmlFor = 'nav-search-input';
  label.textContent = heading.textContent;
  const input = document.createElement('input');
  input.type = 'search';
  input.id = 'nav-search-input';
  input.name = 'q';
  input.placeholder = heading.textContent;
  input.autocomplete = 'off';
  input.maxLength = 100;
  const go = document.createElement('button');
  go.type = 'submit';
  go.className = 'nav-search-go';
  go.textContent = 'Go';
  form.append(label, input, go);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    // matches the source site's search results URL format
    window.location.href = `/search#e=0&q=${encodeURIComponent(q)}`;
  });

  const body = document.createElement('div');
  body.className = 'nav-search-body';
  body.append(form);
  title?.remove();
  [...tools.querySelectorAll('h3')].forEach((h) => {
    const group = document.createElement('div');
    group.className = 'nav-search-group';
    const list = h.nextElementSibling?.tagName === 'UL' ? h.nextElementSibling : null;
    group.append(h);
    if (list) group.append(list);
    body.append(group);
  });
  markExternalLinks(body);
  dialog.append(head, body);

  trigger.addEventListener('click', () => {
    dialog.showModal();
    input.focus();
  });
  close.addEventListener('click', () => dialog.close());
  // click on the backdrop closes the drawer
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => trigger.focus());

  return { trigger, dialog };
}

function toggleMenu(nav, open) {
  const show = open && !isDesktop.matches;
  nav.setAttribute('aria-expanded', String(show));
  nav.querySelector('.nav-hamburger button')?.setAttribute('aria-expanded', String(show));
  document.body.style.overflowY = show ? 'hidden' : '';
  if (show) nav.querySelector('.nav-menu-close')?.focus();
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await loadNavFragment();
  block.textContent = '';
  if (!fragment) return;

  const [brandSection, sectionsSection, toolsSection] = [...fragment.querySelectorAll(':scope > div')];

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main');
  nav.setAttribute('aria-expanded', 'false');

  // skip link: first in-page anchor of the brand section
  const skip = brandSection?.querySelector('a[href^="#"]');
  if (skip) {
    skip.className = 'nav-skip-link';
    skip.closest('p')?.remove();
    const main = document.querySelector('main');
    const targetId = skip.getAttribute('href').slice(1);
    if (main && targetId && !document.getElementById(targetId)) {
      main.id = targetId;
      main.tabIndex = -1;
    }
  }

  const brand = document.createElement('div');
  brand.className = 'nav-brand';
  const brandLink = brandSection?.querySelector('a:not([href^="#"])');
  if (brandLink) {
    // first image = full wordmark, second (optional) = compact mark for small screens
    const [logo, mark] = brandLink.querySelectorAll('img');
    brandLink.setAttribute('aria-label', logo?.alt || 'Home');
    if (logo) {
      logo.alt = '';
      logo.className = 'nav-brand-logo';
      logo.width = 312;
      logo.height = 32;
    }
    if (mark) {
      mark.alt = '';
      mark.className = 'nav-brand-mark';
      mark.width = 37;
      mark.height = 32;
    }
    brand.append(brandLink);
  }

  const bar = document.createElement('div');
  bar.className = 'nav-bar';
  const sections = document.createElement('div');
  sections.className = 'nav-sections';
  const list = sectionsSection?.querySelector(':scope > ul');
  if (list) {
    list.className = 'nav-list';
    buildNavItems(list);
    // top-level labels open in a new tab when external but carry no icon (as on source)
    list.querySelectorAll('.nav-flyout').forEach((f) => markExternalLinks(f));
    list.querySelectorAll(':scope > li > .nav-item-link').forEach((a) => {
      if (isExternal(a)) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
    });
    sections.append(list);
  }

  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  hamburger.innerHTML = `<button type="button" aria-controls="nav-sections" aria-expanded="false" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  const hamburgerButton = hamburger.querySelector('button');
  hamburgerButton.addEventListener('click', () => toggleMenu(nav, true));

  sections.id = 'nav-sections';
  const closeMenu = document.createElement('button');
  closeMenu.type = 'button';
  closeMenu.className = 'nav-menu-close';
  closeMenu.setAttribute('aria-label', 'Close navigation');
  closeMenu.addEventListener('click', () => {
    toggleMenu(nav, false);
    hamburgerButton.focus();
  });
  sections.prepend(closeMenu);

  bar.append(hamburger, sections);

  let dialog;
  if (toolsSection) {
    const tools = document.createElement('div');
    tools.className = 'nav-tools';
    const search = buildSearch(toolsSection);
    tools.append(search.trigger);
    bar.append(tools);
    ({ dialog } = search);
  }

  // shared description for links that open in a new tab
  const newTabHint = document.createElement('span');
  newTabHint.id = 'nav-new-tab-hint';
  newTabHint.className = 'visually-hidden';
  newTabHint.textContent = 'Opens in a new tab';

  nav.append(brand, bar, newTabHint);
  if (skip) nav.prepend(skip);
  if (dialog) nav.append(dialog);

  // close flyouts with Escape and when focus leaves the nav
  nav.addEventListener('keydown', (e) => {
    if (e.code !== 'Escape') return;
    const open = nav.querySelector('.nav-item.is-open');
    if (open) {
      closeFlyouts(nav);
      open.querySelector('.nav-item-toggle')?.focus();
    } else if (!isDesktop.matches && nav.getAttribute('aria-expanded') === 'true') {
      toggleMenu(nav, false);
      hamburgerButton.focus();
    }
  });
  nav.addEventListener('focusout', (e) => {
    if (isDesktop.matches && !nav.contains(e.relatedTarget)) closeFlyouts(nav);
  });

  // reset state when crossing the desktop breakpoint
  isDesktop.addEventListener('change', () => {
    closeFlyouts(nav);
    toggleMenu(nav, false);
  });

  // white logo needs a dark hero behind it; otherwise use the solid bar style
  const firstSection = document.querySelector('main > .section, main > div');
  if (!firstSection?.querySelector('.hero-banner, .carousel-thumbnails')) block.classList.add('header-solid');

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
