# Cards Block

Standard cards block from the AEM EDS boilerplate. It transforms each block row into a list item (`<ul>` / `<li>`) displayed in a responsive grid. Each card can contain an image and a text body.

## 1. Authoring Contract

Each **row** of the block represents a card. Within each row, each **cell** becomes a part of the card:

- A cell whose only content is an image (`picture`) is marked as `cards-card-image`.
- Any other cell is marked as `cards-card-body` (title, text, links, etc.).

### Conceptual Structure

```text
| cards | |
| [image] | ### Card title                     |
|         | Descriptive text for the card.     |
| [image] | ### Another card                   |
|         | More descriptive text.             |
```

Notes derived from the code:

- The block iterates over `block.children` (the rows) and moves the content of each row into a `<li>`.
- Image detection is literal: the cell must have **a single child** containing a `<picture>` to be classified as `cards-card-image`.
- Images are replaced with optimized versions using `createOptimizedPicture` (750px width, no `eager`).

## 2. CSS Customization

`cards.css` does not define its own CSS variables. It consumes the global variable:

```css
--background-color   /* Background of each card (li) */
```

Layout details:

- The grid uses `grid-template-columns: repeat(auto-fill, minmax(257px, 1fr))` with `gap: 24px`.
- Each card has a `1px solid #dadada` border.
- Images are fitted with `aspect-ratio: 4 / 3` and `object-fit: cover`.

## 3. Performance Notes

- Images are optimized with `createOptimizedPicture` and loaded lazily (`eager = false`), which benefits LCP when the block is below the fold.
