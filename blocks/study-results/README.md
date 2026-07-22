# Study Results Block — Study Results

Block that presents the results of a clinical study inside a box with rounded top corners and a teal gradient background. It automatically classifies each row according to its shape (number of cells and presence of an image) into four content types: title, statistics row (3 columns), safety banner, and impact row (image + text).

## 1. Authoring Contract

`decorate(block)` first normalizes the structure (see below) and then `classify(block)` walks through `block.children` and assigns classes according to the shape of each row:

| Row shape | Assigned class | Use |
|------------------|----------------|-----|
| 3 cells | `.study-results-stats` (each cell → `.study-results-stat`) | Row of 3 statistics |
| 1 cell with image | `.study-results-safety` | Safety banner (shield icon + heading) |
| 2 cells | `.study-results-impact` (cell 1 → `-impact-image`, cell 2 → `-impact-text`) | Round image + text |
| 1 cell with heading and text | `.study-results-title` | Section title (kept) |
| 1 cell without heading | *(removed)* | Empty row discarded |

In the statistics rows, the **label** of each stat is an `<h4>` (or the first child of the cell) and receives `.study-results-stat-label`.

### Conceptual Structure

```text
| study-results |          |          |
| ## Study Results         |          |          |   ← title (1 cell with heading)
| #### 75%                 | #### 50% | #### 30% |   ← 3 stats (h4 = label + text below)
| Reduction ...            | ...      | ...      |
| ![](shield.svg) ## Well-studied safety |    |    |   ← safety banner (1 cell + image)
| ![](patient.png)         | ## Real impact **for patients** ... |  ← impact (image + text) |
```

### Nested table normalization

When the block is authored as a **nested table** whose name cell is not the first, EDS leaves the raw `<table>` inside the block. In that case the JS rebuilds the expected `div`/cell structure:

- A heading (`h1`/`h2`/`h3`) authored **outside** the table is **extracted** and placed **before** the block, wrapped in `.study-results-title`, so it renders as a section title (not inside the box).
- Each `<tr>` (except the one that says `study-results`) is converted into a `div` row with `div` cells that preserve the `innerHTML` of each `<td>`.
- After rebuilding, `classify()` is run.

## 2. Odd Variant

The CSS supports a `.study-results-odd` context (applied on the section/page, not by the JS) that inverts the colors of the impact text:

```text
.study-results-odd  →  h2 in #333, strong in teal #046183 (instead of coral)
```

## 3. Accessibility

- The block does not add roles or ARIA; it relies on the semantics of the authored headings (`h1`/`h2`/`h3`/`h4`), which preserve the document outline.
- Images keep their authored `alt`.

## 4. CSS Customization

`study-results.css` does not declare its own `--custom-properties`; it consumes `--body-font-family` and `--heading-font-family`. Fixed brand colors:

```css
#046183  /* teal: title, stat labels, safety heading */
#c02c57  /* coral: strong in the impact text */
#333     /* base text */
gradient #e8f3f5 → #fff  /* gradient background of the box */
```

Details: box with `border-radius: 23px 23px 0 0`, maximum width 1140px. The impact image is cropped into a circle (`border-radius: 50%`, 250px). The safety banner uses an icon of ~116px. Responsive layout: stacks into a column on mobile, with the 3-stat row and the impact row side by side at ≥700px/≥900px.

## 5. Performance Notes

- There are no network requests or dependencies: all classification is done with DOM APIs during decoration.
