// Each authored row starts with a label cell naming the row ("Host", "Feature",
// "Description", "CTA"); the remaining cells carry the content.
const getLabel = (row) => row.children[0]?.textContent.trim().toLowerCase() || '';

const getCells = (row) => [...row.children].slice(1);

const getText = (cell) => {
  if (!cell) return '';

  const clone = cell.cloneNode(true);
  clone.querySelectorAll('img, picture').forEach((el) => el.remove());

  return clone.textContent.replace(/\s+/g, ' ').trim();
};

// The source document bolds every cell, so <strong> carries no meaning here and
// is unwrapped to let CSS own the weight. Other inline markup (links) is kept.
const getRichText = (cell) => {
  if (!cell) return '';

  const clone = cell.cloneNode(true);
  clone.querySelectorAll('strong, b').forEach((el) => el.replaceWith(...el.childNodes));

  return clone.innerHTML.trim();
};

const getImage = (cell) => {
  const img = cell?.querySelector('img');
  return img ? `<img src="${img.src}" alt="${img.alt || ''}" loading="lazy">` : '';
};

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const rowsLabelled = (name) => rows.filter((row) => getLabel(row) === name);

  const host = getCells(rowsLabelled('host')[0] || rows[0]);
  const features = rowsLabelled('feature').map(getCells);
  const descriptions = rowsLabelled('description').map(getCells);
  const [cta] = getCells(rowsLabelled('cta')[0]) || [];

  const hostMarkup = `
    <div class="listing-details-host">
      <div class="listing-details-avatar">${getImage(host[0])}</div>
      <div>
        <div class="listing-details-host-title">${getText(host[1])}</div>
        <div class="listing-details-host-meta">${getText(host[2])}</div>
      </div>
    </div>
  `;

  const featuresMarkup = features.length ? `
    <div class="listing-details-features">
      ${features.map((feature) => `
        <div class="listing-details-feature">
          <div class="listing-details-feature-icon">${getImage(feature[0])}</div>
          <div>
            <div class="listing-details-feature-title">${getText(feature[1])}</div>
            <div class="listing-details-feature-description">${getText(feature[2])}</div>
          </div>
        </div>
      `).join('')}
    </div>
  ` : '';

  const descriptionMarkup = descriptions.length ? `
    <div class="listing-details-description">
      ${descriptions.map(([cell]) => getRichText(cell)).join('')}
      ${cta ? `<button class="listing-details-show-more" type="button">${getText(cta)}</button>` : ''}
    </div>
  ` : '';

  block.innerHTML = hostMarkup + featuresMarkup + descriptionMarkup;
}
