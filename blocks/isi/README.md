# ISI Block — Important Safety Information

The ISI block renders the required pharmaceutical safety disclosure on every page. From a single shared content source (`/fragments/isi`) it produces two coordinated components:

1. **Sticky bottom tray** — fixed to the viewport bottom while the user reads the page. Collapsed, it shows the ISI heading plus the most critical disclosure (and, on desktop, the Approved Use column). A **+/−** button expands the full detail in a scrollable tray.
2. **Inline panel** — anchored in the page flow above the footer at `#SafetyPanelInfo`, always showing the full safety information. When it scrolls into view, the sticky tray automatically slides away.

---

## Developer Notes

### Content sourcing — always from `/fragments/isi`

The block **fetches its own content** from `/fragments/isi.plain.html` inside `decorate()`. Pages do not need to author the ISI at all: `loadISI()` in `scripts/scripts.js` injects an empty `isi` block as the last section of `main` on every page (skipped on `/fragments/*` pages and when an author already placed one).

Path resolution order inside the block:

1. A link authored inside the block table (same-origin) — lets a page point at an alternate fragment, e.g. `/fragments/isi-es`.
2. A plain-text path authored in the cell (e.g. `/fragments/isi-hcp`).
3. Default: `/fragments/isi`.

Content authored directly in the block table is used only as a **fallback** if the fragment request fails.

### The "loading state lock" bug — and how it was fixed

**Symptom:** while the ISI fragment was being fetched, other sections of the page stayed stuck at `data-section-status="initialized"` / `"loading"` with `display: none` inline styling, so page content never appeared.

**Root cause:** the previous implementation fetched the fragment in `scripts.js`, manually created a section, set it to `data-section-status="initialized"` + `display: none`, and awaited the whole chain inside `loadLazy()`. Any rejection, hang, or re-decoration along that path left sections permanently hidden, and the `await` chained the footer and lazy assets behind the fragment network request.

**Fix — three independent safety layers:**

1. **The block's promises always resolve.** The fetch in `isi.js` is time-boxed with `AbortSignal.timeout(5000)` and every failure path is caught and resolved to `null`. `decorate()` can therefore never reject or hang, so `loadBlock()` / `loadSection()` in `aem.js` always complete and transition sections to `data-section-status="loaded"`.
2. **Fail-open guard.** `decorate()` has a `finally` clause that force-releases its host section (`sectionStatus = 'loaded'`, `display` cleared) — the same safety net used by the `fragment` block. Even a bug inside the decoration logic cannot leave the section hidden.
3. **No manual pipeline surgery, no blocking await.** `loadISI()` in `scripts.js` now only appends an empty block and runs it through the standard `decorateBlock()` → `loadSection()` pipeline — it never pre-hides anything. It is called **without `await`** in `loadLazy()`, so the footer, lazy CSS, and fonts load regardless of how slow the fragment is.

If the fragment is missing entirely, the block removes itself cleanly and the page renders normally — the ISI must never take the page down with it.

### Files

| File | Purpose |
|------|---------|
| `blocks/isi/isi.js` | Fragment fetch, content parsing, tray + panel construction, toggle/docking behavior |
| `blocks/isi/isi.css` | All styling, scoped to `.isi` / `.isi-tray`; tokens extracted from the production vyepti.com clientlib |
| `scripts/scripts.js` → `loadISI()` | Auto-injection of the block on every page (lazy phase, fire-and-forget) |

### Behavior reference

- Clicking anywhere on the tray header (or the +/− button) expands/collapses the detail body (`max-height` transition, `0.3s ease-in-out`).
- <kbd>Esc</kbd> collapses the tray and returns focus to the toggle.
- An `IntersectionObserver` docks the tray (slides it out) while `#SafetyPanelInfo` is in view.
- A `ResizeObserver` keeps `--isi-tray-offset` equal to the collapsed tray height; the body gets that much `padding-bottom` so the tray never covers page content (no CLS).
- The toggle is a real `<button>` with `aria-expanded` / `aria-controls`; the tray is `role="complementary"`, the detail body `role="region"`.
- Links ending in `.pdf` (Prescribing/Patient Information) open in a new tab.

---

## Authoring Guide (Word / Google Docs)

### Where the content lives

