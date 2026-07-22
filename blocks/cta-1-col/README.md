# CTA 1 Col Block

A single call-to-action card (one column) with a heading, text and button. On mobile/tablet it shows an accent bar with a gradient (teal -> coral -> magenta) at the foot of the card; on desktop the layout switches to a horizontal row and an optional brand image is anchored to the left edge.

## 1. Authoring Contract

The block is a **single-row** table. Each cell of that row is automatically classified according to its content:

- A cell that contains `picture`/`img` -> `cta-card-shape` (brand graphic, visible only on desktop).
- A cell that contains an `a` link -> `cta-card-action` (the CTA button).
- Any other cell -> `cta-card-text` (eyebrow, heading and paragraph).

The full row receives the class `cta-card`.

### Conceptual Structure

```text
| cta-1-col | | |
| ![shape](shape.png) | #### Eyebrow ← H4 (teal) ## Title ← H2/H3 (magenta) Supporting text. | [Get Started](/start) |
```

The order and number of cells is flexible: classification is done by content, not by position. A cell without an image or link is always treated as text.

Typographic conventions applied via CSS:

- `h4` -> eyebrow in teal (#046183).
- `h2` / `h3` -> heading in magenta (#c02c57).
- `p` -> body text in gray (#333).
- `a.button` -> rounded teal button with an arrow.

## Icons

The CTA button adds an arrow via the `::after` background of the cell:

- `/icons/cta-button-arrow-20-global-white.svg`

## CSS Customization

`cta-1-col.css` does not define its own custom properties; the colors are hardcoded directly (teal `#046183`, hover `#035270`, magenta `#c02c57`). The maximum width of the block is `1140px`.

## Performance Notes

- The brand image (`cta-card-shape`) is hidden on mobile/tablet (`display: none`) and only shown on desktop (>= 900px).
- Simple synchronous decoration, with no dependencies or fetch.
