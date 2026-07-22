# Call CTA Block

Centered call-to-action strip ("Need help getting started on VYEPTI? Call ...") with an optional information icon over a light teal band. Replicates the original `.vyepti-homepage-call-cta` component.

## 1. Authoring Contract

The block is a **single-row** table. The row can have one or two cells:

- **Icon cell** (optional): contains only an icon/image and no meaningful text.
- **Text cell**: contains the message, typically with a bold `tel:` link.

The JS detects the icon cell by looking for a cell that has `.icon`/`img` **and** no text. The text cell is the other cell with content (or the last cell if it cannot be determined).

### Conceptual Structure

```text
| call-cta | | |
| :information: | **Need help getting started on VYEPTI? Call [833-4-VYEPTI](tel:8334893784) (833-489-3784).** |
```

The icon cell is optional: a single-cell row renders only the text.

Classes applied by the JS:

- The icon cell receives the class `vyepti-homepage-info-icon`.
- The text cell receives the class `vyepti-homepage-cta`.

## Accessibility

- The block receives `role="note"` to expose the message as an informational note to assistive technologies.
- The icons/images in the icon cell are decorative: they receive `aria-hidden="true"` (the message is conveyed by the text).

## CSS Customization

`call-cta.css` does not define its own custom properties; it uses the project's global variables:

- `--light-color` — light teal band background.
- `--body-font-size-s` — text font size (mobile).
- `--link-color` / `--link-hover-color` — link color and its hover.

On desktop (>= 900px) the band is centered with `min-width: 800px` and the icon grows from 40px to 48px.

## Performance Notes

Block with no external dependencies; simple synchronous decoration (a single row, no fetch).
