/**
 * Loads the footer fragment. Metadata-independent: /content first (local preview),
 * then the site root (DA/EDS publish).
 * @returns {Promise<Element|null>} wrapper holding the fragment sections
 */
async function loadFooterFragment() {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
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
    return /^https?:/.test(a.getAttribute('href')) && new URL(a.href).host !== window.location.host;
  } catch (e) {
    return false;
  }
}

function openExternalInNewTab(scope, withIcon) {
  scope.querySelectorAll('a[href]').forEach((a) => {
    if (!isExternal(a)) return;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.setAttribute('aria-describedby', 'footer-new-tab-hint');
    if (withIcon) a.classList.add('footer-external');
  });
}

/** link columns: each list item = heading link + nested list */
function buildColumns(section) {
  const nav = document.createElement('nav');
  nav.className = 'footer-nav';
  nav.setAttribute('aria-label', 'Footer');
  const list = section.querySelector(':scope > ul');
  if (!list) return nav;
  list.className = 'footer-columns';
  [...list.children].forEach((li, idx) => {
    li.className = 'footer-column';
    const title = li.querySelector(':scope > a');
    const links = li.querySelector(':scope > ul');
    title?.classList.add('footer-column-title');
    if (!links) return;
    links.classList.add('footer-column-links');
    links.id = `footer-column-${idx}`;
    // small screens: columns collapse to an accordion; the title stays a link
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'footer-column-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', links.id);
    toggle.setAttribute('aria-label', `${title?.textContent.trim() || ''} links`);
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      li.classList.toggle('is-open', open);
    });
    const head = document.createElement('div');
    head.className = 'footer-column-head';
    if (title) head.append(title);
    head.append(toggle);
    li.prepend(head);
  });
  openExternalInNewTab(list, true);
  nav.append(list);
  return nav;
}

/** locale selector: paragraph = trigger label, list = options (opens upward) */
function buildLocale(section) {
  const wrap = document.createElement('div');
  wrap.className = 'footer-locale';
  const label = section.querySelector('p')?.textContent.trim() || '';
  const list = section.querySelector('ul');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'footer-locale-toggle';
  button.textContent = label;
  button.setAttribute('aria-expanded', 'false');
  if (list) {
    list.id = 'footer-locale-list';
    list.className = 'footer-locale-list';
    list.hidden = true;
    button.setAttribute('aria-controls', list.id);
    openExternalInNewTab(list, false);
  }
  const setOpen = (open) => {
    button.setAttribute('aria-expanded', String(open));
    if (list) list.hidden = !open;
  };
  button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
  wrap.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      button.focus();
    }
  });
  if (list) wrap.append(list);
  wrap.append(button);
  return wrap;
}

/** social icons: images become masks so the icon can take the link color */
function buildSocial(section) {
  const list = section.querySelector('ul') || document.createElement('ul');
  list.className = 'footer-social';
  list.querySelectorAll('a').forEach((a) => {
    const img = a.querySelector('img');
    a.className = 'footer-social-link';
    if (img) {
      a.setAttribute('aria-label', img.alt);
      a.style.setProperty('--icon', `url("${img.src}")`);
      img.alt = '';
      img.setAttribute('aria-hidden', 'true');
    }
  });
  openExternalInNewTab(list, false);
  return list;
}

/** legal links (with text-only items such as the newsletter CTA) + copyright */
function buildLegal(section) {
  const row = document.createElement('div');
  row.className = 'footer-legal';
  const list = section.querySelector('ul');
  if (list) {
    list.className = 'footer-legal-links';
    [...list.children].forEach((li) => {
      if (!li.querySelector('a')) li.classList.add('footer-legal-text');
    });
    row.append(list);
  }
  const copyright = section.querySelector('p');
  if (copyright) {
    copyright.className = 'footer-copyright';
    row.append(copyright);
  }
  return row;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fragment = await loadFooterFragment();
  block.textContent = '';
  if (!fragment) return;
  const [brandSection, navSection, localeSection, socialSection, legalSection] = [...fragment.querySelectorAll(':scope > div')];

  const footer = document.createElement('div');
  footer.className = 'footer-inner';

  if (brandSection) {
    const brand = document.createElement('div');
    brand.className = 'footer-brand';
    const link = brandSection.querySelector('a');
    const logo = link?.querySelector('img');
    if (link && logo) {
      link.setAttribute('aria-label', logo.alt || 'Home');
      logo.alt = '';
      logo.width = 37;
      logo.height = 32;
      brand.append(link);
    }
    footer.append(brand);
  }

  if (navSection) footer.append(buildColumns(navSection));

  const utility = document.createElement('div');
  utility.className = 'footer-utility';
  if (localeSection) utility.append(buildLocale(localeSection));
  if (socialSection) utility.append(buildSocial(socialSection));
  footer.append(utility);

  footer.append(document.createElement('hr'));
  if (legalSection) footer.append(buildLegal(legalSection));

  const hint = document.createElement('span');
  hint.id = 'footer-new-tab-hint';
  hint.className = 'visually-hidden';
  hint.textContent = 'Opens in a new tab';
  footer.append(hint);

  block.append(footer);
}
