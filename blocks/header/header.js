import { getMetadata, decorateIcons } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      // return focus to the hamburger (the first nav button is a utility
      // dropdown, not the menu toggle)
      nav.querySelector('.nav-hamburger button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  if (!sections) return;
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  // always collapse sections: desktop dropdowns open on hover, mobile sections
  // are an accordion (tapped open individually)
  toggleAllNavSections(navSections, false);
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  if (navSections) {
    const navDrops = navSections.querySelectorAll('.nav-drop');
    if (isDesktop.matches) {
      navDrops.forEach((drop) => {
        if (!drop.hasAttribute('tabindex')) {
          drop.setAttribute('tabindex', 0);
          drop.addEventListener('focus', focusNavSection);
        }
      });
    } else {
      navDrops.forEach((drop) => {
        drop.removeAttribute('tabindex');
        drop.removeEventListener('focus', focusNavSection);
      });
    }
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * Turns utility list items with a nested list into accessible
 * button-driven dropdowns (e.g. Patient/Prescribing Information PDFs).
 * @param {Element} navUtility The utility section of the nav
 */
function decorateUtility(navUtility) {
  if (!navUtility) return;
  navUtility.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((li) => {
    const submenu = li.querySelector('ul');
    if (!submenu) return;
    li.classList.add('nav-drop');
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-expanded', 'false');
    while (li.firstChild && li.firstChild !== submenu) button.append(li.firstChild);
    li.prepend(button);
    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      navUtility.querySelectorAll('button[aria-expanded="true"]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
      button.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    });
  });

  // close utility dropdowns on click outside or escape
  document.addEventListener('click', (e) => {
    if (!navUtility.contains(e.target)) {
      navUtility.querySelectorAll('button[aria-expanded="true"]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
    }
  });
  navUtility.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
      navUtility.querySelectorAll('button[aria-expanded="true"]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
    }
  });
}

/**
 * Marks list items holding icon-only social links and visually hides
 * their text labels (kept in the DOM for screen readers).
 * @param {Element} scope The element to search for social links
 */
function decorateSocialLinks(scope) {
  scope.querySelectorAll('li').forEach((li) => {
    const links = [...li.querySelectorAll(':scope > a')];
    if (links.length > 1 && links.every((a) => a.querySelector('.icon'))) {
      li.classList.add('nav-social');
      links.forEach((a) => {
        [...a.childNodes].forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
            const label = document.createElement('span');
            label.className = 'visually-hidden';
            label.textContent = node.textContent.trim();
            node.replaceWith(label);
          }
        });
      });
    }
  });
}

/**
 * Builds the search box into the tools area. Submits to /search as a GET so it
 * works as soon as a search page exists, while matching the site's UI now.
 * @param {Element} navTools The tools section of the nav
 */
function decorateSearch(navTools) {
  if (!navTools) return;
  const form = document.createElement('form');
  form.className = 'nav-search';
  form.setAttribute('role', 'search');
  form.action = '/search';
  form.innerHTML = `<input type="search" name="q" placeholder="Search" aria-label="Search">
    <button type="submit" aria-label="Submit search"><span class="icon icon-search"></span></button>`;
  navTools.append(form);
  decorateIcons(form);
}

/**
 * Flags the nav item matching the current page so it can show the active
 * (red) underline.
 * @param {Element} navSections The main nav sections
 */
