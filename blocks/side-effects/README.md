# Side Effects Block — Image + Content

Two-column block (image + content) on a teal gradient background, used to highlight efficacy/safety results. It supports an optional desktop background image, a caption overlaid on the image (e.g. "Actor portrayal"), and automatic de-emphasis of trailing parentheses in headings.

## 1. Authoring Contract

The block reads its rows (`block.children`) as follows:

### Background row (optional)

If there is more than one row and the **first** row has **a single cell with an image**, that image is used as the **desktop background**: its `src` is exposed in the `--side-effects-bg` custom property on the block, and the row is removed so it is not rendered as content. The background is only applied at ≥1200px.

### Content row (required)

The content row has **two cells**:

- **Cell 1 — Image** → `.side-effects-image`. The image (`<picture>`) is wrapped in a `.side-effects-figure`. Any remaining text in the cell (outside the `picture`/`img`) is captured as a **caption** and rendered in `<span class="side-effects-caption">`, overlaid on the image (e.g. "Actor portrayal"). The caption can be its own `<p>`, inline text in the image's `<p>`, or a loose text node.
- **Cell 2 — Content** → `.side-effects-content`. Text, headings (`h1`/`h2`/`h3`), paragraphs.

### Conceptual Structure

```text
| side-effects |                          |
| ![](bg-desktop.png) |                    |   ← optional background row (1 cell with image)
| ![](woman.png) Actor portrayal | ## Up to 40% saw
|                          | # zero migraine days
|                          | ...copy... |
```

Or without background:

```text
| side-effects |                          |
| ![](woman.png) Actor portrayal | ## Up to 40% saw
|                          | # zero migraine days |
```

### De-emphasis of parentheses in headings

In the content cell, for each `h1`/`h2`/`h3` whose text ends in a parenthetical (e.g. *"for a month or more (any 28 days in a row)"*), the trailing parenthetical is wrapped in `<span class="side-effects-light">` and rendered with normal weight (using the body font, because the heading font only ships with weight 700). It only applies if the heading has no child elements.

## 2. Accessibility

- The image keeps its authored `alt` (the block does not modify it).
- The headings keep their semantic level (`h1`/`h2`/`h3`), preserving the document outline.

## 3. CSS Customization

`side-effects.css` defines the following custom property (set by the JS):

```css
--side-effects-bg  /* url() of the desktop background image (≥1200px); fallback: teal gradient */
```

It also consumes `--body-font-family` for the de-emphasized parenthetical. Fixed brand colors:

```css
#eff6f9 / gradient #d6eef7→#f2f9fc  /* light teal background */
#046183  /* teal headings (h2/h3) */
#c02c57  /* main headline (h1), e.g. "zero migraine days" */
#333     /* text and strong */
```

Layout: reversed column on mobile (image at the bottom), 50/50 row on desktop (≥900px). The caption is positioned absolute at the right/bottom of the image with a white `text-shadow`.

## 4. Performance Notes

- The desktop background is applied only at ≥1200px via a media query, avoiding downloading it on small screens.
