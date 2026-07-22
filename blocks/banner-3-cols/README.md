# Banner 3 Cols Block

Column banner over a light teal gradient background with rounded top corners. Each row is distributed into columns (stacked on mobile, in a row from 768px). It supports an **icons** variant with a centered graphic above each column.

## 1. Authoring Contract

Each **row** of the block is a group of columns; each **cell** in the row is a column. The JS:

- Adds the classes `banner-3-cols-row` and `banner-3-cols-row-{N}` to each row, where `{N}` is the number of columns in that row (e.g. `banner-3-cols-row-3`, `banner-3-cols-row-2`).
- Adds `banner-3-cols-col` to each column.
- Marks the first `h2`/`h3`/`h4` of the column (or its first child if there is no heading) as `banner-3-cols-label`.

### Conceptual Structure

```text
| banner-3-cols | | |
| ### Title A Text A | ### Title B Text B | ### Title C Text C |
```

The number of columns per row is unrestricted: the `banner-3-cols-row-{N}` class reflects how many cells the author wrote. The CSS specifically styles 2-column rows (`banner-3-cols-row-2`) for the statistics block, where:

- `h3` -> statistic title (teal).
- `h2` -> large highlighted figure (magenta, italic).
- paragraphs after the `h2` -> supporting text (blue/teal depending on order).
- `em` -> small italic footnote.

### icons Variant

Adding the `icons` class to the block activates a layout with the graphic on top, a teal heading, and text below:

```text
| banner-3-cols (icons) | | |
| ![icon](icon1.png) ### Title A Text A | ![icon](icon2.png) ### Title B Text B | ![icon](icon3.png) ### Title C Text C |
```

In this variant, for each column the JS:

- Wraps the first `picture`/`img` in a `<div class="banner-3-cols-icon">` with `aria-hidden="true"` and places it at the start of the column.
- Removes the paragraphs left empty after extracting the image.

The `icons` CSS removes the background gradient, centers the content, and limits the image to `max-width: 286px`.

## Accessibility

- In the `icons` variant, the graphic container receives `aria-hidden="true"` (decorative icon; the text conveys the message).

## CSS Customization

`banner-3-cols.css` does not define its own custom properties; it uses the global variable `--body-font-family` and hardcoded colors (teal `#046183`, gray `#333`, magenta `#c02c57`). The block has `max-width: 1140px` and rounded top corners (`border-radius: 23px 23px 0 0`).

Note: the file also includes global rules for `main h2#side-effects-in-clinical-studies` and its following paragraph/link (outside the block's scope).

## Performance Notes

Lightweight synchronous decoration, with no dependencies or fetch. In the `icons` variant only the DOM is manipulated (move image, clean up empty paragraphs).
