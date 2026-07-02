# Cards Masonry Block

A universal, responsive masonry-style card block for displaying content with images, titles, and descriptions in a column-based masonry layout.

## Features

- **Responsive Columns**: Uses CSS columns for a masonry-like flow
- **Flexible Heights**: Cards adapt to content length naturally
- **Optimized Images**: Automatic image optimization via AEM helpers
- **Hover Effects**: Subtle shadow on interaction
- **Accessible**: Semantic HTML, proper heading hierarchy
- **Universal**: Works with any content structure

## Content Structure

Each card requires two main sections:

1. **Image Section**: A `<picture>` element with responsive image sources
2. **Body Section**: Content area with title, text, and optional links

```html
<div class="cards-masonry block">
  <div>
    <div>
      <picture>
        <img src="image.jpg" alt="Description" />
      </picture>
    </div>
    <div>
      <h3>Title</h3>
      <p>Description text</p>
    </div>
  </div>
</div>
```

## Responsive Behavior

The block uses CSS columns instead of CSS Grid to let each card keep its natural height.

| Breakpoint | Columns | Use Case           |
| ---------- | ------- | ------------------ |
| Mobile     | 1       | Phone (< 600px)    |
| Tablet     | 2       | Tablet (600-900px) |
| Desktop    | 3       | Desktop (900px+)   |

## CSS Customization

The block uses CSS custom properties for theming:

```css
--background-color: #fff; /* Card background */
```

## Usage

1. Create a new page or edit an existing one
2. Add a section with the block name `cards-masonry`
3. Author card content in rows (image + text pairs)
4. The block automatically decorates the DOM

## Draft Testing Pattern

When testing locally, the draft should follow the standard AEM structure:

- `main > div > h1` for a standalone heading section
- `main > div > div.cards-masonry` for the block section
- Do not pre-add `section` or `block` classes in the draft; AEM adds them during decoration

Example:

```html
<main>
  <div>
    <h1>Cards Masonry Test</h1>
  </div>
  <div>
    <div class="cards-masonry">
      <div>...</div>
    </div>
  </div>
</main>
```

## Performance Notes

- Images use `createOptimizedPicture()` for automatic optimization
- CSS columns avoid JavaScript-based masonry positioning
- `break-inside: avoid` keeps each card intact across columns
- Cards keep their natural height, so no fixed aspect ratio is required

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Columns: Full support
- Picture element: Full support
