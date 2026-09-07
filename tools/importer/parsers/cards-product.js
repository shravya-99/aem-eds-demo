/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-product.
 * Base block: cards
 * Source: https://www.citi.com/credit-cards/view-all-credit-cards
 * Selector: #card_group_0_section cds-tile.cds-tile-component (one credit-card product tile = one card)
 * Generated: 2026-09-04
 *
 * The import framework invokes this parser once per matching cds-tile, so each
 * call emits a "Cards" block with a single card row (2 columns):
 *   Cell 1: card artwork image
 *   Cell 2: card body -> optional ribbon/badge label, H3 card name (linked),
 *           bulleted feature/APR/fee list, "Card details" link, "Apply now" CTA (as link)
 * Interactive controls (Compare checkboxes, expandable fine-print widgets) are
 * dropped; CTAs are flattened to plain links.
 */
export default function parse(element, { document }) {
  // --- Cell 1: card artwork image ---
  // Source: <tds-card-art><a class="card-art"><img ...></a></tds-card-art>
  const artImg = element.querySelector('tds-card-art img, .card-art img, a.card-art img');

  // --- Cell 2: card body ---
  const bodyContent = [];

  // Optional ribbon/badge label (leading text, e.g. "Bonus Offer", "Earn cash back").
  // Source: <tds-flag> ... <h2 class="flag"><b>Bonus Offer</b></h2>. Flatten to a
  // plain paragraph so it does not compete with the card-name heading.
  const flag = element.querySelector('tds-flag .flag, .flag-wrapper .flag, .flag');
  const flagText = flag ? flag.textContent.replace(/\s+/g, ' ').trim() : '';
  if (flagText) {
    const badge = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = flagText;
    badge.append(strong);
    bodyContent.push(badge);
  }

  // H3 card name wrapped in a link to the detail page.
  // Source: <h3 class="card-name"><a href="...detail...">Citi Strata Elite® Card</a></h3>
  const nameHeading = element.querySelector('h3.card-name, .cc_cap_small_header, h3');
  if (nameHeading) {
    bodyContent.push(nameHeading);
  }

  // Bulleted feature / APR / fee list. Rebuild a clean <ul> from the text of each
  // feature item, dropping the decorative icons and footnote superscript markers.
  // Source: <ul class="features-list"><li class="features-items"> ... <span class="cc_rtb_small">TEXT</span> ...
  const featureItems = Array.from(
    element.querySelectorAll('ul.features-list li.features-items, ul.features-list > li'),
  );
  if (featureItems.length) {
    const list = document.createElement('ul');
    featureItems.forEach((li) => {
      const textNode = li.querySelector('span.cc_rtb_small') || li;
      const clone = textNode.cloneNode(true);
      // Remove footnote superscript markers (e.g. <sup><a>2</a></sup>) and any icons.
      clone.querySelectorAll('sup, cds-icon, cds-icon-wrapper, .icon_cc_rtb_small').forEach((n) => n.remove());
      const text = clone.textContent.replace(/\s+/g, ' ').trim();
      if (text) {
        const item = document.createElement('li');
        item.textContent = text;
        list.append(item);
      }
    });
    if (list.children.length) {
      bodyContent.push(list);
    }
  }

  // "Card details" link. Source: <a class="cds-button-inline-link">Card details</a>
  const detailsLink = element.querySelector('.compare-learn a.cds-button-inline-link, a.cds-button-inline-link');
  if (detailsLink && detailsLink.getAttribute('href')) {
    const link = document.createElement('a');
    link.setAttribute('href', detailsLink.getAttribute('href'));
    link.textContent = detailsLink.textContent.replace(/\s+/g, ' ').trim() || 'Card details';
    bodyContent.push(link);
  }

  // "Apply now" primary CTA, flattened to a plain link.
  // Source: <a class="cds-button-primary" href="...application...">Apply now</a>
  const applyLink = element.querySelector('.btn-groups a.cds-button-primary, a.cds-button-primary');
  if (applyLink && applyLink.getAttribute('href')) {
    const cta = document.createElement('a');
    cta.setAttribute('href', applyLink.getAttribute('href'));
    cta.textContent = applyLink.textContent.replace(/\s+/g, ' ').trim() || 'Apply now';
    bodyContent.push(cta);
  }

  // Empty-block guard: bail gracefully if there is no meaningful card content.
  if (!artImg && bodyContent.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Build the 2-column Cards block: [image cell, body cell].
  const cells = [];
  cells.push([artImg || '', bodyContent.length ? bodyContent : '']);

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-product', cells });
  element.replaceWith(block);
}
