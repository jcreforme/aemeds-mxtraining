# Alert Strip Block

Full-width alert strip, intended to sit just below the hero. It displays an optional icon and a short message (for example, a contact phone number). It is announced to screen readers as a note.

## 1. Authoring Contract

The block uses **a single row** with up to **two cells**:

- **Cell 1 (optional)**: an icon only. It is marked as `alert-strip-icon` and treated as decorative.
- **Cell 2 (or single cell)**: the message text. It is marked as `alert-strip-text`.

The classification is dynamic: a cell that contains an `.icon` and **has no text** is considered an icon (`alert-strip-icon`); any other cell is considered text (`alert-strip-text`). This is why a single cell with text also works.

### Conceptual Structure

```text
| alert-strip | |
| :icon:      | **Need help getting started? Call [833-4-VYEPTI](tel:8334893784) (833-489-3784).** |
```

Text-only version (no icon):

```text
| alert-strip |
| **Need help getting started? Call 833-489-3784.** |
```

## 2. Accessibility

Actual behavior present in `alert-strip.js`:

- The block receives `role="note"`.
- A cell that is icon-only receives `aria-hidden="true"` (decorative, hidden from screen readers).

## 3. CSS Customization

`alert-strip.css` does not define its own CSS variables. It consumes global variables:

```css
--light-color         /* Strip background */
--body-font-size-s    /* Text size */
--link-color          /* Link color */
--link-hover-color    /* Link color on hover */
```

Layout details:

- The strip bleeds to the full width of the viewport (`max-width: none`, `padding: 0` on the wrapper) and removes the section's top margin so it sits flush against the hero.
- The inner content is centered with `flex` and limited to `max-width: 1200px`.
- The icon measures 40x40px on mobile and 48x48px on desktop (`width >= 900px`).
- Links are shown underlined and with `white-space: nowrap`.
