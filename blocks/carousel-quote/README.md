# Carousel Quote Block

A carousel of "quote"-style slides with an image and content side by side. Each slide combines an image on the right (full bleed within the cell) and content on the left: a quotation-marks icon, a heading with a red accent line, text and an optional link. It includes indicators (dots), previous/next navigation arrows and active-slide detection by scroll.

## 1. Authoring Contract

`decorate` takes **each row** of the block (`:scope > div`) as a slide. Within each row, the columns (`:scope > div`) are classified by position:

- **Column 1** → slide image (`carousel-quote-slide-image`): a `picture`.
- **Columns 2..N** → slide content (`carousel-quote-slide-content`).

```text
| carousel-quote | |
| [slide 1 image]  | :quotation-icon:                 |
|                  | ## Slide quote or headline       |
|                  | Slide supporting text…           |
|                  | [Optional link](/…)              |
| [slide 2 image]  | :quotation-icon:                 |
|                  | ## Second headline               |
|                  | More text…                       |
```

In the content column, the decorator:

- Marks as `quotation` the `<p>` that contains an `.icon` (quotation-marks icon), applying a special size/scale to it.
- Inserts an `<hr class="red-short-line">` (red accent line) **after the first heading** (`h1`..`h6`).
- Uses the slide heading's `id` to link `aria-labelledby` on the slide.

### Single slide vs. multiple

If the block has **a single row** (`rows.length < 2`), it is a single-slide carousel: indicators, navigation buttons and listeners are **not** generated. With two or more rows, dots, arrows and the full interaction logic are added.

## Accessibility

The block builds accessible carousel markup:

- The block receives `role="region"` and `aria-roledescription="Carousel"`.
- Each slide gets an `id` (`carousel-quote-{n}-slide-{i}`) and, if it has a heading, `aria-labelledby` pointing to that heading.
- Inactive slides are marked with `aria-hidden="true"` and their links receive `tabindex="-1"` (removed from the tab order); the active slide restores the links.
- The dot navigation goes inside a `<nav aria-label="Carousel Slide Controls">`; each dot is a `<button>` with an `aria-label` of "Show Slide {i} of {total}". The active slide's dot is marked with `disabled`.
- The arrows are `<button type="button">` with `aria-label` "Previous Slide" / "Next Slide" (`slide-prev` / `slide-next`).

> The accessible texts are taken from a `placeholders` object with default values in English (`'Carousel'`, `'Previous Slide'`, etc.).

### Interaction

- **Dots**: on click, `showSlide` scrolls to the target slide (`dataset.targetSlide`).
- **Arrows**: prev/next compute the index from `block.dataset.activeSlide`; the scroll wraps around (before the first → last; after the last → first).
- **Scroll / snap**: the slides use `scroll-snap-type: x mandatory`; an `IntersectionObserver` (threshold 0.5) marks the active slide when it comes into view and synchronizes `aria-hidden`, `tabindex` and the state of the dots.

## CSS Customization

CSS variables defined on `.carousel-quote` within `carousel-quote.css`:

```css
--cq-bg        /* Background of each slide (#eaf4f8) */
--cq-text      /* Teal text/heading color (#005b84) */
--cq-accent    /* Accent pink: red line and indicators (#d62b70) */
--cq-arrow-bg  /* Background of the arrow buttons (rgb(255 255 255 / 88%)) */
```

Other styling details:

- The navigation arrows are circular buttons with a chevron drawn using `border` (no images).
- The accent line under the heading (`.red-short-line`) measures 60x3px.
- The quotation-marks icon (`.quotation img`) is displayed scaled (`transform: scale(3.0)`).

## Performance Notes

- **No autoplay**: the carousel advances only through user interaction (dots, arrows, scroll). There are no timers.
- **IntersectionObserver** (threshold 0.5) to detect the active slide, more efficient than listening to `scroll`.
- Native scroll with `scroll-snap` and `scroll-behavior: smooth`; no external libraries.
- The single slide skips all interaction logic and observers.
- Mobile breakpoint: <= 767px (image on top, content below, a single column).
