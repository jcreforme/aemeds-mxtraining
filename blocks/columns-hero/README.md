# Columns Hero Block

A variant of the columns block geared toward hero sections. It shares the decoration logic of `columns` but with styles intended for full-width images. It distributes the content of each row into columns side by side on desktop and stacked on mobile.

## 1. Authoring Contract

Each **row** of the block is a group of columns; each **cell** of the row is a column.

- The number of columns is taken from the **first row** (`block.firstElementChild.children`) and the class `columns-hero-{N}-cols` is added to the block (e.g. `columns-hero-2-cols`).
- If a column contains **only** an image (a `picture` as the sole child of its `div`), it is marked with the class `columns-hero-img-col`.

### Conceptual Structure

```text
| columns-hero | |
| # Hero title                 | [image] |
| Subheading and call to action |         |
```

In this example the first row has 2 cells → the block receives the class `columns-hero-2-cols`, and the second cell (image only) receives `columns-hero-img-col`.

### Layout Behavior

- **Mobile** (default): the columns stack vertically (`flex-direction: column`). Image columns (`columns-hero-img-col`) are placed first (`order: 0`), the rest afterwards (`order: 1`).
- **Desktop** (`width >= 900px`): the columns are shown in a row, vertically centered, with `gap: 24px` and equal distribution (`flex: 1`).
- Unlike `columns`, images occupy `width: 100%` (the full width of their column).

## 2. CSS Customization

`columns-hero.css` does not define its own CSS variables. It applies layout styles (flex, column order and full-width images).

## 3. Notes

- The number of columns should be consistent across rows; the count is calculated only from the first row.
