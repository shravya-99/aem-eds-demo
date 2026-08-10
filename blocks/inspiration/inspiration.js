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

function buildPanel(destinationsCell) {
  const panel = document.createElement('div');
  panel.className = 'inspiration-panel';

  const grid = document.createElement('div');
  grid.className = 'inspiration-grid';

  const lines = destinationsCell ? splitIntoLines(destinationsCell) : [];
  for (let i = 0; i < lines.length; i += 2) {
    const item = document.createElement('div');
    item.className = 'inspiration-item';

    const title = document.createElement('strong');
    title.textContent = lines[i]?.textContent.trim() || '';
    item.append(title);

    if (lines[i + 1]) {
      const subtitle = document.createElement('span');
      subtitle.textContent = lines[i + 1].textContent.trim();
      item.append(subtitle);
    }

    grid.append(item);
  }

  panel.append(grid);
  return panel;
}

export default function decorate(block) {
  const rows = [...block.children];
  const titleRow = rows.shift();

  const title = document.createElement('h2');
  title.className = 'inspiration-title';
  title.append(...(titleRow?.querySelector('div')?.childNodes || []));

  const nav = document.createElement('div');
  nav.className = 'inspiration-tabs';
  nav.setAttribute('role', 'tablist');

  const panels = document.createElement('div');
  panels.className = 'inspiration-panels';

  rows.forEach((row, i) => {
    const [labelCell, destinationsCell] = row.children;
    const label = labelCell?.textContent.trim() || `Tab ${i + 1}`;

    const button = document.createElement('button');
    button.type = 'button';
    button.id = `inspiration-tab-${i}`;
    button.className = 'inspiration-tab';
    button.textContent = label;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-selected', i === 0 ? 'true' : 'false');

    const panel = buildPanel(destinationsCell);
    panel.id = `inspiration-panel-${i}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', button.id);
    if (i === 0) button.classList.add('inspiration-tab-active');
    else panel.hidden = true;

    button.setAttribute('aria-controls', panel.id);
    button.addEventListener('click', () => {
      nav.querySelectorAll('.inspiration-tab').forEach((btn) => {
        btn.classList.remove('inspiration-tab-active');
        btn.setAttribute('aria-selected', 'false');
      });
      panels.querySelectorAll('.inspiration-panel').forEach((p) => {
        p.hidden = true;
      });
      button.classList.add('inspiration-tab-active');
      button.setAttribute('aria-selected', 'true');
      panel.hidden = false;
    });

    nav.append(button);
    panels.append(panel);
  });

  block.replaceChildren(title, nav, panels);
}
