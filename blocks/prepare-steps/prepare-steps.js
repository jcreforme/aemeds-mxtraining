// Two-column "choose a location" + interactive "prepare for each step" card.
// Authored as one flat table so it round-trips through Document Authoring:
//   - a one-cell row  -> left column content (the first one) or the card title
//   - a two-cell row  -> one tab: [icon + label] | [that tab's panel content]

function getRowCells(row) {
  return [...row.children].filter((child) => child.tagName === 'DIV');
}

// A bulleted list whose every item leads with an icon becomes the 4-across
// location grid (icon stacked above its label).
function buildLocationGrid(container) {
  const list = [...container.querySelectorAll('ul')].find((ul) => {
    const items = [...ul.children];
    return items.length > 0 && items.every((li) => li.querySelector(':scope > .icon'));
  });
  if (!list) return;

  const grid = document.createElement('div');
  grid.className = 'prepare-steps-locations';

  [...list.children].forEach((li) => {
    const cell = document.createElement('div');
    const icon = li.querySelector(':scope > .icon');
    if (icon) {
      icon.classList.add('prepare-steps-location-icon');
      cell.append(icon);
    }
    const label = document.createElement('p');
    label.textContent = li.textContent.trim();
    cell.append(label);
    grid.append(cell);
  });

  list.replaceWith(grid);
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const singleCellRows = [];
  const tabRows = [];

  rows.forEach((row) => {
    const cells = getRowCells(row);
    if (cells.length >= 2) tabRows.push(cells);
    else if (cells.length === 1) singleCellRows.push(cells[0]);
  });

  const leftSource = singleCellRows[0];
  const titleSource = singleCellRows[1];
  const cardTitle = titleSource ? titleSource.textContent.trim() : 'Prepare for each step';

  // ---- left column ----
  const left = document.createElement('div');
  left.className = 'prepare-steps-content';
  if (leftSource) {
    while (leftSource.firstChild) left.append(leftSource.firstChild);
    buildLocationGrid(left);
  }

  // ---- right column: the prepare card ----
  const card = document.createElement('div');
  card.className = 'prepare-steps-card';

  const header = document.createElement('div');
  header.className = 'prepare-steps-header';
  const heading = document.createElement('h3');
  heading.textContent = cardTitle;
  header.append(heading);

  const tablist = document.createElement('div');
  tablist.className = 'prepare-steps-tabs';
  tablist.setAttribute('role', 'tablist');

  const panelWrap = document.createElement('div');
  panelWrap.className = 'prepare-steps-panels';

  const uid = `prepare-steps-${Math.random().toString(36).slice(2, 8)}`;
  const tabs = [];
  const panels = [];

  tabRows.forEach((cells, i) => {
    const [labelCell, panelCell] = cells;
    const tabId = `${uid}-tab-${i}`;
    const panelId = `${uid}-panel-${i}`;

    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'prepare-steps-tab';
    tab.id = tabId;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panelId);

    const icon = labelCell.querySelector('.icon');
    if (icon) {
      const iconWrap = document.createElement('span');
      iconWrap.className = 'prepare-steps-tab-icon';
      iconWrap.append(icon);
      tab.append(iconWrap);
    }
    const label = document.createElement('span');
    label.className = 'prepare-steps-tab-label';
    label.textContent = labelCell.textContent.trim();
    tab.append(label);

    const panel = document.createElement('div');
    panel.className = 'prepare-steps-panel';
    panel.id = panelId;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tabId);
    while (panelCell.firstChild) panel.append(panelCell.firstChild);

    tablist.append(tab);
    panelWrap.append(panel);
    tabs.push(tab);
    panels.push(panel);
  });

  const activate = (index, setFocus = false) => {
    tabs.forEach((tab, i) => {
      const selected = i === index;
      tab.classList.toggle('is-active', selected);
      tab.setAttribute('aria-selected', selected ? 'true' : 'false');
      tab.setAttribute('tabindex', selected ? '0' : '-1');
      panels[i].hidden = !selected;
      if (selected && setFocus) tab.focus();
    });
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activate(i));
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        activate((i + 1) % tabs.length, true);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        activate((i - 1 + tabs.length) % tabs.length, true);
      } else if (e.key === 'Home') {
        e.preventDefault();
        activate(0, true);
      } else if (e.key === 'End') {
        e.preventDefault();
        activate(tabs.length - 1, true);
      }
    });
  });

  card.append(header, tablist, panelWrap);

  block.replaceChildren(left, card);

  if (tabs.length) activate(tabs.length - 1);
}
