# Table Block

A responsive, brand-styled table block with two modes:

1. **Standard table** — column headers, sticky label column, horizontal scrolling on mobile.
2. **Comparison variant** (`Table (Comparison)`) — the grouped treatment-comparison layout from
   [vyepti.com/why-iv-treatment](https://www.vyepti.com/why-iv-treatment): full-width teal-gradient
   group headers, bold magenta dose values, and a stacked two-column reflow on mobile instead of
   horizontal scrolling.

---

## Developer Notes

### Semantic DOM transformation

The EDS pipeline delivers the block as nested `<div>`s (one `div` per row, one `div` per cell).
`table.js` rebuilds this into a real table.

**Standard mode:**

```
<div class="table block">
  <div class="table-scroll" role="region" tabindex="0" aria-label="…">
    <table>
      <thead>                       ← first authored row, always
        <tr><th scope="col">…</th>…</tr>
      </thead>
      <tbody>
        <tr><th scope="row">…</th><td>…</td>…</tr>
      </tbody>
    </table>
  </div>
</div>
```

- The first authored row **always** becomes the `<thead>`.
- The first cell of each body row becomes `<th scope="row">` — the sticky label column.
- Empty header cells get `aria-hidden` and lose their `scope`.
- `.table-scroll` is a focusable, labelled region (`overflow-x: auto`) so keyboard users can
  scroll wide tables; its accessible name comes from the nearest section heading.

**Comparison mode** (`.table.comparison`):

```
<table role="table">
  <tbody role="rowgroup">           ← one <tbody> per group
    <tr class="table-group-row" role="row">
      <th colspan="3" scope="rowgroup" role="rowheader">IV infusion for migraine</th>
    </tr>
    <tr role="row">
      <th scope="row" role="rowheader"><strong>VYEPTI®</strong> (eptinezumab-jjmr)</th>
      <td role="cell">4x a year</td>
      <td role="cell">One 30-minute infusion…</td>
    </tr>
  </tbody>
  <tbody role="rowgroup">…</tbody>
</table>
```

- There is **no `<thead>`** — the design has no column header row.
- A row with content **only in its first cell** becomes a full-width group header
  (`<th colspan scope="rowgroup">`), and each group starts a new `<tbody>`.
- **No scroll wrapper**: on mobile the rows reflow instead of scrolling (see below).
- Explicit ARIA roles (`table`/`rowgroup`/`row`/`rowheader`/`cell`) are set because the mobile
  CSS switches rows to `display: grid`, which would otherwise strip native table semantics
  from the accessibility tree.

### Responsive strategy (comparison)

The original site duplicates the description cell with `hide-desktop`/`hide-mobile` classes.
This block avoids content duplication: below 900px each data row becomes a CSS grid —

```
┌──────────────┬──────────────────────┐
│ VYEPTI®      │ 4x a year            │  ← dose value (magenta)
│ (eptinezumab)│ One 30-minute        │  ← description, stacked
│              │ infusion…            │
└──────────────┴──────────────────────┘
```

`th` spans both grid rows on the left; the dose value and description stack on the right.
At ≥900px everything reverts to native table display and the three columns sit side by side.

### CSS variables

| Variable | Default | Purpose |
|---|---|---|
| `--table-header-bg` | teal `#046183` | standard `<thead>` background |
| `--table-header-color` | white | standard `<thead>` text |
| `--table-border-color` | `#d5e3ea` | standard cell borders |
| `--table-stripe-bg` | light teal `#e1f0f6` | standard even-row stripe |
| `--table-group-color` | teal `#046183` | comparison group header text |
| `--table-group-gradient-start/-end` | `#eef1f2` → `#7ebcc6` | comparison group header gradient |
| `--table-row-border-color` | `#d8d8d8` | comparison row separators |
| `--table-value-color` | magenta `#c41748` | comparison dose value text |

---

## Authoring Guide

### Comparison table (Vyepti dosing layout)

Name the block **`Table (Comparison)`**. Use **3 columns**: label, dose value, description.
A row with text **only in the first column** starts a new group section:

| Table (Comparison) |  |  |
|---|---|---|
| IV infusion for migraine |  |  |
| **VYEPTI®** (eptinezumab-jjmr) | 4x a year | One 30-minute infusion administered by a healthcare provider 4x a year |
| Migraine injections |  |  |
| **Aimovig®** (erenumab-aooe) | 12x a year | One self-injection 1x a month |
| **BOTOX®** (onabotulinumtoxinA) | 4x a year | 31 injections at each treatment visit, 4x a year |
| Migraine pills |  |  |
| **Nurtec® ODT** (rimegepant) | 182x a year | One pill every other day |

Formatting rules:

- **Group rows:** plain text in column 1, leave the other cells empty. Renders as the
  full-width teal gradient bar.
- **Product name:** make the brand name **bold**; the generic name in parentheses stays
  regular weight — it automatically renders smaller and lighter.
- **Dose value** (column 2): plain text; it automatically renders bold magenta.
- **Footnotes** (e.g. `*The first dose is a loading dose…`) are **not** part of the block —
  add them as regular italic paragraphs directly below the table in the document.

### Standard table

Name the block **`Table`**. The **first row becomes the column headers**; the first column
holds row labels and stays visible (sticky) while scrolling on mobile:

| Table |  |  |  |
|---|---|---|---|
| **Treatment** | **How it's given** | **Doses per year** | **Who administers it** |
| VYEPTI | 30-minute IV infusion | 4x a year | Healthcare provider |
| Injections | Self-injection | 4–12x a year | Self-administered |

Every row must have the same number of columns. Cells may contain text, bold, links, lists,
or icons.

### Color options (standard tables only)

| Block name in document | Result |
|---|---|
| `Table` | Teal header, white header text (default) |
| `Table (Header Teal)` | Teal `#046183` header background |
| `Table (Header Purple)` | Purple `#4c2f6e` header background |
| `Table (Header Magenta)` | Brand magenta `#c41748` header background |
| `Table (Header Light)` | Light teal header background, teal text |
| `Table (Text White)` | White header text |
| `Table (Text Dark)` | Dark header text |

Options combine freely: `Table (Header Purple, Text White)`. The comparison variant uses the
fixed Vyepti design and ignores these options (override the CSS variables if a different
palette is ever needed).

### Responsive behavior summary

| Mode | Desktop (≥900px) | Mobile |
|---|---|---|
| Standard | Full-width table | Horizontal scroll, sticky first column |
| Comparison | 3 columns, gradient group bars | 2-column stack: label left, value + description right; no scrolling |
