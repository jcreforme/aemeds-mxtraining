# Author guide (da.live)

Use this guide to fill the block correctly and avoid layout issues.

1. Insert a `Block` in da.live.
2. Set the block name to `Columns Content`.
3. Keep only one content row with two columns.

Expected table structure:

| Columns Content |                      |
| --------------- | -------------------- |
| Left column     | Right column content |

**Configuration**

By default, the right column gets a callout. To customize, use a block variant:

- `Columns Content` -> callout on right (default)
- `Columns Content (callout-left)` -> callout on left
- `Columns Content (callout-both)` -> callout on both columns

Authoring rules:

- **Flexible content:** No required heading types or order.
- **Optional callout marker:** Add a standalone row with one of these values where the callout should start in the configured column(s):
  - `[callout]`
  - `callout-start`
  - `---`

How callout placement works:

1. If a marker exists, everything after that marker is wrapped in the callout.
2. If no marker exists, legacy fallback is used: the 3rd element and all following elements go into the callout (right column only).
3. Callout appears in the column(s) specified by the `data-callout` configuration.

Icon behavior (optional):

1. If the first callout item contains an icon token (for example `:mobile:` or `:call:`), the callout renders with an icon column.
2. If no icon is authored, the callout renders as text-only (no icon column).

Common mistakes:

- Adding extra header/content rows in the block table.
- Naming the block as `columns` instead of `Columns Content`.
- Adding marker text inside a paragraph with other content (marker must be standalone).

Validation checklist:

- In Preview, desktop view shows 2 columns with a divider line.
- The callout appears in the configured column(s) at the marker position (or 3rd element if no marker).
- Mobile view stacks columns and keeps the callout style.

---

## Other variants

Besides the callout variants above, `columns-content` has these self-contained variants (each is a leading branch in `decorate()` and does not affect the base block):

### `Columns Content (nurse-support)`

Constrained-width (1140px, no section gutters) two-column layout with a lighter callout tint. Same authoring as the base block.

### `Columns Content (dark)`

Dark teal full-bleed band, white text, image left / text + pill CTAs right. Author a bold link as the primary CTA and an italic link as the secondary CTA.

### `Columns Content (icon-right)` / `(dot-list)`

`icon-right`: the right column leads with an icon graphic beside its text. `dot-list`: bulleted columns with magenta markers and no divider.

### `Columns Content (prepare-steps)`

A two-column "choose a location" section plus an interactive **"Prepare for each step"** tabbed card (matches vyepti.com/what-to-expect). Built from a **flat table**:

- **Row 1** (single cell): the whole left column — heading, intro, a bulleted list where every item leads with an `:icon:` (renders as the 4-across location grid), the "Infusion Network" subsection, and footnote paragraphs.
- **Row 2** (single cell): the card title (e.g. `Prepare for each step`).
- **Rows 3+** (two cells each): one tab per row — `[:icon: + label]` | `[that tab's panel content]`. The **last** tab starts selected.

```text
| Columns Content (prepare-steps) | |
| # Choosing a location…\n- :loc-doctors-office: Your doctor's office\n… | |
| Prepare for each step | |
| :step-before: Before infusion | ##### Getting ready…\n- Confirm your infusion location… |
| :step-during: During infusion | ##### Given by a provider… |
| :step-after: After infusion  | ##### Make your next appointment… |
```

Tabs are interactive (click + arrow/Home/End keys, full `tablist`/`tab`/`tabpanel` ARIA). Mobile/tablet: content centers and the location icons stack 2×2; desktop: text left-aligned, icons in one 4-across row, card 525px wide on the right.

### `Columns Content (stat-highlight)`

A tinted full-bleed band with a circular graphic on the left and a two-color stat headline + supporting copy on the right (matches the "88% … was easy" section). Author as a flat table — the cell with an `:icon:`/image is the graphic, the cell with a heading is the text. In the **Heading 3**, make the words you want in magenta **bold** (the rest stays teal). End with an *italic* disclaimer line.

```text
| Columns Content (stat-highlight) | |
| :graphic-schedule: | ### **88%** of VYEPTI patients agreed that scheduling the next infusion was **easy**\nBased on survey responses…\n*Individual experiences may vary…* |
```
