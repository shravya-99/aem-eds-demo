import { createOptimizedPicture } from '../../scripts/aem.js';

const STAR_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false" style="display: block; height: 8px; width: 8px; fill: currentcolor;"><path fill-rule="evenodd" d="m15.1 1.58-4.13 8.88-9.86 1.27a1 1 0 0 0-.54 1.74l7.3 6.57-1.97 9.85a1 1 0 0 0 1.48 1.06l8.62-5 8.63 5a1 1 0 0 0 1.48-1.06l-1.97-9.85 7.3-6.57a1 1 0 0 0-.55-1.73l-9.86-1.28-4.12-8.88a1 1 0 0 0-1.82 0z"></path></svg>';

function buildHeading(titleCell) {
  const heading = document.createElement('div');
  heading.className = 'listing-heading';

  const title = document.createElement('h1');
  title.className = 'listing-title';
  title.append(...(titleCell?.childNodes || []));
  heading.append(title);

  const actions = document.createElement('div');
  actions.className = 'listing-actions';
  actions.innerHTML = `
    <button type="button" class="listing-action listing-action-share">
      <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style="display: block; fill: none; height: 16px; width: 16px; stroke: currentcolor; stroke-width: 2; overflow: visible;"><path d="m27 18v9c0 1.1046-.8954 2-2 2h-18c-1.10457 0-2-.8954-2-2v-9m11-15v21m-10-11 9.2929-9.29289c.3905-.39053 1.0237-.39053 1.4142 0l9.2929 9.29289" fill="none"></path></svg>
    <span>Share</span>
    </button>
    <button type="button" class="listing-action listing-action-save">
      <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style="display: block; fill: none; height: 16px; width: 16px; stroke: currentcolor; stroke-width: 2; overflow: visible;"><path d="m15.9998 28.6668c7.1667-4.8847 14.3334-10.8844 14.3334-18.1088 0-1.84951-.6993-3.69794-2.0988-5.10877-1.3996-1.4098-3.2332-2.11573-5.0679-2.11573-1.8336 0-3.6683.70593-5.0668 2.11573l-2.0999 2.11677-2.0988-2.11677c-1.3995-1.4098-3.2332-2.11573-5.06783-2.11573-1.83364 0-3.66831.70593-5.06683 2.11573-1.39955 1.41083-2.09984 3.25926-2.09984 5.10877 0 7.2244 7.16667 13.2241 14.3333 18.1088z"></path></svg>
    <span>Save</span>
    </button>
  `;

  heading.append(actions);
  return heading;
}

function buildGallery(imagesCell) {
  const gallery = document.createElement('div');
  gallery.className = 'listing-gallery';

  const pictures = imagesCell
    ? [...imagesCell.querySelectorAll('picture')]
    : [];
  pictures.forEach((picture, i) => {
    const optimized = createOptimizedPicture(
      picture.querySelector('img').src,
      picture.querySelector('img').alt,
      i === 0,
      [{ width: i === 0 ? '750' : '400' }],
    );

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'listing-gallery-image';
    button.setAttribute(
      'aria-label',
      optimized.querySelector('img').alt || `Show listing photo ${i + 1}`,
    );
    button.append(optimized);
    gallery.append(button);
  });

  if (pictures.length > 1) {
    const showAll = document.createElement('button');
    showAll.type = 'button';
    showAll.className = 'listing-gallery-showall';
    showAll.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" aria-hidden="true" role="presentation" focusable="false" style="display: block; height: 16px; width: 16px; fill: currentcolor;"><path fill-rule="evenodd" d="M3 11.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-10-5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-10-5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"></path></svg>  
    <span>Show all photos</span>
    `;
    gallery.append(showAll);
  }

  return gallery;
}

function buildInfo(rows) {
  const info = document.createElement('div');
  info.className = 'listing-info';

  const [subtitleRow, metaRow, ratingRow] = rows;

  if (subtitleRow) {
    const subtitle = document.createElement('p');
    subtitle.className = 'listing-subtitle';
    subtitle.append(...subtitleRow.children[0].childNodes);
    info.append(subtitle);
  }

  if (metaRow) {
    const meta = document.createElement('p');
    meta.className = 'listing-meta';
    meta.append(...metaRow.children[0].childNodes);
    info.append(meta);
  }

  if (ratingRow) {
    const [ratingCell, reviewsCell] = ratingRow.children;
    const rating = document.createElement('p');
    rating.className = 'listing-rating';
    rating.insertAdjacentHTML('beforeend', STAR_ICON);
    rating.append(...(ratingCell?.childNodes || []));
    if (reviewsCell?.textContent.trim()) {
      rating.append(' · ', ...reviewsCell.childNodes);
    }
    info.append(rating);
  }

  return info;
}

export default function decorate(block) {
  const rows = [...block.children];
  const headingRow = rows.shift();
  const imagesRow = rows.shift();
  const [titleCell] = headingRow?.children || [];
  const heading = buildHeading(titleCell);

  const gallery = buildGallery(imagesRow?.children[0]);

  const info = buildInfo(rows);

  block.replaceChildren(heading, gallery, info);
}
