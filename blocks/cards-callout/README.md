# Cards Callout Block

Variant of the cards block aimed at highlighting information (callout). It shares the same decoration logic as `cards`: it transforms each block row into a list item (`<ul>` / `<li>`) displayed in a responsive grid, with support for an image and a text body per card.

## 1. Authoring Contract

Each **row** of the block represents a card. Within each row, each **cell** becomes a part of the card:

- A cell whose only content is an image (`picture`) is marked as `cards-callout-card-image`.
- Any other cell is marked as `cards-callout-card-body` (title, text, links, etc.).

### Conceptual Structure

```text
| cards-callout | |
| [image] | ### Callout title              |
|         | Callout highlighted text.       |
| [image] | ### Another callout             |
|         | More highlighted text.          |
```

Notes derived from the code:

- The block iterates over `block.children` (the rows) and moves the content of each row into a `<li>`.
- Image detection is literal: the cell must have **a single child** containing a `<picture>` to be classified as `cards-callout-card-image`.
- Images are replaced with optimized versions using `createOptimizedPicture` (750px width, no `eager`).

## 2. CSS Customization

`cards-callout.css` does not define its own CSS variables. It consumes the global variable:

```css
--background-color   /* Background of each card (li) */
```

Layout details:

- The grid uses `grid-template-columns: repeat(auto-fill, minmax(257px, 1fr))` with `gap: 24px`.
- Each card has a `1px solid #dadada` border.
- Images are fitted with `aspect-ratio: 4 / 3` and `object-fit: cover`.

## 3. Performance Notes

- Images are optimized with `createOptimizedPicture` and loaded lazily (`eager = false`), which benefits LCP when the block is below the fold.
