/*
 * inventory-detail
 * Auto-injected on /products/trucks/inventory/* pages (see
 * buildInventoryDetailBlock in scripts/scripts.js). The Edge Commerce Product
 * Pipeline server-renders only a minimal h1, picture and description; this
 * block rebuilds the page as a truck detail layout from the product's own
 * `.json` record: gallery, headline facts, dealer card, specification groups
 * and description. Without a record (or if the fetch fails) the pipeline
 * content is left as rendered.
 *
 * Record shape (custom): price, vin, dealer { name, address, phone, website,
 * url }, technicalSpecifications [{ group, items: [[label, value], ...] }],
 * fullDescription.
 */

const BLOCK = 'inventory-detail';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

function safeHref(url) {
  try {
    const { protocol } = new URL(url, window.location.href);
    return ['http:', 'https:', 'tel:'].includes(protocol) ? url : '';
  } catch (e) {
    return '';
  }
}

function link(href, text, className) {
  const a = el('a', className, text);
  const safe = safeHref(href);
  if (safe) {
    a.href = safe;
    if (/^https?:\/\/(?!www\.international\.com)/.test(safe)) {
      a.target = '_blank';
      a.rel = 'noopener';
    }
  }
  return a;
}

function buildGallery(images, name) {
  const gallery = el('div', `${BLOCK}-gallery`);
  const main = el('div', `${BLOCK}-gallery-main`);
  const mainImg = el('img');
  mainImg.alt = name;
  main.append(mainImg);
  const thumbs = el('ul', `${BLOCK}-gallery-thumbs`);

  const show = (image, button) => {
    mainImg.src = image.url;
    mainImg.alt = image.label || name;
    thumbs.querySelectorAll('button').forEach((b) => b.setAttribute('aria-current', String(b === button)));
  };

  images.forEach((image, i) => {
    const li = el('li');
    const button = el('button');
    button.type = 'button';
    button.setAttribute('aria-label', `Show image ${i + 1} of ${images.length}`);
    const thumb = el('img');
    thumb.src = image.url;
    thumb.alt = '';
    thumb.loading = 'lazy';
    button.append(thumb);
    button.addEventListener('click', () => show(image, button));
    li.append(button);
    thumbs.append(li);
  });

  gallery.append(main);
  if (images.length > 1) gallery.append(thumbs);
  if (images.length) show(images[0], thumbs.querySelector('button'));
  return gallery;
}

function buildFacts(specs, price) {
  const wanted = ['GVWR', 'Engine', 'Horsepower', 'Transmission'];
  const flat = {};
  (specs || []).forEach(({ group, items }) => (items || []).forEach(([label, value]) => {
    if (label === 'Manufacturer' || label === 'Model' || label === 'Speeds') {
      flat[`${group} ${label}`] = value;
    } else {
      flat[label] = value;
    }
  }));
  const facts = [];
  if (price) facts.push(['Price', price]);
  if (flat.GVWR) facts.push(['GVWR', flat.GVWR]);
  if (flat['Engine Manufacturer']) facts.push(['Engine', `${flat['Engine Manufacturer']} ${flat['Engine Model'] || ''}`.trim()]);
  if (flat.Horsepower) facts.push(['Horsepower', flat.Horsepower]);
  if (flat['Transmission Manufacturer']) {
    const speeds = flat['Transmission Speeds'] ? ` ${flat['Transmission Speeds']}-speed` : '';
    facts.push(['Transmission', `${flat['Transmission Manufacturer']}${speeds}`]);
  }
  if (!facts.length) return null;
  const dl = el('dl', `${BLOCK}-facts`);
  facts.filter(([label]) => label === 'Price' || wanted.includes(label)).forEach(([label, value]) => {
    const row = el('div');
    row.append(el('dt', '', label), el('dd', '', value));
    dl.append(row);
  });
  return dl;
}

function buildDealer(dealer) {
  if (!dealer || !dealer.name) return null;
  const card = el('div', `${BLOCK}-dealer`);
  card.append(el('h2', '', 'Dealership'), el('p', `${BLOCK}-dealer-name`, dealer.name));
  if (dealer.address) card.append(el('p', '', dealer.address));
  if (dealer.phone) card.append(link(`tel:${dealer.phone.replace(/[^\d+]/g, '')}`, dealer.phone));
  if (dealer.website) card.append(link(dealer.website, dealer.website.replace(/^https?:\/\//, '')));
  if (dealer.url) card.append(link(dealer.url, 'Dealer details', `${BLOCK}-dealer-more`));
  return card;
}

function buildSpecs(groups) {
  if (!Array.isArray(groups) || !groups.length) return null;
  const section = el('section', `${BLOCK}-specs`);
  section.append(el('h2', '', 'Specifications'));
  groups.forEach(({ group, items }, i) => {
    const details = el('details');
    if (i === 0) details.open = true;
    details.append(el('summary', '', group));
    const dl = el('dl');
    (items || []).forEach(([label, value]) => {
      const row = el('div');
      row.append(el('dt', '', label), el('dd', '', value));
      dl.append(row);
    });
    details.append(dl);
    section.append(details);
  });
  return section;
}

function pipelineContent(main, block) {
  const h1 = main.querySelector('h1');
  const description = [...main.querySelectorAll('p')].find((p) => !block.contains(p) && p.textContent.trim());
  return { h1, description };
}

export default async function decorate(block) {
  const main = block.closest('main') || document.querySelector('main');
  const { h1, description } = pipelineContent(main, block);
  const path = window.location.pathname.replace(/\.html$/, '');

  let data;
  try {
    const resp = await fetch(`${path}.json`);
    if (!resp.ok) throw new Error(`Product data request failed: ${resp.status}`);
    data = await resp.json();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('inventory-detail: could not load product data', err);
    block.remove();
    return;
  }

  const custom = data.custom || {};
  const name = data.name || h1?.textContent || '';
  block.textContent = '';

  const layout = el('div', `${BLOCK}-layout`);
  layout.append(buildGallery(data.images || [], name));

  const info = el('div', `${BLOCK}-info`);
  info.append(el('h1', '', name));
  const facts = buildFacts(custom.technicalSpecifications, custom.price);
  if (facts) info.append(facts);
  if (custom.dealer?.phone) {
    info.append(link(`tel:${custom.dealer.phone.replace(/[^\d+]/g, '')}`, 'Contact Seller', 'button'));
  }
  const dealer = buildDealer(custom.dealer);
  if (dealer) info.append(dealer);
  layout.append(info);
  block.append(layout);

  const specs = buildSpecs(custom.technicalSpecifications);
  if (specs) block.append(specs);

  const text = custom.fullDescription;
  if (text) {
    const desc = el('section', `${BLOCK}-description`);
    desc.append(el('h2', '', 'Description'), el('p', '', text));
    block.append(desc);
  }

  // the pipeline's own minimal h1 / picture / description are replaced
  [h1, description].forEach((node) => node?.closest('.section')?.remove());
  main.querySelectorAll(':scope > .section:not(:has(.inventory-detail))').forEach((s) => {
    if (!s.querySelector('.block') && !s.textContent.trim()) s.remove();
  });
}
