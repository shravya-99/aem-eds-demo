import { getMetadata } from '../../scripts/aem.js';

// Each authored row starts with a label cell ("Categories", "Actions", "Search")
// that names the row rather than carrying content, so it is sliced off.
const getCells = (row) => (row ? [...row.children].slice(1) : []);

const getImage = (cell) => {
  const img = cell?.querySelector('img');
  return img ? { src: img.src, alt: img.alt || '' } : null;
};

const getText = (cell) => {
  if (!cell) return '';

  const clone = cell.cloneNode(true);
  clone.querySelectorAll('img, picture').forEach((element) => element.remove());

  return clone.textContent.replace(/\s+/g, ' ').trim();
};

const getLink = (cell) => cell?.querySelector('a')?.href || '#';

const readCell = (cell) => ({
  text: getText(cell),
  image: getImage(cell),
  href: getLink(cell),
});

const renderImage = (image, className) => {
  if (!image) return '';
  return `<img class="${className}" src="${image.src}" alt="${image.alt}" loading="lazy">`;
};

const renderCategory = (item, index) => `
  <a class="header-category${index === 0 ? ' is-active' : ''}" href="${item.href}">
    ${renderImage(item.image, 'header-category-image')}
    <span class="header-category-label">${item.text}</span>
  </a>
`;

const renderRoundButton = (action, ariaLabel) => {
  if (!action) return '';

  const content = action.image
    ? renderImage(action.image, 'header-round-button-image')
    : `<span>${action.text}</span>`;

  return `
    <a class="header-round-button" href="${action.href}" aria-label="${ariaLabel}">
      ${content}
    </a>
  `;
};

const renderSearchField = (label, value) => `
  <button class="header-search-field" type="button">
    <span class="header-search-label">${label}</span>
    <span class="header-search-value">${value}</span>
  </button>
`;

// Fetches the nav document's plain HTML directly rather than going through the
// generic fragment/block-loading pipeline, since the authored block inside it
// is decorated inline below rather than by a separately loaded blockname.js/css.
async function fetchNavBlock(path) {
  const resp = await fetch(`${path}.plain.html`);
  if (!resp.ok) return null;

  const main = document.createElement('div');
  main.innerHTML = await resp.text();

  const resetAttributeBase = (tag, attr) => {
    main.querySelectorAll(`${tag}[${attr}^="./media_"]`).forEach((elem) => {
      elem[attr] = new URL(elem.getAttribute(attr), new URL(path, window.location)).href;
    });
  };
  resetAttributeBase('img', 'src');
  resetAttributeBase('source', 'srcset');

  // first section > first block, whatever the author named it
  return main.firstElementChild?.firstElementChild || null;
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const navBlock = await fetchNavBlock(navPath);
  if (!navBlock) return;

  const [categoriesRow, actionsRow, searchRow] = navBlock.children;

  const categories = getCells(categoriesRow).map(readCell).filter((item) => item.text);
  const actions = getCells(actionsRow).map(readCell).filter((item) => item.text || item.image);
  const search = getCells(searchRow).map((cell) => getText(cell));

  const [
    whereLabel = 'Where',
    whereValue = 'Search destinations',
    whenLabel = 'When',
    whenValue = 'Add dates',
    whoLabel = 'Who',
    whoValue = 'Add guests',
  ] = search;

  const [hostAction, globeAction, menuAction] = actions;

  block.innerHTML = `
    <div class="header-top">
      <a class="header-logo" href="/" aria-label="Airbnb home">
        <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
          <path d="M16 3.2c-2.5 0-4.2 2.1-5.6 4.8L3.9 20.5c-2 3.8-.4 7.2 3.1 8.2 3.1.9 5.5-1.2 7.1-4.4l1.9-3.8 1.9 3.8c1.6 3.2 4 5.3 7.1 4.4 3.5-1 5.1-4.4 3.1-8.2L21.6 8c-1.4-2.7-3.1-4.8-5.6-4.8Zm0 3.2c.8 0 1.6 1 2.5 2.8l6.4 12.4c1.1 2.1.5 3.6-1 4-1.7.5-3.1-.9-4.3-3.3L16 16l-3.6 6.3c-1.2 2.4-2.6 3.8-4.3 3.3-1.5-.4-2.1-1.9-1-4l6.4-12.4C14.4 7.4 15.2 6.4 16 6.4Z"/>
        </svg>
        <span>airbnb</span>
      </a>

      <nav class="header-categories" aria-label="Explore">
        ${categories.map(renderCategory).join('')}
      </nav>

      <div class="header-actions">
        ${hostAction ? `<a class="header-host" href="${hostAction.href}">${hostAction.text}</a>` : ''}
        ${renderRoundButton(globeAction, 'Choose language')}
        ${renderRoundButton(menuAction, 'Open menu')}
      </div>
    </div>

    <div class="header-search" role="search">
      ${renderSearchField(whereLabel, whereValue)}
      <span class="header-search-divider"></span>
      ${renderSearchField(whenLabel, whenValue)}
      <span class="header-search-divider"></span>
      ${renderSearchField(whoLabel, whoValue)}

      <button class="header-search-button" type="button" aria-label="Search">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="10.8" cy="10.8" r="6.8"></circle>
          <path d="m16 16 5 5"></path>
        </svg>
      </button>
    </div>
  `;

  const categoryLinks = [...block.querySelectorAll('.header-category')];
  categoryLinks.forEach((category) => {
    category.addEventListener('click', () => {
      categoryLinks.forEach((item) => item.classList.remove('is-active'));
      category.classList.add('is-active');
    });
  });
}
