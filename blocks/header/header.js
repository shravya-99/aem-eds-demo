import { getMetadata, decorateIcons } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const [categories, actions] = nav.children;

  if (categories) {
    categories.classList.add('nav-categories');
    categories
      .querySelectorAll(':scope .default-content-wrapper > ul > li')
      .forEach((item) => {
        if (item.querySelector('strong')) item.classList.add('nav-categories-active');
      });
  }

  if (actions) {
    actions.classList.add('nav-actions');
    actions
      .querySelectorAll(':scope .default-content-wrapper a')
      .forEach((link) => {
        link.classList.add(
          link.querySelector('.icon') ? 'nav-action-icon' : 'nav-action-text',
        );
      });
  }

  decorateIcons(nav);

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
