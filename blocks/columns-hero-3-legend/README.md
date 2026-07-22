# Columns Hero 3 Legend Block

A columns block for a hero-style section with **text**, a **graphic/image** and a **legend with icons**. The decorator automatically classifies each column by its content (headings, list, images) and applies an asymmetric layout on desktop. It supports a disclaimer (`h6`) that is relocated depending on the breakpoint.

## 1. Authoring Contract

`decorate` takes the **first row** of the block and treats each cell as a column. It adds the class `columns-hero-3-legend-{N}-cols` to the block based on the number of columns.

Each column is classified by reading its content:

- **Legend column** (`columns-hero-3-legend-legend-col`): contains a list (`ul`/`ol`) whose items carry **icons** (`picture`/`img`) and has **no** headings.
- **Image/graphic column** (`columns-hero-3-legend-img-col`): contains only `picture`(s), with no list or headings.
- **Text column**: everything else (heading + paragraphs + bullet list without icons).

```text
| columns-hero-3-legend | | |
| ## Teal title         | [desktop image]    | - [icon] Label 1 |
| Descriptive text      | [mobile image]     | - [icon] Label 2 |
| - bullet one          |                    | - [icon] Label 3 |
| - bullet two          |                    |                  |
| ###### Disclaimer (h6)|                    |                  |
```

### Image column: desktop/mobile swap

If the image column has **two or more** `picture`, the block builds a single responsive `<picture>` that swaps at the **900px** breakpoint:

- 1st image → `<source media="(min-width: 900px)">` (desktop).
- 2nd image → `<img>` fallback (mobile), with `loading="lazy"`.

The rest of the authored images are removed.

### Relocatable disclaimer (h6)

The disclaimer is authored as an `h6` **inside the text column** and receives the class `columns-hero-3-legend-disclaimer`. Its position is adjusted with a `matchMedia('(min-width: 900px)')`:

- **Desktop (>= 900px)**: it remains at the end of the text column.
- **Mobile**: it moves to the end of the row, so it sits below the graphic and the legend (not directly under the bullets).

The `change` listener relocates the disclaimer dynamically when the breakpoint changes.

### Layout

- Mobile/tablet: stacked columns, centered content, `max-width: 540px`.
- Desktop (>= 900px): three columns in a row with asymmetric widths approx. 5 / 5 / 2 (text / graphic / legend), left-aligned, `max-width: 1140px`.
- The legend is a centered horizontal row on mobile and a stacked vertical list on desktop.

## Accessibility

- The authored headings (`h2`, `h6`) are preserved, maintaining the document hierarchy.
- The `<img>` fallback of the swap keeps the `alt` of the authored mobile image.
- Lists are kept as semantic lists (`ul`/`ol`, `li`).

> Note: the block does not add explicit `role`/`aria-*` attributes.

## CSS Customization

`columns-hero-3-legend.css` **does not define `--custom-property` variables**; it uses literal values. Common customization points:

- Full-bleed background of the section: `#eff6f9`.
- Title color (`h2`): `#046183` (brand teal).
- Bullet marker of the text list: `\2022` in color `#c02c57` (brand pink), 30px.
- Size of the legend icons: `24px`.
- Desktop flex ratios: text `5`, image `5`, legend `2`.

Main breakpoint: 900px.

## Performance Notes

- **Single responsive `<picture>`**: when there is a desktop + mobile image, a single `<picture>` serves both via `<source media>`, with `loading="lazy"` on the fallback.
- The relocation of the disclaimer uses `matchMedia` (no polling or costly resize listeners).
- No external dependencies; synchronous decoration.
