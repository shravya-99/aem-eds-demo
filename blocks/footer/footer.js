import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

function groupColumns(wrapper) {
  const columns = document.createElement('div');
  columns.className = 'footer-columns';
  let column = null;

  [...wrapper.children].forEach((el) => {
    if (el.tagName === 'H4') {
      column = document.createElement('div');
      column.className = 'footer-column';
      columns.append(column);
      column.append(el);
    } else if (el.tagName === 'UL' && column) {
      column.append(el);
    } else {
      column = null;
    }
  });

  if (columns.children.length) wrapper.prepend(columns);
}

export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta
    ? new URL(footerMeta, window.location).pathname
    : '/footer';
  const fragment = await loadFragment(footerPath);

  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  footer.querySelectorAll('.default-content-wrapper').forEach(groupColumns);

  block.append(footer);
}