All ISI content is authored **once**, in the document at **`/fragments/isi`** in your content drive (Google Docs or SharePoint/Word). Every page on the site picks it up automatically — you do **not** add an ISI block to individual pages.

To update the safety information: edit the `/fragments/isi` document, then **Preview** and **Publish** it with the AEM Sidekick. Every published page shows the new content immediately.

### Structure of the `/fragments/isi` document

Write the content as plain rich text (no table needed in the fragment). Use **Heading 5** for the two section headings — the block splits the content on them:

> ##### APPROVED USE
> VYEPTI is a prescription medicine used for the preventive treatment of migraine in adults.
>
> ##### IMPORTANT SAFETY INFORMATION
> **Do not receive VYEPTI** if you have a known allergy to eptinezumab-jjmr or its ingredients.
>
> **VYEPTI may cause serious side effects such as:**
> - **Allergic reactions.** Call your healthcare provider or get emergency medical help right away…
> - **High blood pressure.** …
> - **Raynaud's phenomenon.** …
>
> *(remaining paragraphs, FDA MedWatch notice, PI/PPI links)*

### What renders where

| Content | Sticky tray (collapsed) | Sticky tray (expanded) | Inline panel |
|---------|------------------------|------------------------|--------------|
| APPROVED USE heading + first paragraph | Right column (desktop only; mobile shows "AND APPROVED USE" subtitle) | same | Top section |
| IMPORTANT SAFETY INFORMATION heading + **first** paragraph | Left column / full width on mobile | same | Middle section |
| Everything after the first ISI paragraph | Hidden | Scrollable body below the header | Bottom, always visible |

### Rules for authors

| Rule | Detail |
|------|--------|
| Section order | APPROVED USE must come **before** IMPORTANT SAFETY INFORMATION |
| Section headings | Must be **Heading 5** — not bold text, not Heading 4 or 6 |
| APPROVED USE body | Keep it to one paragraph |
| First ISI paragraph | Appears in the collapsed tray on every page — make it the most critical disclosure ("Do not receive…") and keep it short (one to two lines) |
| PDF links | Links ending in `.pdf` automatically open in a new tab |
| Preview before publish | Check one page's sticky tray and inline panel in Preview before publishing the fragment |

### Optional: placing the block on a page manually

Only needed to point a specific page at a **different** fragment (e.g. a Spanish or HCP variant). Insert a one-column table:

| isi |
|-----|
| /fragments/isi-es |

Leave the second cell empty to use the default `/fragments/isi`. Place the block as the **last section** of the page, in its own section (its own `---` dividers).

### Linking to the full safety information

Any page or the footer can deep-link to the inline panel:

```
[See full Important Safety Information](#SafetyPanelInfo)
```

---

## Visual QA Checklist

Verify in the browser inspector against the brand reference (vyepti.com):

- [ ] `.isi-tray` — `border-top: 1px solid #d1d1d1`, `background: #fff`, body text `#484848` at `16px`, `line-height: 24px`
- [ ] `.isi-tray h5` / `.isi-tray-subtitle` — color `#41748d`, `18px/22px`, `font-weight: 700`, uppercase
- [ ] `.isi-panel h5` — color `#046183` (darker teal — intentionally different from the tray)
- [ ] `.isi-toggle` — 26px circle, color `#41748d`, hover swaps to `#7ebcc6` (no fill), visible `:focus-visible` outline
- [ ] Tray/body transitions — `0.3s ease-in-out`; none under `prefers-reduced-motion: reduce`
- [ ] Desktop ≥900px — tray header is `1fr 1fr auto` grid (ISI | APPROVED USE | toggle), gutters `max(32px, calc((100% - 1200px) / 2))` matching `main > .section > div`
- [ ] Mobile <900px — AU column hidden, "AND APPROVED USE" subtitle visible inside the ISI heading
- [ ] Expanded tray — detail body scrolls at `max-height: 55vh` (mobile) / `45vh` (desktop), page behind does not scroll-chain
- [ ] `body` `padding-bottom` equals collapsed tray height (`--isi-tray-offset`), and drops to `0` when the tray docks
- [ ] Scroll to the inline panel — tray slides out (`translateY(110%)`); scroll back up — it returns
- [ ] `ul` — `padding-left: 20px`, `li` `margin-bottom: 10px`, disc bullets
- [ ] PI/PPI PDF links — underlined, `font-weight: 600`, open in a new tab
