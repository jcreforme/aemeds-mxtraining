# Hero Two Columns Block

Single-column hero of content overlaid on a **responsive background image**. The block combines one or several authored images into a single `<picture>` with a `<source media>` per breakpoint and places the headings centered on top. It includes an optional "Actor portrayal" disclaimer in the bottom corner.

## 1. Authoring Contract

`decorate` iterates over **all rows** of the block and classifies each one by reading its **first cell**:

- **Image-only rows** (cell with a `picture` and **no heading**): provide the responsive background images. They are accumulated in order to generate the `<source>` elements.
- **Content row** (cell with an `h1`/`h2`/`h3`/`h4` heading): is the overlaid text. If none is found, the last row is used.

The order of the image rows maps to these media queries (largest first):

```text
1st image row  → (min-width: 1200px)
2nd image row  → (min-width: 768px)
3rd image row  → (min-width: 375px)  + <img> fallback
```

```text
| hero-two-columns | |
| [desktop image 1200px]  |
| [tablet image 768px]    |
| [mobile image 375px]    |
| ### Subheading (H3)     |
| # Main title (H1)       |
| *Actor portrayal*       |
```

From the content of the text row:

- All headings (`h1`..`h4`) are moved to a `hero-two-columns-content` container.
- The **disclaimer** is the `<p>` that contains an `<em>` and does **not** contain an image; it is marked as `hero-two-columns-caption` and positioned at the bottom right.

### Backward compatibility (legacy)

If there are no dedicated image rows, the block looks for a `picture` inside the content row and uses it as the single background.

### financial-assistance variant

The section can carry the `hero-banner-financial-assistance` class (applied to the section container), which adjusts the content padding and the maximum width of the `h1` on mobile, tablet, and desktop.

## Accessibility

- The `<img>` fallback retains the `alt` of the authored mobile image.
- The background image is loaded with `loading="eager"` (it is the LCP).
- The authored headings (`h1`/`h3`) are preserved, maintaining the document hierarchy.
- The disclaimer is kept as text (`<p><em>`), without replacing the image's `alt`.

> Note: the block does not add explicit `role`/`aria-*`.

## CSS Customization

`hero-two-columns.css` **does not define `--custom-property` variables**; it uses literal values. Common customization points:

- Mobile background gradient: `linear-gradient(120deg, #cdeef7 0%, #e8f6fb 60%, #f3fafd 100%)` in `.hero-two-columns` (disabled at >= 768px, where the image takes over).
- Subtitle color (`h3`): `#333`.
- Title color (`h1`): `#046183` (brand teal).
- Font: `proxima-nova, arial, sans-serif`.
- `object-position: 70% center` on the background image (>= 768px).

Breakpoints: 600px, 768px, 1200px, and 1900px.

## Performance Notes

- **Single responsive `<picture>`**: one image serves the three resolutions via `<source media>`, avoiding downloading unnecessary assets.
- The background image uses `loading="eager"` because it is the hero's LCP.
- No interaction JavaScript or observers; decoration is synchronous.
- On mobile the background is replaced by a lightweight CSS gradient; the full-bleed image only appears from 768px.
