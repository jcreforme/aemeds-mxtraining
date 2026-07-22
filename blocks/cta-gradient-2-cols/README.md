# CTA Gradient 2 Cols Block

Grid of call-to-action cards. On mobile they stack into a single column; on desktop (>= 900px) they display in two columns. Each card has a gradient accent bar (teal -> coral -> magenta) anchored to the bottom.

## 1. Authoring Contract

Each **row** of the block is a card. The JS iterates over `block.children` (each row = one card) and:

- Adds the `cta-card` class to each row.
- Adds the `cta-card-body` class to its first child (the content cell).

### Conceptual Structure

```text
| cta-gradient-2-cols | |
| #### Eyebrow ← H4 (teal) ## Title ← H2/H3 (magenta) Supporting text. [Learn More](/link) ← button |
| #### Eyebrow ## Another title More text. [Get Started](/start) |
```

Each row (card) contains a cell with an eyebrow, heading, paragraph, and a button link. With two rows you get the two-column layout on desktop.

Typographic conventions applied via CSS:

- `h4` -> eyebrow in teal (#046183).
- `h2` / `h3` -> heading in magenta (#c02c57).
- `p` -> body text in gray (#333).
- `a.button` (inside `p.button-wrapper`) -> rounded teal button with arrow.

## Icons

The CTA button adds an arrow via the background of the `::after` cell:

- `/icons/cta-button-arrow-20-global-white.svg`

## CSS Customization

`cta-gradient-2-cols.css` does not define its own custom properties; the colors are hardcoded directly (teal `#046183`, hover `#035270`, magenta `#c02c57`). The container uses `display: grid` with `max-width: 1140px` and `gap: 24px`.

## Performance Notes

Very lightweight synchronous decoration (it only assigns classes), with no dependencies or fetch.
