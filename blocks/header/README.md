# Header Block — Global Navigation

The header renders the site-wide navigation from the shared `/nav` fragment. It replicates the vyepti.com header: a teal utility strip, a white brand bar with logo + CTA links + search, and the main pill navigation with hover dropdowns.

**The header is static.** It sits at the top of the document flow and scrolls out of view naturally — matching the source site, whose `.header-section` is `position: relative`. There is no `position: fixed`, no `position: sticky`, and no scroll listeners.

---

## Developer Notes

### Structure

`decorate(block)` fetches the nav fragment (path from the `nav` page metadata, default `/nav`) via `loadFragment()`, then decorates its four authored sections into:

```
header
└── .nav-wrapper                 static, z-index for dropdown stacking only
    └── nav#nav                  [aria-expanded] drives the mobile menu
        ├── .nav-utility         teal strip: tagline, PI/PPI dropdowns, HCP link, social
        ├── .nav-bar             white bar (built by JS):
        │   ├── .nav-hamburger   <button aria-controls="nav"> — mobile only
        │   ├── .nav-brand       logo link (text label visually hidden)
        │   ├── .nav-tagline     mobile-only clone of the utility tagline
        │   └── .nav-tools       CTA links (Sign Up, Infusion Locator, Savings) + .nav-search
        ├── .nav-sections        main nav <ul>; items with a nested <ul> become .nav-drop
        └── .nav-mobile-footer   mobile-only clone of HCP link + social icons
```

A 3-section nav (no utility strip) is also supported — sections then map to brand/sections/tools.

### Mobile menu toggle logic

- The hamburger `<button>` carries `aria-controls="nav"` and an `aria-label` that flips between "Open navigation" / "Close navigation".
- Open/close state lives in **one place**: `aria-expanded` on the `<nav>` element. CSS keys off it (`nav[aria-expanded="true"]`) to show the menu, swap the hamburger icon to a ✕, and hide the logo/tagline. No state classes.
- While open, the nav fills the viewport (`min-height: 100dvh`, scrollable) and `body` gets `overflow-y: hidden` so the page behind doesn't scroll. The `<header>` element keeps its reserved height, so the menu overlays the page instead of pushing it down.
- Main-nav items with children (`.nav-drop`) are a tap-to-open accordion on mobile (`aria-expanded` per item, one open at a time) and hover/keyboard dropdowns on desktop (`tabindex=0`, Enter/Space toggles).
- <kbd>Esc</kbd> closes the open dropdown (desktop) or the whole menu (mobile); focus loss collapses it too.
- A `matchMedia('(min-width: 900px)')` listener re-runs the toggle on breakpoint changes, so resizing never strands the menu in the wrong state.

### Static positioning + height reservation

`styles.css` gives the empty `<header>` element `height: var(--nav-height)` so the page doesn't jump when the block loads in the lazy phase. Because the utility strip wraps to 2–3 rows at narrow widths, a hardcoded value would leave a gap or overlap — a `ResizeObserver` on `.nav-wrapper` (plus `resize`, `load`, and `document.fonts.ready` fallbacks) keeps `--nav-height` equal to the real rendered height. The sync is skipped while the mobile menu is open, since the 100dvh menu must overlay rather than reserve flow space.

`.nav-wrapper` is `position: relative` **with no offsets** — it exists purely so `z-index: var(--header-z)` stacks the dropdowns and open mobile menu above page content. Do not add `fixed`/`sticky` or scroll handlers; the static behavior is a product requirement.

### Brand tokens (extracted from the vyepti.com clientlib)

| Token | Value | Source rule |
|-------|-------|-------------|
| `--header-bg` | `#fff` | `.header-section { background-color: #fff }` |
| `--header-border-color` | `#d1d1d1` | `.navbar { border-bottom: 1px solid #d1d1d1 }` |
| `--header-shadow` | `0 1px 8px rgb(0 0 0 / 12%)` | `.navbar { box-shadow: 1px 0 8px rgba(0,0,0,.12) }` |
| `--header-z` | `4` | `.header-section { z-index: 4 }` |
| utility strip | `--link-color` (`#046183`) | `.info-teal-strip-section { background-color: #046183 }` |
| CTA pills / active marker | `--nav-accent-color` (`#c02c57`) | `.red-text`, `.button-primary-arrow-red` |
| logo width | 105px / 112px (≥900) / 130px (≥1200) | `.vyepti-logo img` |
| desktop CTA links | 20px/24px, weight 800, uppercase, teal | `.center-nav li a` |
| main nav links | 16px/22px, weight 600 (18px ≥1200) | `.nav-full-width li a` |
| mobile strip links | 14px, weight 600, white, centered with `\|` divider | `.header-strip-mobile .navbar-nav` |
| mobile strip dropdown | full-width panel, `border-bottom: 5px #c02c57`, items 16px/500 `#484848` centered | `.header-strip-mobile .dropdown-menu` |
| mobile tagline | 14px/18px, weight 700, 1px×35px `#979797` divider after logo | `.vyepti-logo + p` |
| hamburger | 29×3px bars 10px apart, "Menu" 14px/700 stacked below | `.navbar-toggler-icon`, `.menu-text` |

