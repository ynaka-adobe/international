import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-category-card-image';
      else div.className = 'cards-category-card-body';
    });
    /* whole tile is clickable when the tile has a link (stretched via CSS) */
    if (li.querySelector('.cards-category-card-body a[href]')) li.classList.add('cards-category-card-linked');
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    /* inline SVG icons (data URIs) cannot go through the image optimizer */
    if (img.src.startsWith('data:') || /\.svg(\?|$)/i.test(img.src)) return;
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
