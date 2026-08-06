import { createOptimizedPicture } from '../../scripts/aem.js';

const SCROLL_END_THRESHOLD = 4;

function buildNav() {
  const nav = document.createElement('div');
  nav.className = 'carousel-nav';
  nav.innerHTML = `
    <button type="button" class="carousel-action carousel-action-prev" aria-label="Previous listings">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path fill="none" d="M20 28 8.7 16.7a1 1 0 0 1 0-1.4L20 4"></path></svg>
    </button>
    <button type="button" class="carousel-action carousel-action-next" aria-label="Next listings">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path fill="none" d="m12 4 11.3 11.3a1 1 0 0 1 0 1.4L12 28"></path></svg>
    </button>
  `;
  return nav;
}

// AEM wraps a cell's loose content in a single <p>, with multiple authored
// lines separated by <br> rather than split into their own <p> elements.
function splitIntoLines(container) {
  const paragraphs = [...container.querySelectorAll(':scope > p')];
  if (paragraphs.length !== 1) return paragraphs;

  const [combined] = paragraphs;
  const lines = [];
  let current = document.createElement('p');
  [...combined.childNodes].forEach((node) => {
    if (node.nodeName === 'BR') {
      lines.push(current);
      current = document.createElement('p');
    } else {
      current.append(node);
    }
  });
  lines.push(current);
  combined.replaceWith(...lines);
  return lines;
}

function buildCard(row) {
  const li = document.createElement('li');
  li.className = 'carousel-item';
  while (row.firstElementChild) li.append(row.firstElementChild);

  const [imageCell, bodyCell] = li.children;
  if (imageCell) imageCell.className = 'carousel-card-image';
  if (bodyCell) bodyCell.className = 'carousel-card-body';

  const paragraphs = bodyCell ? splitIntoLines(bodyCell) : [];
  const badge = paragraphs.find((p) => !p.querySelector('a') && p.querySelector('strong'));
  const titlePara = paragraphs.find((p) => p.querySelector('a'));
  const priceLine = paragraphs.find((p) => p !== badge && p !== titlePara);

  if (badge) {
    badge.className = 'carousel-card-badge';
    imageCell?.append(badge);
  }

  // Price line is authored as "<price> for <n> nights · <rating>"; the
  // rating moves up next to the title, matching Airbnb's card layout.
  let ratingText = '';
  if (priceLine) {
    const text = priceLine.textContent;
    const separatorIndex = text.indexOf('·');
    const priceText = separatorIndex === -1 ? text : text.slice(0, separatorIndex).trim();
    if (separatorIndex !== -1) ratingText = text.slice(separatorIndex + 1).trim();

    const [amount, ...rest] = priceText.trim().split(' ');
    priceLine.textContent = '';
    const amountEl = document.createElement('span');
    amountEl.className = 'carousel-card-price-amount';
    amountEl.textContent = amount;
    priceLine.append(amountEl, ` ${rest.join(' ')}`);
    priceLine.classList.add('carousel-card-meta');
  }

  if (titlePara) {
    const title = document.createElement('h3');
    title.className = 'carousel-card-title';

    const titleText = document.createElement('span');
    titleText.className = 'carousel-card-title-text';
    titleText.append(...titlePara.childNodes);
    title.append(titleText);

    if (ratingText) {
      const rating = document.createElement('span');
      rating.className = 'carousel-card-rating';
      rating.textContent = ratingText;
      title.append(rating);
    }

    titlePara.replaceWith(title);
  }

  if (imageCell) {
    const favorite = document.createElement('span');
    favorite.className = 'carousel-card-favorite';
    favorite.setAttribute('aria-hidden', 'true');
    favorite.innerHTML = '&#9825;';
    imageCell.append(favorite);
  }

  return li;
}

export default function decorate(block) {
  const rows = [...block.children];
  const headerRow = rows.shift();
  const titleCell = headerRow?.querySelector('div');
  const seeAllLink = titleCell?.querySelector('a');
  const seeAllHref = seeAllLink?.getAttribute('href');
  seeAllLink?.remove();

  const title = document.createElement('h2');
  title.className = 'carousel-title';
  if (titleCell) title.append(...titleCell.childNodes);
  if (seeAllHref) {
    const arrow = document.createElement('a');
    arrow.className = 'carousel-seeall-arrow';
    arrow.href = seeAllHref;
    arrow.setAttribute('aria-label', 'See all');
    arrow.innerHTML = '&#8594;';
    title.append(arrow);
  }

  const header = document.createElement('div');
  header.className = 'carousel-header';
  header.append(title, buildNav());

  const track = document.createElement('ul');
  track.className = 'carousel-track';
  rows.forEach((row) => track.append(buildCard(row)));

  if (seeAllHref) {
    const li = document.createElement('li');
    li.className = 'carousel-item carousel-seeall-card';
    li.innerHTML = `<a href="${seeAllHref}"><span>See all</span></a>`;
    track.append(li);
  }

  track.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '400' }]));
  });

  block.replaceChildren(header, track);

  const prevBtn = header.querySelector('.carousel-action-prev');
  const nextBtn = header.querySelector('.carousel-action-next');

  function updateButtonStates() {
    const maxScroll = track.scrollWidth - track.clientWidth;
    prevBtn.disabled = track.scrollLeft <= SCROLL_END_THRESHOLD;
    nextBtn.disabled = track.scrollLeft >= maxScroll - SCROLL_END_THRESHOLD || maxScroll <= 0;
  }

  function scrollByGroup(direction) {
    const scrollAmount = direction * track.clientWidth * 0.9;
    track.scrollLeft += scrollAmount;
  }

  prevBtn.addEventListener('click', () => scrollByGroup(-1));
  nextBtn.addEventListener('click', () => scrollByGroup(1));
  track.addEventListener('scroll', updateButtonStates, { passive: true });
  window.addEventListener('resize', updateButtonStates);

  // Watch for track size changes (e.g., when images load) to update button states
  const resizeObserver = new ResizeObserver(updateButtonStates);
  resizeObserver.observe(track);

  updateButtonStates();
}
