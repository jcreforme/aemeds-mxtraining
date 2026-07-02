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
