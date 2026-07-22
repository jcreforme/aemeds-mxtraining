# Paragraph Block

Typography block for rich text blocks (headings, paragraphs, and links) with brand styling. The JavaScript is minimal: it only adds the `paragraph-block` class to the block; all styling lives in the CSS.

## 1. Authoring Contract

The block does not impose a special table structure. It is authored as normal rich content (headings, paragraphs, links) and the CSS styles it.

### Conceptual Structure

```text
| paragraph |
| ## Section title              |
| Paragraph text with a link.   |
| ### Subheading                |
| More text.                    |
```

## 2. Variants

In addition to `.paragraph-block` (applied by the JS), the CSS recognizes the `.paragraph-center` class. This class is **not** added by the JavaScript, so it must be authored as a block variant (e.g. `paragraph (center)`) to get the centered layout.

```text
| paragraph (center) |
| ## Centered title |
| Centered text in bold. |
```

Differences of `.paragraph-center`:

- Aligns all content to the center (`text-align: center`).
- `h2` at 32px in color `#046183`.
- Paragraphs in bold, 16px, with vertical padding.

## 3. CSS Customization

`paragraph.css` does not define its own CSS variables. It uses fixed colors:

- `h2` / `h3`: color `#1a4a5c` (h2 700/1.75rem, h3 600/1.35rem).
- `h4` / `h5`: color `#046183`.
- Paragraphs: 16px, `line-height: 1.6`, color `#333`.
- Links `a`: color `#046183`.
- Maximum width `1140px`; reduced side padding below 900px and removed below 450px.
