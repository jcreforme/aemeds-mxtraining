# Quote Single Block — Featured Quote

Featured quote block on a teal panel, with an optional art-directed image on the right (on desktop). It renders a quote, an author, and an optional disclaimer next to a responsive image built as a `<picture>` from author-provided images.

## 1. Authoring Contract

The block is tolerant of different authoring shapes, because pasting from DA can flatten the content into a single cell. The JS **does not depend on a rigid table**: it queries the DOM directly.

### Quote text

- **Quote**: the first `blockquote`, `h1`, `h2`, or `h3` in the block → `.quote-single-quote`.
- **Author**: the first paragraph that contains a `<strong>` → `.quote-single-author`.
- **Disclaimer** (optional): the last paragraph, if it is not the author → `.quote-single-disclaimer`.

Paragraphs that contain images, those inside a `blockquote`, empty ones, and those that are breakpoint labels (`desktop`, `tablet`, `mobile`, `small desktop`) are filtered out.

### Responsive images (optional)

Each image is paired with the **breakpoint label** that precedes it (text in the previous sibling element). Only two images are supported:

- Label that contains **`desktop`** → gets its own `<source media="(min-width: 900px)">`.
- Any other (including `mobile` / `tablet`) → is used as the fallback `<img>`.

The image's `alt` is taken from the author text.

### Conceptual Structure

As separate rows (label + image):

```text
| quote-single |                                          |
| "VYEPTI helped me get back to my life."                 |
| **Jane D., VYEPTI patient**                             |
| Individual results may vary.                            |
| desktop      | ![](quote-desktop.png)                    |
| mobile       | ![](quote-mobile.png)                     |
```

Or flattened into a single cell (sequence of paragraphs), also supported:

```text
| quote-single |
| "VYEPTI helped me get back to my life."
| **Jane D., VYEPTI patient**
| Individual results may vary.
| desktop
| ![](quote-desktop.png)
| mobile
| ![](quote-mobile.png) |
```

## 2. No-Image Variant

If the author does not provide any image, the block automatically receives the **`quote-single-no-image`** class and the text occupies the entire panel (maximum width 760px on mobile, 100% on desktop). It is not a class the author adds: it is applied due to the absence of images.

## 3. Accessibility

- The image receives an `alt` derived from the author text.
- Images are loaded with `loading="lazy"`.
- The quote is rendered with the authored semantic element (`blockquote`/`h1`/`h2`/`h3`), preserving the document outline.

## 4. CSS Customization

`quote-single.css` does not declare its own `--custom-properties`; it uses fixed brand colors and consumes `--body-font-family`. Key colors:

```css
#046183  /* teal background of the panel */
#e8635a  /* coral: decorative quotation-mark circle and line above the author */
#fff     /* white text */
```

Visual details: decorative quotation mark (`\201C`) in a coral circle, a coral line of 50×4px above the author, column layout on mobile and row layout (60% text / 40% image) on desktop (≥900px). The image uses `object-fit: cover` with `object-position: center bottom`.

## 5. Performance Notes

- The art-directed `<picture>` serves the desktop image only at ≥900px via `<source media>`, avoiding downloading the large variant on mobile.
- Images with `loading="lazy"`.
