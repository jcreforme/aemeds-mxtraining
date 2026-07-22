# Cards Feature Block

A variant of the cards block intended to highlight characteristics or "features". It shares the same decoration logic as `cards`: it transforms each row of the block into a list item (`<ul>` / `<li>`) displayed in a responsive grid, with support for an image and body text per card.

## 1. Authoring Contract

Each **row** of the block represents a card. Within each row, each **cell** becomes a part of the card:

- A cell whose only content is an image (`picture`) is marked as `cards-feature-card-image`.
- Any other cell is marked as `cards-feature-card-body` (title, text, links, etc.).

### Conceptual Structure

```text
| cards-feature | |
| [image] | ### Feature title              |
|         | Feature description.            |
| [image] | ### Another feature             |
|         | More description.               |
```

Notes derived from the code:

- The block iterates over `block.children` (the rows) and moves the content of each row into a `<li>`.
- Image detection is literal: the cell must have **a single child** containing a `<picture>` to be classified as `cards-feature-card-image`.
- Images are replaced with optimized versions using `createOptimizedPicture` (width of 750px, no `eager`).

## 2. CSS Customization

`cards-feature.css` does not define its own CSS variables. It consumes the global variable:

```css
--background-color   /* Background of each card (li) */
```

Layout details:

- The grid uses `grid-template-columns: repeat(auto-fill, minmax(257px, 1fr))` with `gap: 24px`.
- Each card has a `1px solid #dadada` border.
- Images are fitted with `aspect-ratio: 4 / 3` and `object-fit: cover`.

## 3. Performance Notes

- Images are optimized with `createOptimizedPicture` and lazy loaded (`eager = false`), which benefits LCP when the block is below the fold.
