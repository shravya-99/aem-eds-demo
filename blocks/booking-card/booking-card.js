// Each authored row starts with a label cell naming the row ("Fees", "Price",
// "Dates", "Guests", "CTA", "Message", "Report"); the rest carry the content.
const getLabel = (row) => row.children[0]?.textContent.trim().toLowerCase() || '';

const getCells = (row) => (row ? [...row.children].slice(1) : []);

const getText = (cell) => cell?.textContent.replace(/\s+/g, ' ').trim() || '';

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
  const cellsFor = (name) => getCells(rows.find((row) => getLabel(row) === name));

  const fees = cellsFor('fees');
  const price = cellsFor('price');
  const dates = cellsFor('dates');
  const guests = cellsFor('guests');
  const cta = cellsFor('cta');
  const message = cellsFor('message');
  const report = cellsFor('report');

  // dates are authored as label/value pairs so a missing checkout value collapses
  // to an empty field rather than shifting the checkout label into the value slot
  const datePairs = [[dates[0], dates[1]], [dates[2], dates[3]]]
    .filter(([label]) => getText(label));

  block.innerHTML = `
    ${getText(fees[1]) ? `
      <div class="booking-card-fees">
        <span class="booking-card-fees-icon">${getImage(fees[0])}</span>
        <strong>${getText(fees[1])}</strong>
      </div>
    ` : ''}

    <div class="booking-card-card">
      <div class="booking-card-price">
        ${getText(price[0]) ? `<s>${getText(price[0])}</s>` : ''}
        <strong>${getText(price[1])}</strong>
        <span>${getText(price[2])}</span>
      </div>

      <div class="booking-card-dates">
        ${datePairs.map(([label, value]) => `
          <div class="booking-card-date">
            <strong>${getText(label)}</strong>
            <span>${getText(value)}</span>
          </div>
        `).join('')}
      </div>

      <button class="booking-card-guests" type="button">
        <span>
          <strong>${getText(guests[0])}</strong>
          <span>${getText(guests[1])}</span>
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="2" d="m2 5 6 6 6-6"/></svg>
      </button>

      <button class="booking-card-reserve" type="button">${getText(cta[0])}</button>

      <p class="booking-card-message">${getText(message[0])}</p>
    </div>

    ${getText(report[1]) ? `
      <a class="booking-card-report" href="#">
        <span class="booking-card-report-icon">${getImage(report[0])}</span>
        <span>${getText(report[1])}</span>
      </a>
    ` : ''}
  `;
}