---

## Authoring Guide (Word / Google Docs)

The navigation is authored once, in the document at **`/nav`** in the content drive. A page can point at an alternate nav with the `nav` metadata property. The document has **four sections**, separated by horizontal rules (`---`), in this exact order:

### Section 1 — Utility strip (teal bar)

1. A paragraph with the tagline (e.g. *For the preventive treatment of migraine in adults.*).
2. A bulleted list where each item is either:
   - **A dropdown** — plain text label (e.g. `Patient Information`) with an indented sub-list of links. Rendered as a click/hover dropdown.
   - **A plain link** — e.g. `Healthcare Provider Site`. Shown in the strip on desktop, at the bottom of the mobile menu on mobile.
   - **Social icons** — one list item containing several links, each starting with an icon (`:facebook-white:` etc. followed by the network name). The text stays available to screen readers.

### Section 2 — Brand / logo

One paragraph containing a single link to `/` whose content is the logo icon followed by accessible text:

> `:logo-vyepti:` VYEPTI® (eptinezumab-jjmr) home

The text is visually hidden and read by screen readers; only the logo displays.

### Section 3 — Main navigation

One bulleted list. Top-level items become the horizontal pill nav on desktop and the accordion on mobile:

- A top-level item that is **a link** (e.g. `Home`) navigates directly.
- A top-level item that is **plain text with an indented sub-list** becomes a dropdown/accordion (e.g. `Why VYEPTI` → *Could VYEPTI Be Right for You?*, *How VYEPTI Works*, …).
- Keep top-level labels short — they must fit one row on desktop.
- The item linking to the current page automatically gets the red active underline.

### Section 4 — Tools / CTA links

One bulleted list of icon + link pairs (e.g. `:mail:` **Sign Up**, `:locator:` **Infusion Locator**, `:savings:` **Savings**). Rendered as large teal uppercase links with circle icons on desktop, and as rose pill buttons inside the mobile menu. The search box is added automatically after these — authors do not add it.

### Rules for authors

| Rule | Detail |
|------|--------|
| Section order | Utility → Logo → Main nav → Tools, separated by `---` |
| Dropdowns | Use **nested (indented) lists** — never headings — for sub-navigation |
| Icons | Use icon tokens (e.g. `:mail:`) whose SVGs exist in `/icons/` |
| Logo | Keep the accessible text after the logo icon — do not delete it |
| Publishing | Preview and publish the `/nav` document; every page updates immediately |

---

## Visual QA Checklist

- [ ] `header .nav-wrapper` — computed `position: relative` (never `fixed`/`sticky`); header scrolls away with the page
- [ ] Wrapper — `border-bottom: 1px solid #d1d1d1`, `box-shadow 0 1px 8px rgb(0 0 0 / 12%)`, white background
- [ ] Utility strip — background `#046183`, white 14px/16px 600 text
- [ ] Logo — 105px wide mobile, 112px ≥900px, 130px ≥1200px
- [ ] Desktop CTA links — `20px/24px`, weight 800, uppercase, teal `#046183`, 38px circle icons
- [ ] Main nav — 16px/600 (18px ≥1200px), red `#c02c57` active underline, dropdowns with red bottom border on hover
- [ ] Mobile — teal strip shows the two PI/PPI dropdowns centered with a 1px white `|` divider; tapping one opens a full-width white panel with a 5px rose `#c02c57` bottom border and centered 16px items
- [ ] Mobile — bold 14px/18px tagline sits after the logo behind a 1px×35px gray `#979797` divider, wrapping to ~3 lines (max-width 167px)
- [ ] Mobile — hamburger is three 29×3px teal bars 10px apart with "Menu" (14px/700) stacked below; open menu fills viewport, page scroll locked, CTA links as rose `#c02c57` pills
- [ ] `aria-expanded` flips on `<nav>` (menu), `.nav-drop` items (accordion), and utility dropdown buttons
- [ ] No layout jump when the header loads — `<header>` height reservation matches the rendered wrapper