function markActiveNavItem(navSections) {
  if (!navSections) return;
  const here = window.location.pathname.replace(/index\.html$/, '') || '/';
  navSections.querySelectorAll(':scope a[href]').forEach((a) => {
    try {
      const path = new URL(a.href, window.location).pathname.replace(/index\.html$/, '') || '/';
      if (path === here) a.closest('li').classList.add('active');
    } catch { /* ignore malformed hrefs */ }
  });
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/fragments/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  // a 4-section nav has a utility strip first; fall back to 3 sections
  const classes = ['brand', 'sections', 'tools'];
  if (nav.children.length > 3) classes.unshift('utility');
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  decorateUtility(nav.querySelector('.nav-utility'));

  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    const brandLink = navBrand.querySelector('.button');
    if (brandLink) {
      brandLink.className = '';
      brandLink.closest('.button-container').className = '';
    }
    // show only the logo, keep the text label for screen readers
    const logoLink = navBrand.querySelector('a');
    if (logoLink && logoLink.querySelector('.icon')) {
      [...logoLink.childNodes].forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
          const label = document.createElement('span');
          label.className = 'visually-hidden';
          label.textContent = node.textContent.trim();
          node.replaceWith(label);
        }
      });
    }
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', (e) => {
        // desktop opens dropdowns on hover (+ keyboard); only mobile toggles
        // the accordion on tap
        if (isDesktop.matches) return;
        // let links navigate without collapsing their section
        if (e.target.closest('a')) return;
        if (!navSection.classList.contains('nav-drop')) return;
        const expanded = navSection.getAttribute('aria-expanded') === 'true';
        toggleAllNavSections(navSections);
        navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      });
    });
  }

  decorateSocialLinks(nav);

  // Clone HCP Site link and social icons to the bottom of the open mobile menu.
  // On desktop these items live in the utility strip; on mobile they are hidden
  // there and appear here instead.
  const navUtilityList = nav.querySelector('.nav-utility .default-content-wrapper > ul');
  if (navUtilityList) {
    const mobileFooter = document.createElement('div');
    mobileFooter.className = 'nav-mobile-footer';
    const hcpItem = navUtilityList.querySelector('li:not(.nav-drop, .nav-social)');
    const socialItem = navUtilityList.querySelector('li.nav-social');
    if (hcpItem) mobileFooter.append(hcpItem.cloneNode(true));
    if (socialItem) mobileFooter.append(socialItem.cloneNode(true));
    if (mobileFooter.children.length) nav.append(mobileFooter);
  }

  // group hamburger, brand, and tools into a single bar for layout
  const navBar = document.createElement('div');
  navBar.className = 'nav-bar';
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
      <span class="nav-hamburger-label" aria-hidden="true">Menu</span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  navBar.append(hamburger);
  if (navBrand) navBar.append(navBrand);
  const navTools = nav.querySelector('.nav-tools');
  if (navTools) navBar.append(navTools);

  // Clone the utility tagline into the bar for the mobile layout
  // (real site shows it below logo on mobile, hidden on desktop)
  const utilityTagline = nav.querySelector('.nav-utility p');
  if (utilityTagline) {
    const mobileTagline = utilityTagline.cloneNode(true);
    mobileTagline.className = 'nav-tagline';
    navBar.append(mobileTagline);
  }
  decorateSearch(navTools);
  markActiveNavItem(navSections);
  if (navSections) nav.insertBefore(navBar, navSections);
  else nav.append(navBar);

  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);

  // The header is STATIC — it sits in the document flow and scrolls out of
  // view naturally (no fixed/sticky positioning, no scroll listeners). The
  // <header> element reserves --nav-height of space before this block loads
  // (see styles.css); keep that variable in sync with the rendered height so
  // the reservation is exact (the utility strip wraps to 2-3 rows at narrow
  // widths, so a hardcoded --nav-height would leave a gap or an overlap).
  const syncNavHeight = () => {
    // when the mobile menu is open the nav fills the viewport (100dvh); don't
    // reserve that height for the page flow
    if (nav.getAttribute('aria-expanded') === 'true' && !isDesktop.matches) return;
    document.documentElement.style.setProperty('--nav-height', `${navWrapper.offsetHeight}px`);
  };
  const navHeightObserver = new ResizeObserver(syncNavHeight);
  navHeightObserver.observe(navWrapper);
  // the ResizeObserver's first callback can fire before web fonts/icons load
  // and under-measure the strip, so re-sync once they settle and on resize
  if (document.fonts?.ready) document.fonts.ready.then(syncNavHeight);
  window.addEventListener('load', syncNavHeight);
  window.addEventListener('resize', syncNavHeight);
}
