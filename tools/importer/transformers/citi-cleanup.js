/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Citi site-wide cleanup (credit-cards template).
 *
 * Scope: page body content only.
 *
 * Strategy: KEEP-ONLY the main content wrapper. The rendered Citi page nests the
 * authorable body inside `#page-container` (which contains both the page intro
 * `#category-header_group_0` — H1 + CTA + legal bar + filter row — and the card
 * grid `#card_group_0_section`). Everything else (the `citi-header` / `citi-navigation3`
 * global nav, the `citi-footer` global footer, cookie banners, and tracking pixels)
 * lives OUTSIDE `#page-container`. Rather than enumerate every chrome selector
 * (the analysis-phase `div.banner`/`div.footer` guesses did not match the real DOM),
 * we promote `#page-container` to be the sole body content and drop the rest.
 *
 * Verified against the rendered snapshot with jsdom:
 *   - #page-container contains the H1, legal bar, filter chips, and all 26 card tiles
 *   - #page-container contains NO nav, footer, tracking, or cookie content
 *
 * The interactive filter widget (`tds-filter-chips`) and per-card "Compare"
 * checkboxes (`cds-checkbox2`) are client-side Angular controls with no static
 * data source, so they are dropped before parsing (allowed outcome per scope).
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Drop interactive Angular controls before the card parser runs so the
    // cards-product cells stay free of dead controls.
    WebImporter.DOMUtils.remove(element, [
      'tds-filter-chips', // interactive filter widget (no static data source -> drop)
      'cds-checkbox2', // per-card "Compare (0/3)" checkbox
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    const { document } = payload;

    // Promote the main content wrapper to be the ONLY body content. This strips
    // the global header/nav, footer, cookie banner, and tracking pixels in one
    // move — they all live outside #page-container.
    const main = element.querySelector('#page-container')
      || element.querySelector('#maincontent')
      || element.querySelector('#category-header_group_0')?.closest('#page-container, [id="maincontent"]');

    if (main) {
      // Replace the entire body contents with just the main content wrapper.
      element.textContent = '';
      element.appendChild(main);
    }

    // Remove any residual non-authorable resource / scaffolding tags.
    WebImporter.DOMUtils.remove(element, [
      '.modal', // Angular modal dialogs
      '.modal-backdrop', // Angular modal backdrops
      'script',
      'style',
      'noscript',
      'link',
      'iframe',
    ]);

    // Strip Angular-specific attribute noise left on retained content.
    element.querySelectorAll('[ng-version], [_ngcontent], [_nghost]').forEach((el) => {
      Array.from(el.attributes).forEach((attr) => {
        if (attr.name.startsWith('_ngcontent') || attr.name.startsWith('_nghost') || attr.name === 'ng-version') {
          el.removeAttribute(attr.name);
        }
      });
    });
  }
}
