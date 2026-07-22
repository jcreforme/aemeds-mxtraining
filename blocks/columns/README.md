# Columns Block

The columns block from the AEM EDS boilerplate. It distributes the content of each row into columns side by side on desktop and stacked on mobile. It automatically detects columns that only contain an image in order to reorder them.

## 1. Authoring Contract

Each **row** of the block is a group of columns; each **cell** of the row is a column.

- The number of columns is taken from the **first row** (`block.firstElementChild.children`) and the class `columns-{N}-cols` is added to the block (e.g. `columns-2-cols`).
- If a column contains **only** an image (a `picture` as the sole child of its `div`), it is marked with the class `columns-img-col`.

### Conceptual Structure

```text
| columns | |
| ## Column title                 | [image] |
| Column text with a link         |         |
```

In this example the first row has 2 cells → the block receives the class `columns-2-cols`, and the second cell (image only) receives `columns-img-col`.

### Layout Behavior

- **Mobile** (default): the columns stack vertically (`flex-direction: column`). Image columns (`columns-img-col`) are placed first (`order: 0`), the rest afterwards (`order: 1`).
- **Desktop** (`width >= 900px`): the columns are shown in a row, vertically centered, with `gap: 24px` and equal distribution (`flex: 1`).
- Images are limited to `30%` width and centered.

## 2. CSS Customization

`columns.css` does not define its own CSS variables. It applies fixed styles to the content:

- `h2` titles in color `#046183`, centered, 25px.
- `p` paragraphs centered.
- `a` links are rendered as "pill"-style buttons (`2px solid #046183` border, `border-radius: 999px`, bold).
- Special rule for `.columns .icon-arrow2 img` (inline arrow icon, 80x10px).

## 3. Notes

- The number of columns should be consistent across rows; the count is calculated only from the first row.
