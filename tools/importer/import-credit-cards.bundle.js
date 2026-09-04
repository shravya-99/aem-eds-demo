/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-credit-cards.js
  var import_credit_cards_exports = {};
  __export(import_credit_cards_exports, {
    default: () => import_credit_cards_default
  });

  // tools/importer/parsers/cards-product.js
  function parse(element, { document }) {
    const artImg = element.querySelector("tds-card-art img, .card-art img, a.card-art img");
    const bodyContent = [];
    const flag = element.querySelector("tds-flag .flag, .flag-wrapper .flag, .flag");
    const flagText = flag ? flag.textContent.replace(/\s+/g, " ").trim() : "";
    if (flagText) {
      const badge = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = flagText;
      badge.append(strong);
      bodyContent.push(badge);
    }
    const nameHeading = element.querySelector("h3.card-name, .cc_cap_small_header, h3");
    if (nameHeading) {
      bodyContent.push(nameHeading);
    }
    const featureItems = Array.from(
      element.querySelectorAll("ul.features-list li.features-items, ul.features-list > li")
    );
    if (featureItems.length) {
      const list = document.createElement("ul");
      featureItems.forEach((li) => {
        const textNode = li.querySelector("span.cc_rtb_small") || li;
        const clone = textNode.cloneNode(true);
        clone.querySelectorAll("sup, cds-icon, cds-icon-wrapper, .icon_cc_rtb_small").forEach((n) => n.remove());
        const text = clone.textContent.replace(/\s+/g, " ").trim();
        if (text) {
          const item = document.createElement("li");
          item.textContent = text;
          list.append(item);
        }
      });
      if (list.children.length) {
        bodyContent.push(list);
      }
    }
    const detailsLink = element.querySelector(".compare-learn a.cds-button-inline-link, a.cds-button-inline-link");
    if (detailsLink && detailsLink.getAttribute("href")) {
      const link = document.createElement("a");
      link.setAttribute("href", detailsLink.getAttribute("href"));
      link.textContent = detailsLink.textContent.replace(/\s+/g, " ").trim() || "Card details";
      bodyContent.push(link);
    }
    const applyLink = element.querySelector(".btn-groups a.cds-button-primary, a.cds-button-primary");
    if (applyLink && applyLink.getAttribute("href")) {
      const cta = document.createElement("a");
      cta.setAttribute("href", applyLink.getAttribute("href"));
      cta.textContent = applyLink.textContent.replace(/\s+/g, " ").trim() || "Apply now";
      bodyContent.push(cta);
    }
    if (!artImg && bodyContent.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cells.push([artImg || "", bodyContent.length ? bodyContent : ""]);
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-product", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/citi-cleanup.js
  var TransformHook = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function transform(hookName, element, payload) {
    var _a;
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "tds-filter-chips",
        // interactive filter widget (no static data source -> drop)
        "cds-checkbox2"
        // per-card "Compare (0/3)" checkbox
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      const { document } = payload;
      const main = element.querySelector("#page-container") || element.querySelector("#maincontent") || ((_a = element.querySelector("#category-header_group_0")) == null ? void 0 : _a.closest('#page-container, [id="maincontent"]'));
      if (main) {
        element.textContent = "";
        element.appendChild(main);
      }
      WebImporter.DOMUtils.remove(element, [
        ".modal",
        // Angular modal dialogs
        ".modal-backdrop",
        // Angular modal backdrops
        "script",
        "style",
        "noscript",
        "link",
        "iframe"
      ]);
      element.querySelectorAll("[ng-version], [_ngcontent], [_nghost]").forEach((el) => {
        Array.from(el.attributes).forEach((attr) => {
          if (attr.name.startsWith("_ngcontent") || attr.name.startsWith("_nghost") || attr.name === "ng-version") {
            el.removeAttribute(attr.name);
          }
        });
      });
    }
  }

  // tools/importer/import-credit-cards.js
  var parsers = {
    "cards-product": parse
  };
  var transformers = [
    transform
  ];
  var PAGE_TEMPLATE = {
    name: "credit-cards",
    description: "Citi 'View all credit cards' listing page. Body content only: page intro heading + CTA (default content), legal disclaimer bar (default content), result count/filter label (default content, interactive filter dropped), and a grid of repeating credit-card product tiles mapped to the cards-product block.",
    urls: [
      "https://www.citi.com/credit-cards/view-all-credit-cards"
    ],
    blocks: [
      {
        name: "cards-product",
        instances: ["#card_group_0_section cds-tile.cds-tile-component"]
      }
    ]
  };
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_credit_cards_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_credit_cards_exports);
})();
